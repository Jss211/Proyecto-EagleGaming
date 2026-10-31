import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createVerificationHandler } from './handler.ts';
import { loadTemplates, renderMail } from './template.ts';
import type { Account, Mail, RateLimiter } from './contracts.ts';
import { refreshVerificationStatus, requestVerificationEmail } from '../../src/features/auth/emailVerification.ts';

const templates = await loadTemplates();
const config = {
  enabled: true, // Exclusivamente mocks; no hay un bootstrap real ni transporte de correo.
  allowedOrigin: 'https://store.example.test',
  continueUrl: 'https://store.example.test/cuenta',
  actionOrigin: 'https://auth.example.test',
};
const fakeLink = 'https://auth.example.test/__/auth/action?mode=verifyEmail&oobCode=MOCK_ONLY&lang=es';

function setup(options: { enabled?: boolean; tokenError?: boolean; sendError?: boolean; user?: Partial<Account>; limiterError?: boolean } = {}) {
  const calls = { verified: [] as unknown[][], users: [] as string[], links: [] as unknown[][], mails: [] as Mail[] };
  // Almacén atómico en memoria SOLO para estas pruebas; nunca para producción.
  const counts = new Map<string, number>();
  const limiter: RateLimiter = {
    async consume(key, limit) {
      if (options.limiterError) throw new Error('storage unavailable');
      const count = counts.get(key) ?? 0;
      if (count >= limit) return false;
      counts.set(key, count + 1);
      return true;
    },
  };
  const handler = createVerificationHandler({
    config: { ...config, enabled: options.enabled ?? true }, templates, limiter,
    auth: {
      async verifyIdToken(...args) {
        calls.verified.push(args);
        if (options.tokenError) throw new Error(`SENSITIVE ${fakeLink}`);
        return { uid: 'owner-uid' };
      },
      async getUser(uid) {
        calls.users.push(uid);
        return { uid, email: 'owner@example.test', displayName: 'Ana', disabled: false, emailVerified: false,
          providerData: [{ providerId: 'password' }], ...options.user };
      },
      async generateEmailVerificationLink(...args) { calls.links.push(args); return fakeLink; },
    },
    mailer: { async send(mail) {
      calls.mails.push(mail);
      if (options.sendError) throw new Error(`SMTP_SECRET ${fakeLink}`);
    } },
  });
  function request(body = '{}', authorization = 'Bearer mock-token', origin = config.allowedOrigin, method = 'POST') {
    return new Request('https://backend.example.test/auth/email-verification', {
      method, headers: { Origin: origin, Authorization: authorization },
      ...(method === 'POST' ? { body } : {}),
    });
  }
  return { handler, calls, request };
}

test('la plantilla aprobada conserva sus bytes', () => {
  assert.equal(createHash('sha256').update(templates.html).digest('hex'), 'a141186f6aad6c7e6ed670f5a4df70e63de7318b0a637dddef550c28e7bb44ef');
  assert.equal(createHash('sha256').update(templates.text).digest('hex'), '8458474edb81bc675c29cbaf98ad7a63f8ca50c05aea76d1c4163bdd703ea7ad');
});

test('desactivado no valida tokens, genera enlaces ni envía', async () => {
  const s = setup({ enabled: false });
  assert.equal((await s.handler(s.request(), 'ip')).status, 503);
  assert.deepEqual(s.calls, { verified: [], users: [], links: [], mails: [] });
});

test('valida revocación y obtiene el destinatario exclusivamente por UID', async () => {
  const s = setup();
  const response = await s.handler(s.request(), 'ip');
  assert.deepEqual(await response.json(), { code: 'sent' });
  assert.deepEqual(s.calls.verified, [['mock-token', true]]);
  assert.deepEqual(s.calls.users, ['owner-uid']);
  assert.deepEqual(s.calls.links, [['owner@example.test', { url: config.continueUrl }]]);
  assert.equal(s.calls.mails[0]?.to, 'owner@example.test');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('rechaza destinatarios, redirects, nombres y UID proporcionados por el cliente', async () => {
  for (const body of ['{"email":"other@example.test"}', '{"uid":"other"}', '{"name":"Other"}', '{"url":"https://other.test"}']) {
    const s = setup();
    assert.equal((await s.handler(s.request(body), 'ip')).status, 400);
    assert.equal(s.calls.links.length, 0);
  }
});

test('sin token, token inválido, revocado o sin origen permitido no envía', async () => {
  const s = setup();
  assert.equal((await s.handler(s.request('{}', ''), 'ip')).status, 401);
  const invalid = setup({ tokenError: true });
  const response = await invalid.handler(invalid.request(), 'ip');
  assert.equal(response.status, 401);
  assert.ok(!(await response.text()).includes('SENSITIVE'));
  assert.equal((await s.handler(s.request('{}', 'Bearer token', 'https://evil.test'), 'ip')).status, 403);
  assert.equal(s.calls.mails.length + invalid.calls.mails.length, 0);
});

test('cuentas verificadas o Google no generan envíos; deshabilitadas o UID distinto se rechazan', async () => {
  for (const [user, status, code] of [
    [{ emailVerified: true }, 200, 'already_verified'],
    [{ providerData: [{ providerId: 'google.com' }] }, 200, 'provider_managed'],
    [{ disabled: true }, 403, 'forbidden'],
    [{ uid: 'other' }, 403, 'forbidden'],
    [{ email: undefined }, 409, 'not_eligible'],
  ] as const) {
    const s = setup({ user: user as Partial<Account> });
    const response = await s.handler(s.request(), 'ip');
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { code });
    assert.equal(s.calls.links.length, 0);
  }
});

test('envío inicial y reenvíos simultáneos comparten límite por UID, incluso desde distintas IP', async () => {
  const s = setup();
  const responses = await Promise.all([s.handler(s.request(), 'ip1'), s.handler(s.request(), 'ip2')]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 429]);
  assert.equal(s.calls.mails.length, 1);
});

