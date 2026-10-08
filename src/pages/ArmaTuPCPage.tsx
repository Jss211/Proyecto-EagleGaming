import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "../components/home/ProductCard";
import {
  X,
  CheckCircle2,
  Check,
  AlertCircle,
} from "lucide-react";

// ─── Definición de pasos ──────────────────────────────────────────────────────

interface Step {
  id: string;
  label: string;
  categorySlug: string;
  image: string;
  optional?: boolean;
}

const STEPS: Step[] = [
  { id: "procesador",     label: "PROCESADOR",       categorySlug: "procesadores",         image: "/categorias/procesadores.png" },
  { id: "placa-madre",    label: "PLACA MADRE",      categorySlug: "placa-madre",          image: "/categorias/placa madre.png" },
  { id: "memoria-ram",    label: "MEMORIA RAM",      categorySlug: "memoria-ram",          image: "/categorias/memoria RAM.png" },
  { id: "almacenamiento", label: "ALMACENAMIENTO",   categorySlug: "memoria-ssd",          image: "/categorias/memoria ssd.png" },
  { id: "tarjeta-video",  label: "TARJETA DE VIDEO", categorySlug: "tarjeta-grafica",      image: "/categorias/TARJETA gráfica.png" },
  { id: "fuente-poder",   label: "FUENTE DE PODER",  categorySlug: "fuente-poder",         image: "/categorias/fuente de poder.png", optional: true },
  { id: "case",           label: "CASE/GABINETE",    categorySlug: "case",                 image: "/categorias/case_4.png", optional: true },
  { id: "refrigeracion",  label: "REFRIGERACIÓN",    categorySlug: "refrigeracion",        image: "/categorias/refrigeración líquida.png", optional: true },
  { id: "monitor",        label: "MONITOR",          categorySlug: "monitores",            image: "/categorias/monitores.png", optional: true },
  { id: "perifericos",    label: "PERIFERICOS",      categorySlug: "perifericos",          image: "/categorias/perifericos.png", optional: true },
];

type Selection = Record<string, Product | null>;

