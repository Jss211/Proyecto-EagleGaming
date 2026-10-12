import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase";
import { isAdminUser, ensureAdminDocument } from "../utils/admin";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Garantizar que el usuario tenga su documento admin en Firestore
        await ensureAdminDocument(currentUser);
      }
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
        <p className="text-lg text-gray-600 dark:text-gray-400">Verificando sesión de administrador...</p>
      </div>
    );
  }

  // Si no hay usuario logueado o no es un email de admin permitido
  if (!user || !isAdminUser(user.email)) {
    return <Navigate to="/admin-login" replace />;
  }

  // Si sí es admin autenticado, mostramos el panel de admin
  return <>{children}</>;
}
