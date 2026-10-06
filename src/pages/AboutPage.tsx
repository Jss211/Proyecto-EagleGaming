import React, { useState, useRef, useEffect } from "react";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { 
  Zap, 
  Target, 
  Heart, 
  ShieldCheck, 
  Trophy, 
  Users, 
  Truck, 
  ChevronRight, 
  Sparkles,
  Headphones,
  Award
} from "lucide-react";
import { AnimatedButton } from "../components/ui/AnimatedButton";



interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function AboutPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Refs para el efecto de luz/rotación en las tarjetas
  const visionRef = useRef<HTMLDivElement>(null);
  const misionRef = useRef<HTMLDivElement>(null);
  const valoresRef = useRef<HTMLDivElement>(null);

  // Estado para contadores animados
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    clients: 0,
    products: 0,
    deliveries: 0,
    experience: 0,
  });

  // Animación del contador al cargar la vista
  useEffect(() => {
    const targets = {
      clients: 15000,
      products: 2500,
      deliveries: 99,
      experience: 6,
    };

    const duration = 2000; // 2 segundos
    const steps = 50;
    const intervalTime = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounts({
        clients: Math.min(Math.round((targets.clients / steps) * step), targets.clients),
        products: Math.min(Math.round((targets.products / steps) * step), targets.products),
        deliveries: Math.min(Math.round((targets.deliveries / steps) * step), targets.deliveries),
        experience: Math.min(Math.round((targets.experience / steps) * step), targets.experience),
      });

      if (step >= steps) clearInterval(timer);
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Cálculo de rotación dinámica por posición del cursor
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const ref = cardId === "vision" ? visionRef : cardId === "mision" ? misionRef : valoresRef;
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    
    ref.current.style.setProperty("--rotation", `${angle}deg`);
    ref.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = (cardId: string) => {
    const ref = cardId === "vision" ? visionRef : cardId === "mision" ? misionRef : valoresRef;
    if (!ref.current) return;
    ref.current.style.setProperty("--rotation", "0deg");
    setHoveredCard(null);
  };

  // Características de servicio
  const features: FeatureItem[] = [
    {
      icon: <ShieldCheck size={28} className="text-[#e81950]" />,
      title: "Garantía Oficial",
      description: "Todos nuestros productos cuentan con garantía real de fábrica y soporte directo en Perú."
    },
    {
      icon: <Truck size={28} className="text-[#e81950]" />,
      title: "Envíos Seguros a Todo el Perú",
      description: "Despachos rápidos y rastreables para que tus componentes lleguen intactos hasta tu puerta."
    },
    {
      icon: <Headphones size={28} className="text-[#e81950]" />,
      title: "Asesoría Gamer Especializada",
      description: "Te guiamos para armar o mejorar tu Setup de acuerdo a tus necesidades y presupuesto real."
    },
    {
      icon: <Award size={28} className="text-[#e81950]" />,
      title: "Productos 100% Originales",
      description: "Importación directa de las marcas líderes del mercado internacional de hardware y periféricos."
    }
  ];

  return (
    <div className="home-page" style={{ background: "#ffffff", color: "#1a1a2e" }}>
      <Navbar />
      <SecondaryNav />

      <main style={{ background: "#fff", overflowX: "hidden" }}>
        {/* Estilos CSS Inyectados para Animaciones y Keyframes */}
        <style>{`
          @keyframes pulseGlow {
            0%, 100% { transform: scale(1); opacity: 0.15; }
            50% { transform: scale(1.08); opacity: 0.25; }
          }
          @keyframes floatEffect {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .card-spotlight {
            position: relative;
            background: #ffffff;
            border-radius: 16px;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .card-spotlight::before {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: 17px;
            background: radial-gradient(
              600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              rgba(232, 25, 80, 0.25),
              transparent 40%
            );
            z-index: 0;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
          }
          .card-spotlight:hover::before {
            opacity: 1;
          }
          .feature-card {
            background: #ffffff;
            border: 1px solid #f0f0f5;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border-radius: 14px;
            padding: 2rem;
            transition: all 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-6px);
            border-color: rgba(232, 25, 80, 0.3);
            box-shadow: 0 12px 30px rgba(232, 25, 80, 0.1);
          }
        `}</style>

        {/* HERO SECTION */}
        <section 
          className="about-hero"
          style={{
            background: "linear-gradient(135deg, #e81950 0%, #c41340 100%)",
            color: "#fff",
            padding: "6.5rem 2rem 5.5rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Circulo decorativo animado 1 */}
          <div 
            style={{
              position: "absolute",
              top: "-30%",
              right: "-5%",
              width: "550px",
              height: "550px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.12)",
              filter: "blur(90px)",
              zIndex: 0,
              animation: "pulseGlow 6s infinite ease-in-out"
            }}
          />

          {/* Círculo decorativo animado 2 */}
          <div 
            style={{
              position: "absolute",
              bottom: "-40%",
              left: "-10%",
              width: "450px",
              height: "450px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.15)",
              filter: "blur(80px)",
              zIndex: 0
            }}
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto" }} className="animate-fade-in">
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.18)",
              backdropFilter: "blur(8px)",
              padding: "6px 16px",
              borderRadius: "50px",
              fontSize: "0.85rem",
              fontWeight: "600",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "1.5rem"
            }}>
              <Sparkles size={16} /> Sobre Eagle Gaming Perú
            </span>

            <h1 className="product-title" style={{ fontSize: "3.5rem", marginBottom: "1.5rem", fontWeight: "800", letterSpacing: "-1px" }}>
              Nosotros
            </h1>

            <p style={{ fontSize: "1.2rem", lineHeight: "1.8", color: "#f8e6eb", maxWidth: "800px", margin: "0 auto", fontWeight: "400" }}>
              Eagle Gaming Perú es la empresa referente en tecnología y hardware de alto rendimiento. 
              Importamos directamente las marcas líderes para equipar a gamers, creadores de contenido y profesionales de todo el país.
            </p>
          </div>
        </section>

        {/* METRICAS Y ESTADISTICAS */}
        <section style={{
          marginTop: "-2.5rem",
          maxWidth: "1150px",
          margin: "-2.5rem auto 4rem",
          padding: "0 1.5rem",
          position: "relative",
          zIndex: 3
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
            padding: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            border: "1px solid #f0f0f5"
          }}>
            <div style={{ textAlign: "center", borderRight: "1px solid #f0f0f0" }}>
              <Users size={28} style={{ color: "#e81950", marginBottom: "0.5rem" }} />
              <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1a1a2e" }}>
                +{counts.clients.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#666", fontWeight: "500" }}>Clientes Satisfechos</div>
            </div>

            <div style={{ textAlign: "center", borderRight: "1px solid #f0f0f0" }}>
              <Trophy size={28} style={{ color: "#e81950", marginBottom: "0.5rem" }} />
              <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1a1a2e" }}>
                +{counts.products.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#666", fontWeight: "500" }}>Productos en Catálogo</div>
            </div>

            <div style={{ textAlign: "center", borderRight: "1px solid #f0f0f0" }}>
              <Truck size={28} style={{ color: "#e81950", marginBottom: "0.5rem" }} />
              <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1a1a2e" }}>
                {counts.deliveries}%
              </div>
              <div style={{ fontSize: "0.9rem", color: "#666", fontWeight: "500" }}>Envíos a Tiempo</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <Sparkles size={28} style={{ color: "#e81950", marginBottom: "0.5rem" }} />
              <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1a1a2e" }}>
                +{counts.experience}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#666", fontWeight: "500" }}>Años de Experiencia</div>
            </div>
          </div>
        </section>

        {/* ¿QUIÉNES SOMOS? */}
        <section style={{ padding: "2rem 2rem 4rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ 
            background: "linear-gradient(135deg, #ffffff 0%, #fff8f9 100%)", 
            padding: "3.5rem", 
            borderRadius: "20px",
            border: "1px solid #fce8ed",
            boxShadow: "0 8px 30px rgba(232, 25, 80, 0.04)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3rem",
            alignItems: "center"
          }}>
            <div>
              <span style={{ color: "#e81950", fontWeight: "700", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>
                Nuestra Trayectoria
              </span>
              <h2 className="product-title" style={{ fontSize: "2.3rem", marginTop: "0.5rem", marginBottom: "1.2rem", color: "#1a1a2e", fontWeight: "800" }}>
                Líderes en Hardware Gamer y Tecnología en Perú
              </h2>
              <p style={{ fontSize: "1.05rem", lineHeight: "1.8", color: "#555", marginBottom: "1.5rem" }}>
                <strong>Eagle Gaming Perú</strong> nació con una clara visión: acercar la tecnología gaming mundial de última generación al mercado peruano con precios transparentes y un asesoramiento especializado.
              </p>
              <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#666" }}>
                Nos destacamos por nuestra amplia variedad de componentes de vanguardia, desde procesadores y tarjetas gráficas hasta periféricos competitivos. Trabajamos cada día para garantizar la autenticidad de cada producto y brindar una atención postventa confiable y transparente.
              </p>
            </div>

            {/* Ilustración / Tarjeta Destacada */}
            <div style={{
              background: "#ffffff",
              padding: "2rem",
              borderRadius: "16px",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.06)",
              borderLeft: "5px solid #e81950"
            }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem", color: "#1a1a2e", display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={24} style={{ color: "#e81950" }} /> Compromiso de Calidad
              </h3>
              <p style={{ color: "#666", lineHeight: "1.7", fontSize: "0.95rem" }}>
                "No solo vendemos tecnología; construimos la base para que cada gamer logre su máximo nivel y cada creador concrete sus proyectos sin límites de rendimiento."
              </p>
              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-[#e81950]", alignItems: "center" }}>
                <span style={{ fontWeight: "700", color: "#1a1a2e", fontSize: "0.9rem" }}>Equipo Eagle Gaming Perú</span>
              </div>
            </div>
          </div>
        </section>

        {/* CARACTERÍSTICAS / PROPUESTA DE VALOR */}
        <section style={{ padding: "2rem 2rem 5rem", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ color: "#e81950", fontWeight: "700", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>
              ¿Por qué elegirnos?
            </span>
            <h2 className="product-title" style={{ fontSize: "2.2rem", marginTop: "0.5rem", color: "#1a1a2e", fontWeight: "800" }}>
              Ventajas Exclusivas Eagle Gaming
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.8rem"
          }}>
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  background: "#fff0f3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.2rem"
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1a1a2e", marginBottom: "0.6rem" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: "0.92rem", color: "#666", lineHeight: "1.6" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* VISIÓN, MISIÓN Y VALORES */}
        <section style={{ 
          padding: "5rem 2rem", 
          background: "linear-gradient(180deg, #ffffff 0%, #f9f9fc 100%)"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span style={{ color: "#e81950", fontWeight: "700", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>
                Filosofía Corporativa
              </span>
              <h2 className="product-title" style={{ fontSize: "2.4rem", marginTop: "0.4rem", color: "#1a1a2e", fontWeight: "800" }}>
                Nuestra Pasión es tu Satisfacción
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem"
            }}>
              {/* Visión */}
              <div 
                ref={visionRef}
                className="card-spotlight"
                onMouseMove={(e) => handleMouseMove(e, "vision")}
                onMouseEnter={() => setHoveredCard("vision")}
                onMouseLeave={() => handleMouseLeave("vision")}
                style={{
                  position: "relative",
                  padding: "3px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  boxShadow: hoveredCard === "vision" ? "0 20px 35px -5px rgba(232, 25, 80, 0.2)" : "0 6px 20px rgba(0, 0, 0, 0.05)",
                  transform: hoveredCard === "vision" ? "translateY(-8px)" : "translateY(0)",
                  transition: "all 0.35s ease",
                  display: "flex",
                  flexDirection: "column"
                } as React.CSSProperties}
              >
                <div style={{ position: "absolute", inset: 0, background: "#f0f0f5", zIndex: 0 }} />
                
                {/* Borde giratorio con degradado */}
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

                <div style={{
                  background: "#fff",
                  borderRadius: "13px",
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                  zIndex: 2,
                  position: "relative",
                  flexGrow: 1
                }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "#fff0f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem"
                  }}>
                    <Target size={36} style={{ color: "#e81950" }} />
                  </div>
                  <h3 className="product-title" style={{ fontSize: "1.6rem", marginBottom: "1rem", color: "#1a1a2e", fontWeight: "700" }}>
                    Visión
                  </h3>
                  <p style={{ fontSize: "0.98rem", lineHeight: "1.7", color: "#555" }}>
                    Ser la tienda referente en Perú en la distribución de productos de gaming y tecnología, 
                    reconocida por la excelencia técnica, garantía transparente y la confianza absoluta de la comunidad gamer.
                  </p>
                </div>
              </div>

              {/* Misión */}
              <div 
                ref={misionRef}
                className="card-spotlight"
                onMouseMove={(e) => handleMouseMove(e, "mision")}
                onMouseEnter={() => setHoveredCard("mision")}
                onMouseLeave={() => handleMouseLeave("mision")}
                style={{
                  position: "relative",
                  padding: "3px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  boxShadow: hoveredCard === "mision" ? "0 20px 35px -5px rgba(232, 25, 80, 0.2)" : "0 6px 20px rgba(0, 0, 0, 0.05)",
                  transform: hoveredCard === "mision" ? "translateY(-8px)" : "translateY(0)",
                  transition: "all 0.35s ease",
                  display: "flex",
                  flexDirection: "column"
                } as React.CSSProperties}
              >
                <div style={{ position: "absolute", inset: 0, background: "#f0f0f5", zIndex: 0 }} />
                
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

                <div style={{
                  background: "#fff",
                  borderRadius: "13px",
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                  zIndex: 2,
                  position: "relative",
                  flexGrow: 1
                }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "#fff0f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem"
                  }}>
                    <Zap size={36} style={{ color: "#e81950" }} />
                  </div>
                  <h3 className="product-title" style={{ fontSize: "1.6rem", marginBottom: "1rem", color: "#1a1a2e", fontWeight: "700" }}>
                    Misión
                  </h3>
                  <p style={{ fontSize: "0.98rem", lineHeight: "1.7", color: "#555" }}>
                    Proporcionar componentes y periféricos de alta gama a precios altamente competitivos, 
                    impulsando la cultura gamer en Perú con asesoría personalizada y compras 100% seguras.
                  </p>
                </div>
              </div>

              {/* Valores */}
              <div 
                ref={valoresRef}
                className="card-spotlight"
                onMouseMove={(e) => handleMouseMove(e, "valores")}
                onMouseEnter={() => setHoveredCard("valores")}
                onMouseLeave={() => handleMouseLeave("valores")}
                style={{
                  position: "relative",
                  padding: "3px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  boxShadow: hoveredCard === "valores" ? "0 20px 35px -5px rgba(232, 25, 80, 0.2)" : "0 6px 20px rgba(0, 0, 0, 0.05)",
                  transform: hoveredCard === "valores" ? "translateY(-8px)" : "translateY(0)",
                  transition: "all 0.35s ease",
                  display: "flex",
                  flexDirection: "column"
                } as React.CSSProperties}
              >
                <div style={{ position: "absolute", inset: 0, background: "#f0f0f5", zIndex: 0 }} />
                
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

                <div style={{
                  background: "#fff",
                  borderRadius: "13px",
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                  zIndex: 2,
                  position: "relative",
                  flexGrow: 1
                }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "#fff0f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem"
                  }}>
                    <Heart size={36} style={{ color: "#e81950" }} />
                  </div>
                  <h3 className="product-title" style={{ fontSize: "1.6rem", marginBottom: "1rem", color: "#1a1a2e", fontWeight: "700" }}>
                    Valores
                  </h3>
                  <p style={{ fontSize: "0.98rem", lineHeight: "1.7", color: "#555" }}>
                    Integridad, pasión tecnológica, transparencia e innovación constante. Nos enfocamos en crear relaciones sólidas y duraderas con nuestros usuarios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA CALL TO ACTION */}
        <section style={{
          background: "linear-gradient(135deg, #e81950 0%, #1d1111 100%)",
          color: "#fff",
          padding: "5rem 2rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Luz de fondo en CTA */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "200px",
            background: "rgba(232, 25, 80, 0.25)",
            filter: "blur(100px)",
            pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "750px", margin: "0 auto" }}>
            <h2 className="product-title" style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#fff", fontWeight: "800" }}>
              ¿Necesitas Asesoría para tu Próximo Setup?
            </h2>
            <p style={{ fontSize: "1.15rem", marginBottom: "2.5rem", color: "#d0d0e0", lineHeight: "1.7" }}>
              Escríbenos directamente y nuestro equipo te ayudará a encontrar los componentes idóneos con la mejor relación calidad-precio.
            </p>
            
            <div style={{ display: "inline-block" }}>
              <AnimatedButton as="a" href="/contactenos" style={{ textDecoration: "none" }}>
                Contactar Ahora <ChevronRight size={18} style={{ marginLeft: "6px", verticalAlign: "middle" }} />
              </AnimatedButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}