import { LoginCarousel } from "../components/login/LoginCarousel";
import { RegisterForm } from "../features/auth/RegisterForm";

export function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 relative overflow-hidden bg-black">
        <LoginCarousel />
      </div>
      <div className="flex-1 flex items-center justify-center bg-white min-h-screen md:min-h-0 overflow-y-auto px-4 py-8 sm:px-6 md:px-8">
        <RegisterForm onSuccess={() => window.location.assign("/")} />
      </div>
    </div>
  );
}