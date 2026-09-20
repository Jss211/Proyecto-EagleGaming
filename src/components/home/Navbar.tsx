import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../../firebase";

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  const firstName = currentUser?.displayName?.trim().split(/\s+/)[0];
  const accountLabel = firstName ? `Bienvenido, ${firstName}` : "Acceder";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">

        {/* Logo */}
        <NavLink to="/" className="navbar__logo" aria-label="Ir al inicio Eagle Gaming">
          <img src="/icono.png" alt="Eagle Gaming" className="navbar__logo-img" />
        </NavLink>

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
          <NavLink to="/" end className="navbar__link">Inicio</NavLink>
          <NavLink to="/nosotros" className="navbar__link navbar__link--nosotros">Nosotros</NavLink>
          <NavLink to="/contactenos" className="navbar__link navbar__link--contactenos">Contactenos</NavLink>
        </nav>

        {/* Carrito */}
        <button className="navbar__icon-btn" aria-label="Ver carrito de compras">
          <ShoppingCart className="w-5 h-5" />
          <span className="navbar__cart-badge">0</span>
        </button>

        {/* Acceder */}
        <button
          className="navbar__acceder-btn"
          onClick={() => navigate(currentUser ? "/cuenta" : "/login")}
          aria-label="Iniciar sesion o registrarse"
        >
          <User className="w-4 h-4" />
          <span>{accountLabel}</span>
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
          <NavLink to="/" end className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Inicio</NavLink>
          <NavLink to="/nosotros" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Nosotros</NavLink>
          <NavLink to="/contactenos" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Contactenos</NavLink>
          <button className="navbar__mobile-link text-left" onClick={() => { navigate(currentUser ? "/cuenta" : "/login"); setMobileMenuOpen(false); }}>
            {accountLabel}
          </button>
        </nav>
      )}
    </header>
  );
}
