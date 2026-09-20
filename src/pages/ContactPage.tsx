import { useState } from "react";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatedButton } from "../components/ui/AnimatedButton";

export function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);
    
    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setFormStatus("success");
        form.reset();
        setTimeout(() => setFormStatus("idle"), 8000);
      } else {
        setFormStatus("error");
        setTimeout(() => setFormStatus("idle"), 5000);
      }
    } catch (error) {
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  const faqs = [
    {
      q: "¿Cuáles son los gastos de envío para los pedidos de la tienda online?",
      a: "Ofrecemos envíos económicos a todo Perú, variando nuestros precios según la ubicación. Contamos con diferentes opciones para asegurar una entrega rápida y segura de tus pedidos desde la tienda online."
    },
    {
      q: "¿Qué métodos de pago se aceptan en la tienda online?",
      a: "En nuestra tienda online aceptamos los siguientes métodos de pago:\n\n- Yape\n- Tarjeta de débito\n- Tarjeta de crédito\n- Transferencia bancaria\n\nLos pagos con tarjeta y Yape se procesan de manera segura a través de las pasarelas de pago habilitadas en nuestro sistema. Para transferencias bancarias, te proporcionaremos los detalles de la cuenta una vez realizado el pedido."
    },
    {
      q: "¿Cuánto tiempo tarda la entrega?",
      a: "Procesamos los pedidos de inmediato, por lo general el tiempo de entrega es el siguiente:\n\n- Lima Metropolitana y Callao: 1 – 3 días hábiles\n- Resto de departamentos de Perú: 3 – 5 días hábiles\n\nEl tiempo puede variar según la ubicación, fecha del pedido y disponibilidad del método de envío. Te mantendremos informado sobre el estado de tu pedido a través de correos electrónicos de seguimiento."
    },
    {
      q: "¿Qué tan segura es la compra en la tienda online? ¿Mi información está protegida?",
      a: "Contamos con los más altos estándares de encriptación y seguridad para proteger tus datos e información financiera. Tu privacidad está garantizada durante la navegación y procesamiento de pagos en nuestra tienda online."
    },
    {
      q: "¿Qué sucede exactamente después de realizar el pedido?",
      a: "**Confirmación del pedido:** Recibes un correo electrónico con los detalles de la compra.\n**Procesamiento del pedido:** Preparamos los productos para el envío.\n**Envío:** Entregamos el pedido a nuestro partner logístico.\n**Seguimiento:** Recibes actualizaciones por correo electrónico.\n**Entrega:** Una vez recibido por el cliente, la transacción finaliza.\n**Soporte:** Estamos disponibles para resolver cualquier duda."
    },
    {
      q: "¿Recibiré una factura por mi pedido?",
      a: "Sí, recibirá una factura por su pedido. Una vez procesado, le llegará un correo electrónico con los detalles de la factura como número, monto total y método de pago utilizado. Nuestro objetivo es brindar una excelente experiencia al cliente. No dude en contactarnos si tiene alguna otra pregunta."
    }
  ];

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ background: "#fff", paddingBottom: "4rem" }}>
        {/* Mapa */}
        <section style={{ width: "100%", height: "450px" }}>
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
            <h2 className="product-title" style={{ fontSize: "1.2rem", marginBottom: "1.5rem", letterSpacing: "1px", textTransform: "uppercase" }}>Preguntas frecuentes</h2>
            
            <div style={{ border: "1px solid #eaeaea", padding: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", marginBottom: "1rem" }}>
                <strong style={{ width: "120px", fontSize: "0.85rem", color: "#555" }}>UBICACIÓN:</strong>
                <span style={{ fontSize: "0.9rem", color: "#333", flex: 1 }}>AV GARCILAZO DE LA VEGA 1345 C.C. CYBERPLAZA TDA 1B-139, Lima, Peru</span>
              </div>
              <div style={{ display: "flex", marginBottom: "1rem" }}>
                <strong style={{ width: "120px", fontSize: "0.85rem", color: "#555" }}>COMUNÍCATE:</strong>
                <span style={{ fontSize: "0.9rem", color: "#333", flex: 1 }}>
                  Teléfono: <a href="tel:986638034" style={{ color: "#364563", textDecoration: "none", fontWeight: "500" }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>986 638 034</a><br/>
                  Whatsapp: <a href="https://wa.me/51986638034" target="_blank" rel="noopener noreferrer" style={{ color: "#364563", textDecoration: "none", fontWeight: "500" }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>+51 986 638 034</a>
                </span>
              </div>
              <div style={{ display: "flex" }}>
                <strong style={{ width: "120px", fontSize: "0.85rem", color: "#555" }}>ESCRÍBENOS:</strong>
                <span style={{ fontSize: "0.9rem", color: "#333", flex: 1 }}>
                  <a href="mailto:eaglegamingperu@gmail.com" style={{ color: "#364563", textDecoration: "none", fontWeight: "500" }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}>eaglegamingperu@gmail.com</a>
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
                      padding: 0
                    }}
                  >
                    <span style={{ paddingRight: "1rem" }}>{faq.q}</span>
                    {openFaq === index ? <ChevronUp size={18} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} style={{ flexShrink: 0 }} />}
                  </button>
                  {openFaq === index && (
                    <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555", lineHeight: "1.6" }}>
                      {faq.a.split('\n').map((line, i) => (
                        <p key={i} style={{ marginBottom: "0.5rem" }}>
                          {line.startsWith('**') 
                            ? <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            : line
                          }
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="contact-col">
            <h2 className="product-title" style={{ fontSize: "1.2rem", marginBottom: "1.5rem", letterSpacing: "1px", textTransform: "uppercase" }}>Envíanos un correo electrónico.</h2>
            
            {/* Usa Formspree para recibir los correos fácilmente */}
            <form action="https://formspree.io/f/moeqgkde" method="POST" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>Tu nombre</label>
                <input type="text" name="name" required style={{ width: "100%", padding: "0.8rem", border: "1px solid #ddd", fontSize: "0.95rem", outline: "none", borderRadius: "4px" }} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>Tu correo electrónico</label>
                <input type="email" name="email" required style={{ width: "100%", padding: "0.8rem", border: "1px solid #ddd", fontSize: "0.95rem", outline: "none", borderRadius: "4px" }} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>Asunto</label>
                <input type="text" name="subject" required style={{ width: "100%", padding: "0.8rem", border: "1px solid #ddd", fontSize: "0.95rem", outline: "none", borderRadius: "4px" }} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>Tu mensaje (opcional)</label>
                <textarea name="message" rows={6} style={{ width: "100%", padding: "0.8rem", border: "1px solid #ddd", fontSize: "0.95rem", outline: "none", resize: "vertical", borderRadius: "4px" }}></textarea>
              </div>

              <AnimatedButton type="submit" disabled={formStatus === "submitting"} className={formStatus === "submitting" ? "opacity-50 cursor-not-allowed" : ""}>
                {formStatus === "submitting" ? "ENVIANDO..." : "ENVIAR"}
              </AnimatedButton>

              {formStatus === "success" && (
                <div style={{ background: "#dcfce7", color: "#166534", padding: "1rem", borderRadius: "4px", border: "1px solid #bbf7d0", fontSize: "0.95rem" }}>
                  <strong>¡Mensaje enviado con éxito!</strong><br/>
                  Gracias por comunicarte con Eagle Gaming. Hemos recibido tu mensaje y te responderemos lo más pronto posible a tu correo.
                </div>
              )}
              
              {formStatus === "error" && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "1rem", borderRadius: "4px", border: "1px solid #fecaca", fontSize: "0.95rem" }}>
                  Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde o contáctanos por WhatsApp.
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
