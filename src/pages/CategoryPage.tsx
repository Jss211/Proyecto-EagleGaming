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
  const { id, subcategoria } = useParams<{
    id: string;
    subcategoria?: string;
  }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, subcategoria]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!id) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const categoria = id.toLowerCase();
        const subcategoriaId = subcategoria?.toLowerCase();

        let q;

        // Si estamos dentro de una subcategoría
        if (subcategoriaId) {
          q = query(
            collection(db, "productos"),
            where("categoria", "==", categoria),
            where("subcategoria", "==", subcategoriaId)
          );
        } else {
          // Categoría principal
          q = query(
            collection(db, "productos"),
            where("categoria", "==", categoria)
          );
        }

        const querySnapshot = await getDocs(q);

        const fetchedProducts: Product[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name:
              data.titulo ||
              data.nombre ||
              `${data.marca || ""} ${data.modelo || ""}`.trim(),
            category: data.categoria || categoria,
            price: data.precio || 0,
            imageUrl:
              data.url ||
              `https://placehold.co/400x300?text=${encodeURIComponent(
                subcategoriaId || categoria
              )}`,
          };
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error obteniendo productos:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [id, subcategoria]);

  const formatTitle = (value?: string) => {
    if (!value) return "PRODUCTOS";

    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const pageTitle = subcategoria
    ? formatTitle(subcategoria)
    : formatTitle(id);

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ minHeight: "60vh", padding: "2rem 0" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
            }}
          >
            Cargando productos...
          </div>
        ) : (
          <div style={{ padding: "0 2rem" }}>
            <ProductGrid
              title={pageTitle}
              products={products}
            />

            {products.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  marginTop: "2rem",
                }}
              >
                No hay productos en esta sección por ahora.
              </p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
