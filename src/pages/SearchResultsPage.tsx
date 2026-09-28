import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { ProductGrid } from "../components/home/ProductGrid";
import { Footer } from "../components/home/Footer";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "../components/home/ProductCard";

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const term = (searchParams.get("q") || "").trim().toLowerCase();
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!term) {
      setResults([]);
      return;
    }

    const fetchAndFilter = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const all: Product[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.titulo || data.nombre || `${data.marca || ""} ${data.modelo || ""}`.trim(),
            category: data.categoria || "",
            price: data.precio || 0,
            imageUrl: data.url || "https://placehold.co/400x300?text=Producto",
          };
        });

        const filtered = all.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );

        setResults(filtered);
      } catch (error) {
        console.error("Error al buscar productos:", error);
      }
    };

    fetchAndFilter();
  }, [term]);

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />
      <main className="home-main">
        <div style={{ padding: "2rem" }}>
          <ProductGrid title={`Resultados para "${term}"`} products={results} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
