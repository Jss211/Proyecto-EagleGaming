import { useCart } from "../context/CartContext";
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import { LiquidMetalButton } from "../components/ui/liquid-metal-button";
import { ProductReviewForm, ProductReviewList } from "../components/product/ProductReviews";
import {
  normalizeDocumentData,
  resolveProductTitle,
  parsePrice,
  resolveAllProductImages,
  extractProductSpecifications,
} from "../utils/productUtils";

export function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomPos({ x: 50, y: 50 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "productos", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          const clean = normalizeDocumentData(rawData);
          setProduct({ id: docSnap.id, ...clean });
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

  const title = resolveProductTitle(product);
  const price = parsePrice(product.precio ?? product.Precio);
  const images = resolveAllProductImages(product);

  // Imagen por defecto si no hay ninguna
  if (images.length === 0) {
    images.push("https://placehold.co/600x400?text=Imagen+No+Disponible");
  }

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main className="product-detail-main">
        {/* Breadcrumbs */}
        <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "2rem", textTransform: "uppercase", letterSpacing: "1px" }}>
          <Link to="/" style={{ color: "#999", textDecoration: "none" }}>INICIO</Link> / 
          <span style={{ color: "#999" }}> TIENDA</span> / 
          <span style={{ color: "#333", fontWeight: "bold" }}> {product.categoria || product.Categoria || product.categoría || product.Categoría || "PRODUCTO"}</span>
        </div>

        <div className="product-detail-grid">
          {/* Columna Izquierda: Imagen y Carrusel */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "600px" }}>
            {/* Imagen Principal con Zoom Interactivo al pasar el mouse */}
            <div 
              className="product-detail-image-box"
              ref={imageContainerRef}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setIsLightboxOpen(true)}
              title="Haz clic para ver en pantalla completa"
              style={{ 
                border: "1px solid #eaeaea", 
                borderRadius: "12px", 
                padding: "1.5rem", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                backgroundColor: "white", 
                marginBottom: "2rem", 
                position: "relative", 
                minHeight: "400px", 
                width: "100%",
                overflow: "hidden",
                cursor: isZoomed ? "zoom-in" : "pointer",
                boxShadow: isZoomed ? "0 10px 25px rgba(0,0,0,0.06)" : "0 2px 6px rgba(0,0,0,0.02)",
                transition: "box-shadow 0.25s ease",
                userSelect: "none",
              }}
            >
              <img 
                src={images[currentImageIndex]} 
                alt={`${title} - Vista ${currentImageIndex + 1}`} 
                style={{ 
                  width: "100%", 
                  height: "auto", 
                  objectFit: "contain", 
                  maxHeight: "450px",
                  transform: isZoomed ? "scale(2.3)" : "scale(1)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transition: isZoomed ? "transform 0.08s ease-out" : "transform 0.3s ease-out, transform-origin 0.3s ease-out",
                  pointerEvents: "none",
                  willChange: "transform, transform-origin",
                }} 
              />

              {/* Badge indicador de zoom */}
              <div
                className="product-detail-zoom-badge"
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                  backgroundColor: "rgba(17, 24, 39, 0.72)",
                  backdropFilter: "blur(4px)",
                  color: "#fff",
                  padding: "5px 11px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  pointerEvents: "none",
                  opacity: isZoomed ? 0 : 0.88,
                  transition: "opacity 0.25s ease",
                  zIndex: 5,
                }}
              >
                <ZoomIn size={14} />
                <span className="product-detail-zoom-text-desktop">Pasa el cursor para ampliar</span>
                <span className="product-detail-zoom-text-mobile">Toca para ampliar</span>
              </div>

              {/* Flechas (solo si hay más de 1 imagen) */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                    }}
                    className="product-detail-arrow-left" 
                    style={{ 
                      position: "absolute", 
                      top: "50%", 
                      transform: "translateY(-50%)", 
                      background: "white", 
                      border: "1px solid #eaeaea", 
                      borderRadius: "50%", 
                      width: "45px", 
                      height: "45px", 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center", 
                      cursor: "pointer", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)", 
                      color: "#333", 
                      transition: "opacity 0.2s ease, border-color 0.2s", 
                      zIndex: 10,
                      opacity: isZoomed ? 0 : 1,
                      pointerEvents: isZoomed ? "none" : "auto",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "#ccc"} 
                    onMouseOut={(e) => e.currentTarget.style.borderColor = "#eaeaea"}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                    }}
                    className="product-detail-arrow-right" 
                    style={{ 
                      position: "absolute", 
                      top: "50%", 
                      transform: "translateY(-50%)", 
                      background: "white", 
                      border: "1px solid #eaeaea", 
                      borderRadius: "50%", 
                      width: "45px", 
                      height: "45px", 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center", 
                      cursor: "pointer", 
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)", 
                      color: "#333", 
                      transition: "opacity 0.2s ease, border-color 0.2s", 
                      zIndex: 10,
                      opacity: isZoomed ? 0 : 1,
                      pointerEvents: isZoomed ? "none" : "auto",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "#ccc"} 
                    onMouseOut={(e) => e.currentTarget.style.borderColor = "#eaeaea"}
                    aria-label="Siguiente imagen"
                  >
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

          {/* Columna Derecha: Detalles del Producto */}
          <div className="product-detail-info-col" style={{ flex: "1 1 500px", minWidth: 0, width: "100%" }}>
            <h1 className="product-title" style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#222", marginBottom: "1rem", lineHeight: "1.3" }}>
              {title}
            </h1>
            
            <p className="product-title" style={{ fontSize: "2rem", fontWeight: "bold", color: "#e81950", marginBottom: "1rem" }}>
              S/ {price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </p>

            {/* Lista Unificada y Deduplicada de Especificaciones */}
            {(() => {
              const displaySpecs = extractProductSpecifications(product);
              if (displaySpecs.length === 0) return null;

              return (
                <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "#555", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "2rem" }}>
                  {displaySpecs.map((item) => (
                    <li 
                      key={item.id} 
                      style={item.isSubItem ? { marginLeft: "1.5rem", listStyleType: "circle" } : {}}
                    >
                      {item.text}
                    </li>
                  ))}
                </ul>
              );
            })()}

            {(product.descripcion || product.Descripcion) && (
              <div style={{ marginBottom: "2rem", borderTop: "1px solid #eaeaea", paddingTop: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#333", marginBottom: "0.8rem" }}>Descripción del producto</h3>
                <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: "1.6" }}>
                  {product.descripcion || product.Descripcion}
                </p>
              </div>
            )}

            <div className="product-detail-btn-wrap flex justify-center w-full mt-4">
              <LiquidMetalButton 
                label="AÑADIR AL CARRITO"
                onClick={() => addItem({ id: id!, name: title, category: product.categoria || "", price: Number(price), imageUrl: images[0] })}
                viewMode="text" 
                width={380} 
              />
            </div>
          </div>
        </div>

        {/* Sección de Reseñas: siempre debajo de la imagen, descripción y botón de carrito */}
        <section className="product-detail-reviews-section">
          <div className="product-reviews-grid">
            <ProductReviewForm productId={product.id} />
            <ProductReviewList productId={product.id} />
          </div>
        </section>
      </main>

      {/* Modal / Lightbox Pantalla Completa al hacer clic */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            cursor: "zoom-out",
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Cerrar vista ampliada"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "46px",
              height: "46px",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              zIndex: 100000,
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
          >
            <X size={26} />
          </button>

          {/* Imagen ampliada */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "92vw",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "default",
            }}
          >
            <img
              src={images[currentImageIndex]}
              alt={`${title} - Vista completa`}
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                backgroundColor: "white",
                padding: "1rem",
              }}
            />

            {/* Controles de navegación en el modal (si hay más de 1 imagen) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
                  }}
                  style={{
                    position: "absolute",
                    left: "-25px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    color: "#111",
                  }}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
                  }}
                  style={{
                    position: "absolute",
                    right: "-25px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "50%",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    color: "#111",
                  }}
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={28} />
                </button>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-32px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

