import { Link } from "react-router-dom";
import { Monitor, Cpu, Laptop, Droplets, Server } from "lucide-react";

interface Category {
  id: string;
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: Category[] = [
  { id: "laptops", label: "LAPTOPS", href: "/categoria/laptops", Icon: Laptop },
  { id: "refrigeracion", label: "REFRIGERACIÓN LÍQUIDA", href: "/categoria/refrigeracion", Icon: Droplets },
  { id: "monitores", label: "MONITORES", href: "/categoria/monitores", Icon: Monitor },
  { id: "pc-completa", label: "PC COMPLETA", href: "/categoria/pc-completa", Icon: Server },
  { id: "procesadores", label: "PROCESADORES", href: "/categoria/procesadores", Icon: Cpu },
];

export function CategoriesSection() {
  return (
    <section className="categories-section" aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="categories-section__title">
        PRODUCTOS
      </h2>

      <div className="categories-section__grid">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={cat.href}
            className="category-card"
            aria-label={`Ver ${cat.label}`}
          >
            {/* Imagen de categoría — placeholder hasta tener imágenes */}
            <div className="category-card__img-wrap" aria-hidden="true">
              <cat.Icon className="category-card__icon" />
            </div>
            <span className="category-card__label">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
