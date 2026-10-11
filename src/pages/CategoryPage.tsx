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
  "pc-completa":       ["pc completa", "pc-completa", "computadora completa", "equipo completo"],
  "pc-gamer":          ["gamer", "gaming"],
  "pc-oficina":        ["oficina"],
  "pc-ingenierias":    ["ingenieria", "workstation"],
  "pc-diseno":         ["diseno", "diseño", "render"],
  "disco-ssd":         ["disco ssd", "disco-ssd", "ssd", "disco solido", "disco duro ssd"],
  "estabilizador":     ["estabilizador", "ups", "regulador"],
  "fuente-de-poder":   ["fuente de poder", "fuente-de-poder", "fuente poder", "psu"],
  "memoria-ram":       ["memoria ram", "memoria-ram", "ram"],
  "perifericos":       ["periferico", "audifonos", "teclado", "mouse", "webcam", "camara", "parlante", "cooler", "kit"],
  "placa-madre":       ["placa madre", "placa-madre", "motherboard", "mainboard"],
  "tarjetas-de-video": ["tarjeta de video", "tarjeta-de-video", "gpu", "grafica", "grafico", "video card"],
  "procesadores":      ["procesador", "cpu", "intel", "amd ryzen"],
  "laptops":           ["laptop", "portatil", "notebook"],
  "refrigeracion":     ["refrigeracion", "liquida", "cooler", "enfriamiento"],
};

/**
 * Términos adicionales de SUBCATEGORÍA para filtrar dentro de una categoría.
 * Si la subcategoría del producto (normalizada) contiene el término, coincide.
 */
const SUBCATEGORY_TERMS: Record<string, string[]> = {
  "gaming":           ["gaming", "gamer"],
  "alta-frecuencia":  ["alta frecuencia", "alta-frecuencia", "hz"],
  "curvos":           ["curvo", "curved"],
  "calidad-de-imagen": ["calidad de imagen", "4k", "2k", "qhd", "uhd", "ips", "oled"],
  "pantalla-grande":  ["pantalla grande", "grande", "32", "34", "27"],
  "oficina-y-estudio":["oficina", "estudio", "trabajo"],
  "con-fuente":       ["con fuente", "con-fuente"],
  "sin-fuente":       ["sin fuente", "sin-fuente"],
  "compactos":        ["compacto", "mini", "itx"],
  "pc-oficina":       ["oficina"],
  "pc-gamer":         ["gamer", "gaming"],
  "pc-ingenierias":   ["ingenieria", "workstation"],
  "pc-diseno":        ["diseno", "diseño", "render"],
  "sd-m2":            ["m.2", "m2", "pcie", "nvme"],
  "ssd-sata":         ["sata", "2.5"],
  "ddr3":             ["ddr3"],
  "ddr4":             ["ddr4"],
  "ddr5":             ["ddr5"],
  "audifonos":        ["audifono", "auricular", "headset"],
  "cooler":           ["cooler", "ventilador", "fan"],
  "teclado":          ["teclado", "keyboard"],
  "mouse":            ["mouse", "raton"],
  "parlantes":        ["parlante", "speaker", "bocina"],
  "webcam":           ["webcam", "camara", "camweb"],
  "kit-teclado-mouse":["kit", "combo teclado"],
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
  const marca  = String(pickField(data, ["marca",  "Marca"])  ?? "");
  const modelo = String(pickField(data, ["modelo", "Modelo"]) ?? "");

  const name = String(
    pickField(data, ["titulo", "Titulo", "título", "Título", "nombre", "Nombre"]) ??
    (`${marca} ${modelo}`.trim() || "Producto sin título")
  );

  return {
    id,
    name,
    category: String(
      pickField(data, ["categoria", "Categoria", "categoría", "Categoría"]) ?? ""
    ),
    price: Number(pickField(data, ["precio", "Precio"]) ?? 0),
    imageUrl: String(
      pickField(data, ["url", "Url"]) ??
      "https://placehold.co/400x300?text=Producto"
    ),
  };
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
  const terms = CATEGORY_TERMS[categoryId];
  if (!terms) return false;

  const catField = normalize(
    String(pickField(data, ["categoria", "Categoria", "categoría", "Categoría"]) ?? "")
  );

  if (!catField) return false;

  return terms.some((t) => catField.includes(t));
};

/**
 * Comprueba si un producto coincide con una subcategoría.
 * SOLO compara contra el campo "subcategoria" de Firestore.
 */
const matchesSubcategory = (
  data: Record<string, unknown>,
  subcategoryId: string
): boolean => {
  const subField = normalize(
    String(pickField(data, ["subcategoria", "Subcategoria", "subcategoría"]) ?? "")
  );
  const catField = normalize(
    String(pickField(data, ["categoria", "Categoria", "categoría", "Categoría"]) ?? "")
  );

  const fieldToSearch = `${subField} ${catField}`.trim();

  if (!fieldToSearch) return false;

  const terms = SUBCATEGORY_TERMS[subcategoryId];
  if (!terms) {
    return fieldToSearch.includes(normalize(subcategoryId));
  }

  return terms.some((t) => fieldToSearch.includes(t));
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
  "pc-ingenierias":    "PC Ingenierías",
  "pc-diseno":         "PC Diseño",
  "sd-m2":             "SSD M.2 PCIe",
  "ssd-sata":          "SSD SATA 2.5",
  "ddr3":              "DDR3",
  "ddr4":              "DDR4",
  "ddr5":              "DDR5",
  "audifonos":         "Audífonos",
  "cooler":            "Cooler",
  "teclado":           "Teclado",
  "mouse":             "Mouse",
  "parlantes":         "Parlantes",
  "webcam":            "Web Cam",
  "kit-teclado-mouse": "Kit Teclado y Mouse",
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

  const { addItem } = useCart();

  // Scroll al inicio al cambiar de categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, subcategoria, filterMarca, filterPantalla]);

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
          const data = doc.data() as Record<string, unknown>;

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

  const handleApplyPriceFilter = () => {
    setAppliedMinPrice(minPriceInput ? Number(minPriceInput) : null);
    setAppliedMaxPrice(maxPriceInput ? Number(maxPriceInput) : null);
  };

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ minHeight: "60vh", background: "#f3f4f6" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
          
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

          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            
            {/* SIDEBAR (Filtros) */}
            <aside style={{ width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
                    {displayedProducts.length > 0 ? `Mostrar: 1-${displayedProducts.length} de ${products.length}` : `0 resultados`}
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
                  <p style={{ fontSize: "1rem", color: "#4b5563" }}>No se encontraron productos con estos filtros.</p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "1.25rem",
                }}>
                  {displayedProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={(product, quantity) => addItem(product, quantity)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}