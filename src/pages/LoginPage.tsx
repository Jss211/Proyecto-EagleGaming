import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <div className="auth-page">
      <main className="auth-panel auth-panel--form">
        <div className="auth-card">
          <h1 className="auth-card__title">Iniciar sesión</h1>
          <p className="auth-card__subtitle">
            Esta pantalla pertenece a sandoval.
          </p>
          <Link to="/register" className="back-link">
            ← Volver al registro
          </Link>
        </div>
      </main>
    </div>
  );
}