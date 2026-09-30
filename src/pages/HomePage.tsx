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

type CategoryKey =
  | "productos en tendencia"
  | "laptops"
  | "pc completa"
  | "procesadores"
  | "monitores"
  | "refrigeracion";

type ProductsByCategory = Record<CategoryKey, Product[]>;

// Orden en el que se muestran las secciones en la página
const SECTIONS: { key: CategoryKey; title: string }[] = [
  { key: "productos en tendencia", title: "Productos en tendencia" },
  { key: "laptops", title: "Laptops Destacadas" },
  { key: "pc completa", title: "PC Completas" },
  { key: "procesadores", title: "Procesadores" },
  { key: "monitores", title: "Monitores" },
  { key: "refrigeracion", title: "Refrigeración Líquida" },
];

const createEmptyGroups = (): ProductsByCategory => ({
  "productos en tendencia": [],
  laptops: [],
  "pc completa": [],
  procesadores: [],
  monitores: [],
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

const getCategoryKey = (category: string): CategoryKey | null => {
  const cat = normalize(category);

  if (cat.includes("laptop")) return "laptops";
  if (cat.includes("refrig") || cat.includes("liquida")) return "refrigeracion";
  if (cat.includes("monitor")) return "monitores";
  if (cat.includes("pc")) return "pc completa";
  if (cat.includes("procesador")) return "procesadores";
  return null;
};

const isTrending = (data: Record<string, unknown>): boolean => {
  const value = pickField(data, ["tendencia", "Tendencia"]);
  return value === true || value === "true";
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, "productos")));
        const grouped = createEmptyGroups();

        querySnapshot.docs.forEach((doc) => {
          const data = doc.data() as Record<string, unknown>;
          const product = buildProduct(doc.id, data);

          // Un producto puede estar en "tendencia" y además en su categoría
          if (isTrending(data)) {
            grouped["productos en tendencia"].push(product);
          }

          const categoryKey = getCategoryKey(product.category);
          if (categoryKey) {
            grouped[categoryKey].push(product);
          }
        });

        setProductsByCategory(grouped);
      } catch (error) {
        console.error("Error al obtener productos:", error);
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