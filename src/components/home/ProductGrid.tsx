import { useCart } from "../../context/CartContext";
import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { ProductCard, type Product } from "./ProductCard";

interface ProductGridProps {
  title?: string;
  products?: Product[];
  /** "carousel" (default) → slider con flechas y dots  |  "grid" → cuadrícula completa sin paginación */
  mode?: "carousel" | "grid";
  viewMoreUrl?: string;
  viewMoreText?: string;
}

export function ProductGrid({
  title = "Recomendados para ti",
  products = [],
  mode = "carousel",
  viewMoreUrl,
  viewMoreText = "Ver todos",
}: ProductGridProps) {
  const { addItem } = useCart();
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    if (mode !== "carousel") return;
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1200) setItemsPerPage(5);
      else if (width >= 900) setItemsPerPage(4);
      else if (width >= 640) setItemsPerPage(3);
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

  const headingId = `heading-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className="product-grid-section" aria-labelledby={headingId}>
      {viewMoreUrl ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <h2 id={headingId} className="product-grid-section__title page-title" style={{ margin: 0, textAlign: "left" }}>
            {title}
          </h2>
          <Link
            to={viewMoreUrl}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              color: "#e81950",
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            {viewMoreText}
            <ChevronRight style={{ width: "18px", height: "18px" }} />
          </Link>
        </div>
      ) : (
        <h2 id={headingId} className="product-grid-section__title page-title">
          {title}
        </h2>
      )}

      {products.length === 0 ? (
        <div className="product-grid-section__empty" role="status">
          <Package className="product-grid-section__empty-icon" aria-hidden="true" />
          <p className="product-grid-section__empty-text">
            Próximamente tendremos productos disponibles para ti.
          </p>
        </div>
      ) : mode === "grid" ? (
        /* ── Modo grid responsive ── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
            gap: "1rem",
            width: "100%",
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
        /* ── Modo carousel responsive ── */
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
