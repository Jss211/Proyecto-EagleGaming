import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../../firebase";

type Subcategory = {
  id: string;
  label: string;
};

type Category = {
  id: string;
  label: string;
  subcategories?: Subcategory[];
};

const CATEGORY_LINKS: Category[] = [
  {
    id: "monitores",
    label: "Monitores",
    subcategories: [
      { id: "gaming", label: "Gaming" },
      { id: "alta-frecuencia", label: "Alta frecuencia" },
      { id: "curvos", label: "Curvos" },
      { id: "calidad-de-imagen", label: "Calidad de imagen" },
      { id: "pantalla-grande", label: "Pantalla grande" },
      { id: "oficina-y-estudio", label: "Oficina y estudio" },
    ],
  },
  {
    id: "case",
    label: "Case",
    subcategories: [
      { id: "gaming", label: "Gaming" },
      { id: "con-fuente", label: "Con fuente" },
      { id: "sin-fuente", label: "Sin fuente" },
      { id: "compactos", label: "Compactos" },
    ],
  },
  {
    id: "pc-completa",
    label: "PC Completa",
    subcategories: [
      { id: "gaming", label: "Gaming" },
      { id: "estudiantes", label: "Estudiantes" },
      { id: "oficina", label: "Oficina" },
      { id: "diseno", label: "Diseño" },
    ],
  },
  { id: "disco-ssd", label: "Disco SSD" },
  { id: "estabilizador", label: "Estabilizador" },
  { id: "fuente-de-poder", label: "Fuente de poder" },
  { id: "memoria-ram", label: "Memoria RAM" },
  {
    id: "perifericos",
    label: "Perifericos",
    subcategories: [
      { id: "audifonos", label: "Audifonos" },
      { id: "cooler", label: "Cooler" },
      { id: "teclado", label: "Teclado" },
      { id: "mouse", label: "Mouse" },
      { id: "parlantes", label: "Parlantes" },
      { id: "webcam", label: "Web cam (camara)" },
      { id: "kit-teclado-mouse", label: "Kit teclado y mouse" },
    ],
  },
  { id: "placa-madre", label: "Placa madre" },
  { id: "tarjetas-de-video", label: "Tarjetas de video" },
];

export function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  const firstName = currentUser?.displayName?.trim().split(/\s+/)[0];
  const accountLabel = firstName ? `Bienvenido, ${firstName}` : "Acceder";

  const hoveredCategoryData = CATEGORY_LINKS.find(
    (category) => category.id === hoveredCategory
  );

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
          onMouseLeave={() => {
            setCategoriesOpen(false);
            setHoveredCategory(null);
          }}
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
    <div className="navbar-category-sidebar__nav-col">
      <div className="navbar-category-sidebar__title">CATEGORIAS</div>
      <nav className="navbar-category-sidebar__nav" aria-label="Categorías de productos">
        {CATEGORY_LINKS.map((category) => (
          <Link
            key={category.id}
            to={`/categoria/${category.id}`}
            className="navbar-category-sidebar__link"
            onMouseEnter={() => setHoveredCategory(category.id)}
            onClick={() => setCategoriesOpen(false)}
          >
            <span>{category.label}</span>
            <ChevronRight className="navbar-category-sidebar__arrow" aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </div>

    {hoveredCategoryData?.subcategories && (
      <div className="navbar-category-sidebar__preview">
        <div className="navbar-category-sidebar__preview-title">
          {hoveredCategoryData.label}
        </div>
        <nav
          className="navbar-category-sidebar__preview-nav"
          aria-label={`Subcategorías de ${hoveredCategoryData.label}`}
        >
          {hoveredCategoryData.subcategories.map((sub) => (
            <Link
              key={sub.id}
              to={`/categoria/${hoveredCategoryData.id}/${sub.id}`}
              className="navbar-category-sidebar__preview-link"
              onClick={() => setCategoriesOpen(false)}
            >
              {sub.label}
            </Link>
          ))}
        </nav>
      </div>
    )}
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