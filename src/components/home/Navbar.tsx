import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
  Monitor,
  HardDrive,
  Cpu,
  Disc,
  Zap,
  Power,
  MemoryStick,
  Headphones,
  CircuitBoard,
  Gamepad2,
  Laptop,
  Droplets,
  Snowflake,
  ShieldCheck,
  Keyboard,
  Mouse,
  Video,
  Tv,
  Sparkles,
  Box,
  Briefcase,
  Flame,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../../firebase";

export type Subcategory = {
  id: string;
  label: string;
  icon?: LucideIcon;
};

export type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
  subcategories?: Subcategory[];
};

const CATEGORY_LINKS: Category[] = [
  {
    id: "monitores",
    label: "Monitores",
    icon: Monitor,
    subcategories: [
      { id: "monitores-24", label: 'Monitores 24" (FHD)', icon: Monitor },
      { id: "monitores-27", label: 'Monitores 27" (2K / 200Hz)', icon: Monitor },
      { id: "monitores-34", label: 'Monitores 34" Curvos', icon: Tv },
      { id: "gaming", label: "Monitores Gaming", icon: Gamepad2 },
      { id: "todos", label: "Ver todos los monitores", icon: Sparkles },
    ],
  },
  {
    id: "case",
    label: "Case",
    icon: HardDrive,
    subcategories: [
      { id: "gaming", label: "Case Gamer", icon: Sparkles },
      { id: "con-fuente", label: "Case con fuente", icon: Power },
      { id: "sin-fuente", label: "Case sin fuente", icon: HardDrive },
      { id: "todos", label: "Ver todos los productos", icon: Box },
    ],
  },
  {
    id: "pc-completa",
    label: "PC Completa",
    icon: Cpu,
    subcategories: [
      { id: "pc-gamer", label: "PC Gamer", icon: Gamepad2 },
      { id: "pc-oficina", label: "PC de Oficina", icon: Briefcase },
      { id: "pc-combos", label: "PC con Monitor y Kit", icon: Monitor },
      { id: "todas", label: "Ver todas las PC Armadas", icon: Sparkles },
    ],
  },
  {
    id: "disco-ssd",
    label: "Disco SSD",
    icon: Disc,
    subcategories: [
      { id: "sd-m2", label: "SD M.2 PCIe", icon: Zap },
      { id: "ssd-sata", label: "SSD SATA 2.5\"", icon: HardDrive },
      { id: "todos", label: "Ver todos los SSD", icon: Sparkles },
    ],
  },
  {
    id: "estabilizador",
    label: "Estabilizador",
    icon: Zap,
    subcategories: [
      { id: "estabilizadores", label: "Estabilizadores de Voltaje", icon: Zap },
      { id: "ups", label: "Sistemas UPS", icon: ShieldCheck },
      { id: "todos", label: "Ver todos los estabilizadores", icon: Sparkles },
    ],
  },
  {
    id: "fuente-de-poder",
    label: "Fuente de poder",
    icon: Power,
    subcategories: [
      { id: "certificadas", label: "Fuentes 80 Plus", icon: ShieldCheck },
      { id: "modulares", label: "Fuentes Modulares", icon: Zap },
      { id: "todas", label: "Ver todas las fuentes", icon: Sparkles },
    ],
  },
  {
    id: "memoria-ram",
    label: "Memoria RAM",
    icon: MemoryStick,
    subcategories: [
      { id: "ddr4", label: "Memoria RAM DDR4", icon: MemoryStick },
      { id: "ddr5", label: "Memoria RAM DDR5", icon: Zap },
      { id: "todas", label: "Ver todas las memorias", icon: Sparkles },
    ],
  },
  {
    id: "perifericos",
    label: "Perifericos",
    icon: Headphones,
    subcategories: [
      { id: "teclados", label: "Teclados Mecánicos", icon: Keyboard },
      { id: "mouse", label: "Mouse Gamer", icon: Mouse },
      { id: "audifonos", label: "Headsets & Audífonos", icon: Headphones },
      { id: "webcam", label: "Cámaras & Webcams", icon: Video },
      { id: "combos", label: "Kits Teclado + Mouse", icon: Sparkles },
      { id: "todos", label: "Ver todos los periféricos", icon: Sparkles },
    ],
  },
  {
    id: "placa-madre",
    label: "Placa madre",
    icon: CircuitBoard,
    subcategories: [
      { id: "intel", label: "Placas para Intel", icon: CircuitBoard },
      { id: "amd", label: "Placas para AMD", icon: Zap },
      { id: "todas", label: "Ver todas las placas madre", icon: Sparkles },
    ],
  },
  {
    id: "tarjetas-de-video",
    label: "Tarjetas de video",
    icon: Gamepad2,
    subcategories: [
      { id: "nvidia-rtx", label: "NVIDIA GeForce RTX", icon: Flame },
      { id: "amd-radeon", label: "AMD Radeon RX", icon: Zap },
      { id: "todas", label: "Ver todas las tarjetas", icon: Sparkles },
    ],
  },
  {
    id: "procesadores",
    label: "Procesadores",
    icon: Cpu,
    subcategories: [
      { id: "intel", label: "Procesadores Intel Core", icon: Cpu },
      { id: "amd-ryzen", label: "Procesadores AMD Ryzen", icon: Zap },
      { id: "todos", label: "Ver todos los procesadores", icon: Sparkles },
    ],
  },
  {
    id: "laptops",
    label: "Laptops",
    icon: Laptop,
    subcategories: [
      { id: "oficina", label: "Laptops de Oficina / Estudio", icon: Laptop },
      { id: "todas", label: "Ver todas las laptops", icon: Sparkles },
    ],
  },
  {
    id: "refrigeracion",
    label: "Refrigeración líquida",
    icon: Droplets,
    subcategories: [
      { id: "240mm", label: "Refrigeración líquida 240mm", icon: Droplets },
      { id: "360mm", label: "Refrigeración líquida 360mm", icon: Snowflake },
      { id: "todas", label: "Ver sistemas líquidos", icon: Sparkles },
    ],
  },
  {
    id: "todos",
    label: "Todos los productos",
    icon: Box,
  },
];

