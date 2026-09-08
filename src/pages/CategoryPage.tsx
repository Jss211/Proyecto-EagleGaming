import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { ProductGrid } from "../components/home/ProductGrid";
import type { Product } from "../components/home/ProductCard";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, "productos"), where("categoria", "==", id.toLowerCase()));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.titulo || data.nombre || `${data.marca || ""} ${data.modelo || ""}`.trim(),
            category: data.categoria || id,
            price: data.precio || 0,
            imageUrl: data.url || "https://placehold.co/400x300?text=" + id.toUpperCase(),
          };
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

