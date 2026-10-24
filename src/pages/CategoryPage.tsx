import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { ProductCard } from "../components/home/ProductCard";
import type { Product } from "../components/home/ProductCard";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { buildNormalizedProduct, normalizeDocumentData } from "../utils/productUtils";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Normaliza texto: minúsculas, sin tildes, sin guiones → espacios */
const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // quita tildes
    .replace(/-/g, " ")               // guiones → espacios
    .replace(/[^a-z0-9 ]+/g, "")      // quita otros caracteres especiales para comparar
    .trim();

export const normalizeSlug = (text: string) => 
  text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

/**
 * Mapa de id-de-ruta → términos que pueden aparecer en el campo "categoria"
 * de Firestore (ya normalizados). Si el valor normalizado del campo contiene
 * alguno de estos términos, el producto pertenece a esta categoría.
 */
const CATEGORY_TERMS: Record<string, string[]> = {
  "monitores":         ["monitor"],
  "case":              ["case", "gabinete", "caja"],
  "pc-completa":       ["pc completa", "pc-completa", "computadora completa", "equipo completo", "computadora pc", "computadora gamer", "computadora"],
  "pc-gamer":          ["pc completa gamer", "pc gamer", "computadora gamer", "gamer", "gaming"],
  "pc-oficina":        ["pc completa oficina", "pc oficina", "computadora oficina", "oficina", "estudio"],
  "pc-ingenieria":     ["pc completa ingenieria", "pc completa ingenierias", "ingenieria", "ingenierias", "workstation"],
  "pc-ingenierias":    ["pc completa ingenieria", "pc completa ingenierias", "ingenieria", "ingenierias", "workstation"],
  "pc-diseno":         ["pc completa diseno", "pc completa diseño", "diseno", "diseño", "render"],
  "disco-ssd":         ["disco ssd", "disco-ssd", "ssd", "disco solido", "disco duro ssd"],
  "estabilizador":     ["estabilizador", "ups", "regulador"],
  "fuente-de-poder":   ["fuente de poder", "fuente-de-poder", "fuente poder", "psu"],
  "memoria-ram":       ["memoria ram", "memoria-ram", "ram"],
  "perifericos":       ["periferico", "audifonos", "teclado", "mouse", "webcam", "camara", "parlante", "cooler", "kit", "cable", "adaptador", "adaptadores"],
  "placa-madre":       ["placa madre", "placa-madre", "motherboard", "mainboard"],
  "tarjetas-de-video": ["tarjeta de video", "tarjeta-de-video", "gpu", "grafica", "grafico", "video card"],
  "procesadores":      ["procesador", "cpu", "intel", "amd ryzen"],
  "laptops":           ["laptop", "portatil", "notebook"],
  "refrigeracion":     ["refrigeracion", "liquida", "cooler", "enfriamiento"],
};

/**
 * Términos adicionales de SUBCATEGORÍA para filtrar dentro de una categoría.
 * Si la subcategoría o título del producto (normalizado) contiene el término, coincide.
 */
