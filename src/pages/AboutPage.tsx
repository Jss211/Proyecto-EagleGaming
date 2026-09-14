import { useState, useRef } from "react";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { Zap, Target, Heart } from "lucide-react";
import { AnimatedButton } from "../components/ui/AnimatedButton";

export function AboutPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const misionRef = useRef<HTMLDivElement>(null);
  const valoresRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const ref = cardId === "vision" ? visionRef : cardId === "mision" ? misionRef : valoresRef;
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    ref.current.style.setProperty("--rotation", `${angle}deg`);
  };

  const handleMouseLeave = (cardId: string) => {
    const ref = cardId === "vision" ? visionRef : cardId === "mision" ? misionRef : valoresRef;
    if (!ref.current) return;
    ref.current.style.setProperty("--rotation", "0deg");
  };

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ background: "#fff" }}>
        {/* Hero Section */}
        <section 
          className="about-hero"
          style={{
            background: "linear-gradient(135deg, #e81950 0%, #c41340 100%)",
            color: "#fff",
            padding: "6rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Fondo decorativo */}
          <div 
            style={{
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              filter: "blur(80px)",
              zIndex: 0
            }}
          />
          
          <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto" }}>
            <h1 className="product-title" style={{ fontSize: "3.5rem", marginBottom: "1.5rem", fontWeight: "700" }}>
              Nosotros
            </h1>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "#e0e0e0" }}>
              Eagle Gaming Perú es una empresa dedicada a la venta de productos de tecnología y gaming. 
              Importamos las mejores marcas del mercado para ofrecer a nuestros clientes lo último en hardware.
            </p>
          </div>
        </section>

        {/* Descripción General */}
        <section style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ 
            background: "#f8f9fa", 
            padding: "3rem", 
            borderRadius: "12px",
            borderLeft: "4px solid #e81950"
          }}>
            <h2 className="product-title" style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "#1a1a2e" }}>
              ¿Quiénes Somos?
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#555" }}>
              Eagle Gaming Perú se destaca por nuestra variedad de productos, precios competitivos y un fuerte 
              compromiso con la calidad y el servicio al cliente. Nos esforzamos por ofrecer la mejor experiencia 
              de compra, garantizando productos auténticos y un servicio excepcional en cada transacción.
            </p>
          </div>
        </section>

        {/* Atención al Cliente */}
        <section style={{ 
          padding: "4rem 2rem", 
          maxWidth: "1200px", 
          margin: "0 auto",
          textAlign: "center"
        }}>
          <h2 className="product-title" style={{ fontSize: "2rem", marginBottom: "2rem", color: "#1a1a2e" }}>
            Atención al Cliente y Buen Servicio
          </h2>
          <div style={{
            background: "linear-gradient(135deg, #f0f4ff 0%, #fff5f7 100%)",
            padding: "2.5rem",
            borderRadius: "12px",
            border: "1px solid #e81950"
          }}>
            <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#333" }}>
              En Eagle Gaming Perú nos enorgullecemos de brindar una atención al cliente excepcional. 
              Nuestro equipo está dedicado a asegurar que cada compra sea una experiencia satisfactoria, 
              respaldada por un servicio atento y profesional. Nos esforzamos por resolver cualquier duda 
              o problema de manera rápida y eficiente, garantizando así la máxima satisfacción de nuestros clientes.
            </p>
          </div>
        </section>

        {/* Visión, Misión, Valores */}
        <section style={{ 
          padding: "4rem 2rem", 
          maxWidth: "1200px", 
          margin: "0 auto"
        }}>
          <h2 className="product-title" style={{ fontSize: "2.2rem", marginBottom: "3rem", textAlign: "center", color: "#1a1a2e" }}>
            Nuestra Pasión es su Satisfacción
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            {/* Visión */}
            <div 
              ref={visionRef}
              onMouseMove={(e) => handleMouseMove(e, "vision")}
              onMouseEnter={() => setHoveredCard("vision")}
              onMouseLeave={() => {
                setHoveredCard(null);
                handleMouseLeave("vision");
              }}
              style={{
                position: "relative",
                padding: "3px",
                borderRadius: "12px",
                overflow: "hidden",
                boxSizing: "border-box",
                boxShadow: hoveredCard === "vision" ? "0 20px 25px -5px rgba(232, 25, 80, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transform: hoveredCard === "vision" ? "translateY(-8px)" : "translateY(0)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column"
              } as React.CSSProperties}
            >
              {/* Fondo del borde */}
              <div style={{ position: "absolute", inset: 0, background: "#eaeaea", zIndex: 0 }} />
              
              {/* Borde giratorio */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "800px",
                  height: "800px",
                  backgroundImage: `conic-gradient(from 0deg at 50% 50%, #e81950 0deg, #e81950 45deg, transparent 45deg, transparent 360deg)`,
                  transform: "translate(-50%, -50%) rotate(var(--rotation, 0deg))",
                  transformOrigin: "center",
                  zIndex: 1,
                  pointerEvents: "none",
                  opacity: hoveredCard === "vision" ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  filter: "drop-shadow(0 0 8px rgba(232, 25, 80, 0.6))"
                }}
              />

              {/* Contenido */}
              <div 
                style={{
                  background: "#fff",
                  borderRadius: "9px",
                  padding: "2rem",
                  textAlign: "center",
                  zIndex: 2,
                  position: "relative",
                  flexGrow: 1
                }}
              >
                <Target size={40} style={{ color: "#e81950", marginBottom: "1rem", margin: "0 auto 1rem" }} />
                <h3 className="product-title" style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1a1a2e" }}>
                  Visión
                </h3>
                <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#555" }}>
                  Ser la tienda líder en Perú en la venta de productos de gaming y tecnología, reconocida 
                  por la calidad de nuestros productos y la excelencia en nuestro servicio al cliente. 
                  Aspiramos a ser el primer destino para los entusiastas del gaming.
                </p>
              </div>
            </div>

            {/* Misión */}
            <div 
              ref={misionRef}
              onMouseMove={(e) => handleMouseMove(e, "mision")}
              onMouseEnter={() => setHoveredCard("mision")}
              onMouseLeave={() => {
                setHoveredCard(null);
                handleMouseLeave("mision");
              }}
              style={{
                position: "relative",
                padding: "3px",
                borderRadius: "12px",
                overflow: "hidden",
                boxSizing: "border-box",
                boxShadow: hoveredCard === "mision" ? "0 20px 25px -5px rgba(232, 25, 80, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transform: hoveredCard === "mision" ? "translateY(-8px)" : "translateY(0)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column"
              } as React.CSSProperties}
            >
              {/* Fondo del borde */}
              <div style={{ position: "absolute", inset: 0, background: "#eaeaea", zIndex: 0 }} />
              
              {/* Borde giratorio */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "800px",
                  height: "800px",
                  backgroundImage: `conic-gradient(from 0deg at 50% 50%, #e81950 0deg, #e81950 45deg, transparent 45deg, transparent 360deg)`,
                  transform: "translate(-50%, -50%) rotate(var(--rotation, 0deg))",
                  transformOrigin: "center",
                  zIndex: 1,
                  pointerEvents: "none",
                  opacity: hoveredCard === "mision" ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  filter: "drop-shadow(0 0 8px rgba(232, 25, 80, 0.6))"
                }}
              />

              {/* Contenido */}
              <div 
                style={{
                  background: "#fff",
                  borderRadius: "9px",
                  padding: "2rem",
                  textAlign: "center",
                  zIndex: 2,
                  position: "relative",
                  flexGrow: 1
                }}
              >
                <Zap size={40} style={{ color: "#e81950", marginBottom: "1rem", margin: "0 auto 1rem" }} />
                <h3 className="product-title" style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1a1a2e" }}>
                  Misión
                </h3>
                <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#555" }}>
                  Ofrecer productos de tecnología y gaming de alta calidad a precios competitivos, 
                  con el objetivo de satisfacer las necesidades y expectativas de nuestros clientes en Perú. 
                  Nos comprometemos a proporcionar una experiencia de compra excepcional, basada en la 
                  confianza e innovación.
                </p>
              </div>
            </div>

            {/* Valores */}
            <div 
              ref={valoresRef}
              onMouseMove={(e) => handleMouseMove(e, "valores")}
              onMouseEnter={() => setHoveredCard("valores")}
              onMouseLeave={() => {
                setHoveredCard(null);
                handleMouseLeave("valores");
              }}
              style={{
                position: "relative",
                padding: "3px",
                borderRadius: "12px",
                overflow: "hidden",
                boxSizing: "border-box",
                boxShadow: hoveredCard === "valores" ? "0 20px 25px -5px rgba(232, 25, 80, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transform: hoveredCard === "valores" ? "translateY(-8px)" : "translateY(0)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column"
              } as React.CSSProperties}
            >
              {/* Fondo del borde */}
              <div style={{ position: "absolute", inset: 0, background: "#eaeaea", zIndex: 0 }} />
              
              {/* Borde giratorio */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "800px",
                  height: "800px",
                  backgroundImage: `conic-gradient(from 0deg at 50% 50%, #e81950 0deg, #e81950 45deg, transparent 45deg, transparent 360deg)`,
                  transform: "translate(-50%, -50%) rotate(var(--rotation, 0deg))",
                  transformOrigin: "center",
                  zIndex: 1,
                  pointerEvents: "none",
                  opacity: hoveredCard === "valores" ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  filter: "drop-shadow(0 0 8px rgba(232, 25, 80, 0.6))"
                }}
              />

              {/* Contenido */}
              <div 
                style={{
                  background: "#fff",
                  borderRadius: "9px",
                  padding: "2rem",
                  textAlign: "center",
                  zIndex: 2,
                  position: "relative",
                  flexGrow: 1
                }}
              >
                <Heart size={40} style={{ color: "#e81950", marginBottom: "1rem", margin: "0 auto 1rem" }} />
                <h3 className="product-title" style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1a1a2e" }}>
                  Valores
                </h3>
                <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#555" }}>
                  Nuestro compromiso es con la calidad y la satisfacción del cliente. Valoramos la innovación, 
                  la integridad y la pasión por el gaming. Nos esforzamos por ofrecer atención personalizada 
                  y construir relaciones duraderas con nuestros clientes, basadas en la confianza y el respeto mutuo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          background: "#1a1a2e",
          color: "#fff",
          padding: "4rem 2rem",
          textAlign: "center",
          marginTop: "4rem"
        }}>
          <h2 className="product-title" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#fff" }}>
            ¿Tienes Preguntas?
          </h2>
          <p style={{ fontSize: "1.1rem", marginBottom: "2.5rem", color: "#e0e0e0" }}>
            Contáctanos y nuestro equipo estará encantado de ayudarte
          </p>
          <AnimatedButton as="a" href="/contactenos">
            Contactar Ahora
          </AnimatedButton>
        </section>
      </main>

      <Footer />
    </div>
  );
}
