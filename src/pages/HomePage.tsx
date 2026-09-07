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
  const [laptops, setLaptops] = useState<Product[]>([]);

  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        const q = query(collection(db, "productos"));
        const querySnapshot = await getDocs(q);
        
        console.log("Documentos encontrados en Firestore:", querySnapshot.docs.length);
        
        const laptopsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Data del documento:", doc.id, data);
          return {
            id: doc.id,
            // Mapeamos los campos de Firestore a nuestra interfaz Product
            name: data.titulo || data.nombre || `${data.marca || ""} ${data.modelo || ""}`.trim(),
            category: data.categoria || "laptops",
            price: data.precio || 0,
            imageUrl: data.url || "https://placehold.co/400x300?text=Laptop"
          };
        });
        
        setLaptops(laptopsData);
      } catch (error) {
        console.error("Error al obtener laptops:", error);
      }
    };

    fetchLaptops();
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main className="home-main">
        <HeroCarousel />
        <CategoriesSection />
        
        {/* Mostramos los laptops de Firestore */}
        <div style={{ padding: "0 2rem", marginTop: "2rem" }}>
          <ProductGrid title="Laptops Destacadas" products={laptops} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
