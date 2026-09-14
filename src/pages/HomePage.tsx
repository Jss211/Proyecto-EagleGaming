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

export function HomePage() {
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "productos"));
        const querySnapshot = await getDocs(q);
        
        const grouped: Record<string, Product[]> = {
          "laptops": [],
          "refrigeracion": [],
          "monitores": [],
          "pc completa": [],
          "procesadores": [],
          "otros": []
        };
        
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          const product: Product = {
            id: doc.id,
            name: data.titulo || data.Titulo || data.título || data.Título || data.nombre || data.Nombre || `${data.marca || data.Marca || ""} ${data.modelo || data.Modelo || ""}`.trim() || "Producto sin título",
            category: data.categoria || data.Categoria || data.categoría || data.Categoría || "otros",
            price: data.precio || data.Precio || 0,
            imageUrl: data.url || data.Url || "https://placehold.co/400x300?text=Producto"
          };
          
          const cat = product.category.toLowerCase();
          
          if (cat.includes("laptop")) grouped["laptops"].push(product);
          else if (cat.includes("refrig") || cat.includes("liquida")) grouped["refrigeracion"].push(product);
          else if (cat.includes("monitor")) grouped["monitores"].push(product);
          else if (cat.includes("pc")) grouped["pc completa"].push(product);
          else if (cat.includes("procesador")) grouped["procesadores"].push(product);
          else grouped["otros"].push(product);
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
        
        <div style={{ padding: "0 2rem", marginTop: "2rem", display: "flex", flexDirection: "column", gap: "3rem", marginBottom: "4rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Cargando productos...</div>
          ) : (
            <>
              {productsByCategory["laptops"]?.length > 0 && (
                <ProductGrid title="Laptops Destacadas" products={productsByCategory["laptops"]} />
              )}
              {productsByCategory["pc completa"]?.length > 0 && (
                <ProductGrid title="PC Completas" products={productsByCategory["pc completa"]} />
              )}
              {productsByCategory["procesadores"]?.length > 0 && (
                <ProductGrid title="Procesadores" products={productsByCategory["procesadores"]} />
              )}
              {productsByCategory["monitores"]?.length > 0 && (
                <ProductGrid title="Monitores" products={productsByCategory["monitores"]} />
              )}
              {productsByCategory["refrigeracion"]?.length > 0 && (
                <ProductGrid title="Refrigeración Líquida" products={productsByCategory["refrigeracion"]} />
              )}
              {productsByCategory["otros"]?.length > 0 && (
                <ProductGrid title="Otros Productos" products={productsByCategory["otros"]} />
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
