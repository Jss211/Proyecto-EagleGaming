import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { LiquidMetalButton } from "../ui/liquid-metal-button";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl = product.imageUrl || "https://placehold.co/400x300?text=Producto";
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    cardRef.current.style.setProperty("--rotation", `${angle}deg`);
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
      className="flex flex-col items-center group relative shadow-sm hover:shadow-md transition-shadow duration-300" 
      aria-label={product.name}
      style={{ 
        width: "280px", 
        padding: "3px", // Espacio para el borde giratorio
        boxSizing: "border-box",
        borderRadius: "0.75rem",
        overflow: "hidden",
        position: "relative"
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

      {/* Borde giratorio interactivo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "800px",
          height: "800px",
          backgroundImage: `conic-gradient(#e81950 0deg, #e81950 90deg, transparent 90deg, transparent 360deg)`,
          transform: "translate(-50%, -50%) rotate(var(--rotation, 0deg))",
          transformOrigin: "center",
          zIndex: 1,
          pointerEvents: "none",
          opacity: hovered ? 1 : 0, 
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Contenido principal (Tarjeta blanca) */}
      <div style={{
        background: "white",
        width: "100%",
        height: "100%",
        borderRadius: "calc(0.75rem - 3px)",
        padding: "1rem",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <Link to={`/producto/${product.id}`} className="block w-full text-center" style={{ textDecoration: "none" }}>
          {/* Imagen del producto */}
          <div style={{ width: "100%", height: "200px", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "1rem" }}>
            <img 
              src={imageUrl} 
              alt={product.name}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </div>
          
          {/* Nombre del producto */}
          <h3 
            style={{ 
              color: "#0056b3", 
              fontSize: "0.95rem", 
              fontWeight: "500", 
              margin: "0 0 0.5rem 0",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: "1.4",
              minHeight: "4rem"
            }}
          >
            {product.name}
          </h3>
          
          {/* Precio */}
          <p style={{ color: "#e81950", fontSize: "1.2rem", fontWeight: "bold", margin: "0 0 1rem 0" }}>
            S/ {product.price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </p>
        </Link>
         
        {/* Botón */}
        <div className="w-full flex justify-center mt-auto">
          <LiquidMetalButton 
            label="Añadir al carrito" 
            onClick={() => onAddToCart?.(product)} 
            viewMode="text" 
            width={240} 
          />
        </div>
      </div>
    </article>
  );
}