const SUBCATEGORY_TERMS: Record<string, string[]> = {
  "monitores-24":      ["24", "238", "23.8", "g24i", "te 24", "2477"],
  "monitores-27":      ["27", "g27i", "g27qi", "gs27qa", "hs2703fc", "te 27"],
  "monitores-34":      ["34", "te 34", "3412g", "curvo", "curved", "wqhd"],
  "gaming":            ["gaming", "gamer", "hz", "144hz", "200hz"],
  "alta-frecuencia":   ["alta frecuencia", "alta-frecuencia", "hz", "144hz", "200hz"],
  "curvos":            ["curvo", "curved"],
  "calidad-de-imagen": ["calidad de imagen", "4k", "2k", "qhd", "uhd", "ips", "oled"],
  "pantalla-grande":   ["pantalla grande", "grande", "32", "34", "27"],
  "oficina-y-estudio": ["oficina", "estudio", "trabajo"],
  "con-fuente":        ["con fuente", "con-fuente"],
  "sin-fuente":        ["sin fuente", "sin-fuente"],
  "compactos":         ["compacto", "mini", "itx"],
  "pc-oficina":        ["oficina", "estudio", "trabajo"],
  "pc-gamer":          ["gamer", "gaming"],
  "pc-combos":         ["monitor", "kit", "combo", "4 en 1", "completa"],
  "pc-ingenierias":    ["ingenieria", "ingenierias", "workstation"],
  "pc-diseno":         ["diseno", "diseño", "render"],
  "intel":             ["intel", "core", "i3", "i5", "i7", "i9"],
  "amd":               ["amd", "ryzen", "am4", "am5"],
  "amd-ryzen":         ["ryzen", "amd"],
  "nvidia-rtx":        ["rtx", "geforce", "nvidia"],
  "amd-radeon":        ["radeon", "rx"],
  "oficina":           ["laptop", "lenovo", "oficina", "estudio", "trabajo", "portatil", "v15"],
  "240mm":             ["240"],
  "360mm":             ["360"],
  "sd-m2":             ["m.2", "m2", "pcie", "nvme"],
  "ssd-m2":            ["m.2", "m2", "pcie", "nvme"],
  "ssd-sata":          ["sata", "2.5"],
  "ddr3":              ["ddr3"],
  "ddr4":              ["ddr4"],
  "ddr5":              ["ddr5"],
  "certificadas":      ["80 plus", "80+", "certificad", "bronze", "gold", "white"],
  "modulares":         ["modular", "semi modular"],
  "adaptador":           ["adaptador", "adaptadores", "converter", "conversor", "dongle"],
  "adaptadores":         ["adaptador", "adaptadores", "converter", "conversor", "dongle"],
  "audifonos":           ["audifono", "auricular", "headset"],
  "cable":               ["cable", "adaptador", "hdmi", "displayport", "vga", "usb"],
  "cables":              ["cable", "adaptador", "hdmi", "displayport", "vga", "usb"],
  "cooler":              ["cooler", "ventilador", "fan"],
  "teclados":            ["teclado", "keyboard"],
  "teclado":             ["teclado", "keyboard"],
  "mouse":               ["mouse", "raton"],
  "parlantes":           ["parlante", "speaker", "bocina"],
  "webcam":              ["webcam", "camara", "camweb", "streaming"],
  "webcam-camara":       ["webcam", "camara", "camweb", "streaming"],
  "combos":              ["kit", "combo", "4 en 1", "kit gamer"],
  "kit-teclado-mouse":   ["kit", "combo teclado", "teclado y mouse"],
  "kit-teclado-y-mouse": ["kit", "combo teclado", "teclado y mouse"],
  "estabilizadores":     ["estabilizador", "regulador"],
  "ups":                 ["ups", "bateria"],
};

