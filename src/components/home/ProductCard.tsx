import { Link } from "react-router-dom";
import { InfoCard } from "../ui/info-card";
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
  // Use a nice placeholder from unsplash if no image is provided
  const imageUrl = product.imageUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop";

  return (
    <article className="flex flex-col items-center gap-4 group" aria-label={product.name}>
      <Link to={`/producto/${product.id}`} className="block">
        <InfoCard 
          image={imageUrl} 
          title={product.category} 
          description={`${product.name} • S/${product.price.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
          width={320}
          height={340}
        />
      </Link>
       
      <div className="-mt-2 relative z-10 w-[320px] flex justify-center">
        <LiquidMetalButton 
          label="Añadir al carrito" 
          onClick={() => onAddToCart?.(product)} 
          viewMode="text" 
          width={280} 
        />
      </div>
    </article>
  );
}
