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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../../firebase";
import { useCategoriesTree } from "../../hooks/useCategoriesTree";

type Subcategory = {
  id: string;
  label: string;
};

type Category = {
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
    icon: HardDrive,
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
    icon: Cpu,
    subcategories: [
      { id: "pc-oficina", label: "PC Oficina" },
      { id: "pc-gamer", label: "PC Gamer" },
      { id: "pc-ingenierias", label: "PC Ingenierias" },
      { id: "pc-diseño", label: "PC Diseño" },
    ],
  },
  {
    id: "disco-ssd",
    label: "Disco SSD",
    icon: Disc,
    subcategories: [
      { id: "sd-m2", label: "SD M.2 PCIe" },
      { id: "ssd-sata", label: "SSD SATA 2.5" },
    ],
  },
  { id: "estabilizador", label: "Estabilizador", icon: Zap },
  { id: "fuente-de-poder", label: "Fuente de poder", icon: Power },
  {
    id: "memoria-ram",
    label: "Memoria RAM",
    icon: MemoryStick,
    subcategories: [
      { id: "ddr3", label: "DDR3" },
      { id: "ddr4", label: "DDR4" },
      { id: "ddr5", label: "DDR5" },
    ],
  },
  {
    id: "perifericos",
    label: "Perifericos",
    icon: Headphones,
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
  { id: "placa-madre", label: "Placa madre", icon: CircuitBoard },
  { id: "tarjetas-de-video", label: "Tarjetas de video", icon: Gamepad2 },
];

export function Navbar() {
  const navigate = useNavigate();
  const { totalItems, notice } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const { categoriesTree } = useCategoriesTree();

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  const firstName = currentUser?.displayName?.trim().split(/\s+/)[0];
  const accountLabel = firstName ? `Bienvenido, ${firstName}` : "Acceder";

  const hoveredCategoryData = CATEGORY_LINKS.find(
    (category) => category.id === hoveredCategory
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
          onMouseEnter={() => setCategoriesOpen(true)}
          onMouseLeave={() => {
            setCategoriesOpen(false);
            setHoveredCategory(null);
            setHoveredBrand(null);
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
            <aside id="navbar-category-sidebar" className="navbar-category-sidebar" style={{ display: 'flex' }}>
              <div className="navbar-category-sidebar__nav-col" style={{ minWidth: '220px' }}>
                <nav className="navbar-category-sidebar__nav" aria-label="Categorías de productos">
                  {CATEGORY_LINKS.map((category) => {
                    const CategoryIcon = category.icon;
                    const dynamicBrands = categoriesTree.find(c => c.id === category.id)?.brands;
                    const hasChildren = (dynamicBrands && dynamicBrands.length > 0) || (category.subcategories && category.subcategories.length > 0);

                    return (
                      <Link
                        key={category.id}
                        to={`/categoria/${category.id}`}
                        className="navbar-category-sidebar__link"
                        onMouseEnter={() => {
                          setHoveredCategory(category.id);
                          setHoveredBrand(null);
                        }}
                        onClick={() => {
                           setCategoriesOpen(false);
                           setHoveredCategory(null);
                           setHoveredBrand(null);
                        }}
                      >
                        <div className="navbar-category-sidebar__link-content">
                          <CategoryIcon className="navbar-category-sidebar__icon w-4 h-4 mr-2 inline-block" />
                          <span>{category.label}</span>
                        </div>

                        {hasChildren && (
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

              {/* LEVEL 2: Brands or Static Subcategories */}
              {hoveredCategory && (
                (() => {
                  const categoryData = CATEGORY_LINKS.find(c => c.id === hoveredCategory);
                  const dynamicBrands = categoriesTree.find(c => c.id === hoveredCategory)?.brands;
                  
                  if (dynamicBrands && dynamicBrands.length > 0) {
                    return (
                      <div className="navbar-category-sidebar__preview" style={{ width: '220px', borderLeft: '1px solid #f1f1f1' }}>
                        <div className="navbar-category-sidebar__preview-title">
                          Marcas
                        </div>
                        <nav
                          className="navbar-category-sidebar__preview-nav"
                          aria-label={`Marcas de ${categoryData?.label}`}
                        >
                          {dynamicBrands.map((brand) => (
                            <Link
                              key={brand.id}
                              to={`/categoria/${hoveredCategory}?marca=${brand.id}`}
                              className="navbar-category-sidebar__preview-link"
                              onMouseEnter={() => setHoveredBrand(brand.id)}
                              onClick={() => {
                                setCategoriesOpen(false);
                                setHoveredCategory(null);
                                setHoveredBrand(null);
                              }}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <span>{brand.label}</span>
                              {brand.attributes.length > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                            </Link>
                          ))}
                        </nav>
                      </div>
                    );
                  } else if (categoryData?.subcategories && categoryData.subcategories.length > 0) {
                    return (
                      <div className="navbar-category-sidebar__preview" style={{ width: '220px', borderLeft: '1px solid #f1f1f1' }}>
                        <div className="navbar-category-sidebar__preview-title">
                          {categoryData.label}
                        </div>
                        <nav
                          className="navbar-category-sidebar__preview-nav"
                          aria-label={`Subcategorías de ${categoryData.label}`}
                        >
                          {categoryData.subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/categoria/${categoryData.id}/${sub.id}`}
                              className="navbar-category-sidebar__preview-link"
                              onClick={() => {
                                setCategoriesOpen(false);
                                setHoveredCategory(null);
                                setHoveredBrand(null);
                              }}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </nav>
                      </div>
                    );
                  }
                  return null;
                })()
              )}

              {/* LEVEL 3: Attributes (e.g., Inches) */}
              {hoveredBrand && hoveredCategory && (
                (() => {
                  const brandData = categoriesTree.find(c => c.id === hoveredCategory)?.brands.find(b => b.id === hoveredBrand);
                  
                  if (brandData && brandData.attributes && brandData.attributes.length > 0) {
                    return (
                      <div className="navbar-category-sidebar__preview" style={{ width: '220px', borderLeft: '1px solid #f1f1f1' }}>
                        <div className="navbar-category-sidebar__preview-title">
                          Opciones
                        </div>
                        <nav
                          className="navbar-category-sidebar__preview-nav"
                          aria-label={`Atributos de ${brandData.label}`}
                        >
                          {brandData.attributes.map((attr) => (
                            <Link
                              key={attr.id}
                              to={`/categoria/${hoveredCategory}?marca=${brandData.id}&pantalla=${attr.id}`}
                              className="navbar-category-sidebar__preview-link"
                              onClick={() => {
                                setCategoriesOpen(false);
                                setHoveredCategory(null);
                                setHoveredBrand(null);
                              }}
                            >
                              {attr.label}
                            </Link>
                          ))}
                        </nav>
                      </div>
                    );
                  }
                  return null;
                })()
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