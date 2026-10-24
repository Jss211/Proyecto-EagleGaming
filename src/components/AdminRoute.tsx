import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege las rutas de administrador.
 * Verifica:
 *  1. Que haya un usuario autenticado en Firebase Auth.
 *  2. Que ese usuario tenga un documento en /admins/{uid} en Firestore
 *     (verificado a través del AuthContext, que es server-side).
 *
 * NO auto-crea documentos de admin ni confía solo en el email.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">
            Verificando acceso…
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}
