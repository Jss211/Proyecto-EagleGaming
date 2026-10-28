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
            max-width: 100%;
            box-sizing: border-box;
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
            padding: 1.5rem 1.25rem;
            transition: all 0.3s ease;
            box-sizing: border-box;
          }
          .feature-card:hover {
            transform: translateY(-6px);
            border-color: rgba(232, 25, 80, 0.3);
            box-shadow: 0 12px 30px rgba(232, 25, 80, 0.1);
          }

          /* Responsive Layout Styles */
          .about-hero {
            background: linear-gradient(135deg, #e81950 0%, #c41340 100%);
            color: #fff;
            padding: 3.5rem 1.25rem 3rem;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
          }
          @media (min-width: 768px) {
            .about-hero {
              padding: 6.5rem 2rem 5.5rem;
            }
          }

          .about-metrics-section {
            max-width: 1150px;
            margin: -1.75rem auto 3rem;
            padding: 0 1rem;
            position: relative;
            z-index: 3;
            box-sizing: border-box;
          }
          @media (min-width: 768px) {
            .about-metrics-section {
              margin: -2.5rem auto 4rem;
              padding: 0 1.5rem;
            }
          }

          .about-metrics-grid {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 35px rgba(0,0,0,0.08);
            padding: 1.25rem 1rem;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem 0.75rem;
            border: 1px solid #f0f0f5;
            box-sizing: border-box;
          }
          @media (min-width: 768px) {
            .about-metrics-grid {
              grid-template-columns: repeat(4, 1fr);
              padding: 2rem;
              gap: 2rem;
            }
          }

          .about-metric-item {
            text-align: center;
            padding: 0.5rem 0.25rem;
          }
          @media (min-width: 768px) {
            .about-metric-item:not(:last-child) {
              border-right: 1px solid #f0f0f0;
            }
          }

          .about-history-section {
            padding: 1.5rem 1rem 3rem;
            max-width: 1200px;
            margin: 0 auto;
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 768px) {
            .about-history-section {
              padding: 2rem 2rem 4rem;
            }
          }

          .about-history-card {
            background: linear-gradient(135deg, #ffffff 0%, #fff8f9 100%);
            padding: 1.5rem 1.25rem;
            border-radius: 20px;
            border: 1px solid #fce8ed;
            box-shadow: 0 8px 30px rgba(232, 25, 80, 0.04);
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            align-items: center;
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 900px) {
            .about-history-card {
              padding: 3.5rem;
              grid-template-columns: 1.2fr 1fr;
              gap: 3rem;
            }
          }

          .about-quality-box {
            background: #ffffff;
            padding: 1.5rem 1.25rem;
            border-radius: 16px;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.06);
            border-left: 5px solid #e81950;
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 768px) {
            .about-quality-box {
              padding: 2rem;
            }
          }

          .about-features-section {
            padding: 2rem 1rem 3.5rem;
            max-width: 1200px;
            margin: 0 auto;
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 768px) {
            .about-features-section {
              padding: 2rem 2rem 5rem;
            }
          }

          .about-features-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.25rem;
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 600px) {
            .about-features-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 1.5rem;
            }
          }
          @media (min-width: 1024px) {
            .about-features-grid {
              grid-template-columns: repeat(4, 1fr);
              gap: 1.8rem;
            }
          }

          .about-philosophy-section {
            padding: 3rem 1rem;
            background: linear-gradient(180deg, #ffffff 0%, #f9f9fc 100%);
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 768px) {
            .about-philosophy-section {
              padding: 5rem 2rem;
            }
          }

          .about-philosophy-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 768px) {
            .about-philosophy-grid {
              grid-template-columns: repeat(3, 1fr);
              gap: 2rem;
            }
          }

          .about-philosophy-inner {
            background: #fff;
            border-radius: 13px;
            padding: 1.75rem 1.25rem;
            text-align: center;
            z-index: 2;
            position: relative;
            flex-grow: 1;
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 768px) {
            .about-philosophy-inner {
              padding: 2.5rem 2rem;
            }
          }

          .about-cta-section {
            background: linear-gradient(135deg, #e81950 0%, #1d1111 100%);
            color: #fff;
            padding: 3.5rem 1.25rem;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            width: 100%;
          }
          @media (min-width: 768px) {
            .about-cta-section {
              padding: 5rem 2rem;
            }
          }
        `}</style>

        {/* HERO SECTION */}
        <section className="about-hero">
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
            <h1 className="product-title" style={{ fontSize: "clamp(1.8rem, 5vw, 3.2rem)", marginBottom: "1.2rem", fontWeight: "800", letterSpacing: "-1px" }}>
              Nosotros
            </h1>

            <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", lineHeight: "1.8", color: "#f8e6eb", maxWidth: "800px", margin: "0 auto", fontWeight: "400" }}>
              Eagle Gaming Perú es la empresa referente en tecnología y hardware de alto rendimiento. 
              Importamos directamente las marcas líderes para equipar a gamers, creadores de contenido y profesionales de todo el país.
            </p>
          </div>
        </section>

        {/* METRICAS Y ESTADISTICAS */}
        <section className="about-metrics-section">
          <div className="about-metrics-grid">
            <div className="about-metric-item">
              <Users size={28} style={{ color: "#e81950", margin: "0 auto 0.5rem" }} />
              <div style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: "800", color: "#1a1a2e" }}>
                +{counts.clients.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: "500" }}>Clientes Satisfechos</div>
            </div>

            <div className="about-metric-item">
              <Trophy size={28} style={{ color: "#e81950", margin: "0 auto 0.5rem" }} />
              <div style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: "800", color: "#1a1a2e" }}>
                +{counts.products.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: "500" }}>Productos en Catálogo</div>
            </div>

            <div className="about-metric-item">
              <Truck size={28} style={{ color: "#e81950", margin: "0 auto 0.5rem" }} />
              <div style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: "800", color: "#1a1a2e" }}>
                {counts.deliveries}%
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: "500" }}>Envíos a Tiempo</div>
            </div>

            <div className="about-metric-item">
              <Sparkles size={28} style={{ color: "#e81950", margin: "0 auto 0.5rem" }} />
              <div style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: "800", color: "#1a1a2e" }}>
                +{counts.experience}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: "500" }}>Años de Experiencia</div>
            </div>
          </div>
        </section>

        {/* ¿QUIÉNES SOMOS? */}
        <section className="about-history-section">
          <div className="about-history-card">
            <div>
              <span style={{ color: "#e81950", fontWeight: "700", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>
                Nuestra Trayectoria
              </span>
              <h2 className="product-title" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.3rem)", marginTop: "0.5rem", marginBottom: "1.2rem", color: "#1a1a2e", fontWeight: "800", lineHeight: "1.25" }}>
                Líderes en Hardware Gamer y Tecnología en Perú
              </h2>
              <p style={{ fontSize: "1rem", lineHeight: "1.8", color: "#555", marginBottom: "1.25rem" }}>
                <strong>Eagle Gaming Perú</strong> nació con una clara visión: acercar la tecnología gaming mundial de última generación al mercado peruano con precios transparentes y un asesoramiento especializado.
              </p>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "#666" }}>
                Nos destacamos por nuestra amplia variedad de componentes de vanguardia, desde procesadores y tarjetas gráficas hasta periféricos competitivos. Trabajamos cada día para garantizar la autenticidad de cada producto y brindar una atención postventa confiable y transparente.
              </p>
            </div>

            {/* Ilustración / Tarjeta Destacada */}
            <div className="about-quality-box">
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.85rem", color: "#1a1a2e", display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={24} style={{ color: "#e81950", flexShrink: 0 }} /> Compromiso de Calidad
              </h3>
              <p style={{ color: "#666", lineHeight: "1.7", fontSize: "0.92rem" }}>
                "No solo vendemos tecnología; construimos la base para que cada gamer logre su máximo nivel y cada creador concrete sus proyectos sin límites de rendimiento."
              </p>
              <div style={{ marginTop: "1.25rem", paddingTop: "0.85rem", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
                <span style={{ fontWeight: "700", color: "#1a1a2e", fontSize: "0.85rem" }}>Equipo Eagle Gaming Perú</span>
              </div>
            </div>
          </div>
        </section>

        {/* CARACTERÍSTICAS / PROPUESTA DE VALOR */}
        <section className="about-features-section">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ color: "#e81950", fontWeight: "700", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>
              ¿Por qué elegirnos?
            </span>
            <h2 className="product-title" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", marginTop: "0.5rem", color: "#1a1a2e", fontWeight: "800" }}>
              Ventajas Exclusivas Eagle Gaming
            </h2>
          </div>

          <div className="about-features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "12px",
                  background: "#fff0f3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem"
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#1a1a2e", marginBottom: "0.5rem" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: "1.6" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* VISIÓN, MISIÓN Y VALORES */}
        <section className="about-philosophy-section">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span style={{ color: "#e81950", fontWeight: "700", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>
                Filosofía Corporativa
              </span>
              <h2 className="product-title" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)", marginTop: "0.4rem", color: "#1a1a2e", fontWeight: "800" }}>
                Nuestra Pasión es tu Satisfacción
              </h2>
            </div>

            <div className="about-philosophy-grid">
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

                <div className="about-philosophy-inner">
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#fff0f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem"
                  }}>
                    <Target size={32} style={{ color: "#e81950" }} />
                  </div>
                  <h3 className="product-title" style={{ fontSize: "1.45rem", marginBottom: "0.85rem", color: "#1a1a2e", fontWeight: "700" }}>
                    Visión
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#555" }}>
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

                <div className="about-philosophy-inner">
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#fff0f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem"
                  }}>
                    <Zap size={32} style={{ color: "#e81950" }} />
                  </div>
                  <h3 className="product-title" style={{ fontSize: "1.45rem", marginBottom: "0.85rem", color: "#1a1a2e", fontWeight: "700" }}>
                    Misión
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#555" }}>
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

                <div className="about-philosophy-inner">
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#fff0f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.25rem"
                  }}>
                    <Heart size={32} style={{ color: "#e81950" }} />
                  </div>
                  <h3 className="product-title" style={{ fontSize: "1.45rem", marginBottom: "0.85rem", color: "#1a1a2e", fontWeight: "700" }}>
                    Valores
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#555" }}>
                    Integridad, pasión tecnológica, transparencia e innovación constante. Nos enfocamos en crear relaciones sólidas y duraderas con nuestros usuarios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA CALL TO ACTION */}
        <section className="about-cta-section">
          {/* Luz de fondo en CTA */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(600px, 90vw)",
            height: "200px",
            background: "rgba(232, 25, 80, 0.25)",
            filter: "blur(100px)",
            pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: "750px", margin: "0 auto" }}>
            <h2 className="product-title" style={{ fontSize: "clamp(1.6rem, 5vw, 2.5rem)", marginBottom: "1rem", color: "#fff", fontWeight: "800", lineHeight: "1.25" }}>
              ¿Necesitas Asesoría para tu Próximo Setup?
            </h2>
            <p style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)", marginBottom: "2rem", color: "#d0d0e0", lineHeight: "1.7" }}>
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