import { useState } from "react";
import { Link } from "react-router-dom";
import { Marquee } from "../ui/marquee";

interface Category {
  id: string;
  label: string;
  image: string;
}

const CATEGORIES: Category[] = [
  { id: "laptops", label: "LAPTOPS", image: "/categorias/laptops.png" },
  { id: "refrigeracion", label: "REFRIGERACIÓN LÍQUIDA", image: "/categorias/refrigeración líquida.png" },
  { id: "monitores", label: "MONITORES", image: "/categorias/monitores.png" },
  { id: "pc-completa", label: "PC COMPLETA", image: "/categorias/pc completa.png" },
  { id: "procesadores", label: "PROCESADORES", image: "/categorias/procesadores.png" },
  { id: "tarjeta-grafica", label: "TARJETA GRÁFICA", image: "/categorias/TARJETA gráfica.png" },
  { id: "case", label: "CASES", image: "/categorias/case_4.png" },
  { id: "estabilizadores", label: "ESTABILIZADORES", image: "/categorias/estabilizadores.png" },
  { id: "fuente-poder", label: "FUENTE DE PODER", image: "/categorias/fuente de poder.png" },
  { id: "memoria-ram", label: "MEMORIA RAM", image: "/categorias/memoria RAM.png" },
  { id: "memoria-ssd", label: "MEMORIA SSD", image: "/categorias/memoria ssd.png" },
  { id: "perifericos", label: "PERIFÉRICOS", image: "/categorias/perifericos.png" },
  { id: "placa-madre", label: "PLACA MADRE", image: "/categorias/placa madre.png" },
];

export function CategoriesMarquee() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <Marquee pauseOnHover speed={40} className="py-4 mt-0 sm:mt-0">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          to={`/categoria/${cat.id}`}
          className="category-card mx-4 shrink-0 flex flex-col items-center justify-center gap-4"
          aria-label={`Ver ${cat.label}`}
          onMouseEnter={() => setHoveredId(cat.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{ width: "200px" }}
        >
          <div 
            className="category-card__img-wrap relative flex items-center justify-center bg-zinc-800 rounded-xl"
            aria-hidden="true"
            style={{
              width: "100%",
              aspectRatio: "1/1",
              overflow: "hidden",
            }}
          >
            <img 
              src={cat.image} 
              alt={cat.label}
              style={{
                width: "80%",
                height: "80%",
                objectFit: "contain",
                transform: hoveredId === cat.id ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.4s ease-in-out",
                transformOrigin: "center"
              }}
            />
          </div>
          <span className="category-card__label font-bold text-center text-sm tracking-wider uppercase">
            {cat.label}
          </span>
        </Link>
      ))}
    </Marquee>
  );
}