export function Navbar() {
  const navigate = useNavigate();
  const { totalItems, notice } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>("monitores");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  const firstName = currentUser?.displayName?.trim().split(/\s+/)[0];
  const accountLabel = firstName ? `Bienvenido, ${firstName}` : "Acceder";

  const activeCategoryId = hoveredCategory || CATEGORY_LINKS[0].id;
  const hoveredCategoryData = CATEGORY_LINKS.find(
    (category) => category.id === activeCategoryId
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="navbar">
      <p className="sr-only" role="status">{notice}</p>
      <div className="navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo" aria-label="Ir al inicio Eagle Gaming">
          <img src="/icono.png" alt="Eagle Gaming" className="navbar__logo-img" />
        </NavLink>

        {/* Categorias */}
        <div
          className="navbar__categories-area"
          onMouseEnter={() => {
            setCategoriesOpen(true);
            if (!hoveredCategory) {
              setHoveredCategory(CATEGORY_LINKS[0].id);
            }
          }}
          onMouseLeave={() => {
            setCategoriesOpen(false);
          }}
        >
          <button
            className="navbar__categories-btn"
            onClick={() => {
              setCategoriesOpen((open) => {
                const next = !open;
                if (next && !hoveredCategory) {
                  setHoveredCategory(CATEGORY_LINKS[0].id);
                }
                return next;
              });
            }}
            aria-label="Abrir categorias"
            aria-expanded={categoriesOpen}
            aria-controls="navbar-category-sidebar"
          >
            {categoriesOpen ? <X className="navbar__categories-icon" /> : <Menu className="navbar__categories-icon" />}
            <span>Categorias</span>
          </button>

          {categoriesOpen && (
            <aside id="navbar-category-sidebar" className="navbar-category-sidebar">
              {/* Columna izquierda: Categorías principales */}
              <div className="navbar-category-sidebar__nav-col">
                <nav className="navbar-category-sidebar__nav" aria-label="Categorías de productos">
                  {CATEGORY_LINKS.map((category) => {
                    const CategoryIcon = category.icon;
                    const isActive = category.id === activeCategoryId;
                    return (
                      <Link
                        key={category.id}
                        to={`/categoria/${category.id}`}
                        className={`navbar-category-sidebar__link ${isActive ? "active" : ""}`}
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        onClick={() => setCategoriesOpen(false)}
                      >
                        <span className="navbar-category-sidebar__link-icon-wrap">
                          <CategoryIcon className="navbar-category-sidebar__icon" />
                        </span>
                        <span className="navbar-category-sidebar__link-label">
                          {category.label}
                        </span>

                        {category.subcategories && category.subcategories.length > 0 && (
                          <ChevronRight
                            className="navbar-category-sidebar__arrow"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Columna derecha: Panel de subcategorías compacto y ordenado */}
              {hoveredCategoryData?.subcategories && (
                <div className="navbar-category-sidebar__preview">
                  {/* Cabecera del panel */}
                  <div className="navbar-category-sidebar__preview-header">
                    <div className="navbar-category-sidebar__preview-header-left">
                      <div className="navbar-category-sidebar__preview-icon-badge">
                        <hoveredCategoryData.icon className="w-4 h-4 text-[#e81950]" />
                      </div>
                      <h3 className="navbar-category-sidebar__preview-title">
                        {hoveredCategoryData.label}
                      </h3>
                    </div>

                    <Link
                      to={`/categoria/${hoveredCategoryData.id}`}
                      className="navbar-category-sidebar__preview-viewall"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      <span>Ver todo</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Lista vertical limpia de subcategorías */}
                  <nav
                    className="navbar-category-sidebar__preview-list"
                    aria-label={`Subcategorías de ${hoveredCategoryData.label}`}
                  >
                    {hoveredCategoryData.subcategories.map((sub) => {
                      const SubIcon = sub.icon || hoveredCategoryData.icon;
                      const subPath =
                        sub.id === "todas" || sub.id === "todos"
                          ? `/categoria/${hoveredCategoryData.id}`
                          : `/categoria/${hoveredCategoryData.id}/${sub.id}`;
                      return (
                        <Link
                          key={sub.id}
                          to={subPath}
                          className="navbar-category-sidebar__card"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <div className="navbar-category-sidebar__card-left">
                            <div className="navbar-category-sidebar__card-icon">
                              <SubIcon className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="navbar-category-sidebar__card-title">
                              {sub.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Banner / Pie de panel */}
                  <div className="navbar-category-sidebar__preview-footer">
                    <span>Garantía y envíos a todo el Perú</span>
                  </div>
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
          <NavLink to="/" end className="navbar__link">Inicio</NavLink>
          <NavLink to="/nosotros" className="navbar__link navbar__link--nosotros">Nosotros</NavLink>
          <NavLink to="/contactenos" className="navbar__link navbar__link--contactenos">Contactenos</NavLink>
        </nav>

        {/* Carrito */}
        <button
          type="button"
          className="relative inline-flex items-center justify-center p-2.5 text-gray-700 transition-colors duration-200 rounded-full hover:bg-red-50 hover:text-red-600 active:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label={`Ver carrito de compras: ${totalItems} unidades`}
          onClick={() => navigate("/carrito")}
        >
          <ShoppingCart className="w-6 h-6 stroke-[1.75]" />
          
          {totalItems > 0 && (
            <span 
              className="absolute top-0 right-0 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white shadow-sm ring-2 ring-white"
              aria-live="polite"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
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