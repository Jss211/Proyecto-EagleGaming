import { Link } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { Home, ShoppingBag } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md w-full">
          <span className="text-7xl font-extrabold text-[#e81950] tracking-wider block mb-2 font-mono">
            404
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Página no encontrada
          </h1>
          <p className="text-gray-600 text-sm mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida como parte de nuestra nueva tienda online.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#e81950] hover:bg-[#d01545] text-white font-medium text-sm transition-colors shadow-md"
            >
              <Home size={18} />
              Volver al inicio
            </Link>
            <Link
              to="/categoria/pc-completa"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm transition-colors"
            >
              <ShoppingBag size={18} />
              Ver Computadoras
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
