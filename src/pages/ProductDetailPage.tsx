import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LiquidMetalButton } from "../components/ui/liquid-metal-button";

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No existe el producto!");
        }
      } catch (error) {
        console.error("Error al obtener producto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="home-page">
        <Navbar />
        <SecondaryNav />
        <div style={{ padding: "4rem", textAlign: "center" }}>Cargando producto...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="home-page">
        <Navbar />
        <SecondaryNav />
        <div style={{ padding: "4rem", textAlign: "center" }}>Producto no encontrado</div>
        <Footer />
      </div>
    );
  }

  const title = product.titulo || product.Titulo || product.título || product.Título || product.nombre || product.Nombre || `${product.marca || product.Marca || ""} ${product.modelo || product.Modelo || ""}`.trim() || "Producto sin título";
  const price = product.precio || product.Precio || 0;

  // Recolectar todas las imágenes disponibles
  const images: string[] = [];
  if (Array.isArray(product.imagenes)) {
    images.push(...product.imagenes);
  } else {
    if (product.url) images.push(product.url);
    if (product.url1) images.push(product.url1);
    if (product.url2) images.push(product.url2);
    if (product.url3) images.push(product.url3);
    if (product.url4) images.push(product.url4);
    if (product.url5) images.push(product.url5);
  }
  // Imagen por defecto si no hay ninguna
  if (images.length === 0) {
    images.push("https://placehold.co/600x400?text=Imagen+No+Disponible");
  }

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        {/* Breadcrumbs */}
        <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "2rem", textTransform: "uppercase", letterSpacing: "1px" }}>
          <Link to="/" style={{ color: "#999", textDecoration: "none" }}>INICIO</Link> / 
          <span style={{ color: "#999" }}> TIENDA</span> / 
          <span style={{ color: "#333", fontWeight: "bold" }}> {product.categoria || product.Categoria || product.categoría || product.Categoría || "PRODUCTO"}</span>
        </div>

        <div 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1.2fr", 
            gap: "3rem",
            alignItems: "start"
          }}
        >
          {/* Columna Izquierda: Imagen y Carrusel */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "600px" }}>
            {/* Imagen Principal */}
            <div style={{ border: "1px solid #eaeaea", borderRadius: "12px", padding: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "white", marginBottom: "2rem", position: "relative", minHeight: "400px", width: "100%" }}>
              <img 
                src={images[currentImageIndex]} 
                alt={`${title} - Vista ${currentImageIndex + 1}`} 
                style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "450px" }} 
              />
              {/* Flechas (solo si hay más de 1 imagen) */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    style={{ position: "absolute", left: "-22px", top: "50%", transform: "translateY(-50%)", background: "white", border: "1px solid #eaeaea", borderRadius: "50%", width: "45px", height: "45px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", color: "#333", transition: "all 0.2s", zIndex: 10 }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "#ccc"} 
                    onMouseOut={(e) => e.currentTarget.style.borderColor = "#eaeaea"}>
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    style={{ position: "absolute", right: "-22px", top: "50%", transform: "translateY(-50%)", background: "white", border: "1px solid #eaeaea", borderRadius: "50%", width: "45px", height: "45px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", color: "#333", transition: "all 0.2s", zIndex: 10 }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "#ccc"} 
                    onMouseOut={(e) => e.currentTarget.style.borderColor = "#eaeaea"}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            {/* Miniaturas (solo si hay más de 1 imagen) */}
            {images.length > 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", padding: "5px", justifyContent: "center", width: "100%" }}>
                {images.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{ 
                      width: "80px", 
                      height: "80px", 
                      border: currentImageIndex === idx ? "2px solid #e81950" : "1px solid #eaeaea",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      padding: "4px",
                      backgroundColor: "white",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { if(currentImageIndex !== idx) e.currentTarget.style.transform = "translateY(-2px)" }} 
                    onMouseOut={(e) => { if(currentImageIndex !== idx) e.currentTarget.style.transform = "translateY(0)" }}
                  >
                    <img src={imgUrl} alt={`Miniatura ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Detalles */}
          <div style={{ flex: "1 1 500px" }}>
            <h1 className="product-title" style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#222", marginBottom: "1rem", lineHeight: "1.3" }}>
              {title}
            </h1>
            
            <p className="product-title" style={{ fontSize: "2rem", fontWeight: "bold", color: "#e81950", marginBottom: "1rem" }}>
              S/ {price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </p>

            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "#555", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "2rem" }}>
              {Object.entries(product)
                .filter(([key, value]) => {
                  const k = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                  const ignoredKeys = ["id", "titulo", "nombre", "precio", "categoria", "descripcion", "imagenes", "url", "url1", "url2", "url3", "url4", "url5"];
                  return !ignoredKeys.includes(k) && typeof value === 'string' && value.trim() !== '';
                })
                .map(([key, value]) => {
                  // Formatear la clave para que se vea bien (ej. "fuente de poder" -> "Fuente de poder")
                  const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                  return (
                    <li key={key}>
                      <strong>{formattedKey}:</strong> {String(value)}
                    </li>
                  );
                })}
            </ul>

            {(product.descripcion || product.Descripcion) && (
              <div style={{ marginBottom: "2rem", borderTop: "1px solid #eaeaea", paddingTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#333", marginBottom: "0.8rem" }}>Descripción del producto</h3>
                <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: "1.6" }}>
                  {product.descripcion || product.Descripcion}
                </p>
              </div>
            )}

            <div className="flex justify-center w-full mt-4">
              <LiquidMetalButton 
                label="AÑADIR AL CARRITO" 
                viewMode="text" 
                width={380} 
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

