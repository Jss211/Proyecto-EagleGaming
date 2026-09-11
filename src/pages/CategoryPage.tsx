import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { ProductGrid } from "../components/home/ProductGrid";
import type { Product } from "../components/home/ProductCard";
import { db } from "../firebase";
import { collection, query, getDocs } from "firebase/firestore";

export function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, "productos"));
        const querySnapshot = await getDocs(q);
        
        const fetchedProducts: Product[] = [];
        const searchId = id.toLowerCase().replace("-", " ");
        
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const category = (data.categoria || data.Categoria || data.categoría || data.Categoría || "").toLowerCase();
          
          let matches = false;
          if (searchId.includes("laptop") && category.includes("laptop")) matches = true;
          else if ((searchId.includes("refrig") || searchId.includes("liquida")) && (category.includes("refrig") || category.includes("liquida"))) matches = true;
          else if (searchId.includes("monitor") && category.includes("monitor")) matches = true;
          else if (searchId.includes("pc") && category.includes("pc")) matches = true;
          else if (searchId.includes("procesador") && category.includes("procesador")) matches = true;
          else if (category === searchId) matches = true;
          
          if (matches) {
            fetchedProducts.push({
              id: doc.id,
              name: data.titulo || data.Titulo || data.título || data.Título || data.nombre || data.Nombre || `${data.marca || data.Marca || ""} ${data.modelo || data.Modelo || ""}`.trim() || "Producto sin título",
              category: data.categoria || data.Categoria || data.categoría || data.Categoría || id,
              price: data.precio || data.Precio || 0,
              imageUrl: data.url || data.Url || "https://placehold.co/400x300?text=" + id.toUpperCase(),
            });
          }
        });
        
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error obteniendo productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [id]);

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ minHeight: "60vh", padding: "2rem 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>Cargando {id}...</div>
        ) : (
          <div style={{ padding: "0 2rem" }}>
            <ProductGrid 
              title={id ? id.toUpperCase() : "PRODUCTOS"} 
              products={products} 
            />
            {products.length === 0 && (
              <p style={{ textAlign: "center", color: "#666", marginTop: "2rem" }}>
                No hay productos en esta categorÍa por ahora.
              </p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

