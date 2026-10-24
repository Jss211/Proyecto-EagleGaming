import { useState } from "react";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { AnimatedButton } from "../components/ui/AnimatedButton";
import { contactFormSchema, type ContactFormValues } from "../utils/validation";

/**
 * Renderiza de forma segura fragmentos en negrita sin usar dangerouslySetInnerHTML.
 */
function parseBoldLine(line: string): React.ReactNode {
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
    </>
  );
}

export function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ContactFormValues>({
    name: "",
    email: "",
    subject: "",
    message: "",
    website_hp: "",
  });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // 1. Validación estricta con Zod
    const validationResult = contactFormSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    // 2. Comprobar honeypot anti-spam
    if (formData.website_hp && formData.website_hp.trim().length > 0) {
      // Simular éxito silencioso ante bots
      setFormStatus("success");
      return;
    }

    setFormStatus("submitting");
    try {
      const response = await fetch("https://formspree.io/f/moeqgkde", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setFormStatus("success");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          website_hp: "",
        });
        setTimeout(() => setFormStatus("idle"), 8000);
      } else {
        setFormStatus("error");
        setTimeout(() => setFormStatus("idle"), 5000);
      }
    } catch {
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  const faqs = [
    {
      q: "¿Cuáles son los gastos de envío para los pedidos de la tienda online?",
      a: "Ofrecemos envíos económicos a todo Perú, variando nuestros precios según la ubicación. Contamos con diferentes opciones para asegurar una entrega rápida y segura de tus pedidos desde la tienda online.",
    },
    {
      q: "¿Qué métodos de pago se aceptan en la tienda online?",
      a: "En nuestra tienda online aceptamos los siguientes métodos de pago:\n\n- Yape\n- Tarjeta de débito\n- Tarjeta de crédito\n- Transferencia bancaria\n\nCoordinamos el pago de manera directa y segura al momento de finalizar tu pedido vía WhatsApp.",
    },
    {
      q: "¿Cuánto tiempo tarda la entrega?",
      a: "Procesamos los pedidos de inmediato, por lo general el tiempo de entrega es el siguiente:\n\n- Lima Metropolitana y Callao: 1 – 3 días hábiles\n- Resto de departamentos de Perú: 3 – 5 días hábiles\n\nEl tiempo puede variar según la ubicación y disponibilidad.",
    },
    {
      q: "¿Qué tan segura es la compra en la tienda online? ¿Mi información está protegida?",
      a: "Contamos con los más altos estándares de seguridad para proteger tus datos. Tu privacidad y pedido están garantizados en todo momento.",
    },
    {
      q: "¿Qué sucede exactamente después de realizar el pedido por WhatsApp?",
      a: "**Confirmación del pedido:** Te confirmamos stock y datos de entrega.\n**Pago coordinado:** Realizas el abono seguro por tu método preferido.\n**Preparación:** Empaquetamos tus componentes con máxima protección.\n**Envío y guía:** Te enviamos tu comprobante y código de seguimiento en tiempo real.",
    },
    {
      q: "¿Recibiré boleta o factura por mi pedido?",
      a: "Sí, emitimos boleta o factura con garantía para todos nuestros productos y componentes.",
    },
  ];

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "51986638034";

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ background: "#fff", paddingBottom: "4rem" }}>
        {/* Mapa */}
        <section style={{ width: "100%", height: "420px" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.761763784013!2d-77.03923052409055!3d-12.05988588817743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8c6f2a632bd%3A0xc6cfbe3d65b16956!2sAv.%20Garcilaso%20de%20la%20Vega%201348%2C%20Lima%2015001!5e0!3m2!1ses!2spe!4v1714151234567!5m2!1ses!2spe"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Eagle Gaming"
          ></iframe>
        </section>

        <section className="contact-section">
          {/* Columna Izquierda: Info y FAQs */}
          <div className="contact-col">
            <h2
              className="product-title"
              style={{
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Preguntas frecuentes
            </h2>

            <div style={{ border: "1px solid #eaeaea", padding: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", marginBottom: "1rem" }}>
                <strong style={{ width: "120px", fontSize: "0.85rem", color: "#555" }}>
                  UBICACIÓN:
                </strong>
                <span style={{ fontSize: "0.9rem", color: "#333", flex: 1 }}>
                  AV GARCILASO DE LA VEGA 1345 C.C. CYBERPLAZA TDA 1B-139, Lima, Perú
                </span>
              </div>
              <div style={{ display: "flex", marginBottom: "1rem" }}>
                <strong style={{ width: "120px", fontSize: "0.85rem", color: "#555" }}>
                  COMUNÍCATE:
                </strong>
                <span style={{ fontSize: "0.9rem", color: "#333", flex: 1 }}>
                  Teléfono:{" "}
                  <a
                    href="tel:986638034"
                    style={{ color: "#364563", textDecoration: "none", fontWeight: "500" }}
                  >
                    986 638 034
                  </a>
                  <br />
                  WhatsApp:{" "}
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#364563", textDecoration: "none", fontWeight: "500" }}
                  >
                    +51 986 638 034
                  </a>
                </span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: "120px", fontSize: "0.85rem", color: "#555" }}>
                  ESCRÍBENOS:
                </strong>
                <span style={{ fontSize: "0.9rem", color: "#333", flex: 1 }}>
                  <a
                    href="mailto:eaglegamingperu@gmail.com"
                    style={{ color: "#364563", textDecoration: "none", fontWeight: "500" }}
                  >
                    eaglegamingperu@gmail.com
                  </a>
                </span>
              </div>
            </div>

            <p style={{ fontSize: "0.95rem", color: "#555", marginBottom: "1.5rem" }}>
              Por favor, lee nuestras preguntas frecuentes antes de enviarnos un mensaje.
            </p>

            <div className="faq-accordion">
              {faqs.map((faq, index) => (
                <div key={index} style={{ borderBottom: "1px solid #eaeaea", padding: "1rem 0" }}>
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      color: openFaq === index ? "#e81950" : "#555",
                      fontWeight: openFaq === index ? "600" : "400",
                      padding: 0,
                    }}
                  >
                    <span style={{ paddingRight: "1rem" }}>{faq.q}</span>
                    {openFaq === index ? (
                      <ChevronUp size={18} style={{ flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={18} style={{ flexShrink: 0 }} />
                    )}
                  </button>
                  {openFaq === index && (
                    <div
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.9rem",
                        color: "#555",
                        lineHeight: "1.6",
                      }}
                    >
                      {faq.a.split("\n").map((line, i) => (
                        <p key={i} style={{ marginBottom: "0.5rem" }}>
                          {line.startsWith("**") ? parseBoldLine(line) : line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Formulario Sanitizado */}
          <div className="contact-col">
            <h2
              className="product-title"
              style={{
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Envíanos un mensaje
            </h2>

            <form
              onSubmit={handleSubmit}
              noValidate
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              {/* Campo Honeypot Oculto para bots */}
              <div style={{ display: "none" }} aria-hidden="true">
                <input
                  type="text"
                  name="website_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website_hp}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>
                  Tu nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: errors.name ? "1px solid #ef4444" : "1px solid #ddd",
                    fontSize: "0.95rem",
                    outline: "none",
                    borderRadius: "4px",
                  }}
                />
                {errors.name && (
                  <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle size={14} /> {errors.name}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>
                  Tu correo electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={150}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: errors.email ? "1px solid #ef4444" : "1px solid #ddd",
                    fontSize: "0.95rem",
                    outline: "none",
                    borderRadius: "4px",
                  }}
                />
                {errors.email && (
                  <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle size={14} /> {errors.email}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>
                  Asunto *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  maxLength={150}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: errors.subject ? "1px solid #ef4444" : "1px solid #ddd",
                    fontSize: "0.95rem",
                    outline: "none",
                    borderRadius: "4px",
                  }}
                />
                {errors.subject && (
                  <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle size={14} /> {errors.subject}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>
                  Tu mensaje (opcional)
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={2000}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: errors.message ? "1px solid #ef4444" : "1px solid #ddd",
                    fontSize: "0.95rem",
                    outline: "none",
                    resize: "vertical",
                    borderRadius: "4px",
                  }}
                ></textarea>
                {errors.message && (
                  <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle size={14} /> {errors.message}
                  </span>
                )}
              </div>

              <AnimatedButton
                type="submit"
                disabled={formStatus === "submitting"}
                className={formStatus === "submitting" ? "opacity-50 cursor-not-allowed" : ""}
              >
                {formStatus === "submitting" ? "ENVIANDO..." : "ENVIAR MENSAJE"}
              </AnimatedButton>

              {formStatus === "success" && (
                <div
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "1rem",
                    borderRadius: "4px",
                    border: "1px solid #bbf7d0",
                    fontSize: "0.95rem",
                  }}
                >
                  <strong>¡Mensaje enviado con éxito!</strong>
                  <br />
                  Gracias por comunicarte con Eagle Gaming. Te responderemos a la brevedad.
                </div>
              )}

              {formStatus === "error" && (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    padding: "1rem",
                    borderRadius: "4px",
                    border: "1px solid #fecaca",
                    fontSize: "0.95rem",
                  }}
                >
                  Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo o contáctanos directamente por WhatsApp.
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
