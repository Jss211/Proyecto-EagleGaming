import { RegisterForm } from "../features/auth/RegisterForm";

export function RegisterPage() {
  return (
    <div className="auth-page">
      

      <aside className="auth-panel auth-panel--visual">
        <p className="auth-visual__headline">
          img
          <br />
          de la empresa.
        </p>
      </aside>
      <main className="auth-panel auth-panel--form">
        <RegisterForm onSuccess={() => window.location.assign("/")} />
      </main>
    </div>
  );
}