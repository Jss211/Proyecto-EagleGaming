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
import { buildNormalizedProduct, normalizeDocumentData } from "../utils/productUtils";

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

const PRINCIPAL_SECTIONS: { key: CategoryKey; title: string; slug: string; limit: number }[] = [
  { key: "productos en tendencia", title: "Productos en Tendencia", slug: "pc-gamer", limit: 5 },
  { key: "pc completa", title: "PC Completas y Combos", slug: "pc-completa", limit: 5 },
  { key: "tarjetas de video", title: "Tarjetas de Video Destacadas", slug: "tarjetas-de-video", limit: 5 },
  { key: "laptops", title: "Laptops Destacadas", slug: "laptops", limit: 5 },
  { key: "procesadores", title: "Procesadores Principales", slug: "procesadores", limit: 5 },
  { key: "monitores", title: "Monitores Gaming", slug: "monitores", limit: 5 },
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

const pickField = (data: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const normalize = (text: string): string =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const getCategoryKey = (category: string, title?: string): CategoryKey | null => {
  const cat = normalize(category || "");
  if (cat.includes("pc") || cat.includes("computadora") || cat.includes("combo") || cat.includes("gamer") || cat.includes("oficina")) return "pc completa";
  if (cat.includes("laptop")) return "laptops";
  if (cat.includes("refrig") || cat.includes("liquida")) return "refrigeracion";
  if (cat.includes("monitor")) return "monitores";
  if (cat.includes("procesador")) return "procesadores";
  if (cat.includes("tarjeta") || cat.includes("video") || cat.includes("grafica")) return "tarjetas de video";
  if (cat.includes("placa") || cat.includes("madre")) return "placas madre";
  const tit = normalize(title || "");
  if (tit.startsWith("pc ") || tit.startsWith("computadora")) return "pc completa";
  if (tit.startsWith("monitor")) return "monitores";
  if (tit.startsWith("laptop")) return "laptops";
  if (tit.startsWith("procesador")) return "procesadores";
  if (tit.startsWith("tarjeta") || tit.includes("geforce") || tit.startsWith("placa de video")) return "tarjetas de video";
  if (tit.startsWith("placa")) return "placas madre";
  return null;
};

const isTrending = (data: Record<string, unknown>): boolean => {
  const value = pickField(data, ["tendencia", "Tendencia"]);
  return value === true || value === "true" || value === 1;
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
          const rawData = doc.data() as Record<string, unknown>;
          const data = normalizeDocumentData(rawData);
          const product = buildNormalizedProduct(doc.id, data);

          if (isTrending(data)) {
            grouped["productos en tendencia"].push(product);
          }

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

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8 flex flex-col gap-8 sm:gap-12 mb-12 w-full box-border">
          {loading ? (
            <div style={{
              textAlign: "center",
              padding: "4rem 1rem",
              color: "#64748b",
              background: "#fff",
            }}>
              <div
                style={{
                  display: "inline-block",
                  width: "2.5rem",
                  height: "2.5rem",
                  border: "3px solid #e2e8f0",
                  borderTopColor: "#e81950",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  marginBottom: "1rem",
                }}
              />
              <p style={{ margin: 0, fontWeight: 500 }}>Cargando catálogo principal...</p>
            </div>
          ) : error ? (
            <div
              role="alert"
              style={{
                textAlign: "center",
                padding: "2rem",
                margin: "2rem",
                color: "#b91c1c",
                background: "#fef2f2",
                borderRadius: "0.75rem",
              }}
            >
              {error}
            </div>
          ) : (
            PRINCIPAL_SECTIONS.map(({ key, title, slug, limit }) => {
              const items = productsByCategory[key];
              if (!items || items.length === 0) return null;

              const principalItems = items.slice(0, limit);
              const hasMore = items.length > limit;

              return (
                <ProductGrid
                  key={key}
                  title={title}
                  products={principalItems}
                  viewMoreUrl={`/categoria/${slug}`}
                  viewMoreText={hasMore ? `Ver todos (${items.length})` : "Ver categoría"}
                />
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
