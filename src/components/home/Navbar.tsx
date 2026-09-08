import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Monitor,
  Box,
  Cpu,
  HardDrive,
  Zap,
  BatteryCharging,
  MemoryStick,
  Mouse,
  CircuitBoard,
  Video,
} from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../../firebase";

const CATEGORY_LINKS = [
  { id: "monitores", label: "Monitores", Icon: Monitor },
  { id: "case", label: "Case", Icon: Box },
  { id: "pc-completa", label: "PC Completa", Icon: Cpu },
  { id: "disco-ssd", label: "Disco SSD", Icon: HardDrive },
  { id: "estabilizador", label: "Estabilizador", Icon: Zap },
  { id: "fuente-de-poder", label: "Fuente de poder", Icon: BatteryCharging },
  { id: "memoria-ram", label: "Memoria RAM", Icon: MemoryStick },
  { id: "perifericos", label: "Perifericos", Icon: Mouse },
  { id: "placa-madre", label: "Placa madre", Icon: CircuitBoard },
  { id: "tarjetas-de-video", label: "Tarjetas de video", Icon: Video },
];

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
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
        <Link to="/" className="navbar__logo" aria-label="Ir al inicio Eagle Gaming">
          <img src="/icono.png" alt="Eagle Gaming" className="navbar__logo-img" />
        </Link>

        {/* Categorias */}
        <div
          className="navbar__categories-area"
          onMouseEnter={() => setCategoriesOpen(true)}
          onMouseLeave={() => setCategoriesOpen(false)}
        >
          <button
            className="navbar__categories-btn"
            onClick={() => setCategoriesOpen((open) => !open)}
            aria-label="Abrir categorias"
            aria-expanded={categoriesOpen}
            aria-controls="navbar-category-sidebar"
          >
            {categoriesOpen ? <X className="navbar__categories-icon" /> : <Menu className="navbar__categories-icon" />}
            <span>Categorias</span>
          </button>

          {categoriesOpen && (
            <aside id="navbar-category-sidebar" className="navbar-category-sidebar">
              <nav className="navbar-category-sidebar__nav" aria-label="Categorías de productos">
                {CATEGORY_LINKS.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categoria/${category.id}`}
                    className="navbar-category-sidebar__link"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    <category.Icon className="navbar-category-sidebar__icon" aria-hidden="true" />
                    <span>{category.label}</span>
                  </Link>
                ))}
              </nav>
            </aside>
          )}
        </div>

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
          <Link to="/" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
          <Link to="/nosotros" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Nosotros</Link>
          <Link to="/contactenos" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Contactenos</Link>
          <button className="navbar__mobile-link text-left" onClick={() => { navigate(currentUser ? "/cuenta" : "/login"); setMobileMenuOpen(false); }}>
            {accountLabel}
          </button>
        </nav>
      )}
    </header>
  );
}
