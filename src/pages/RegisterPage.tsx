import { LoginCarousel } from "../components/login/LoginCarousel";
import { RegisterForm } from "../features/auth/RegisterForm";

export function RegisterPage() {
  return (
    <div className="h-screen w-screen flex">
      <LoginCarousel />
      <div className="flex-1 flex items-center justify-center bg-white">
        <RegisterForm onSuccess={() => window.location.assign("/")} />
      </div>
    </div>
  );
}