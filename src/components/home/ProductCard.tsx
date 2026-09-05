import { ShoppingCart } from "lucide-react";

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
  return (
    <article className="product-card" aria-label={product.name}>
      {/* Imagen */}
      <div className="product-card__img-wrap">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card__img"
            loading="lazy"
          />
        ) : (
          <div className="product-card__img-placeholder" aria-hidden="true" />
        )}
      </div>

      {/* Cuerpo */}
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">
          S/{product.price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
        </p>
      </div>
       
      {/* Botón */}
      <button
        className="product-card__add-btn"
        onClick={() => onAddToCart?.(product)}
        aria-label={`Añadir ${product.name} al carrito`}
      >
        <ShoppingCart className="w-4 h-4" aria-hidden="true" />
        Añadir al carro
      </button>
    </article>
  );
}
