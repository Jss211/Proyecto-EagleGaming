import { LoginCarousel } from './LoginCarousel'
import { LoginForm } from './LoginForm'

interface LoginPageProps {
  initialMode?: 'login' | 'forgot'
}

export function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Carrusel visual gamer para pantallas medianas y grandes */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden bg-black">
        <LoginCarousel />
      </div>

      {/* Formulario centrado y optimizado para móvil y desktop */}
      <div className="flex-1 flex items-center justify-center bg-white min-h-screen md:min-h-0 overflow-y-auto px-4 py-8 sm:px-6 md:px-8">
        <LoginForm initialMode={initialMode} />
      </div>
    </div>
  )
}