test('límite por IP se aplica antes de validar tokens; almacén caído falla cerrado', async () => {
  const s = setup();
  for (let i = 0; i < 10; i++) await s.handler(s.request('{}', ''), 'same-ip');
  assert.equal((await s.handler(s.request(), 'same-ip')).status, 429);
  assert.equal(s.calls.verified.length, 0);
  const failed = setup({ limiterError: true });
  assert.equal((await failed.handler(failed.request(), 'ip')).status, 503);
  assert.equal(failed.calls.verified.length, 0);
});

test('fallo del proveedor mantiene cuenta existente, oculta detalles y evita reintento automático', async () => {
  const s = setup({ sendError: true });
  const response = await s.handler(s.request(), 'ip');
  assert.deepEqual(await response.json(), { code: 'temporarily_unavailable' });
  assert.equal((await s.handler(s.request(), 'ip')).status, 429);
  assert.equal(s.calls.mails.length, 1);
});

test('HTML escapa nombre y enlace; texto conserva URL; no reevalúa datos como marcadores', () => {
  const mail = renderMail(templates, { email: 'owner@example.test', displayName: '<Ana & "{{VERIFICATION_URL}}">\r\n' }, fakeLink, config.actionOrigin);
  assert.ok(mail.html.includes('&lt;Ana &amp; &quot;{{VERIFICATION_URL}}&quot;&gt;'));
  assert.ok(mail.html.includes('&amp;lang=es'));
  assert.ok(mail.text.includes(fakeLink));
  assert.ok(!mail.text.includes('&amp;lang'));
  assert.throws(() => renderMail(templates, { email: 'owner@example.test' }, 'javascript:alert(1)', config.actionOrigin));
  assert.throws(() => renderMail(templates, { email: 'owner@example.test' }, 'https://evil.test/action', config.actionOrigin));
  assert.throws(() => renderMail({ html: '{{UNKNOWN}}', text: '' }, { email: 'owner@example.test' }, fakeLink, config.actionOrigin));
});

test('rechaza cuerpos grandes y permite preflight sin autenticar ni enviar', async () => {
  const s = setup();
  assert.equal((await s.handler(s.request('x'.repeat(1025)), 'ip')).status, 413);
  assert.equal((await s.handler(s.request('', '', config.allowedOrigin, 'OPTIONS'), 'ip')).status, 204);
  assert.equal(s.calls.mails.length, 0);
});

test('cliente inactivo sin endpoint; petición autenticada sin datos personales ni reintento', async () => {
  const user = { getIdToken: async () => 'mock-token' };
  assert.equal(await requestVerificationEmail(user), 'not_configured');
  let calls = 0;
  const fakeFetch: typeof fetch = async (_input, options) => {
    calls++;
    assert.equal(options?.body, '{}');
    assert.ok(options);
    assert.equal((options.headers as Record<string, string>).Authorization, 'Bearer mock-token');
    return Response.json({ code: 'sent' });
  };
  assert.equal(await requestVerificationEmail(user, 'https://backend.example.test/auth/email-verification', fakeFetch), 'sent');
  assert.equal(calls, 1);
  assert.equal(await requestVerificationEmail(user, 'http://backend.example.test', fakeFetch), 'not_configured');
});

test('confirmación consulta Firebase y renueva token; errores nunca se convierten en verificado', async () => {
  const calls: string[] = [];
  const user = {
    emailVerified: false,
    async reload() { calls.push('reload'); this.emailVerified = true; },
    async getIdToken(force?: boolean) { assert.equal(force, true); calls.push('token'); return 'mock'; },
  };
  assert.equal(await refreshVerificationStatus(user), true);
  assert.deepEqual(calls, ['reload', 'token']);
  await assert.rejects(refreshVerificationStatus({ ...user, async reload() { throw new Error('offline'); } }));
  assert.equal(await refreshVerificationStatus({ ...user, emailVerified: false, async reload() {} }), false);
});

test('cliente no informa éxito con respuestas inválidas o fallidas y no reintenta', async () => {
  const user = { getIdToken: async () => 'mock-token' };
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; throw new Error('offline'); };
  assert.equal(await requestVerificationEmail(user, 'https://backend.example.test', fetcher), 'temporarily_unavailable');
  assert.equal(calls, 1);
  assert.equal(await requestVerificationEmail(user, 'https://backend.example.test', async () => Response.json({ code: 'sent' }, { status: 503 })), 'temporarily_unavailable');
  assert.equal(await requestVerificationEmail(user, 'https://backend.example.test', async () => Response.json({ code: 'unknown' })), 'temporarily_unavailable');
});
