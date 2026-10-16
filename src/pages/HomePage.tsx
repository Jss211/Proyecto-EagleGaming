import { useState, useEffect } from "react";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { HeroCarousel } from "../components/home/HeroCarousel";
import { CategoriesSection } from "../components/home/CategoriesSection";
import { ProductGrid } from "../components/home/ProductGrid";
import { Footer } from "../components/home/Footer";
import { db } from "../firebase";
import { collection, getDocs, query } from "firebase/firestore";
import type { Product } from "../components/home/ProductCard";
import { CombosSection } from "../components/home/CombosSection";

type CategoryKey =
  | "pc completa"
  | "productos en tendencia"
  | "laptops"
  | "procesadores"
  | "tarjetas de video"
  | "monitores"
  | "placas madre"
  | "refrigeracion";

type ProductsByCategory = Record<CategoryKey, Product[]>;

// Orden exacto solicitado:
// 1. PC Completas
// 2. Productos en tendencia
// 3. Laptops (destacando la laptop existente)
// 4. Otras categorías
const SECTIONS: { key: CategoryKey; title: string }[] = [
  { key: "pc completa", title: "PC Completas" },
  { key: "productos en tendencia", title: "Productos en tendencia" },
  { key: "procesadores", title: "Procesadores" },
  { key: "tarjetas de video", title: "Tarjetas de Video" },
  { key: "monitores", title: "Monitores" },
  { key: "placas madre", title: "Placas Madre" },
  { key: "refrigeracion", title: "Refrigeración Líquida" },
  { key: "laptops", title: "Laptops" },
];

const createEmptyGroups = (): ProductsByCategory => ({
  "pc completa": [],
  "productos en tendencia": [],
  laptops: [],
  procesadores: [],
  "tarjetas de video": [],
  monitores: [],
  "placas madre": [],
  refrigeracion: [],
});

// Devuelve el primer campo que exista (Firestore puede tener variaciones de nombre)
const pickField = (data: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

// Minúsculas y sin tildes, para comparar categorías de forma robusta
const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getCategoryKey = (category: string, title?: string): CategoryKey | null => {
  const cat = normalize(category || "");
  const tit = normalize(title || "");

  if (cat.includes("laptop") || tit.includes("laptop")) return "laptops";
  if (cat.includes("refrig") || cat.includes("liquida") || tit.includes("refrigeracion")) return "refrigeracion";
  if (cat.includes("monitor") || tit.includes("monitor")) return "monitores";
  if (
    cat.includes("pc") ||
    cat.includes("computadora") ||
    cat.includes("combo") ||
    tit.startsWith("pc ") ||
    tit.startsWith("computadora") ||
    tit.includes("pc gamer") ||
    tit.includes("pc completa")
  ) {
    return "pc completa";
  }
  if (cat.includes("procesador") || tit.includes("procesador")) return "procesadores";
  if (
    cat.includes("tarjeta") ||
    cat.includes("video") ||
    cat.includes("grafica") ||
    tit.includes("rtx") ||
    tit.includes("rx ") ||
    tit.includes("geforce")
  ) {
    return "tarjetas de video";
  }
  if (cat.includes("placa") || cat.includes("madre") || tit.includes("placa")) return "placas madre";
  return null;
};

const isTrending = (data: Record<string, unknown>): boolean => {
  const value = pickField(data, ["tendencia", "Tendencia"]);
  return value === true || value === "true" || value === 1;
};

const buildProduct = (id: string, data: Record<string, unknown>): Product => {
  const marca = String(pickField(data, ["marca", "Marca"]) ?? "");
  const modelo = String(pickField(data, ["modelo", "Modelo"]) ?? "");

  const name =
    pickField(data, ["titulo", "Titulo", "título", "Título", "nombre", "Nombre"]) ??
    (`${marca} ${modelo}`.trim() || "Producto sin título");

  return {
    id,
    name: String(name),
    category: String(pickField(data, ["categoria", "Categoria", "categoría", "Categoría"]) ?? ""),
    price: Number(pickField(data, ["precio", "Precio"]) ?? 0),
    imageUrl: String(pickField(data, ["url", "Url"]) ?? "https://placehold.co/400x300?text=Producto"),
  };
};

export function HomePage() {
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>(createEmptyGroups());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, "productos")));
        const grouped = createEmptyGroups();

        querySnapshot.docs.forEach((doc) => {
          const data = doc.data() as Record<string, unknown>;
          const product = buildProduct(doc.id, data);

          // Si tiene flag de tendencia va a la sección de tendencia
          if (isTrending(data)) {
            grouped["productos en tendencia"].push(product);
          }

          // Y también a su categoría respectiva
          const categoryKey = getCategoryKey(product.category, product.name);
          if (categoryKey) {
            grouped[categoryKey].push(product);
          }
        });

        setProductsByCategory(grouped);
        setError(null);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setError("No se pudieron cargar los productos. Revisa la configuración de Firebase.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main className="home-main">
        <HeroCarousel />
        <CategoriesSection />
        <CombosSection />

        <div
          style={{
            padding: "0 2rem",
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "3rem",
            marginBottom: "4rem",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Cargando productos...</div>
          ) : error ? (
            <div
              role="alert"
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#b91c1c",
                background: "#fef2f2",
                borderRadius: "0.75rem",
              }}
            >
              {error}
            </div>
          ) : (
            SECTIONS.map(({ key, title }) =>
              productsByCategory[key].length > 0 ? (
                <ProductGrid key={key} title={title} products={productsByCategory[key]} />
              ) : null
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}