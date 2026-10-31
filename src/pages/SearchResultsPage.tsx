import { useSearchParams } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { ProductGrid } from "../components/home/ProductGrid";
import { Footer } from "../components/home/Footer";
import { db } from "../firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { Product } from "../components/home/ProductCard";
import { buildNormalizedProduct, normalizeDocumentData, isProductInMaintenance, matchesSmartSearch } from "../utils/productUtils";

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const term = searchParams.get("q") || "";
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!term.trim()) {
        setResults([]);
        return;
      }
      try {
        const querySnapshot = await getDocs(query(collection(db, "productos")));
        const filtered: Product[] = [];

        querySnapshot.docs.forEach((doc) => {
          const rawData = doc.data() as Record<string, unknown>;
          const data = normalizeDocumentData(rawData);

          // Ocultar productos en mantenimiento para los clientes
          if (isProductInMaintenance(data)) return;

          const product = buildNormalizedProduct(doc.id, data);

          const isMatch = matchesSmartSearch(
            [
              product.name,
              product.category,
              product.sku,
              String(data.subcategoria || "")
            ],
            term
          );

          if (isMatch) {
            filtered.push(product);
          }
        });

        setResults(filtered);
      } catch (err) {
        console.error("Error al buscar productos:", err);
      }
    };

    fetchResults();
  }, [term]);

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />
      <main className="home-main">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 w-full box-border">
          <ProductGrid title={`Resultados para "${term}"`} products={results} mode="grid" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
