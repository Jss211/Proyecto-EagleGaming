import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
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
    .trim();

/**
 * Mapa de id-de-ruta → términos que pueden aparecer en el campo "categoria"
 * de Firestore (ya normalizados). Si el valor normalizado del campo contiene
 * alguno de estos términos, el producto pertenece a esta categoría.
 */
const CATEGORY_TERMS: Record<string, string[]> = {
  "monitores":         ["monitor"],
  "case":              ["case", "gabinete", "caja"],
  "pc-completa":       ["pc completa", "pc-completa", "computadora completa", "equipo completo"],
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

  if (!subField) return false;

  const terms = SUBCATEGORY_TERMS[subcategoryId];
  if (!terms) {
    return subField.includes(normalize(subcategoryId));
  }

  return terms.some((t) => subField.includes(t));
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
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);

  // Scroll al inicio al cambiar de categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, subcategoria]);

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

        snapshot.docs.forEach((doc) => {
          const data = doc.data() as Record<string, unknown>;

          const matchesCat = matchesCategory(data, id);
          if (!matchesCat) return;

          if (subcategoria && !matchesSubcategory(data, subcategoria)) return;

          filtered.push(buildProduct(doc.id, data));
        });

        setProducts(filtered);
      } catch (err) {
        console.error("Error al obtener productos de categoría:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, subcategoria]);

  const categoryLabel = getLabel(id);
  const subcategoryLabel = subcategoria ? getLabel(subcategoria) : null;

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ minHeight: "60vh", background: "#f8fafc" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.25rem 2rem 3rem" }}>

          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#555", marginBottom: "0.75rem" }}>
            <a href="/" style={{ color: "#e81950", textDecoration: "none", fontWeight: 600 }}>← Home</a>
            <span style={{ color: "#999" }}>/</span>
            <a href={`/categoria/${id}`} style={{ color: subcategoria ? "#555" : "#333", textDecoration: "none" }}>
              {categoryLabel}
            </a>
            {subcategoryLabel && (
              <>
                <span style={{ color: "#999" }}>/</span>
                <span style={{ color: "#333" }}>{subcategoryLabel}</span>
              </>
            )}
          </nav>

          {/* Título + contador */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#e81950", letterSpacing: "0.04em", textTransform: "uppercase", margin: 0 }}>
              {subcategoryLabel ?? categoryLabel}
            </h1>
            {!loading && (
              <span style={{ fontSize: "0.82rem", color: "#666" }}>
                {products.length === 0
                  ? "Sin resultados"
                  : `Resultados (${products.length} producto${products.length !== 1 ? "s" : ""})`}
              </span>
            )}
          </div>

          {/* Contenido */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#555" }}>
              Cargando productos...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 0", color: "#999" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ margin: "0 auto 1rem", display: "block" }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <p style={{ fontSize: "0.95rem" }}>Aún no hay productos en esta categoría.</p>
              <p style={{ fontSize: "0.82rem", marginTop: "0.4rem" }}>Vuelve pronto, estamos actualizando el catálogo.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "1rem",
              }}
            >
              {products.map((product) => (
                <CompactProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Tarjeta compacta para la vista de categoría ─────────────────────────── */

function CompactProductCard({ product }: { product: Product }) {
  const imageUrl = product.imageUrl || "https://placehold.co/400x300?text=Producto";
  const { addItem } = useCart();

  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.6rem",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(232,25,80,0.15)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      <Link to={`/producto/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        {/* Imagen */}
        <div style={{ width: "100%", aspectRatio: "1/1", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.75rem" }}>
          <img
            src={imageUrl}
            alt={product.name}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Info */}
        <div style={{ padding: "0.65rem 0.75rem 0.75rem" }}>
          <p style={{
            fontSize: "0.78rem",
            color: "#333",
            lineHeight: "1.35",
            margin: "0 0 0.45rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.1rem",
          }}>
            {product.name}
          </p>

          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e81950", margin: "0 0 0.35rem" }}>
            S/ {product.price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#16a34a" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            En stock
          </div>
        </div>
      </Link>

      {/* Botón agregar al carrito */}
      <div style={{ padding: "0 0.75rem 0.75rem" }}>
        <button
          onClick={() => addItem(product)}
          style={{
            width: "100%",
            padding: "0.45rem 0",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#fff",
            background: "#e81950",
            border: "none",
            borderRadius: "0.4rem",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#c0143c")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#e81950")}
        >
          Añadir al carrito
        </button>
      </div>
    </article>
  );
}