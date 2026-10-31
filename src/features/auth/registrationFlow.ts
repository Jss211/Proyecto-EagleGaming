import type { RegisterFormValues } from './auth.types.ts';
import type { VerificationCode } from './emailVerification.ts';

type Values = Pick<RegisterFormValues, 'firstName' | 'lastName' | 'email' | 'password'>;

export async function completePasswordRegistration<TUser>(values: Values, dependencies: {
  create: (email: string, password: string) => Promise<TUser>;
  onCreated: (user: TUser) => void;
  updateName: (user: TUser, name: string) => Promise<void>;
  saveProfile: (user: TUser, values: Values) => Promise<void>;
  send: (user: TUser) => Promise<VerificationCode>;
}) {
  // Solo un fallo de creación significa que no hay una cuenta nueva.
  const user = await dependencies.create(values.email, values.password);
  dependencies.onCreated(user);
  const warnings: string[] = [];
  try { await dependencies.updateName(user, `${values.firstName} ${values.lastName}`); }
  catch { warnings.push('Tu cuenta se creó, pero no pudimos guardar tu nombre. Puedes actualizarlo en Mi cuenta.'); }
  try { await dependencies.saveProfile(user, values); }
  catch { warnings.push('Tu cuenta se creó, pero no pudimos guardar todos los datos del perfil. No necesitas registrarte de nuevo.'); }
  let verificationCode: VerificationCode;
  try { verificationCode = await dependencies.send(user); }
  catch { verificationCode = 'temporarily_unavailable'; }
  return { user, verificationCode, warning: warnings.join(' ') || null };
}
