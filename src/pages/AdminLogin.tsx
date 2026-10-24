import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { isAdminEmail, verifyAdminDocument } from "../utils/admin";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Verificación rápida de lista blanca antes de llamar a Firebase
    if (!isAdminEmail(email)) {
      setError("No tienes permisos de administrador.");
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      // Verificar que existe el documento en Firestore (sin crearlo)
      const isAdmin = await verifyAdminDocument(res.user);
      if (!isAdmin) {
        await auth.signOut();
        setError("Tu cuenta no tiene acceso de administrador. Contacta al propietario.");
        return;
      }

      navigate("/admin");
    } catch {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-8">
      <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-md w-full max-w-sm sm:max-w-md border border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6 text-slate-900">
          Panel de Administrador
        </h1>

        {error && (
          <p className="text-red-600 mb-4 text-center text-sm font-medium" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo del administrador"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-slate-300 rounded-xl text-sm focus:border-[#e81950] outline-none"
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-slate-300 rounded-xl text-sm focus:border-[#e81950] outline-none"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {loading ? "Verificando…" : "Ingresar al Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
