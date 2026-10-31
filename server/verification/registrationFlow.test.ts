import test from 'node:test';
import assert from 'node:assert/strict';
import { completePasswordRegistration } from '../../src/features/auth/registrationFlow.ts';
import { canRequestVerification, checkVerification, requestVerificationEmail, resolveVerificationEndpoint } from '../../src/features/auth/emailVerification.ts';

const values = { firstName: 'Ana', lastName: 'Prueba', email: 'test@example.test', password: 'TestOnly123' };

test('registro crea una sola cuenta, guarda nombre/perfil y solicita un solo envio', async () => {
  const calls: string[] = [];
  const user = { uid: 'mock-user', getIdToken: async () => 'MOCK_TOKEN' };
  const result = await completePasswordRegistration(values, {
    create: async (email, password) => { assert.equal(email, values.email); assert.equal(password, values.password); calls.push('create'); return user; },
    onCreated: current => { assert.equal(current, user); calls.push('session-created'); },
    updateName: async (current, name) => { assert.equal(current, user); assert.equal(name, 'Ana Prueba'); calls.push('name'); },
    saveProfile: async () => { calls.push('profile'); },
    send: current => requestVerificationEmail(current, 'https://store.example.test/api/email-verification.php', async (_url, options) => {
      assert.equal(options?.method, 'POST'); assert.equal(options?.body, '{}'); calls.push('send');
      return Response.json({ code: 'sent' });
    }),
  });
  assert.deepEqual(calls, ['create', 'session-created', 'name', 'profile', 'send']);
  assert.equal(result.verificationCode, 'sent'); assert.equal(result.warning, null); assert.equal(result.user, user);
});

test('cuenta existente despues de fallos de perfil y envio no se vuelve a crear ni pierde sesion', async () => {
  let creations = 0; let session: unknown;
  const user = { uid: 'mock-user' };
  const result = await completePasswordRegistration(values, {
    create: async () => { creations++; return user; }, onCreated: current => { session = current; },
    updateName: async () => { throw new Error('network'); }, saveProfile: async () => { throw new Error('profile'); },
    send: async () => { throw new Error('timeout'); },
  });
  assert.equal(creations, 1); assert.equal(session, user); assert.equal(result.user, user);
  assert.equal(result.verificationCode, 'temporarily_unavailable'); assert.match(result.warning ?? '', /No necesitas registrarte de nuevo/);
});

test('fallo de creacion no solicita correo ni declara cuenta creada', async () => {
  let sideEffects = 0;
  await assert.rejects(completePasswordRegistration(values, {
    create: async () => { throw new Error('auth/email-already-in-use'); }, onCreated: () => { sideEffects++; },
    updateName: async () => { sideEffects++; }, saveProfile: async () => { sideEffects++; },
    send: async () => { sideEffects++; return 'sent'; },
  }));
  assert.equal(sideEffects, 0);
});

test('reenvio autentica al mismo usuario y muestra limite sin reintentos', async () => {
  let calls = 0;
  const code = await requestVerificationEmail({ getIdToken: async () => 'MOCK_TOKEN' }, 'https://store.example.test/api/email-verification.php', async (_url, options) => {
    calls++; assert.equal((options?.headers as Record<string, string>)?.Authorization, 'Bearer MOCK_TOKEN');
    return Response.json({ code: 'rate_limited' }, { status: 429 });
  });
  assert.equal(code, 'rate_limited'); assert.equal(calls, 1);
});

test('enlace vencido conserva estado pendiente hasta que Firebase confirma con token renovado', async () => {
  const calls: string[] = [];
  const user = { emailVerified: false, reload: async () => { calls.push('reload'); }, getIdToken: async (force?: boolean) => { assert.equal(force, true); calls.push('token'); return 'MOCK'; } };
  const pending = await checkVerification(user);
  assert.equal(pending.status, 'pending'); assert.match(pending.message, /venció/);
  user.reload = async () => { calls.push('reload'); user.emailVerified = true; };
  assert.equal((await checkVerification(user)).status, 'verified');
  assert.deepEqual(calls, ['reload', 'token', 'reload', 'token']);
});

test('errores de sesion/red no se convierten en verificacion exitosa', async () => {
  for (const [code, expected] of [['auth/user-token-expired', 'session_expired'], ['auth/network-request-failed', 'unavailable']]) {
    const result = await checkVerification({ emailVerified: false, reload: async () => { throw { code }; }, getIdToken: async () => 'MOCK' });
    assert.equal(result.status, expected);
  }
});

test('Google y cuentas vinculadas a Google no ofrecen el envio personalizado', () => {
  const provider = (providerId: string) => ({ providerId, uid: 'mock', displayName: null, email: null, phoneNumber: null, photoURL: null });
  assert.equal(canRequestVerification({ providerData: [provider('google.com')] }), false);
  assert.equal(canRequestVerification({ providerData: [provider('password'), provider('google.com')] }), false);
  assert.equal(canRequestVerification({ providerData: [provider('password')] }), true);
});

test('endpoint del mismo origen HTTPS por defecto; rechaza enlaces inseguros', () => {
  assert.equal(resolveVerificationEndpoint('https://store.example.test'), 'https://store.example.test/api/email-verification.php');
  assert.equal(resolveVerificationEndpoint('http://localhost:5173'), undefined);
  for (const bad of ['http://api.example.test', 'https://user:password@api.example.test', 'https://api.example.test?token=secret']) {
    assert.equal(resolveVerificationEndpoint('https://store.example.test', bad), undefined);
  }
});
