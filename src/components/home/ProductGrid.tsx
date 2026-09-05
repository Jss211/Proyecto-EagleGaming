import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { ProductCard, type Product } from "./ProductCard";

interface ProductGridProps {
  title?: string;
  products?: Product[];
}

export function ProductGrid({ title = "Recomendados para ti", products = [] }: ProductGridProps) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  const visibleProducts = products.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const handlePrev = useCallback(() => {
    setPage((p) => Math.max(0, p - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  }, [totalPages]);

  function handleAddToCart(product: Product) {
    // TODO: conectar con el contexto del carrito
    console.log("Añadir al carrito:", product);
  }

  return (
    <section className="product-grid-section" aria-labelledby="product-grid-heading">
      <h2 id="product-grid-heading" className="product-grid-section__title">
        {title}
      </h2>

      {products.length === 0 ? (
        <div className="product-grid-section__empty" role="status">
          <Package className="product-grid-section__empty-icon" aria-hidden="true" />
          <p className="product-grid-section__empty-text">
            Próximamente tendremos productos disponibles para ti.
          </p>
        </div>
      ) : (
        <>
          <div className="product-grid" role="list">
            {visibleProducts.map((product) => (
              <div key={product.id} role="listitem">
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>

          {/* Paginación por dots */}
          {totalPages > 1 && (
            <div className="product-grid-section__pagination">
              <button
                className="product-grid-section__pg-btn"
                onClick={handlePrev}
                disabled={page === 0}
                aria-label="Página anterior de productos"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`product-grid-section__dot ${i === page ? "product-grid-section__dot--active" : ""}`}
                  onClick={() => setPage(i)}
                  aria-label={`Ir a página ${i + 1}`}
                  aria-current={i === page ? "page" : undefined}
                />
              ))}

              <button
                className="product-grid-section__pg-btn"
                onClick={handleNext}
                disabled={page === totalPages - 1}
                aria-label="Página siguiente de productos"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
