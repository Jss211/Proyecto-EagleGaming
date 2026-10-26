import { useCart } from "../../context/CartContext";
import { useEffect, useState, useRef } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  LogOut,
  ShieldAlert,
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
  Box,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../../firebase";
import {
  getTimeGreeting,
  getUserDisplayName,
  getUserFirstName,
  getUserRole,
} from "../../utils/userProfile";

export type Subcategory = {
  id: string;
  label: string;
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
      { id: "monitores-24", label: 'Monitores 24" (FHD)' },
      { id: "monitores-27", label: 'Monitores 27" (2K / 200Hz)' },
      { id: "monitores-34", label: 'Monitores 34" Curvos' },
      { id: "gaming", label: "Monitores Gaming" },
      { id: "todos", label: "Ver todos los monitores" },
    ],
  },
  {
    id: "case",
    label: "Case",
    icon: HardDrive,
    subcategories: [
      { id: "gaming", label: "Case Gamer" },
      { id: "con-fuente", label: "Case con fuente" },
      { id: "sin-fuente", label: "Case sin fuente" },
      { id: "todos", label: "Ver todos los cases" },
    ],
  },
  {
    id: "pc-completa",
    label: "PC Completa",
    icon: Cpu,
    subcategories: [
      { id: "pc-gamer", label: "PC Gamer" },
      { id: "pc-oficina", label: "PC de Oficina" },
      { id: "pc-combos", label: "PC con Monitor y Kit" },
      { id: "todas", label: "Ver todas las PC Armadas" },
    ],
  },
  {
    id: "disco-ssd",
    label: "Disco SSD",
    icon: Disc,
    subcategories: [
      { id: "sd-m2", label: "SSD M.2 NVMe PCIe" },
      { id: "ssd-sata", label: 'SSD SATA 2.5"' },
      { id: "todos", label: "Ver todos los SSD" },
    ],
  },
  {
    id: "estabilizador",
    label: "Estabilizador",
    icon: Zap,
    subcategories: [
      { id: "estabilizadores", label: "Estabilizadores de Voltaje" },
      { id: "ups", label: "Sistemas UPS" },
      { id: "todos", label: "Ver todos los estabilizadores" },
    ],
  },
  {
    id: "fuente-de-poder",
    label: "Fuente de poder",
    icon: Power,
    subcategories: [
      { id: "certificadas", label: "Fuentes 80 Plus" },
      { id: "modulares", label: "Fuentes Modulares" },
      { id: "todas", label: "Ver todas las fuentes" },
    ],
  },
  {
    id: "memoria-ram",
    label: "Memoria RAM",
    icon: MemoryStick,
    subcategories: [
      { id: "ddr4", label: "Memoria RAM DDR4" },
      { id: "ddr5", label: "Memoria RAM DDR5" },
      { id: "todas", label: "Ver todas las memorias" },
    ],
  },
  {
    id: "perifericos",
    label: "Perifericos",
    icon: Headphones,
    subcategories: [
      { id: "teclados", label: "Teclados Mecánicos" },
      { id: "mouse", label: "Mouse Gamer" },
      { id: "audifonos", label: "Headsets & Audífonos" },
      { id: "webcam", label: "Cámaras & Webcams" },
      { id: "combos", label: "Kits Teclado + Mouse" },
      { id: "cables", label: "Cables y Adaptadores" },
      { id: "todos", label: "Ver todos los periféricos" },
    ],
  },
  {
    id: "placa-madre",
    label: "Placa madre",
    icon: CircuitBoard,
    subcategories: [
      { id: "intel", label: "Placas para Intel" },
      { id: "amd", label: "Placas para AMD" },
      { id: "todas", label: "Ver todas las placas madre" },
    ],
  },
  {
    id: "tarjetas-de-video",
    label: "Tarjetas de video",
    icon: Gamepad2,
    subcategories: [
      { id: "nvidia-rtx", label: "NVIDIA GeForce RTX" },
      { id: "amd-radeon", label: "AMD Radeon RX" },
      { id: "todas", label: "Ver todas las tarjetas" },
    ],
  },
  {
    id: "procesadores",
    label: "Procesadores",
    icon: Cpu,
    subcategories: [
      { id: "intel", label: "Procesadores Intel Core" },
      { id: "amd-ryzen", label: "Procesadores AMD Ryzen" },
      { id: "todos", label: "Ver todos los procesadores" },
    ],
  },
  {
    id: "laptops",
    label: "Laptops",
    icon: Laptop,
    subcategories: [
      { id: "oficina", label: "Laptops de Oficina / Estudio" },
      { id: "gaming", label: "Laptops Gamer" },
      { id: "todas", label: "Ver todas las laptops" },
    ],
  },
  {
    id: "refrigeracion",
    label: "Refrigeración líquida",
    icon: Droplets,
    subcategories: [
      { id: "240mm", label: "Refrigeración líquida 240mm" },
      { id: "360mm", label: "Refrigeración líquida 360mm" },
      { id: "todas", label: "Ver sistemas de refrigeración" },
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  // Cierra el dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  const timeGreeting = getTimeGreeting();
  const fullName = getUserDisplayName(currentUser);
  const firstName = getUserFirstName(fullName);
  const role = getUserRole(currentUser?.email);
  const isAdmin = role === "Admin";
  const userInitial = (firstName || "U")[0]?.toUpperCase();

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

              {/* Columna derecha: Panel de subcategorías profesional */}
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

                  {/* Lista limpia de subcategorías */}
                  <nav
                    className="navbar-category-sidebar__preview-list"
                    aria-label={`Subcategorías de ${hoveredCategoryData.label}`}
                  >
                    {hoveredCategoryData.subcategories.map((sub) => {
                      const isAll = sub.id === "todas" || sub.id === "todos";
                      const subPath = isAll
                        ? `/categoria/${hoveredCategoryData.id}`
                        : `/categoria/${hoveredCategoryData.id}/${sub.id}`;
                      return (
                        <Link
                          key={sub.id}
                          to={subPath}
                          className={`navbar-category-sidebar__item ${isAll ? "navbar-category-sidebar__item--all" : ""}`}
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <span className="navbar-category-sidebar__item-label">
                            {sub.label}
                          </span>
                          <ChevronRight
                            className="navbar-category-sidebar__item-arrow"
                            aria-hidden="true"
                          />
                        </Link>
                      );
                    })}
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

        {/* Perfil de usuario o Botón Acceder */}
        {currentUser ? (
          <div className="navbar__user-profile-wrap" ref={dropdownRef}>
            <button
              type="button"
              className="navbar__user-profile-btn"
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              aria-label={`Perfil de ${fullName}`}
              aria-expanded={userDropdownOpen}
            >
              <div className="navbar__user-avatar">
                {userInitial}
              </div>
              <span className="navbar__user-greeting">
                ¡Hola, {timeGreeting.greeting}, {firstName}!
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 ml-0.5" />
            </button>

            {userDropdownOpen && (
              <div className="navbar__user-dropdown">
                <div className="navbar__user-dropdown-header">
                  <p className="navbar__user-dropdown-name">{fullName}</p>
                  <p className="navbar__user-dropdown-email">{currentUser.email}</p>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    className="navbar__user-dropdown-item navbar__user-dropdown-item--admin"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate("/admin");
                    }}
                  >
                    <ShieldAlert className="w-4 h-4 text-[#e81950]" />
                    <span>Panel de Administración</span>
                  </button>
                )}

                <button
                  type="button"
                  className="navbar__user-dropdown-item"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate("/cuenta");
                  }}
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span>Mi Cuenta</span>
                </button>

                <button
                  type="button"
                  className="navbar__user-dropdown-item navbar__user-dropdown-item--logout"
                  onClick={async () => {
                    setUserDropdownOpen(false);
                    await signOut(auth);
                    navigate("/");
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="navbar__acceder-btn"
            onClick={() => navigate("/login")}
            aria-label="Iniciar sesion o registrarse"
          >
            <User className="w-4 h-4" />
            <span>Acceder</span>
          </button>
        )}

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
        <nav className="navbar__mobile-nav">
          <NavLink to="/" end className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Inicio</NavLink>
          <NavLink to="/arma-tu-pc" className="navbar__mobile-link font-bold text-[#e81950] flex items-center justify-between" onClick={() => setMobileMenuOpen(false)}>
            <span>Arma tu PC</span>
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Recomendado</span>
          </NavLink>
          <NavLink to="/nosotros" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Nosotros</NavLink>
          <NavLink to="/contactenos" className="navbar__mobile-link" onClick={() => setMobileMenuOpen(false)}>Contactenos</NavLink>
          
          {currentUser ? (
            <div className="navbar__mobile-user-box">
              <div className="navbar__mobile-user-greeting">
                <span>¡Hola, {timeGreeting.greeting}, {firstName}!</span>
              </div>
              {isAdmin && (
                <button
                  className="navbar__mobile-link text-left font-bold text-[#e81950] flex items-center gap-2"
                  onClick={() => {
                    navigate("/admin");
                    setMobileMenuOpen(false);
                  }}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Panel de Administración</span>
                </button>
              )}
              <button
                className="navbar__mobile-link text-left flex items-center gap-2"
                onClick={() => {
                  navigate("/cuenta");
                  setMobileMenuOpen(false);
                }}
              >
                <User className="w-4 h-4" />
                <span>Mi Cuenta</span>
              </button>
              <button
                className="navbar__mobile-link text-left text-red-600 flex items-center gap-2"
                onClick={async () => {
                  await signOut(auth);
                  setMobileMenuOpen(false);
                  navigate("/");
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <button
              className="navbar__mobile-link text-left font-bold text-[#e81950] flex items-center gap-2"
              onClick={() => {
                navigate("/login");
                setMobileMenuOpen(false);
              }}
            >
              <User className="w-4 h-4" />
              <span>Acceder</span>
            </button>
          )}
        </nav>
      )}
    </header>
  );
}