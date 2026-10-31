import type { AdminAuth, Mailer, RateLimiter, VerificationConfig } from './contracts.ts';
import { renderMail } from './template.ts';

interface Dependencies {
  auth: AdminAuth;
  mailer: Mailer;
  limiter: RateLimiter;
  templates: { html: string; text: string };
  config: VerificationConfig;
}

// Adaptador HTTP futuro: POST /auth/email-verification, sin cuerpo de destinatario.
// El host debe imponer HTTPS, tamaño máximo de 1 KiB, timeout y una IP de origen
// confiable. No usar X-Forwarded-For sin un proxy de confianza configurado.
export function createVerificationHandler(dependencies: Dependencies) {
  const { auth, mailer, limiter, templates, config } = dependencies;
  if (config.enabled) {
    for (const value of [config.allowedOrigin, config.continueUrl, config.actionOrigin]) {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || url.hash) {
        throw new Error('Invalid verification configuration');
      }
    }
    if (new URL(config.continueUrl).origin !== config.allowedOrigin ||
        new URL(config.allowedOrigin).origin !== config.allowedOrigin ||
        new URL(config.actionOrigin).origin !== config.actionOrigin) {
      throw new Error('Invalid verification origins');
    }
  }

  return async (request: Request, trustedIp: string): Promise<Response> => {
    const origin = request.headers.get('origin');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'Vary': 'Origin',
    };
    if (origin === config.allowedOrigin) headers['Access-Control-Allow-Origin'] = origin;
    const reply = (status: number, code: string) => new Response(JSON.stringify({ code }), { status, headers });
    if (!config.enabled) return reply(503, 'not_configured');
    if (origin !== config.allowedOrigin) return reply(403, 'forbidden');
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      } });
    }
    if (request.method !== 'POST') return reply(405, 'method_not_allowed');
    if (new URL(request.url).search) return reply(400, 'invalid_request');
    if (!trustedIp) return reply(503, 'not_configured');
    try {
      if (!await limiter.consume(`ip:${trustedIp}`, 10, 60_000)) return reply(429, 'rate_limited');
    } catch {
      return reply(503, 'temporarily_unavailable');
    }
    const bearer = /^Bearer ([^\s]+)$/.exec(request.headers.get('authorization') ?? '');
    if (!bearer || bearer[1]!.length > 8192) return reply(401, 'unauthenticated');
    let uid: string;
    try {
      uid = (await auth.verifyIdToken(bearer[1]!, true)).uid;
      if (!uid) return reply(401, 'unauthenticated');
    } catch {
      return reply(401, 'unauthenticated');
    }
    try {
      // No aceptar uid, email, nombre, enlace o redirect enviados por el cliente.
      let body = '';
      const reader = request.body?.getReader();
      if (reader) {
        let size = 0;
        const decoder = new TextDecoder();
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > 1024) {
            await reader.cancel();
            return reply(413, 'invalid_request');
          }
          body += decoder.decode(chunk.value, { stream: true });
        }
        body += decoder.decode();
      }
      if (body !== '' && body.trim() !== '{}') return reply(400, 'invalid_request');
      const user = await auth.getUser(uid);
      if (user.uid !== uid || user.disabled) return reply(403, 'forbidden');
      if (user.emailVerified) return reply(200, 'already_verified');
      if (user.providerData.some(provider => provider.providerId === 'google.com')) {
        return reply(200, 'provider_managed');
      }
      if (!user.email || /[\r\n]/.test(user.email) || !user.providerData.some(p => p.providerId === 'password')) {
        return reply(409, 'not_eligible');
      }
      // La misma reserva cubre el envío inicial y el reenvío, también en paralelo.
      if (!await limiter.consume(`uid:${uid}`, 1, 60_000)) return reply(429, 'rate_limited');
      if (!await limiter.consume(`daily:${uid}`, 5, 86_400_000)) return reply(429, 'rate_limited');
      const link = await auth.generateEmailVerificationLink(user.email, { url: config.continueUrl });
      await mailer.send(renderMail(templates, { email: user.email, displayName: user.displayName }, link, config.actionOrigin));
      return reply(200, 'sent');
    } catch {
      // Nunca incluir errores del SDK/proveedor: pueden contener códigos o credenciales.
      // No reintentar automáticamente: un timeout podría ocultar un envío aceptado.
      return reply(503, 'temporarily_unavailable');
    }
  };
}
