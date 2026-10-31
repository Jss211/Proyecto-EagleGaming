export interface Account {
  uid: string;
  email?: string;
  displayName?: string;
  disabled: boolean;
  emailVerified: boolean;
  providerData: { providerId: string }[];
}

// Compatible con getAuth() de firebase-admin/auth, solo en un runtime privado.
export interface AdminAuth {
  verifyIdToken(token: string, checkRevoked: boolean): Promise<{ uid: string }>;
  getUser(uid: string): Promise<Account>;
  generateEmailVerificationLink(email: string, settings: { url: string }): Promise<string>;
}

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

export interface RateLimiter {
  // Reserva atómica; TTL y reloj del servidor. Fallar cerrado si el almacén falla.
  // Las claves deben ser opacas en almacenamiento/logs del adaptador final.
  consume(key: string, limit: number, windowMs: number): Promise<boolean>;
}

export interface VerificationConfig {
  enabled: boolean;
  allowedOrigin: string;
  continueUrl: string;
  actionOrigin: string;
}
