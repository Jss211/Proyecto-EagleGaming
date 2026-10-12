import { LoginCarousel } from './LoginCarousel'
import { LoginForm } from './LoginForm'

interface LoginPageProps {
  initialMode?: 'login' | 'forgot'
}

export function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  return (
    <div className="h-screen w-screen flex">
      <LoginCarousel />
      <div className="flex-1 flex items-center justify-center bg-white overflow-y-auto">
        <LoginForm initialMode={initialMode} />
      </div>
    </div>
  )
}