/** Devuelve el primer campo que exista en el objeto */
const pickField = (data: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

/** Construye un Product a partir de un doc de Firestore */
const buildProduct = (id: string, data: Record<string, unknown>): Product => {
  return buildNormalizedProduct(id, data);
};

/**
 * Comprueba si un producto pertenece a una categoría dada.
 * SOLO compara contra el campo "categoria" de Firestore — sin fallback al
 * nombre del producto para evitar falsos positivos.
 */
const matchesCategory = (
  data: Record<string, unknown>,
  categoryId: string
): boolean => {
  if (categoryId === "todos" || categoryId === "todos-los-productos") {
    return true;
  }

  const terms = CATEGORY_TERMS[categoryId];
  if (!terms) return false;

  const catField = normalize(
    String(pickField(data, ["categoria", "Categoria", "categoría", "Categoría"]) ?? "")
  );

  if (!catField) return false;

  // Si la categoría buscada es monitores, excluir estrictamente cualquier PC o computadora
  if (categoryId === "monitores") {
    if (
      catField.includes("pc") ||
      catField.includes("computadora") ||
      catField.includes("combo") ||
      catField.includes("gamer") ||
      catField.includes("oficina") ||
      catField.includes("ingenieria")
    ) {
      return false;
    }
  }

  return terms.some((t) => catField.includes(t));
};

/**
 * Comprueba si un producto coincide con una subcategoría.
 * Si es 'todas' o 'todos', muestra todo el catálogo de esa categoría.
 * Revisa el campo subcategoría de Firestore, y si no está definido,
 * inspecciona de forma inteligente categoría, título y descripción.
 */
const matchesSubcategory = (
  data: Record<string, unknown>,
  subcategoryId: string
): boolean => {
  if (subcategoryId === "todas" || subcategoryId === "todos") {
    return true;
  }

  const subField = normalize(
    String(pickField(data, ["subcategoria", "Subcategoria", "subcategoría"]) ?? "")
  );
  const catField = normalize(
    String(pickField(data, ["categoria", "Categoria", "categoría", "Categoría"]) ?? "")
  );
  const titleField = normalize(
    String(pickField(data, ["titulo", "Titulo", "título", "Título", "nombre", "Nombre"]) ?? "")
  );
  const descField = normalize(
    String(pickField(data, ["descripcion", "Descripcion", "descripción", "Descripción"]) ?? "")
  );

  const fullText = `${subField} ${catField} ${titleField} ${descField}`.trim();

  const terms = SUBCATEGORY_TERMS[subcategoryId] || [normalize(subcategoryId)];
  return terms.some((t) => fullText.includes(t));
};

// ─── Componente ──────────────────────────────────────────────────────────────

const LABEL_MAP: Record<string, string> = {
  "monitores":         "Monitores",
  "case":              "Case",
  "pc-completa":       "PC Completa",
  "disco-ssd":         "Disco SSD",
  "estabilizador":     "Estabilizador",
  "fuente-de-poder":   "Fuente de Poder",
  "memoria-ram":       "Memoria RAM",
  "perifericos":       "Periféricos",
  "placa-madre":       "Placa Madre",
  "tarjetas-de-video": "Tarjetas de Video",
  "procesadores":      "Procesadores",
  "laptops":           "Laptops",
  "refrigeracion":     "Refrigeración Líquida",
  "monitores-24":      "Monitores 24\" (FHD)",
  "monitores-27":      "Monitores 27\" (2K / 200Hz)",
  "monitores-34":      "Monitores 34\" Curvos",
  "pc-combos":         "PC con Monitor y Kit",
  "gaming":            "Gaming",
  "alta-frecuencia":   "Alta Frecuencia",
  "curvos":            "Curvos",
  "calidad-de-imagen": "Calidad de Imagen",
  "pantalla-grande":   "Pantalla Grande",
  "oficina-y-estudio": "Oficina y Estudio",
  "con-fuente":        "Con Fuente",
  "sin-fuente":        "Sin Fuente",
  "compactos":         "Compactos",
  "pc-oficina":        "PC Oficina",
  "pc-gamer":          "PC Gamer",
  "pc-ingenieria":     "PC Ingenierías",
  "pc-ingenierias":    "PC Ingenierías",
  "pc-diseno":         "PC Diseño",
  "intel":             "Intel Core",
  "amd":               "AMD",
  "amd-ryzen":         "AMD Ryzen",
  "nvidia-rtx":        "NVIDIA GeForce RTX",
  "amd-radeon":        "AMD Radeon RX",
  "oficina":           "Laptops de Oficina / Estudio",
  "240mm":             "Refrigeración 240mm",
  "360mm":             "Refrigeración 360mm",
  "sd-m2":             "SSD M.2 PCIe",
  "ssd-m2":            "SSD M.2 NVMe PCIe",
  "ssd-sata":          "SSD SATA 2.5",
  "ddr3":              "DDR3",
  "ddr4":              "DDR4",
  "ddr5":              "DDR5",
  "certificadas":      "Fuentes 80 Plus",
  "modulares":         "Fuentes Modulares",
  "audifonos":         "Audífonos",
  "adaptador":         "Adaptadores",
  "adaptadores":       "Adaptadores",
  "cable":             "Cables",
  "cables":            "Cables y Adaptadores",
  "cooler":            "Cooler",
  "teclados":          "Teclados Mecánicos",
  "teclado":           "Teclado",
  "mouse":             "Mouse Gamer",
  "parlantes":         "Parlantes",
  "webcam":            "Cámaras & Webcams",
  "combos":            "Kits Teclado + Mouse",
  "kit-teclado-mouse": "Kit Teclado y Mouse",
  "estabilizadores":   "Estabilizadores de Voltaje",
  "ups":               "Sistemas UPS",
  "todas":             "Todas las Computadoras",
  "todos":             "Todos los Productos",
};

const getLabel = (slug?: string) =>
  slug ? (LABEL_MAP[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())) : "Productos";

export function CategoryPage() {
  const { id, subcategoria } = useParams<{ id: string; subcategoria?: string }>();
  const [searchParams] = useSearchParams();
  const filterMarca = searchParams.get("marca");
  const filterPantalla = searchParams.get("pantalla");
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);

  // Filtros de Sidebar
  const [globalMinPrice, setGlobalMinPrice] = useState<number>(0);
  const [globalMaxPrice, setGlobalMaxPrice] = useState<number>(9999);
  
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("default");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12;

  const { addItem } = useCart();

  // Scroll al inicio al cambiar de categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(1);
  }, [id, subcategoria, filterMarca, filterPantalla]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedMinPrice, appliedMaxPrice, sortBy]);

  useEffect(() => {
    if (!id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchProducts = async () => {
      try {
        // Traemos TODOS los productos y filtramos en el cliente
        // porque los valores de "categoria" en Firestore pueden tener
        // mayúsculas, tildes u otras variaciones que no coinciden
        // exactamente con los slugs de la URL.
        const snapshot = await getDocs(collection(db, "productos"));

        const filtered: Product[] = [];
        let globalMin = Infinity;
        let globalMax = -Infinity;

        snapshot.docs.forEach((doc) => {
          const rawData = doc.data() as Record<string, unknown>;
          const data = normalizeDocumentData(rawData);

          const matchesCat = matchesCategory(data, id);
          if (!matchesCat) return;

          if (subcategoria && !matchesSubcategory(data, subcategoria)) return;

          // Check dynamic brand filter
          if (filterMarca) {
            const marca = String(data.marca || data.Marca || "");
            if (normalizeSlug(marca) !== filterMarca) return;
          }

          // Check dynamic attribute filter
          if (filterPantalla) {
            const pantalla = String(data["tamaño de pantalla"] || data["pulgadas"] || data.tamaño || data.procesador || data.capacidad || "");
            if (normalizeSlug(pantalla) !== filterPantalla) return;
          }

          const product = buildProduct(doc.id, data);
          filtered.push(product);
          
          if (product.price < globalMin) globalMin = product.price;
          if (product.price > globalMax) globalMax = product.price;
        });

        setProducts(filtered);
        
        if (filtered.length > 0) {
          setGlobalMinPrice(globalMin);
          setGlobalMaxPrice(globalMax);
          setMinPriceInput(globalMin.toString());
          setMaxPriceInput(globalMax.toString());
          // Optional: we can reset applied prices so it shows all by default
          setAppliedMinPrice(null);
          setAppliedMaxPrice(null);
        } else {
          setGlobalMinPrice(0);
          setGlobalMaxPrice(9999);
          setMinPriceInput("");
          setMaxPriceInput("");
        }

      } catch (err) {
        console.error("Error al obtener productos de categoría:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, subcategoria, filterMarca, filterPantalla]);

  const categoryLabel = getLabel(id);
  const subcategoryLabel = filterPantalla ? filterPantalla.replace(/-/g, ' ') : (filterMarca ? filterMarca.replace(/-/g, ' ') : (subcategoria ? getLabel(subcategoria) : null));

  // Aplicar filtros locales (precio) y ordenamiento
  const displayedProducts = products.filter(p => {
    if (appliedMinPrice !== null && p.price < appliedMinPrice) return false;
    if (appliedMaxPrice !== null && p.price > appliedMaxPrice) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0; // default (podría ser por fecha o id)
  });

  const totalPages = Math.ceil(displayedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = displayedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleApplyPriceFilter = () => {
    setAppliedMinPrice(minPriceInput ? Number(minPriceInput) : null);
    setAppliedMaxPrice(maxPriceInput ? Number(maxPriceInput) : null);
  };

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ minHeight: "60vh", background: "#f3f4f6" }}>
        <div className="category-page-container" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          
          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.5rem" }}>
            <Link to="/" style={{ color: "#e81950", textDecoration: "none", fontWeight: 500 }}>Inicio</Link>
            <span>/</span>
            <Link to={`/categoria/${id}`} style={{ color: subcategoria ? "#6b7280" : "#111827", textDecoration: "none", fontWeight: subcategoria ? 400 : 500 }}>
              {categoryLabel}
            </Link>
            {subcategoryLabel && (
              <>
                <span>/</span>
                <span style={{ color: "#111827", fontWeight: 500, textTransform: 'capitalize' }}>{subcategoryLabel}</span>
              </>
            )}
          </nav>

          <div className="category-layout">
            
            {/* SIDEBAR (Filtros) */}
            <aside className="category-sidebar">
              <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: "1.25rem" }}>
                  Filter By Price
                </h3>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <input 
                    type="range" 
                    min={globalMinPrice} 
                    max={globalMaxPrice} 
                    value={maxPriceInput || globalMaxPrice}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    style={{ width: "100%", accentColor: "#ea580c", cursor: "pointer" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Min S/</span>
                    <input 
                      type="number" 
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      placeholder="0"
                      style={{ width: "100%", padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                    />
                  </div>
                  <span style={{ color: "#9ca3af", marginTop: "1rem" }}>—</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Max S/</span>
                    <input 
                      type="number" 
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      placeholder="9999"
                      style={{ width: "100%", padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleApplyPriceFilter}
                  style={{
                    width: "100%", padding: "0.5rem", background: "#eff6ff", color: "#1d4ed8",
                    border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
                >
                  Filtrar
                </button>
              </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <div style={{ flex: 1, minWidth: 0 }}>
              
              {/* Header Resultados */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111827", margin: 0, textTransform: "capitalize" }}>
                  {subcategoryLabel ?? categoryLabel}
                </h1>
                
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                    {displayedProducts.length > 0
                      ? `Mostrando: ${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, displayedProducts.length)} de ${displayedProducts.length}`
                      : `0 resultados`}
                  </span>
                  
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: "0.4rem 2rem 0.4rem 0.8rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.9rem", background: "#fff", cursor: "pointer", outline: "none" }}
                  >
                    <option value="default">Ordenar por defecto</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                  </select>
                </div>
              </div>

              {/* Grid Productos */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>
                  Cargando productos...
                </div>
              ) : displayedProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "5rem 0", color: "#9ca3af", background: "#fff", borderRadius: "12px" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: "0 auto 1rem", display: "block" }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#374151" }}>No hay productos registrados en esta categoría en la base de datos.</p>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.4rem" }}>Actualmente no hay unidades disponibles para este filtro.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
                    {paginatedProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={(product) => addItem(product)}
                      />
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => {
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        style={{
                          padding: "0.5rem 1rem",
                          background: currentPage === 1 ? "#f3f4f6" : "#ffffff",
                          color: currentPage === 1 ? "#9ca3af" : "#111827",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          transition: "all 0.15s",
                        }}
                      >
                        ← Anterior
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          style={{
                            width: "38px",
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: currentPage === pageNum ? "#e81950" : "#ffffff",
                            color: currentPage === pageNum ? "#ffffff" : "#374151",
                            border: currentPage === pageNum ? "1px solid #e81950" : "1px solid #d1d5db",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            transition: "all 0.15s",
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "0.5rem 1rem",
                          background: currentPage === totalPages ? "#f3f4f6" : "#ffffff",
                          color: currentPage === totalPages ? "#9ca3af" : "#111827",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          transition: "all 0.15s",
                        }}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}