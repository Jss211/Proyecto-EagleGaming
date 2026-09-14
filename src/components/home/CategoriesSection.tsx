import { useState } from "react";
import { Link } from "react-router-dom";

interface Category {
  id: string;
  label: string;
  href: string;
  image: string;
}

const CATEGORIES: Category[] = [
  { id: "laptops", label: "LAPTOPS", href: "/categoria/laptops", image: "/laptops.png" },
  { id: "refrigeracion", label: "REFRIGERACIÓN LÍQUIDA", href: "/categoria/refrigeracion", image: "/refrigeración líquida.png" },
  { id: "monitores", label: "MONITORES", href: "/categoria/monitores", image: "/monitores.png" },
  { id: "pc-completa", label: "PC COMPLETA", href: "/categoria/pc-completa", image: "/pc completa.png" },
  { id: "procesadores", label: "PROCESADORES", href: "/categoria/procesadores", image: "/procesadores.png" },
];

export function CategoriesSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="categories-section" aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="categories-section__title page-title">
        PRODUCTOS
      </h2>

      <div className="categories-section__grid">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={cat.href}
            className="category-card"
            aria-label={`Ver ${cat.label}`}
            onMouseEnter={() => setHoveredId(cat.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Imagen de categoría */}
            <div 
              className="category-card__img-wrap" 
              aria-hidden="true"
              style={{
                overflow: "hidden",
                borderRadius: "8px"
              }}
            >
              <img 
                src={cat.image} 
                alt={cat.label}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  transform: hoveredId === cat.id ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.4s ease-in-out",
                  transformOrigin: "center"
                }}
              />
            </div>
            <span className="category-card__label category-title">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
