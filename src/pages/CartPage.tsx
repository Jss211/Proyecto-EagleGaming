import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Minus,
  Plus,
  Check,
  PackageCheck,
  MessageCircle,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { useCart } from "../context/CartContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { checkoutCustomerSchema, type CheckoutCustomerValues } from "../utils/validation";
import {
  verifyCartWithFirestore,
  generateOrderCode,
  buildWhatsAppOrderMessage,
  createWhatsAppOrderUrl,
  type VerifiedCartItem,
} from "../utils/whatsappOrder";

const money = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);

export function CartPage() {
  const {
    items,
    totalItems,
    total,
    setQuantity,
    removeItem,
    clearCart,
    storageError,
  } = useCart();

  // Estados de Checkout y Modal de Pedido por WhatsApp
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);
  const [priceNotice, setPriceNotice] = useState(false);
  const [verifiedItems, setVerifiedItems] = useState<VerifiedCartItem[]>([]);
  const [verifiedTotal, setVerifiedTotal] = useState<number>(total);

  // Formulario de datos del cliente
  const [customerData, setCustomerData] = useState<CheckoutCustomerValues>({
    fullName: "",
    phone: "",
    cityOrDepartment: "",
    address: "",
    notes: "",
    company_hp: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Abrir checkout: Revalida precios y stock con Firestore al instante
  const handleOpenCheckout = async () => {
    if (items.length === 0) return;
    setIsVerifying(true);
    setVerificationErrors([]);
    setPriceNotice(false);

    try {
      const res = await verifyCartWithFirestore(items);
      setVerifiedItems(res.items);
      setVerifiedTotal(res.total);

      if (!res.valid && res.errors.length > 0) {
        setVerificationErrors(res.errors);
      }
      if (res.priceChangedNotice) {
        setPriceNotice(true);
      }

      setIsModalOpen(true);
    } catch (err) {
      console.error("Error al verificar carrito:", err);
      setVerificationErrors(["No se pudo verificar el inventario con el servidor. Puedes proceder con precaución."]);
      setIsModalOpen(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSendWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validar datos del cliente con Zod
    const validation = checkoutCustomerSchema.safeParse(customerData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setFormErrors(fieldErrors);
      return;
    }

    // Comprobar honeypot anti-spam
    if (customerData.company_hp && customerData.company_hp.trim().length > 0) {
      setIsModalOpen(false);
      clearCart();
      return;
    }

    setIsSubmitting(true);
    const orderCode = generateOrderCode();
    const finalItems = verifiedItems.length > 0 ? verifiedItems : items.map(i => ({ ...i, inStock: true }));
    const finalTotal = verifiedTotal > 0 ? verifiedTotal : total;

    // 1. Guardar pedido en Firestore (colección "orders") con solo permiso de creación pública
    try {
      await addDoc(collection(db, "orders"), {
        orderCode,
        customerName: customerData.fullName.trim(),
        customerPhone: customerData.phone.trim(),
        cityOrDepartment: customerData.cityOrDepartment.trim(),
        address: customerData.address?.trim() || "",
        notes: customerData.notes?.trim() || "",
        items: finalItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: Math.round(item.price * item.quantity * 100) / 100,
        })),
        total: finalTotal,
        status: "pendiente_whatsapp",
        createdAt: serverTimestamp(),
      });
    } catch (dbErr) {
      console.warn("No se pudo registrar orden en Firestore:", dbErr);
    }

    // 2. Construir mensaje formateado y URL wa.me
    const message = buildWhatsAppOrderMessage({
      orderCode,
      customerName: customerData.fullName,
      customerPhone: customerData.phone,
      cityOrDepartment: customerData.cityOrDepartment,
      address: customerData.address,
      notes: customerData.notes,
      items: finalItems,
      total: finalTotal,
    });

    const targetPhone = import.meta.env.VITE_WHATSAPP_NUMBER || "51986638034";
    const waUrl = createWhatsAppOrderUrl(targetPhone, message);

    // Abrir WhatsApp en nueva pestaña
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Limpiar carrito y cerrar modal
    clearCart();
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="home-page cart-page-wrapper">
      <Navbar />
      <SecondaryNav />

      <main className="cart-page-premium">
        <div className="cart-container">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <section className="cart-header-block">
            <Link to="/" className="cart-back-link">
              <ArrowLeft size={16} />
              Seguir comprando
            </Link>

            <div className="cart-title-row">
              <div>
                <span className="cart-eyebrow">
                  EAGLE GAMING / SHOPPING CART
                </span>

                <h1>
                  Tu carrito
                  <span>{totalItems}</span>
                </h1>

                <p>
                  Revisa tus productos antes de continuar con tu compra.
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  className="cart-clear-button"
                  onClick={clearCart}
                >
                  <Trash2 size={15} />
                  Vaciar carrito
                </button>
              )}
            </div>
          </section>

          {/* =====================================================
              PROGRESS
          ===================================================== */}

          {items.length > 0 && (
            <section className="cart-progress-block">
              <div className="cart-progress-item active">
                <div className="cart-progress-number">
                  <Check size={14} />
                </div>

                <div>
                  <strong>Carrito</strong>
                  <span>Productos seleccionados</span>
                </div>
              </div>

              <div className="cart-progress-line" />

              <div className="cart-progress-item">
                <div className="cart-progress-number">2</div>

                <div>
                  <strong>Datos de compra</strong>
                  <span>Información de envío</span>
                </div>
              </div>

              <div className="cart-progress-line" />

              <div className="cart-progress-item">
                <div className="cart-progress-number">3</div>

                <div>
                  <strong>Confirmación</strong>
                  <span>Finalizar pedido</span>
                </div>
              </div>
            </section>
          )}

          {/* =====================================================
              STORAGE WARNING
          ===================================================== */}

          {storageError && (
            <div className="cart-storage-warning">
              <ShieldCheck size={18} />

              <span>
                No se pudo guardar el carrito en este navegador. Podría
                perderse al cerrar o recargar la página.
              </span>
            </div>
          )}

          {/* =====================================================
              EMPTY CART
          ===================================================== */}

          {items.length === 0 ? (
            <section className="cart-empty-block">
              <div className="cart-empty-decoration cart-empty-decoration-one" />
              <div className="cart-empty-decoration cart-empty-decoration-two" />

              <div className="cart-empty-icon">
                <ShoppingBag size={52} strokeWidth={1.4} />
              </div>

              <span className="cart-eyebrow">
                EAGLE GAMING STORE
              </span>

              <h2>
                Tu carrito está
                <br />
                <strong>esperando productos.</strong>
              </h2>

              <p>
                Parece que todavía no has agregado nada.
                Explora nuestro catálogo y encuentra el equipo perfecto
                para tu setup.
              </p>

              <Link to="/" className="cart-main-button">
                Explorar productos
                <ArrowRight size={17} />
              </Link>
            </section>
          ) : (
            <>

              {/* =====================================================
                  MAIN GRID
              ===================================================== */}

              <div className="cart-main-grid">

                {/* =================================================
                    LEFT
                ================================================= */}

                <div className="cart-products-column">

                  <section className="cart-products-block">

                    <div className="cart-block-header">
                      <div>
                        <span className="cart-block-label">
                          TU SELECCIÓN
                        </span>

                        <h2>
                          Productos
                          <span>{items.length}</span>
                        </h2>
                      </div>

                      <div className="cart-products-counter">
                        {totalItems} unidades
                      </div>
                    </div>

                    <div className="cart-products-list">
                      {items.map((item, index) => (
                        <article
                          key={item.id}
                          className="cart-product-card"
                        >

                          {/* NUMBER */}
                          <div className="cart-product-number">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          {/* IMAGE */}
                          <Link
                            to={`/producto/${item.id}`}
                            className="cart-product-image"
                          >
                            <img
                              src={
                                item.imageUrl ||
                                "https://placehold.co/300x300?text=Producto"
                              }
                              alt={item.name}
                            />
                          </Link>

                          {/* INFORMATION */}
                          <div className="cart-product-info">

                            <span className="cart-product-category">
                              GAMING / HARDWARE
                            </span>

                            <Link
                              to={`/producto/${item.id}`}
                              className="cart-product-name"
                            >
                              {item.name}
                            </Link>

                            <span className="cart-product-unit-price">
                              {money(item.price)} por unidad
                            </span>

                            <div className="cart-product-bottom">

                              <div
                                className="cart-quantity-control"
                                role="group"
                                aria-label={`Cantidad de ${item.name}`}
                              >
                                <button
                                  type="button"
                                  disabled={item.quantity <= 1}
                                  onClick={() =>
                                    setQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  aria-label={`Reducir cantidad de ${item.name}`}
                                >
                                  <Minus size={14} />
                                </button>

                                <span aria-live="polite">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  disabled={item.quantity >= 99}
                                  onClick={() =>
                                    setQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  aria-label={`Aumentar cantidad de ${item.name}`}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <button
                                type="button"
                                className="cart-product-remove"
                                onClick={() =>
                                  removeItem(item.id)
                                }
                              >
                                <Trash2 size={14} />
                                Eliminar
                              </button>

                            </div>
                          </div>

                          {/* PRICE */}
                          <div className="cart-product-price">
                            <span>Total</span>

                            <strong>
                              {money(
                                (Math.round(item.price * 100) *
                                  item.quantity) /
                                  100
                              )}
                            </strong>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  {/* =================================================
                      BENEFITS
                  ================================================= */}

                  <section className="cart-benefits-block">

                    <div className="cart-benefit">
                      <div className="cart-benefit-icon">
                        <ShieldCheck size={21} />
                      </div>

                      <div>
                        <strong>Compra segura</strong>
                        <span>
                          Productos originales y garantía
                        </span>
                      </div>
                    </div>

                    <div className="cart-benefit">
                      <div className="cart-benefit-icon">
                        <Truck size={21} />
                      </div>

                      <div>
                        <strong>Envíos en Perú</strong>
                        <span>
                          Recibe tus productos donde estés
                        </span>
                      </div>
                    </div>

                    <div className="cart-benefit">
                      <div className="cart-benefit-icon">
                        <PackageCheck size={21} />
                      </div>

                      <div>
                        <strong>Pedido protegido</strong>
                        <span>
                          Seguimiento de tu compra
                        </span>
                      </div>
                    </div>

                  </section>
                </div>

                {/* =================================================
                    RIGHT
                ================================================= */}

                <aside className="cart-summary-column">

                  <section className="cart-summary-block">

                    <div className="cart-summary-top">
                      <span>RESUMEN</span>

                      <ShoppingBag size={20} />
                    </div>

                    <h2>
                      Resumen de
                      <br />
                      <strong>tu compra</strong>
                    </h2>

                    <div className="cart-summary-items">

                      <div>
                        <span>Productos</span>
                        <strong>{totalItems}</strong>
                      </div>

                      <div>
                        <span>Subtotal</span>
                        <strong>{money(total)}</strong>
                      </div>

                      <div>
                        <span>Envío</span>
                        <strong className="pending">
                          Por calcular
                        </strong>
                      </div>

                    </div>

                    <div className="cart-summary-total">
                      <span>Total estimado</span>

                      <strong>{money(total)}</strong>
                    </div>

                    <div className="cart-summary-message">
                      <span className="cart-summary-dot" />

                      <p>
                        El costo de envío será calculado según
                        tu ubicación y método de entrega.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCheckout}
                      disabled={isVerifying || items.length === 0}
                      className="cart-checkout-button"
                      style={{ cursor: isVerifying ? "wait" : "pointer" }}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Verificando inventario...
                        </>
                      ) : (
                        <>
                          <MessageCircle size={18} />
                          Comprar por WhatsApp
                        </>
                      )}
                    </button>

                    <Link
                      to="/"
                      className="cart-continue-link"
                    >
                      <ArrowLeft size={14} />
                      Seguir comprando
                    </Link>

                  </section>

                </aside>
              </div>
            </>
          )}
        </div>
        {/* =====================================================
            MODAL DE CHECKOUT Y ENVÍO POR WHATSAPP
        ===================================================== */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
              style={{ background: "#ffffff", borderRadius: "18px", width: "100%", maxWidth: "540px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            >
              {/* Header Modal */}
              <div
                style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f3", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fcfcfd" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#181827" }}>
                      Finalizar Pedido por WhatsApp
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#777" }}>
                      Verificamos tu pedido antes de enviarlo
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#888", padding: "6px" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Modal con scroll */}
              <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
                {/* Alertas de inventario / precios de Firestore */}
                {priceNotice && (
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "0.8rem", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "1rem", display: "flex", gap: "8px" }}>
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>Los precios de algunos productos se actualizaron con las tarifas vigentes de la tienda.</span>
                  </div>
                )}

                {verificationErrors.length > 0 && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.8rem", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "1rem" }}>
                    <strong style={{ display: "block", marginBottom: "4px" }}>Aviso de inventario:</strong>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                      {verificationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resumen del Pedido Revalidado */}
                <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "1rem", marginBottom: "1.25rem", border: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666", marginBottom: "6px" }}>
                    <span>Total de ítems a comprar:</span>
                    <strong style={{ color: "#222" }}>{verifiedItems.length > 0 ? verifiedItems.reduce((s, it) => s + it.quantity, 0) : totalItems} unidades</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 700, color: "#e81950", borderTop: "1px dashed #ddd", paddingTop: "6px" }}>
                    <span>Monto Total a pagar:</span>
                    <span>{money(verifiedTotal > 0 ? verifiedTotal : total)}</span>
                  </div>
                </div>

                {/* Formulario del Cliente */}
                <form id="checkout-customer-form" onSubmit={handleSendWhatsAppOrder} noValidate style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                  {/* Honeypot invisible */}
                  <div style={{ display: "none" }} aria-hidden="true">
                    <input type="text" name="company_hp" tabIndex={-1} autoComplete="off" value={customerData.company_hp} onChange={handleCustomerChange} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "4px" }}>
                      Nombre y Apellido completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Ej. Carlos Mendoza"
                      value={customerData.fullName}
                      onChange={handleCustomerChange}
                      maxLength={120}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", border: formErrors.fullName ? "1px solid #ef4444" : "1px solid #ccc", borderRadius: "8px", fontSize: "0.9rem", outline: "none" }}
                    />
                    {formErrors.fullName && (
                      <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>{formErrors.fullName}</span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "4px" }}>
                        Teléfono / Celular *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Ej. 987654321"
                        value={customerData.phone}
                        onChange={handleCustomerChange}
                        maxLength={15}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", border: formErrors.phone ? "1px solid #ef4444" : "1px solid #ccc", borderRadius: "8px", fontSize: "0.9rem", outline: "none" }}
                      />
                      {formErrors.phone && (
                        <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>{formErrors.phone}</span>
                      )}
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "4px" }}>
                        Ciudad / Dpto *
                      </label>
                      <input
                        type="text"
                        name="cityOrDepartment"
                        placeholder="Ej. Lima / Arequipa"
                        value={customerData.cityOrDepartment}
                        onChange={handleCustomerChange}
                        maxLength={80}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", border: formErrors.cityOrDepartment ? "1px solid #ef4444" : "1px solid #ccc", borderRadius: "8px", fontSize: "0.9rem", outline: "none" }}
                      />
                      {formErrors.cityOrDepartment && (
                        <span style={{ color: "#ef4444", fontSize: "0.78rem" }}>{formErrors.cityOrDepartment}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "4px" }}>
                      Dirección de entrega (opcional)
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Calle, número, urbanización o agencia Shalom/Olva"
                      value={customerData.address}
                      onChange={handleCustomerChange}
                      maxLength={200}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", border: "1px solid #ccc", borderRadius: "8px", fontSize: "0.9rem", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "4px" }}>
                      Observaciones o instrucciones adicionales (opcional)
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Ej. Necesito factura con RUC, entrega en la tarde..."
                      value={customerData.notes}
                      onChange={handleCustomerChange}
                      maxLength={500}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", border: "1px solid #ccc", borderRadius: "8px", fontSize: "0.85rem", outline: "none", resize: "none" }}
                    ></textarea>
                  </div>
                </form>
              </div>

              {/* Footer Modal con botón enviar */}
              <div
                style={{ padding: "1.1rem 1.5rem", borderTop: "1px solid #f0f0f3", background: "#fcfcfd", display: "flex", gap: "12px", justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "0.65rem 1.2rem", borderRadius: "8px", border: "1px solid #ddd", background: "#fff", color: "#555", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="checkout-customer-form"
                  disabled={isSubmitting}
                  style={{ padding: "0.65rem 1.5rem", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontSize: "0.9rem", fontWeight: 700, cursor: isSubmitting ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      Enviar a WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style>{`

        /* =========================================================
           BASE
        ========================================================= */

        .cart-page-wrapper {
          background: #f5f5f8;
        }

        .cart-page-premium {
          padding: 3rem 1.5rem 7rem;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(232, 25, 80, .045),
              transparent 30%
            ),
            #f5f5f8;
        }

        .cart-container {
          max-width: 1250px;
          margin: 0 auto;
        }

        /* =========================================================
           HEADER
        ========================================================= */

        .cart-header-block {
          margin-bottom: 2rem;
        }

        .cart-back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #777;
          text-decoration: none;
          font-size: .82rem;
          font-weight: 600;
          margin-bottom: 2rem;
          transition: color .2s ease;
        }

        .cart-back-link:hover {
          color: #e81950;
        }

        .cart-title-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
        }

        .cart-eyebrow {
          display: block;
          color: #e81950;
          font-size: .68rem;
          font-weight: 800;
          letter-spacing: .16em;
          margin-bottom: .7rem;
        }

        .cart-title-row h1 {
          margin: 0;
          color: #181827;
          font-size: clamp(2.5rem, 5vw, 4rem);
          line-height: .95;
          letter-spacing: -.045em;
          font-weight: 800;
        }

        .cart-title-row h1 span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          margin-left: 13px;
          padding: 0 8px;
          border-radius: 50px;
          background: #e81950;
          color: #fff;
          font-size: .78rem;
          vertical-align: middle;
          letter-spacing: 0;
        }

        .cart-title-row p {
          color: #888;
          margin: .9rem 0 0;
          font-size: .9rem;
        }

        .cart-clear-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 0;
          background: transparent;
          color: #999;
          cursor: pointer;
          font-size: .78rem;
          font-weight: 600;
          padding: 8px;
          transition: color .2s ease;
        }

        .cart-clear-button:hover {
          color: #e81950;
        }

        /* =========================================================
           PROGRESS
        ========================================================= */

        .cart-progress-block {
          display: flex;
          align-items: center;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          background: #fff;
          border: 1px solid #e9e9ed;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(20,20,40,.025);
        }

        .cart-progress-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #aaa;
          min-width: 180px;
        }

        .cart-progress-item.active {
          color: #1a1a2e;
        }

        .cart-progress-number {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f3;
          color: #999;
          font-size: .7rem;
          font-weight: 800;
        }

        .cart-progress-item.active .cart-progress-number {
          background: #e81950;
          color: #fff;
          box-shadow: 0 5px 15px rgba(241, 118, 151, 0.22);
        }

        .cart-progress-item strong,
        .cart-progress-item span {
          display: block;
        }

        .cart-progress-item strong {
          font-size: .76rem;
        }

        .cart-progress-item span {
          color: #aaa;
          font-size: .65rem;
          margin-top: 2px;
        }

        .cart-progress-line {
          flex: 1;
          height: 1px;
          background: #e5e5e9;
          margin: 0 1rem;
        }

        /* =========================================================
           WARNING
        ========================================================= */

        .cart-storage-warning {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          margin-bottom: 1.5rem;
          background: #fff8ee;
          border: 1px solid #f4dfbd;
          border-radius: 12px;
          color: #95601b;
          font-size: .78rem;
        }

        /* =========================================================
           MAIN GRID
        ========================================================= */

        .cart-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 370px;
          gap: 1.5rem;
          align-items: start;
        }

        /* =========================================================
           PRODUCTS BLOCK
        ========================================================= */

        .cart-products-block {
          background: #fff;
          border: 1px solid #e9e9ed;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(20,20,40,.035);
        }

        .cart-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.6rem 1.7rem;
          border-bottom: 1px solid #eeeeF1;
        }

        .cart-block-label {
          color: #e81950;
          font-size: .65rem;
          letter-spacing: .15em;
          font-weight: 800;
        }

        .cart-block-header h2 {
          margin: .4rem 0 0;
          color: #19192a;
          font-size: 1.35rem;
        }

        .cart-block-header h2 span {
          color: #aaa;
          font-size: .75rem;
          margin-left: 8px;
          font-weight: 500;
        }

        .cart-products-counter {
          color: #999;
          font-size: .72rem;
          padding: 7px 11px;
          background: #f7f7f9;
          border-radius: 50px;
        }

        /* =========================================================
           PRODUCT CARD
        ========================================================= */

        .cart-products-list {
          padding: 0 1.2rem;
        }

        .cart-product-card {
          position: relative;
          display: grid;
          grid-template-columns: 25px 130px minmax(0,1fr) auto;
          gap: 1.2rem;
          align-items: center;
          padding: 1.5rem .5rem;
          border-bottom: 1px solid #eeeeF2;
        }

        .cart-product-card:last-child {
          border-bottom: 0;
        }

        .cart-product-number {
          color: #ddd;
          font-size: .7rem;
          font-weight: 800;
          align-self: start;
          padding-top: 5px;
        }

        .cart-product-image {
          width: 130px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background:
            linear-gradient(
              145deg,
              #fafafd,
              #f2f2f6
            );
          border: 1px solid #ededf1;
          overflow: hidden;
        }

        .cart-product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 10px;
          transition: transform .35s ease;
        }

        .cart-product-image:hover img {
          transform: scale(1.07);
        }

        .cart-product-info {
          min-width: 0;
        }

        .cart-product-category {
          display: block;
          color: #e81950;
          font-size: .6rem;
          font-weight: 800;
          letter-spacing: .12em;
          margin-bottom: .55rem;
        }

        .cart-product-name {
          display: block;
          color: #2a2219;
          text-decoration: none;
          font-size: .98rem;
          line-height: 1.4;
          font-weight: 750;
          margin-bottom: .35rem;
        }

        .cart-product-name:hover {
          color: #e81950;
        }

        .cart-product-unit-price {
          display: block;
          color: #999;
          font-size: .74rem;
          margin-bottom: 1rem;
        }

        .cart-product-bottom {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .cart-quantity-control {
          display: flex;
          align-items: center;
          height: 34px;
          border: 1px solid #e4e4e8;
          border-radius: 8px;
          overflow: hidden;
        }

        .cart-quantity-control button {
          width: 32px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: #fafafa;
          color: #333;
          cursor: pointer;
        }

        .cart-quantity-control button:hover:not(:disabled) {
          background: #fff0f4;
          color: #e81950;
        }

        .cart-quantity-control button:disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        .cart-quantity-control span {
          width: 34px;
          text-align: center;
          color: #1a1a2e;
          font-size: .78rem;
          font-weight: 800;
        }

        .cart-product-remove {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: #aaa;
          cursor: pointer;
          font-size: .7rem;
          padding: 4px;
        }

        .cart-product-remove:hover {
          color: #e81950;
        }

        .cart-product-price {
          align-self: stretch;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          min-width: 105px;
        }

        .cart-product-price span {
          color: #aaa;
          font-size: .63rem;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .cart-product-price strong {
          color: #1a1a2e;
          font-size: 1rem;
          white-space: nowrap;
        }

        /* =========================================================
           BENEFITS
        ========================================================= */

        .cart-benefits-block {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin-top: 1rem;
          border: 1px solid #e9e9ed;
          border-radius: 16px;
          overflow: hidden;
          background: #e9e9ed;
        }

        .cart-benefit {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1.1rem;
          background: #fff;
        }

        .cart-benefit-icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #fff0f4;
          color: #e81950;
        }

        .cart-benefit strong,
        .cart-benefit span {
          display: block;
        }

        .cart-benefit strong {
          color: #333;
          font-size: .72rem;
        }

        .cart-benefit span {
          color: #999;
          font-size: .63rem;
          line-height: 1.4;
          margin-top: 3px;
        }

        /* =========================================================
           SUMMARY
        ========================================================= */

        .cart-summary-column {
          position: sticky;
          top: 20px;
        }

        .cart-summary-block {
          position: relative;
          overflow: hidden;
          padding: 1.8rem;
          border-radius: 22px;
          background:
            linear-gradient(
              145deg,
              #e81950 0%,
              #7e0827 100%
            );
          color: #fff;
          box-shadow: 0 20px 50px rgba(20,20,40,.14);
        }

        .cart-summary-block::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -100px;
          top: -100px;
          border-radius: 50%;
          background: #e81950;
          opacity: .15;
          filter: blur(50px);
        }

        .cart-summary-top {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fdf9fa;
          font-size: .65rem;
          letter-spacing: .14em;
          font-weight: 800;
        }

        .cart-summary-block h2 {
          position: relative;
          margin: 1.4rem 0 2rem;
          font-size: 1.65rem;
          line-height: 1.15;
          letter-spacing: -.02em;
        }

        .cart-summary-block h2 strong {
          color: #fff;
        }

        .cart-summary-items {
          position: relative;
          padding: 1.2rem 0;
          border-top: 1px solid rgba(255,255,255,.1);
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .cart-summary-items > div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: .9rem;
          color: #f7f7fa;
          font-size: .78rem;
        }

        .cart-summary-items > div:last-child {
          margin-bottom: 0;
        }

        .cart-summary-items strong {
          color: #eee;
          font-weight: 700;
        }

        .cart-summary-items .pending {
          color: #f3f1f1;
          font-size: .72rem;
        }

        .cart-summary-total {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 1.5rem 0;
        }

        .cart-summary-total span {
          color: #f6f6fa;
          font-size: .75rem;
        }

        .cart-summary-total strong {
          color: #fff;
          font-size: 1.7rem;
          font-weight: 800;
        }

        .cart-summary-message {
          position: relative;
          display: flex;
          gap: 9px;
          padding: 11px;
          margin-bottom: 1.2rem;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 9px;
        }

        .cart-summary-dot {
          width: 6px;
          height: 6px;
          margin-top: 6px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #e81950;
          box-shadow: 0 0 10px #e81950;
        }

        .cart-summary-message p {
          margin: 0;
          color: #f9f9fd;
          font-size: .65rem;
          line-height: 1.55;
        }

        .cart-checkout-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
          padding: 14px;
          border-radius: 10px;
          background: linear-gradient(135deg, #e81950, #c41340);
          color: #fff;
          text-decoration: none;
          font-size: .8rem;
          font-weight: 800;
          box-shadow: 0 10px 25px rgba(232,25,80,.25);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .cart-checkout-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(232,25,80,.32);
        }

        .cart-continue-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #fbfbfd;
          text-decoration: none;
          font-size: .68rem;
          margin-top: 1rem;
        }

        .cart-continue-link:hover {
          color: #fff;
        }

        /* =========================================================
           PROMO
        ========================================================= */

        .cart-promo-block {
          position: relative;
          overflow: hidden;
          margin-top: 1rem;
          padding: 1.5rem;
          border-radius: 18px;
          background: #fff;
          border: 1px solid #e9e9ed;
        }

        .cart-promo-glow {
          position: absolute;
          width: 130px;
          height: 130px;
          right: -50px;
          top: -50px;
          border-radius: 50%;
          background: #e81950;
          opacity: .08;
          filter: blur(25px);
        }

        .cart-promo-block > span {
          position: relative;
          color: #e81950;
          font-size: .62rem;
          letter-spacing: .14em;
          font-weight: 800;
        }

        .cart-promo-block h3 {
          position: relative;
          margin: .7rem 0;
          color: #1a1a2e;
          font-size: 1.5rem;
          line-height: 1.05;
        }

        .cart-promo-block p {
          position: relative;
          color: #888;
          font-size: .7rem;
          line-height: 1.6;
          margin-bottom: 1.2rem;
        }

        .cart-promo-block a {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #e81950;
          text-decoration: none;
          font-size: .72rem;
          font-weight: 800;
        }

        /* =========================================================
           TRUST
        ========================================================= */

        .cart-trust-block {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          margin-top: 1.5rem;
          padding: 2rem;
          background: #fff;
          border: 1px solid #e9e9ed;
          border-radius: 18px;
        }

        .cart-trust-title {
          display: flex;
          gap: 15px;
        }

        .cart-trust-title > span {
          color: #e81950;
          font-size: .65rem;
          font-weight: 800;
        }

        .cart-trust-title div span,
        .cart-trust-title div strong {
          display: block;
        }

        .cart-trust-title div span {
          color: #aaa;
          font-size: .6rem;
          letter-spacing: .1em;
          font-weight: 800;
        }

        .cart-trust-title div strong {
          color: #1a1a2e;
          font-size: 1rem;
          margin-top: 5px;
        }

        .cart-trust-items {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .cart-trust-items strong,
        .cart-trust-items span {
          display: block;
        }

        .cart-trust-items strong {
          color: #333;
          font-size: .78rem;
          margin-bottom: 5px;
        }

        .cart-trust-items span {
          color: #999;
          font-size: .68rem;
          line-height: 1.55;
        }

        /* =========================================================
           EMPTY
        ========================================================= */

        .cart-empty-block {
          position: relative;
          overflow: hidden;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          border-radius: 24px;
          background: #fff;
          border: 1px solid #e9e9ed;
          box-shadow: 0 15px 50px rgba(20,20,40,.04);
        }

        .cart-empty-decoration {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .cart-empty-decoration-one {
          width: 350px;
          height: 350px;
          top: -220px;
          right: -100px;
          background: #e81950;
          opacity: .04;
        }

        .cart-empty-decoration-two {
          width: 250px;
          height: 250px;
          bottom: -170px;
          left: -80px;
          background: #1a1a2e;
          opacity: .035;
        }

        .cart-empty-icon {
          position: relative;
          width: 105px;
          height: 105px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff0f4;
          color: #e81950;
          margin-bottom: 1.7rem;
          box-shadow: 0 15px 35px rgba(232,25,80,.1);
        }

        .cart-empty-block h2 {
          position: relative;
          color: #1a1a2e;
          font-size: clamp(2rem, 5vw, 3rem);
          line-height: 1;
          margin: .3rem 0 1rem;
        }

        .cart-empty-block h2 strong {
          color: #e81950;
        }

        .cart-empty-block p {
          position: relative;
          max-width: 500px;
          color: #888;
          font-size: .88rem;
          line-height: 1.8;
          margin-bottom: 2rem;
        }

        .cart-main-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 23px;
          border-radius: 10px;
          background: #e81950;
          color: #fff;
          text-decoration: none;
          font-size: .8rem;
          font-weight: 800;
          box-shadow: 0 10px 25px rgba(232,25,80,.22);
        }

        /* =========================================================
           RESPONSIVE
        ========================================================= */

        @media (max-width: 1050px) {
          .cart-main-grid {
            grid-template-columns: minmax(0, 1fr) 320px;
          }

          .cart-product-card {
            grid-template-columns: 20px 105px minmax(0,1fr);
          }

          .cart-product-image {
            width: 105px;
            height: 105px;
          }

          .cart-product-price {
            grid-column: 3;
            grid-row: 1;
            align-self: start;
          }
        }

        @media (max-width: 850px) {
          .cart-main-grid {
            grid-template-columns: 1fr;
          }

          .cart-summary-column {
            position: static;
          }

          .cart-progress-item {
            min-width: 0;
          }

          .cart-progress-item span {
            display: none;
          }

          .cart-trust-block {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 650px) {
          .cart-page-premium {
            padding: 2rem 1rem 5rem;
          }

          .cart-title-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .cart-progress-block {
            overflow-x: auto;
            padding: 1rem;
          }

          .cart-progress-line {
            min-width: 30px;
          }

          .cart-product-card {
            grid-template-columns: 75px minmax(0,1fr);
            gap: .9rem;
          }

          .cart-product-number {
            display: none;
          }

          .cart-product-image {
            width: 75px;
            height: 75px;
            grid-row: 1 / span 2;
          }

          .cart-product-info {
            grid-column: 2;
          }

          .cart-product-price {
            grid-column: 2;
            grid-row: auto;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .cart-product-bottom {
            flex-wrap: wrap;
          }

          .cart-benefits-block {
            grid-template-columns: 1fr;
          }

          .cart-trust-items {
            grid-template-columns: 1fr;
            gap: 1.2rem;
          }
        }

        @media (max-width: 450px) {
          .cart-block-header {
            padding: 1.2rem;
          }

          .cart-products-list {
            padding: 0 .7rem;
          }

          .cart-product-card {
            padding: 1.2rem .3rem;
          }

          .cart-product-name {
            font-size: .85rem;
          }

          .cart-summary-block {
            padding: 1.4rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }

      `}</style>
    </div>
  );
}
