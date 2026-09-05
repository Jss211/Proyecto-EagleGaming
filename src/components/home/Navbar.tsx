import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">

        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="Ir al inicio Eagle Gaming">
          <img src="/icono.png" alt="Eagle Gaming" className="navbar__logo-img" />
        </Link>

        {/* Categorias */}
        <button className="navbar__categories-btn" aria-label="Abrir categorias">
          <Menu className="navbar__categories-icon" />
          <span>Categorias</span>
        </button>

        {/* Buscador */}
        <form className="navbar__search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            className="navbar__search-input"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar productos"
          />
        </form>

        {/* Links */}
        <nav className="navbar__links" aria-label="Navegacion principal">
          <Link to="/" className="navbar__link">Inicio</Link>
          <Link to="/nosotros" className="navbar__link navbar__link--nosotros">Nosotros</Link>
          <Link to="/contactenos" className="navbar__link navbar__link--contactenos">Contactenos</Link>
        </nav>

        {/* Carrito */}
        <button className="navbar__icon-btn" aria-label="Ver carrito de compras">
          <ShoppingCart className="w-5 h-5" />
          <span className="navbar__cart-badge">0</span>
        </button>

        {/* Acceder */}
        <button
          className="navbar__acceder-btn"
          onClick={() => navigate("/login")}
          aria-label="Iniciar sesion o registrarse"
        >
          <User className="w-4 h-4" />
          <span>Acceder</span>
        </button>

        {/* Toggle movil */}
        <button
          className="navbar__mobile-toggle"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {mobileMenuOpen && (
        <nav className="navbar__mobile-menu" aria-label="Navegacion movil">
          <Link to="/" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
          <Link to="/nosotros" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
          <Link to="/contactenos" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Contactenos</Link>
          <button className="navbar__mobile-link text-left" onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}>
            Acceder
          </button>
        </nav>
      )}
    </header>
  );
}
