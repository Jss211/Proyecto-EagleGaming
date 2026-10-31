import { useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  canRequestVerification, checkVerification, configuredVerificationEndpoint,
  requestVerificationEmail, verificationMessages, type VerificationCheck, type VerificationCode,
} from './emailVerification';

interface Props {
  user: User;
  initialCode?: VerificationCode | null;
  initialSending?: boolean;
}

export function EmailVerificationPanel({ user, initialCode = null, initialSending = false }: Props) {
  const [code, setCode] = useState<VerificationCode | null>(null);
  const [check, setCheck] = useState<VerificationCheck | null>(null);
  const [busy, setBusy] = useState<'send' | 'check' | null>(null);
  const operation = useRef(false);
  if (!canRequestVerification(user)) return null;
  const verified = check?.status === 'verified' || user.emailVerified;
  const activeCode = code ?? initialCode;
  const disabled = initialSending || busy !== null;

  async function perform(action: 'send' | 'check') {
    if (operation.current || initialSending) return;
    operation.current = true;
    setBusy(action);
    try {
      const current = await checkVerification(user);
      setCheck(current);
      if (action === 'send' && current.status === 'pending') {
        setCode(await requestVerificationEmail(user, configuredVerificationEndpoint()));
      }
    } finally {
      operation.current = false;
      setBusy(null);
    }
  }

  return (
    <section aria-label="Verificación de correo" className="my-6 rounded-xl border border-gray-200 bg-white p-5 text-left">
      <h2 className="text-lg font-bold text-gray-900">{verified ? 'Correo verificado' : 'Confirma tu correo electrónico'}</h2>
      {verified ? <p role="status" className="mt-2 text-sm text-gray-700">Tu correo está confirmado. Puedes continuar en la tienda.</p> : <>
        <p className="mt-2 text-sm leading-6 text-gray-700">Tu cuenta ya existe y tu sesión sigue disponible. Revisa la bandeja de entrada y spam de <strong>{user.email}</strong>.</p>
        {initialSending && <p role="status" className="mt-3 text-sm">Preparando tu correo de confirmación…</p>}
        {!initialSending && activeCode && <p role="status" className="mt-3 text-sm leading-6 text-gray-700">{verificationMessages[activeCode]}</p>}
        {check && <p role="status" className="mt-3 text-sm leading-6 text-gray-700">{check.message}</p>}
        {check?.status === 'session_expired' && <a href="/login" className="mt-3 inline-block font-semibold text-red-700 underline">Iniciar sesión de nuevo</a>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" disabled={disabled} onClick={() => void perform('check')}
            className="rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
            {busy === 'check' ? 'Consultando Firebase…' : 'Ya confirmé mi correo'}
          </button>
          <button type="button" disabled={disabled} onClick={() => void perform('send')}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 disabled:opacity-50">
            {busy === 'send' ? 'Solicitando correo…' : 'Reenviar verificación'}
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-gray-500">Puedes solicitar un reenvío cada cinco minutos. Si el enlace venció o ya fue utilizado, comprueba primero tu estado y usa el correo más reciente.</p>
      </>}
    </section>
  );
}
