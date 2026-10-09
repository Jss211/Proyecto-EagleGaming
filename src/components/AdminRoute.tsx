import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
        <p className="text-lg text-gray-600 dark:text-gray-400">Verificando sesión...</p>
      </div>
    );
  }

  // Si no hay usuario logueado, lo regresamos a la pantalla de login del admin
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Si sí hay usuario, mostramos el panel de admin
  return <>{children}</>;
}
