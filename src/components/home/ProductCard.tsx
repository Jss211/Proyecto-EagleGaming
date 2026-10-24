import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { LiquidMetalButton } from "../../components/ui/liquid-metal-button";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl = product.imageUrl || "https://placehold.co/400x300?text=Producto";
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const tickingRef = useRef(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current || tickingRef.current) return;
    tickingRef.current = true;
    const clientX = e.clientX;
    const clientY = e.clientY;

    requestAnimationFrame(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
        const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
        cardRef.current.style.setProperty("--rotation", `${angle}deg`);
      }
      tickingRef.current = false;
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (cardRef.current) {
      cardRef.current.style.setProperty("--rotation", "0deg");
    }
  };

  return (
    <article 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col items-center group relative transition-transform duration-200" 
      aria-label={product.name}
      style={{ 
        width: "100%", 
        height: "100%",
        padding: "3px", // Espacio para el borde giratorio
        boxSizing: "border-box",
        borderRadius: "0.75rem",
        overflow: "hidden",
        position: "relative",
        boxShadow: hovered ? "0 14px 20px -4px rgba(232, 25, 80, 0.25)" : "0 2px 4px rgba(0, 0, 0, 0.05)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        willChange: "transform",
      }}
    >
      {/* Fondo estático del borde */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#eaeaea",
          zIndex: 0,
        }}
      />

      {/* Borde giratorio interactivo (línea roja que acompaña al mouse) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "800px",
          height: "800px",
          backgroundImage: `conic-gradient(from 0deg at 50% 50%, #e81950 0deg, #e81950 45deg, transparent 45deg, transparent 360deg)`,
          transform: "translate(-50%, -50%) rotate(var(--rotation, 0deg))",
          transformOrigin: "center",
          zIndex: 1,
          pointerEvents: "none",
          opacity: hovered ? 1 : 0, 
          transition: "opacity 0.3s ease",
          filter: "drop-shadow(0 0 8px rgba(232, 25, 80, 0.6))"
        }}
      />

      {/* Contenido principal (Tarjeta blanca) */}
      <div style={{
        background: "white",
        width: "100%",
        height: "100%",
        borderRadius: "calc(0.75rem - 3px)",
        padding: "0.85rem",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
      }}>
        <Link to={`/producto/${product.id}`} className="block w-full text-center" style={{ textDecoration: "none" }}>
          {/* Imagen del producto con zoom al pasar el mouse */}
          <div style={{ 
            width: "100%", 
            height: "180px", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            marginBottom: "0.75rem",
            overflow: "hidden",
            borderRadius: "0.5rem",
            position: "relative"
          }}>
            <img 
              src={imageUrl} 
              alt={product.name}
              loading="lazy"
              style={{ 
                maxWidth: "100%", 
                maxHeight: "100%", 
                objectFit: "contain",
                transform: hovered ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.4s ease-in-out",
                transformOrigin: "center"
              }}
            />
          </div>
          
          {/* Nombre del producto */}
          <h3 
            style={{ 
              color: "#000", 
              fontSize: "0.92rem", 
              fontWeight: "600", 
              margin: "0 0 0.5rem 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: "1.35",
              minHeight: "2.5rem",
              letterSpacing: "0.2px"
            }}
          >
            {product.name}
          </h3>
          
          {/* Precio */}
          <p style={{ 
            color: "#e81950", 
            fontSize: "1.2rem", 
            fontWeight: "700", 
            margin: "0 0 0.6rem 0",
            letterSpacing: "0.5px"
          }}>
            S/ {product.price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </p>
        </Link>

        {/* Indicador de Stock */}
        <div style={{ width: "100%", marginBottom: "0.75rem" }}>
          {product.inStock !== false && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#166534"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              En stock
            </div>
          )}
          {product.inStock === false && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#991b1b"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Agotado
            </div>
          )}
        </div>
         
        {/* Botón */}
        <div className="w-full flex justify-center mt-auto">
          <LiquidMetalButton 
            label="Añadir al carrito" 
            onClick={() => onAddToCart?.(product)} 
            viewMode="text" 
            width={200} 
          />
        </div>
      </div>
    </article>
  );
}
