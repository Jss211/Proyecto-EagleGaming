import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export function AdminPanel() {
  const navigate = useNavigate();

  const handleCerrarSesion = async () => {
    await signOut(auth);
    navigate("/admin-login");
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración de Productos</h1>
        <button onClick={handleCerrarSesion} className="bg-red-500 text-white px-4 py-2 rounded">
          Cerrar Sesión
        </button>
      </div>
      
      <div className="border-4 border-dashed border-gray-300 p-10 text-center text-gray-500">
        Aquí pondremos la tabla con tus productos y el botón de "Agregar Nuevo".
      </div>
    </div>
  );
}