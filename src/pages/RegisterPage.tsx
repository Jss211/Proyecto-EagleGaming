import { RegisterForm } from "../features/auth/RegisterForm";

export function RegisterPage() {
  return (
    <div className="auth-page">
      

      <aside className="auth-panel auth-panel--visual">
        <p className="auth-visual__headline">
          Tu escuadrón
          <br />
          te está esperando.
        </p>
      </aside>
      <main className="auth-panel auth-panel--form">
        <RegisterForm onSuccess={() => window.location.assign("/")} />
      </main>
    </div>
  );
}