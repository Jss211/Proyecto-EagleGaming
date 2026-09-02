import { LoginCarousel } from './LoginCarousel'
import { LoginForm } from './LoginForm'

export function LoginPage() {
  return (
    <div className="h-screen w-screen flex">
      <LoginCarousel />
      <div className="flex-1 flex items-center justify-center bg-white">
        <LoginForm />
      </div>
    </div>
  )
}
