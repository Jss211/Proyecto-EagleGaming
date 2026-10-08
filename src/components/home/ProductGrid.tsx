import { useCart } from "../../context/CartContext";
import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { ProductCard, type Product } from "./ProductCard";

interface ProductGridProps {
  title?: string;
  products?: Product[];
  /** "carousel" (default) → slider con flechas y dots  |  "grid" → cuadrícula completa sin paginación */
  mode?: "carousel" | "grid";
}

export function ProductGrid({
  title = "Recomendados para ti",
  products = [],
  mode = "carousel",
}: ProductGridProps) {
  const { addItem } = useCart();
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    if (mode !== "carousel") return;
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 900) setItemsPerPage(5);
      else if (width >= 500) setItemsPerPage(3);
      else setItemsPerPage(2);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, [mode]);

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [totalPages, page]);

  const visibleProducts =
    mode === "grid"
      ? products
      : products.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

  const handlePrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const handleNext = useCallback(
    () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages]
  );

  function handleAddToCart(product: Product) {
    addItem(product);
  }

  return (
    <section className="product-grid-section" aria-labelledby="product-grid-heading">
      <h2 id="product-grid-heading" className="product-grid-section__title page-title">
        {title}
      </h2>

      {products.length === 0 ? (
        <div className="product-grid-section__empty" role="status">
          <Package className="product-grid-section__empty-icon" aria-hidden="true" />
          <p className="product-grid-section__empty-text">
            Próximamente tendremos productos disponibles para ti.
          </p>
        </div>
      ) : mode === "grid" ? (
        /* ── Modo grid: todos los productos, 4 columnas ── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.25rem",
          }}
          role="list"
        >
          {visibleProducts.map((product) => (
            <div key={product.id} role="listitem">
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </div>
          ))}
        </div>
      ) : (
        /* ── Modo carousel: slider con flechas y dots ── */
        <>
          <div className="product-grid" role="list">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                role="listitem"
                style={{ animation: "fadeIn 0.4s ease-in-out" }}
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>

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
                  className={`product-grid-section__dot ${
                    i === page ? "product-grid-section__dot--active" : ""
                  }`}
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