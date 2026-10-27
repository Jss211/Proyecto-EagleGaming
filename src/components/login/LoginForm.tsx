import { useState, useEffect } from 'react'
import { Eye, EyeOff, ArrowLeft, MailCheck } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { GradientText } from './GradientText'
import { auth, googleProvider } from '../../firebase'
import { isAdminUser, ensureAdminDocument } from '../../utils/admin'

interface FormData {
  email: string
  password: string
}

const INITIAL_FORM: FormData = {
  email: '',
  password: ''
}

interface LoginFormProps {
  initialMode?: 'login' | 'forgot'
}

export function LoginForm({ initialMode = 'login' }: LoginFormProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'forgot'>(() => {
    return initialMode || (searchParams.get('mode') === 'forgot' ? 'forgot' : 'login')
  })

  // Si ya tiene sesión iniciada como admin, enviarlo al panel de inmediato
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && isAdminUser(user.email)) {
        await ensureAdminDocument(user)
        navigate('/admin', { replace: true })
      }
    })
    return () => unsubscribe()
  }, [navigate])

  // Estados de Login
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Estados de Recuperación de contraseña
  const [forgotEmail, setForgotEmail] = useState('')
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false)
  const [isForgotSent, setIsForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const credenciales = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      
      // Si el correo es de administrador, redirigir a /admin
      if (isAdminUser(credenciales.user.email)) {
        await ensureAdminDocument(credenciales.user)
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error) {
      setMessage(mapFirebaseError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const credenciales = await signInWithPopup(auth, googleProvider)
      
      // Si el correo es de administrador, redirigir a /admin
      if (isAdminUser(credenciales.user.email)) {
        await ensureAdminDocument(credenciales.user)
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error) {
      setMessage(mapFirebaseError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsForgotSubmitting(true)
    setForgotError(null)

    try {
      await sendPasswordResetEmail(auth, forgotEmail)
      setIsForgotSent(true)
    } catch (error) {
      setForgotError(mapFirebaseForgotError(error))
    } finally {
      setIsForgotSubmitting(false)
    }
  }

  const handleBackToStore = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 md:p-8">
      {mode === 'login' ? (
        <>
          {/* Botón Volver a la tienda */}
          <button
            type="button"
            onClick={handleBackToStore}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#e81950] transition-colors mb-5 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Volver a la tienda
          </button>

          {/* Encabezado */}
          <div className="mb-4">
            <img
              src="/logo-Eagle.png"
              alt="Eagle Gaming"
              className="h-16 sm:h-20 w-auto mb-4"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
              Bienvenido a{' '}
              <GradientText className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Eagle Gaming
              </GradientText>
            </h1>
            <p className="text-gray-600 mt-2">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: '#d30202cc' }}
              >
                Regístrate
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange} 
                placeholder="Correo electrónico"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e81950] outline-none"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e81950] outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  {showPassword
                    ? <EyeOff className="w-5 h-5 text-gray-500" />
                    : <Eye className="w-5 h-5 text-gray-500" />
                  }
                </button>
              </div>
            </div>

            {/* Olvidé contraseña */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot')
                  setMessage(null)
                  setIsForgotSent(false)
                  setForgotError(null)
                }}
                className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: '#cc0000' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Iniciar sesión */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Procesando...' : 'Iniciar sesión'}
            </button>

            {message && (
              <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg" role="status">
                {message}
              </p>
            )}

            {/* Divisor */}
            <div className="relative my-4 -mt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <GoogleIcon />
              <span className="text-sm font-medium text-gray-700">
                Continuar con Google
              </span>
            </button>
          </form>
        </>
      ) : (
        <>
          {/* MODO: RECUPERAR CONTRASEÑA */}
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setIsForgotSent(false)
              setForgotError(null)
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#e81950] transition-colors mb-5 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Volver al inicio de sesión
          </button>

          <div className="mb-6">
            <img
              src="/logo-Eagle.png"
              alt="Eagle Gaming"
              className="h-16 sm:h-20 w-auto mb-4"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              Recupera tu contraseña
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Escribe el correo asociado a tu cuenta y te enviaremos instrucciones para crear una contraseña nueva.
            </p>
          </div>

          {isForgotSent ? (
            <div role="status" className="text-center py-2 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#e81950]">
                <MailCheck className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Revisa tu correo electrónico
              </h3>
              <p className="text-sm leading-6 text-gray-600">
                Te enviamos un enlace a <strong className="text-gray-900">{forgotEmail}</strong> para cambiar tu contraseña.
              </p>
              <p className="text-xs leading-5 text-gray-500">
                Si no lo encuentras en la bandeja de entrada, revisa la carpeta de spam o correo no deseado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsForgotSent(false)
                  setMode('login')
                }}
                className="mt-4 w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#e81950] outline-none transition"
                  required
                />
              </div>

              {forgotError && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {forgotError}
                </p>
              )}

              <button
                type="submit"
                disabled={isForgotSubmitting}
                className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isForgotSubmitting ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

function mapFirebaseError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'El correo o la contraseña no son correctos.'
    case 'auth/user-not-found':
      return 'No existe una cuenta con ese correo.'
    case 'auth/invalid-email':
      return 'El correo no es válido.'
    case 'auth/popup-closed-by-user':
      return 'Cerraste la ventana de Google antes de terminar.'
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de Google.'
    default:
      return 'No pudimos completar la operación. Intenta de nuevo.'
  }
}

function mapFirebaseForgotError(error: unknown): string {
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
