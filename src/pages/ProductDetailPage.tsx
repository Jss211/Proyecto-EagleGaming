import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

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

  const title = product.titulo || product.nombre || `${product.marca || ""} ${product.modelo || ""}`.trim();
  const price = product.precio || 0;

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
          <span style={{ color: "#333", fontWeight: "bold" }}> {product.categoria || "PRODUCTO"}</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem" }}>
          {/* Columna Izquierda: Imagen y Carrusel */}
          <div style={{ flex: "1 1 400px", maxWidth: "600px", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
              <div style={{ display: "flex", gap: "20px", overflowX: "auto", padding: "5px", justifyContent: "center", width: "100%" }}>
                {images.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{ 
                      width: "100px", 
                      height: "100px", 
                      minWidth: "100px",
                      border: currentImageIndex === idx ? "2px solid #e3000f" : "1px solid #eaeaea",
                      borderRadius: "10px",
                      overflow: "hidden",
                      cursor: "pointer",
                      padding: "6px",
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
            <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#222", marginBottom: "1rem", lineHeight: "1.3" }}>
              {title}
            </h1>
            
            <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#e3000f", marginBottom: "1rem" }}>
              S/ {price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </p>

            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "#555", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "2rem" }}>
              {(product.marca || product.Marca) && <li><strong>Marca:</strong> {product.marca || product.Marca}</li>}
              {(product.modelo || product.Modelo) && <li><strong>Modelo:</strong> {product.modelo || product.Modelo}</li>}
              {(product.procesador || product.Procesador) && <li><strong>Procesador:</strong> {product.procesador || product.Procesador}</li>}
              {(product.ram || product.RAM || product.Ram) && <li><strong>Memoria RAM:</strong> {product.ram || product.RAM || product.Ram}</li>}
              {(product.almacenamiento || product.Almacenamiento) && <li><strong>Almacenamiento:</strong> {product.almacenamiento || product.Almacenamiento}</li>}
              {(product.pantalla || product.Pantalla) && <li><strong>Pantalla:</strong> {product.pantalla || product.Pantalla}</li>}
              {(product.graficos || product.Graficos || product.Gráficos || product.gráficos) && <li><strong>Gráficos:</strong> {product.graficos || product.Graficos || product.Gráficos || product.gráficos}</li>}
              {(product.sistemaOperativo || product.SistemaOperativo || product.sistemaoperativo || product.sistema_operativo) && <li><strong>Sistema operativo:</strong> {product.sistemaOperativo || product.SistemaOperativo || product.sistemaoperativo || product.sistema_operativo}</li>}
              {(product.bateria || product.Bateria || product.Batería || product.batería) && <li><strong>Batería:</strong> {product.bateria || product.Bateria || product.Batería || product.batería}</li>}
              {(product.diseno || product.Diseno || product.Diseño || product.diseño) && <li><strong>Diseño:</strong> {product.diseno || product.Diseno || product.Diseño || product.diseño}</li>}
              {(product.usoRecomendado || product.Usorecomendado || product.uso_recomendado || product.usoRecomendado) && <li><strong>Uso recomendado:</strong> {product.usoRecomendado || product.Usorecomendado || product.uso_recomendado}</li>}
            </ul>

            {(product.descripcion || product.Descripcion) && (
              <div style={{ marginBottom: "2rem", borderTop: "1px solid #eaeaea", paddingTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#333", marginBottom: "0.8rem" }}>Descripción del producto</h3>
                <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: "1.6" }}>
                  {product.descripcion || product.Descripcion}
                </p>
              </div>
            )}

            <button style={{ backgroundColor: "#e3000f", color: "white", border: "none", padding: "1rem 2rem", fontSize: "1.1rem", fontWeight: "bold", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", cursor: "pointer", transition: "background-color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#c2000c"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#e3000f"}>
              <ShoppingCart size={20} />
              AÑADIR AL CARRITO
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

