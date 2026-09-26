import { Link } from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { useCart } from "../context/CartContext";


const money = (value: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);

export function CartPage() {
  const { items, totalItems, total, setQuantity, removeItem, clearCart, storageError } = useCart();
  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />
      <main className="cart-page">
        <Link to="/" className="cart-back">← Seguir comprando</Link>
        <h1>Mi carrito <span>({totalItems})</span></h1>
        {storageError && <p role="alert">No se pudo guardar el carrito en este navegador. Podría perderse al cerrar o recargar la página.</p>}
        {items.length === 0 ? (
          <section className="cart-empty">
            <ShoppingCart size={56} aria-hidden="true" />
            <h2>Tu carrito está vacío</h2>
            <p>Explora nuestros productos y añade tus favoritos.</p>
            <Link to="/" className="cart-primary">Ver productos</Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section aria-label="Productos del carrito">
              <ul className="cart-list">
                {items.map(item => (
                  <li key={item.id} className="cart-item">
                    <Link to={`/producto/${item.id}`}>
                      <img src={item.imageUrl || "https://placehold.co/160x160?text=Producto"} alt={item.name} />
                    </Link>
                    <div className="cart-item-info">
                      <Link to={`/producto/${item.id}`} className="cart-item-name">{item.name}</Link>
                      <p>{money(item.price)} por unidad</p>
                      <div className="cart-quantity" role="group" aria-label={`Cantidad de ${item.name}`}>
                        <button type="button" disabled={item.quantity <= 1} onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label={`Reducir cantidad de ${item.name}`}>−</button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button type="button" disabled={item.quantity >= 99} onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar cantidad de ${item.name}`}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-end">
                      <strong>{money(Math.round(item.price * 100) * item.quantity / 100)}</strong>
                      <button type="button" className="cart-remove" onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.name}`}><Trash2 size={16} /> Eliminar</button>
                    </div>
                  </li>
                ))}
              </ul>
              <button type="button" className="cart-remove" onClick={clearCart}>Vaciar carrito</button>
            </section>
            <aside className="cart-summary" aria-label="Resumen del carrito">
              <h2>Resumen</h2>
              <p><span>Unidades</span><span>{totalItems}</span></p>
              <p className="cart-total"><span>Total de productos</span><strong>{money(total)}</strong></p>
              <small>Los productos de tu carro de compras pueden agotarse próximamente. Cómpralos pronto para que no te quedes sin ellos.</small>
              <Link to="/" className="cart-primary">Comprar</Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
