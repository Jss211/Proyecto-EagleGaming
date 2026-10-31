import type { User } from 'firebase/auth';

export type VerificationCode = 'sent' | 'already_verified' | 'provider_managed' |
  'not_configured' | 'rate_limited' | 'unauthenticated' | 'forbidden' |
  'not_eligible' | 'temporarily_unavailable';

export const verificationMessages: Record<VerificationCode, string> = {
  sent: 'Te enviamos un correo de confirmación. Tu cuenta todavía está pendiente de verificación.',
  already_verified: 'Firebase indica que tu correo ya está verificado.',
  provider_managed: 'Tu acceso con Google continúa disponible.',
  not_configured: 'El envío de confirmación todavía no está disponible. Tu cuenta sigue activa.',
  rate_limited: 'Espera antes de solicitar otro correo. Tu cuenta ya existe; no necesitas registrarte de nuevo.',
  unauthenticated: 'Inicia sesión para solicitar el correo de confirmación.',
  forbidden: 'No pudimos autorizar esta solicitud. Tu cuenta no se ha eliminado.',
  not_eligible: 'No es posible enviar una confirmación para esta cuenta.',
  temporarily_unavailable: 'No pudimos confirmar el envío. Tu cuenta ya existe; puedes solicitar otro correo más tarde.',
};

// URL pública únicamente; nunca contiene credenciales. Mismo origen por defecto.
export function configuredVerificationEndpoint(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const configured = import.meta.env.VITE_EMAIL_VERIFICATION_ENDPOINT as string | undefined;
  return resolveVerificationEndpoint(window.location.origin, configured);
}

export function resolveVerificationEndpoint(origin: string, configured?: string): string | undefined {
  try {
    const endpoint = new URL(configured || '/api/email-verification.php', origin);
    return endpoint.protocol === 'https:' && !endpoint.username && !endpoint.password && !endpoint.search && !endpoint.hash
      ? endpoint.href : undefined;
  } catch { return undefined; }
}

export function canRequestVerification(user: Pick<User, 'providerData'>): boolean {
  return user.providerData.some(provider => provider.providerId === 'password') &&
    !user.providerData.some(provider => provider.providerId === 'google.com');
}

// Inicial y reenvío usan exactamente esta misma operación, sin reintentos automáticos.
export async function requestVerificationEmail(
  user: Pick<User, 'getIdToken'>,
  endpoint?: string,
  fetcher: typeof fetch = fetch,
): Promise<VerificationCode> {
  if (!endpoint) return 'not_configured';
  try {
    const url = new URL(endpoint);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return 'not_configured';
    const token = await user.getIdToken();
    const response = await fetcher(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal: AbortSignal.timeout(60_000),
    });
    const result: unknown = await response.json();
    if (typeof result !== 'object' || result === null || !('code' in result) ||
        typeof result.code !== 'string' || !Object.hasOwn(verificationMessages, result.code)) {
      return 'temporarily_unavailable';
    }
    const code = result.code as VerificationCode;
    if (!response.ok && ['sent', 'already_verified', 'provider_managed'].includes(code)) return 'temporarily_unavailable';
    return code;
  } catch {
    return 'temporarily_unavailable';
  }
}

// No considera confirmado el correo por enviar o pulsar el enlace.
export async function refreshVerificationStatus(
  user: Pick<User, 'reload' | 'getIdToken' | 'emailVerified'>,
): Promise<boolean> {
  await user.reload();
  await user.getIdToken(true);
  return user.emailVerified;
}

export type VerificationCheck = { status: 'verified' | 'pending' | 'session_expired' | 'unavailable'; message: string };

export async function checkVerification(user: Pick<User, 'reload' | 'getIdToken' | 'emailVerified'>): Promise<VerificationCheck> {
  try {
    const verified = await refreshVerificationStatus(user);
    return verified
      ? { status: 'verified', message: 'Tu correo está verificado. Puedes continuar en la tienda.' }
      : { status: 'pending', message: 'Firebase todavía no confirma tu correo. Si el enlace venció o ya no funciona, solicita uno nuevo y usa el más reciente.' };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    return ['auth/user-token-expired', 'auth/invalid-user-token', 'auth/user-disabled', 'auth/user-not-found'].includes(code ?? '')
      ? { status: 'session_expired', message: 'Tu sesión necesita renovarse. Inicia sesión de nuevo; tu cuenta ya existe.' }
      : { status: 'unavailable', message: 'No pudimos consultar Firebase. Revisa tu conexión y vuelve a comprobar el correo.' };
  }
}