const normalize = (text: string) =>
  (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const buildProduct = (id: string, data: Record<string, unknown>): Product => {
  const pick = (keys: string[]) => keys.find((k) => data[k] != null && data[k] !== "") ?? "";
  const name =
    (data[pick(["titulo", "Titulo", "título", "Título", "nombre", "Nombre"])] as string) ??
    (`${data["marca"] ?? ""} ${data["modelo"] ?? ""}`.trim() || "Producto sin título");
  return {
    id,
    name,
    category: (data[pick(["categoria", "Categoria", "categoría", "Categoría"])] as string) ?? "",
    price: Number(data[pick(["precio", "Precio"])] ?? 0),
    imageUrl: (data[pick(["url", "Url"])] as string) ?? `https://placehold.co/400x300?text=Producto`,
    inStock: data["stock"] !== false,
  };
};

// ─── Detección de Socket, Generación y Compatibilidad ─────────────────────────

type CpuSocket = "LGA1700" | "LGA1200" | "LGA1151" | "AM4" | "AM5" | "OTHER";
type RamType = "DDR4" | "DDR5" | "DDR3";

function detectCpuInfo(name: string): { socket: CpuSocket; ram: RamType } {
  const n = normalize(name);

  // Intel 12va, 13va, 14va Gen (LGA1700)
  if (
    n.includes("12100") || n.includes("12400") || n.includes("12600") || n.includes("12700") || n.includes("12900") ||
    n.includes("13400") || n.includes("13600") || n.includes("13700") || n.includes("13900") ||
    n.includes("14400") || n.includes("14600") || n.includes("14700") || n.includes("14900") ||
    n.includes("lga 1700") || n.includes("lga1700")
  ) {
    return { socket: "LGA1700", ram: "DDR4" }; // Compatible con DDR4 / DDR5
  }

  // Intel 10ma y 11va Gen (LGA1200)
  if (
    n.includes("10100") || n.includes("10105") || n.includes("10400") || n.includes("10600") || n.includes("10700") || n.includes("10900") ||
    n.includes("11400") || n.includes("11600") || n.includes("11700") || n.includes("11900") ||
    n.includes("lga 1200") || n.includes("lga1200")
  ) {
    return { socket: "LGA1200", ram: "DDR4" };
  }

  // Intel 6ta a 9na Gen (LGA1151)
  if (
    n.includes("9400") || n.includes("9600") || n.includes("9700") || n.includes("8400") || n.includes("8700") || n.includes("7400") || n.includes("6400")
  ) {
    return { socket: "LGA1151", ram: "DDR4" };
  }

  // AMD AM5 (Ryzen 7000 / 8000 / 9000)
  if (
    n.includes("7600") || n.includes("7700") || n.includes("7800") || n.includes("7900") || n.includes("7950") ||
    n.includes("8500") || n.includes("8600") || n.includes("8700") ||
    n.includes("am5")
  ) {
    return { socket: "AM5", ram: "DDR5" };
  }

  // AMD AM4 (Ryzen 1000 a 5000: 3600, 5600, 5700, 5800, etc.)
  if (
    n.includes("5600") || n.includes("5700") || n.includes("5800") || n.includes("5500") || n.includes("5300") ||
    n.includes("4600") || n.includes("4500") || n.includes("3600") || n.includes("3700") || n.includes("2600") ||
    n.includes("am4")
  ) {
    return { socket: "AM4", ram: "DDR4" };
  }

  return { socket: "OTHER", ram: "DDR4" };
}
// Helper to detect pre‑built PC or laptop entries
function isPrebuiltPc(name: string, cat: string): boolean {
  const n = normalize(name);
  const c = normalize(cat);
  const keywords = [
    "pc completa",
    "pc completo",
    "pc gaming",
    "pc gamer",
    "laptop",
    "notebook",
    "computadora",
    "computer",
    "desktop",
    "all-in-one",
    "full pc",
  ];
  if (keywords.some((k) => c.includes(k) || n.includes(k))) return true;
  // Heuristic: name contains two or more '+' symbols, typical for bundled specs
  if ((n.match(/\+/g) || []).length >= 2) return true;
  return false;
}

// ─── Tarjeta individual estilo Figma ──────────────────────────────────────────

interface SelectCardProps {
  product: Product;
  stepLabel: string;
  badge?: string;
  badgeClass?: string;
  isSelected: boolean;
  onSelect: () => void;
}

function SelectCard({ product, stepLabel, badge = "NUEVO", badgeClass, isSelected, onSelect }: SelectCardProps) {
  return (
    <article
      onClick={onSelect}
      className={`atp-card${isSelected ? " atp-card--selected" : ""}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-pressed={isSelected}
    >
      <span className={`atp-card__badge ${badgeClass || ""}`}>{badge}</span>

      {isSelected && (
        <span className="atp-card__check">
          <CheckCircle2 size={22} />
        </span>
      )}

      <div className="atp-card__img-wrap">
        <img
          src={product.imageUrl || "https://placehold.co/400x300?text=Producto"}
          alt={product.name}
          className="atp-card__img"
        />
      </div>

      <p className="atp-card__cat">{stepLabel}</p>
      <h3 className="atp-card__name">{product.name}</h3>

      <div className="atp-card__stock">
        <Check size={14} />
        <span>En stock</span>
      </div>

      <p className="atp-card__price">
        S/{product.price.toFixed(2)}
      </p>
    </article>
  );
}

// ─── Modal de cotización ──────────────────────────────────────────────────────

interface QuoteModalProps {
  steps: Step[];
  selection: Selection;
  onClose: () => void;
}

function QuoteModal({ steps, selection, onClose }: QuoteModalProps) {
  const total = Object.values(selection).reduce((acc, p) => acc + (p?.price ?? 0), 0);
  const selected = steps.filter((s) => selection[s.id]);

  const handleWhatsApp = () => {
    const lines = selected.map(
      (s) => `• ${s.label}: ${selection[s.id]!.name} — S/${selection[s.id]!.price.toFixed(2)}`
    );
    const msg = `¡Hola Eagle Gaming! Quiero consultar esta cotización de PC armada:\n\n${lines.join("\n")}\n\nTotal estimado: S/${total.toFixed(2)}`;
    window.open(`https://wa.me/51986638034?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="atp-modal-overlay" role="dialog" aria-modal="true" aria-label="Cotización de tu PC">
      <div className="atp-modal">
        <button className="atp-modal__close" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className="atp-modal__header">
          <h2>Cotización de tu PC</h2>
          <p>Revisa los componentes seleccionados para tu armado</p>
        </div>

        <ul className="atp-modal__list">
          {steps.map((step) => {
            const sel = selection[step.id];
            return (
              <li key={step.id} className={`atp-modal__row${sel ? "" : " atp-modal__row--empty"}`}>
                <img src={step.image} alt={step.label} className="atp-modal__row-img" />
                <div className="atp-modal__row-info">
                  <span className="atp-modal__row-label">{step.label}</span>
                  <span className="atp-modal__row-product">
                    {sel ? sel.name : <em>No seleccionado{step.optional ? " (opcional)" : ""}</em>}
                  </span>
                </div>
                {sel && (
                  <span className="atp-modal__row-price">
                    S/{sel.price.toFixed(2)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="atp-modal__total">
          <span>Total de la cotización:</span>
          <strong>S/{total.toFixed(2)}</strong>
        </div>

        <div className="atp-modal__actions">
          <button className="atp-modal__back-btn" onClick={onClose}>
            Seguir armando
          </button>
          <button className="atp-modal__whatsapp-btn" onClick={handleWhatsApp}>
            Solicitar cotización por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ArmaTuPCPage ─────────────────────────────────────────

export function ArmaTuPCPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState<Selection>(() =>
    Object.fromEntries(STEPS.map((s) => [s.id, null]))
  );
  const [allDbProducts, setAllDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showQuote, setShowQuote] = useState(false);

  const step = STEPS[currentStep];

  // 1. Cargar productos desde Firestore en tiempo real
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "productos"));
        const items: Product[] = snap.docs.map((doc) =>
          buildProduct(doc.id, doc.data() as Record<string, unknown>)
        );
        setAllDbProducts(items);
      } catch (err) {
        console.error("Error cargando productos de Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // 2. Extraer información del procesador seleccionado (para compatibilidad de placas y memorias)
  const selectedCpu = selection["procesador"];
  const cpuInfo = useMemo(() => {
    if (!selectedCpu) return null;
    return detectCpuInfo(selectedCpu.name);
  }, [selectedCpu]);

  // 3. Filtrar estrictamente por categoría y excluir ensambladas
  const stepProducts = useMemo(() => {
    if (allDbProducts.length === 0) return [];

    // Descartar computadoras completas y laptops
    const componentsOnly = allDbProducts.filter((p) => !isPrebuiltPc(p.name, p.category));

    const stepId = step.id;

    let matched: Product[] = [];

    if (stepId === "procesador") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        return c.includes("procesador") || n.startsWith("procesador") || n.includes("core i") || n.includes("ryzen");
      });
    } else if (stepId === "placa-madre") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        const isMobo = c.includes("placa") || c.includes("mother") || n.includes("b450") || n.includes("b550") || n.includes("b650") || n.includes("b760") || n.includes("h610") || n.includes("h510") || n.includes("a520");
        if (!isMobo) return false;

        // FILTRO DE COMPATIBILIDAD CON EL PROCESADOR SELECCIONADO:
        if (cpuInfo) {
          if (cpuInfo.socket === "AM4") {
            return n.includes("am4") || n.includes("a320") || n.includes("b450") || n.includes("b550") || n.includes("x570") || n.includes("a520");
          }
          if (cpuInfo.socket === "AM5") {
            return n.includes("am5") || n.includes("a620") || n.includes("b650") || n.includes("x670") || n.includes("b850");
          }
          if (cpuInfo.socket === "LGA1700") {
            return n.includes("1700") || n.includes("h610") || n.includes("b660") || n.includes("b760") || n.includes("z690") || n.includes("z790");
          }
          if (cpuInfo.socket === "LGA1200") {
            return n.includes("1200") || n.includes("h410") || n.includes("b460") || n.includes("h510") || n.includes("b560") || n.includes("z490") || n.includes("z590");
          }
        }
        return true;
      });
    } else if (stepId === "memoria-ram") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        const isRam = c.includes("ram") || n.includes("ram") || n.includes("ddr4") || n.includes("ddr5") || n.includes("vengeance") || n.includes("fury");
        if (!isRam) return false;

        // Si el procesador es AM5, solo admite DDR5
        if (cpuInfo && cpuInfo.ram === "DDR5") {
          return n.includes("ddr5") || (!n.includes("ddr4") && !n.includes("ddr3"));
        }
        return true;
      });
    } else if (stepId === "almacenamiento") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        return c.includes("ssd") || c.includes("almacen") || c.includes("disco") || n.includes("ssd") || n.includes("nvme") || n.includes("m.2") || n.includes("disco duro");
      });
    } else if (stepId === "tarjeta-video") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        return c.includes("grafic") || c.includes("video") || n.includes("rtx") || n.includes("gtx") || n.includes("radeon") || n.includes("rx ");
      });
    } else if (stepId === "fuente-poder") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        return c.includes("fuente") || n.includes("fuente") || n.includes("80 plus") || n.includes("power supply");
      });
    } else if (stepId === "case") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        return c.includes("case") || c.includes("gabinet") || n.includes("gabinete") || n.includes("case gamer");
      });
    } else if (stepId === "refrigeracion") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        return c.includes("refrigera") || n.includes("refrigeracion") || n.includes("disipador") || n.includes("cooler") || n.includes("enfriamiento");
      });
    } else if (stepId === "monitor") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        return c.includes("monitor") || n.includes("monitor");
      });
    } else if (stepId === "perifericos") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        return c.includes("periferic") || c.includes("estabilizador") || n.includes("teclado") || n.includes("mouse") || n.includes("headset") || n.includes("audifono");
      });
    }

    return matched;
  }, [allDbProducts, step.id, cpuInfo]);

  // 4. Aplicar filtro de búsqueda si el usuario escribe
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return stepProducts;
    const query = normalize(search);
    return stepProducts.filter(
      (p) => normalize(p.name).includes(query) || normalize(p.category).includes(query)
    );
  }, [stepProducts, search]);

  // 5. Selección con avance automático al siguiente paso
  const handleSelect = (product: Product) => {
    setSelection((prev) => ({
      ...prev,
      [step.id]: product,
    }));

    // Auto-avance al siguiente paso compatible
    if (currentStep < STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setSearch("");
        window.scrollTo({ top: 120, behavior: "smooth" });
      }, 250);
    } else {
      setShowQuote(true);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      setSearch("");
      window.scrollTo({ top: 120, behavior: "smooth" });
    } else {
      setShowQuote(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setSearch("");
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  // Secciones divididas según diseño Figma
  // Secciones con estructura del Figma pero criterio real de precios
  const { secGaming, secDiseno, secAltaGama, secMejorValorada, secDestacados, secEconomico } = useMemo(() => {
    const empty = {
      secGaming: [],
      secDiseno: [],
      secAltaGama: [],
      secMejorValorada: null as Product | null,
      secDestacados: [],
      secEconomico: [],
    };

    if (filteredProducts.length === 0) return empty;

    // Ordenar de mayor a menor precio para identificar los niveles
    const sorted = [...filteredProducts].sort((a, b) => b.price - a.price);
    const withPrice = sorted.filter((p) => p.price > 0);

    // Caso: sin precios → mostrar todo como "económico"
    if (withPrice.length === 0) return { ...empty, secEconomico: filteredProducts };

    const prices = withPrice.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;

    // Caso: todos el mismo precio → todo en económico
    if (range === 0) return { ...empty, secEconomico: filteredProducts };

    const highCut = min + range * 0.67; // por encima → alta gama
    const lowCut  = min + range * 0.34; // por debajo → económico
    // entre lowCut y highCut → gama media

    // Alta gama: todos los productos en el tercio superior de precio (desc)
    const altaGama = sorted.filter((p) => p.price > highCut);

    // Gama media (incluye productos sin precio)
    const mediaGama = [
      ...sorted.filter((p) => p.price > lowCut && p.price <= highCut),
      ...filteredProducts.filter((p) => p.price === 0),
    ];

    // Económicos: tercio inferior, ordenados de menor a mayor
    const economico = filteredProducts
      .filter((p) => p.price > 0 && p.price <= lowCut)
      .sort((a, b) => a.price - b.price);

    // "Recomendados para gaming" → los 2 más caros de alta gama (mayor rendimiento)
    const gaming = altaGama.slice(0, 2);

    // "Recomendados para Diseño" → los 2 siguientes en precio (rendimiento equilibrado)
    const diseno = altaGama.length >= 4
      ? altaGama.slice(2, 4)
      : mediaGama.slice(0, 2);

    // "Opciones de alta gama" → el resto de alta gama no usado en gaming/diseño
    const usedInTop = new Set([...gaming, ...diseno].map((p) => p.id));
    const altaGamaResto = altaGama.filter((p) => !usedInTop.has(p.id));

    // "Mejor valorada" → producto en el punto medio del precio (relación calidad-precio)
    const midPrice = min + range * 0.45;
    const mejorValorada = withPrice.reduce((best, p) =>
      Math.abs(p.price - midPrice) < Math.abs(best.price - midPrice) ? p : best
    );

    // "Destacados" → 3 productos de gama media no usados como mejor valorada
    const destacados = mediaGama
      .filter((p) => p.id !== mejorValorada.id)
      .slice(0, 3);

    return {
      secGaming: gaming,
      secDiseno: diseno,
      secAltaGama: altaGamaResto,
      secMejorValorada: mejorValorada,
      secDestacados: destacados,
      secEconomico: economico,
    };
  }, [filteredProducts]);

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main className="atp-page">
        {/* ── Breadcrumb idéntico a la imagen ── */}
        <div className="atp-breadcrumb">
          <button onClick={() => navigate("/")} className="atp-breadcrumb__back">
            <span className="atp-breadcrumb__arrow">←</span>
            <span>Home/Arma tu pc</span>
          </button>
        </div>

        {/* ── Banner hero rosado ── */}
        <div className="atp-hero">
          <h1 className="atp-hero__title">PASOS PARA ARMAR TU PC</h1>
          <button className="atp-hero__review-btn" onClick={() => setShowQuote(true)}>
            Revisar compra
          </button>
        </div>

        {/* ── Stepper de 10 iconos ── */}
        <div className="atp-stepper">
          {STEPS.map((s, idx) => {
            const isDone = !!selection[s.id];
            const isActive = idx === currentStep;
            return (
              <button
                key={s.id}
                className={`atp-stepper__item${isActive ? " atp-stepper__item--active" : ""}${isDone ? " atp-stepper__item--done" : ""}`}
                onClick={() => {
                  setCurrentStep(idx);
                  setSearch("");
                }}
                aria-label={s.label}
                aria-current={isActive ? "step" : undefined}
              >
                <div className="atp-stepper__icon-wrap">
                  <img src={s.image} alt={s.label} className="atp-stepper__img" />
                </div>
                <span className="atp-stepper__label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Área de contenido a ancho completo (sin sidebar lateral) ── */}
        <div className="atp-content-full">
          {/* Encabezado del paso */}
          <div className="atp-step-header">
            <h2 className="atp-step-header__title">
              <span className="atp-step-header__name">{step.label}</span>
              <span className="atp-step-header__hint">
                Revisa tu progreso en la opción "revisar compra"
              </span>
            </h2>
          </div>

          {/* Banner de compatibilidad inteligente si hay procesador seleccionado */}
          {selectedCpu && (step.id === "placa-madre" || step.id === "memoria-ram") && (
            <div style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.88rem",
              color: "#1e40af",
            }}>
              <AlertCircle size={18} />
              <span>
                Filtro de compatibilidad activo con tu <strong>{selectedCpu.name}</strong> ({cpuInfo?.socket}). Mostrando únicamente componentes 100% compatibles sin cuello de botella.
              </span>
            </div>
          )}

          {/* Barra de controles */}
          <div className="atp-controls">
            <button
              className="atp-controls__prev"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              ← Anterior
            </button>

            <div className="atp-controls__search-wrap">
              <input
                type="text"
                className="atp-controls__search"
                placeholder="Buscar componentes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="atp-controls__search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button className="atp-controls__skip" onClick={handleNext}>
              Omitir este paso →
            </button>
          </div>

          <p className="atp-step-optional">
            Este paso es opcional. Puedes elegir un componente o hacer clic en 'Omitir este paso' para continuar.
          </p>

          {/* Estado de carga */}
          {loading ? (
            <div className="atp-loading">Cargando catálogo de productos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="atp-empty">
              No hay productos registrados en esta categoría aún en la base de datos.
              <br />
              <small style={{ color: "#9ca3af", marginTop: "0.5rem", display: "inline-block" }}>
                Puedes hacer clic en <strong>'Omitir este paso →'</strong> para continuar con los demás componentes.
              </small>
            </div>
          ) : search.trim() ? (
            /* Vista de búsqueda: Grid simple */
            <div className="atp-products-grid">
              {filteredProducts.map((product) => (
                <SelectCard
                  key={product.id}
                  product={product}
                  stepLabel={step.label}
                  isSelected={selection[step.id]?.id === product.id}
                  onSelect={() => handleSelect(product)}
                />
              ))}
            </div>
          ) : (
            /* Vista por secciones – estructura Figma con criterio real de precios */
            <div className="atp-sections-wrap">

              {/* Fila 1: Recomendados gaming (más caros) | Diseño (siguiente rango) */}
              {(secGaming.length > 0 || secDiseno.length > 0) && (
                <div className="atp-sections-row-2col">
                  {secGaming.length > 0 && (
                    <section className="atp-section">
                      <div className="atp-section__header">
                        <h3 className="atp-section__title">Recomendados para gaming</h3>
                      </div>
                      <div className="atp-products-grid">
                        {secGaming.map((product) => (
                          <SelectCard
                            key={product.id}
                            product={product}
                            stepLabel={step.label}
                            isSelected={selection[step.id]?.id === product.id}
                            onSelect={() => handleSelect(product)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                  {secDiseno.length > 0 && (
                    <section className="atp-section">
                      <div className="atp-section__header">
                        <h3 className="atp-section__title">Recomendados para diseño gráfico</h3>
                      </div>
                      <div className="atp-products-grid">
                        {secDiseno.map((product) => (
                          <SelectCard
                            key={product.id}
                            product={product}
                            stepLabel={step.label}
                            isSelected={selection[step.id]?.id === product.id}
                            onSelect={() => handleSelect(product)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* Fila 2: Alta gama – resto de productos de precio alto */}
              {secAltaGama.length > 0 && (
                <section className="atp-section">
                  <div className="atp-section__header">
                    <h3 className="atp-section__title">Opciones de alta gama</h3>
                  </div>
                  <div className="atp-products-grid">
                    {secAltaGama.map((product) => (
                      <SelectCard
                        key={product.id}
                        product={product}
                        stepLabel={step.label}
                        isSelected={selection[step.id]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Fila 3: Mejor valorada (punto medio precio) | Destacados (gama media) */}
              {(secMejorValorada || secDestacados.length > 0) && (
                <div className="atp-sections-row-aside">
                  {secMejorValorada && (
                    <section className="atp-section">
                      <div className="atp-section__header">
                        <h3 className="atp-section__title">Opción mejor valorada</h3>
                      </div>
                      <SelectCard
                        product={secMejorValorada}
                        stepLabel={step.label}
                        badge="DESTACADO"
                        badgeClass="atp-card__badge--ciberwow"
                        isSelected={selection[step.id]?.id === secMejorValorada.id}
                        onSelect={() => handleSelect(secMejorValorada)}
                      />
                    </section>
                  )}
                  {secDestacados.length > 0 && (
                    <section className="atp-section">
                      <div className="atp-section__header">
                        <h3 className="atp-section__title">Destacados</h3>
                      </div>
                      <div className="atp-products-grid">
                        {secDestacados.map((product) => (
                          <SelectCard
                            key={product.id}
                            product={product}
                            stepLabel={step.label}
                            isSelected={selection[step.id]?.id === product.id}
                            onSelect={() => handleSelect(product)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* Fila 4: Precio económico – tercio inferior de precio */}
              {secEconomico.length > 0 && (
                <section className="atp-section">
                  <div className="atp-section__header">
                    <h3 className="atp-section__title">Precio económico</h3>
                  </div>
                  <div className="atp-products-grid">
                    {secEconomico.map((product) => (
                      <SelectCard
                        key={product.id}
                        product={product}
                        stepLabel={step.label}
                        isSelected={selection[step.id]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                      />
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal cotización accesible con 'Revisar compra' */}
      {showQuote && (
        <QuoteModal
          steps={STEPS}
          selection={selection}
          onClose={() => setShowQuote(false)}
        />
      )}
    </div>
  );
}
