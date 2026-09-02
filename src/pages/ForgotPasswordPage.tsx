import { useState } from 'react'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await sendPasswordResetEmail(auth, email)
      setIsSent(true)
    } catch (error) {
      setErrorMessage(mapFirebaseError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <Link
            to="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al inicio de sesión
          </Link>

          <img
            src="/logo-Eagle.png"
            alt="Eagle Gaming"
            className="mb-6 h-16 w-auto object-contain object-left"
          />

          {isSent ? (
            <div role="status" className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <MailCheck className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Revisa tu correo electrónico
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Te enviamos un enlace a <strong>{email}</strong> para cambiar tu contraseña.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Si no lo encuentras, revisa la carpeta de spam o correo no deseado.
                El enlace te llevará a una página segura para crear tu nueva contraseña.
              </p>
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="mt-7 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Enviar a otro correo
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">
                Recupera tu contraseña
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Escribe el correo asociado a tu cuenta y te enviaremos instrucciones para crear una contraseña nueva.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-slate-700">
                    Correo electrónico
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    required
                  />
                </div>

                {errorMessage && (
                  <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function mapFirebaseError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''

  switch (code) {
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.'
    case 'auth/user-not-found':
      return 'No encontramos una cuenta con ese correo.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.'
    default:
      return 'No pudimos enviar el correo. Revisa los datos e inténtalo de nuevo.'
  }
}
