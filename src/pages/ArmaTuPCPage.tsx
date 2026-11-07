import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "../components/home/ProductCard";
import { buildNormalizedProduct } from "../utils/productUtils";
import {
  X,
  CheckCircle2,
  Check,
  AlertCircle,
} from "lucide-react";

// ─── Iconos SVG del Stepper según diseño Figma ────────────────────────────────
function IconCpu({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  );
}

function IconMobo({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="6" y="6" width="6" height="6" />
      <path d="M15 6h3v3h-3zM15 12h3M15 15h3M6 15h6v3H6zM15 18h3" />
    </svg>
  );
}

function IconRam({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3v2h-2v-2H9v2H7v-2H4a2 2 0 0 1-2-2z" />
      <path d="M6 9h2v4H6zm5 0h2v4h-2zm5 0h2v4h-2z" />
    </svg>
  );
}

function IconStorage({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M6 4v5h12V4" />
      <circle cx="12" cy="14.5" r="2.5" />
    </svg>
  );
}

function IconGpu({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="8" cy="12" r="3" />
      <circle cx="16" cy="12" r="3" />
      <path d="M8 9v6M5 12h6M16 9v6M13 12h6M2 10h-1M2 14h-1" />
    </svg>
  );
}

function IconPsu({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M13 7l-3 5h4l-2 5" />
      <circle cx="17" cy="7" r="1" fill={color} />
      <circle cx="7" cy="17" r="1" fill={color} />
    </svg>
  );
}

function IconCase({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="6" r="1" fill={color} />
      <path d="M8 10h8M8 14h8M8 18h8" />
    </svg>
  );
}

function IconCooler({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 9.5C12 5.5 15.5 5 15.5 5S14 8 14.5 9.5" />
      <path d="M14.5 12c4 0 4.5 3.5 4.5 3.5S16 14 14.5 14.5" />
      <path d="M12 14.5c0 4-3.5 4.5-3.5 4.5S10 16 9.5 14.5" />
      <path d="M9.5 12c-4 0-4.5-3.5-4.5-3.5S8 10 9.5 9.5" />
    </svg>
  );
}

function IconMonitor({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function IconPeripherals({ active }: { active: boolean }) {
  const color = active ? "#ffffff" : "#6b7280";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="10" height="15" rx="5" />
      <path d="M7 4v4" />
      <path d="M16 6a4 4 0 0 1 4 4v7a3 3 0 0 1-3 3h-1" />
      <path d="M15 13h2v4h-2z" />
    </svg>
  );
}

// ─── Definición de pasos ──────────────────────────────────────────────────────

interface Step {
  id: string;
  label: string;
  categorySlug: string;
  optional?: boolean;
  renderIcon: (active: boolean) => React.ReactNode;
}

const STEPS: Step[] = [
  { id: "procesador",     label: "PROCESADOR",       categorySlug: "procesadores",         renderIcon: (a) => <IconCpu active={a} /> },
  { id: "placa-madre",    label: "PLACA MADRE",      categorySlug: "placa-madre",          renderIcon: (a) => <IconMobo active={a} /> },
  { id: "memoria-ram",    label: "MEMORIA RAM",      categorySlug: "memoria-ram",          renderIcon: (a) => <IconRam active={a} /> },
  { id: "almacenamiento", label: "ALMACENAMIENTO",   categorySlug: "memoria-ssd",          renderIcon: (a) => <IconStorage active={a} /> },
  { id: "tarjeta-video",  label: "TARJETA DE VIDEO", categorySlug: "tarjeta-grafica",      renderIcon: (a) => <IconGpu active={a} /> },
  { id: "fuente-poder",   label: "FUENTE DE PODER",  categorySlug: "fuente-poder",         renderIcon: (a) => <IconPsu active={a} />, optional: true },
  { id: "case",           label: "CASE/GABINETE",    categorySlug: "case",                 renderIcon: (a) => <IconCase active={a} />, optional: true },
  { id: "refrigeracion",  label: "REFRIGERACIÓN",    categorySlug: "refrigeracion",        renderIcon: (a) => <IconCooler active={a} />, optional: true },
  { id: "monitor",        label: "MONITOR",          categorySlug: "monitores",            renderIcon: (a) => <IconMonitor active={a} />, optional: true },
  { id: "perifericos",    label: "PERIFÉRICOS",      categorySlug: "perifericos",          renderIcon: (a) => <IconPeripherals active={a} />, optional: true },
];

type Selection = Record<string, Product | null>;

const normalize = (text: string) =>
  (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const buildProduct = (id: string, data: Record<string, unknown>): Product => {
  return buildNormalizedProduct(id, data);
};

// ─── Detección de Socket, Generación y Compatibilidad ─────────────────────────

type CpuSocket = "LGA1700" | "LGA1200" | "LGA1151" | "AM4" | "AM5" | "OTHER";
type RamType = "DDR4" | "DDR5" | "DDR3";

function detectCpuInfo(name: string): { socket: CpuSocket; ram: RamType } {
  const n = normalize(name);

  // Intel 12va, 13va, 14va Gen (LGA1700)
  if (
    n.includes("12100") || n.includes("12400") || n.includes("12600") || n.includes("12700") || n.includes("12900") ||
    n.includes("13100") || n.includes("13400") || n.includes("13600") || n.includes("13700") || n.includes("13900") ||
    n.includes("14100") || n.includes("14400") || n.includes("14600") || n.includes("14700") || n.includes("14900") ||
    n.includes("lga 1700") || n.includes("lga1700")
  ) {
    return { socket: "LGA1700", ram: "DDR4" };
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
    n.includes("7500") || n.includes("7600") || n.includes("7700") || n.includes("7800") || n.includes("7900") || n.includes("7950") ||
    n.includes("8400") || n.includes("8500") || n.includes("8600") || n.includes("8700") ||
    n.includes("9600") || n.includes("9700") || n.includes("9800") || n.includes("9900") || n.includes("9950") ||
    n.includes("am5")
  ) {
    return { socket: "AM5", ram: "DDR5" };
  }

  // AMD AM4 (Ryzen 1000 a 5000: 3200G, 3600, 4500, 5500, 5600, 5700, 5800, etc.)
  if (
    n.includes("5600") || n.includes("5700") || n.includes("5800") || n.includes("5500") || n.includes("5300") ||
    n.includes("4600") || n.includes("4500") || n.includes("4100") || n.includes("3600") || n.includes("3700") || n.includes("3200") || n.includes("2600") ||
    n.includes("am4")
  ) {
    return { socket: "AM4", ram: "DDR4" };
  }

  return { socket: "OTHER", ram: "DDR4" };
}

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

function SelectCard({ product, stepLabel, badge, badgeClass, isSelected, onSelect }: SelectCardProps) {
  // Categoría limpia para la tarjeta
  const catLabel = useMemo(() => {
    const n = normalize(product.name);
    if (n.includes("intel")) return "INTEL PROCESADOR";
    if (n.includes("amd") || n.includes("ryzen")) return "AMD PROCESADOR";
    return stepLabel.toUpperCase();
  }, [product.name, stepLabel]);

  return (
    <article
      onClick={onSelect}
      className={`atp-card${isSelected ? " atp-card--selected" : ""}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-pressed={isSelected}
    >
      {badge && (
        <span className={`atp-card__badge ${badgeClass || ""}`}>{badge}</span>
      )}

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

      <p className="atp-card__cat">{catLabel}</p>
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
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  {step.renderIcon(false)}
                </div>
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
  const [selectedPlatform, setSelectedPlatform] = useState<"intel" | "amd" | null>(null);

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
        const items: Product[] = snap.docs
          .map((doc) => buildProduct(doc.id, doc.data() as Record<string, unknown>))
          .filter((p) => !p.enMantenimiento);
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

  // Manejar selección de marca (Intel o AMD)
  const handleSelectPlatform = (platform: "intel" | "amd") => {
    if (selectedPlatform && selectedPlatform !== platform) {
      setSelection((prev) => ({
        ...prev,
        procesador: null,
        "placa-madre": null,
      }));
    }
    setSelectedPlatform(platform);
    setSearch("");
  };

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
        const isCpu = c.includes("procesador") || n.startsWith("procesador") || n.includes("core i") || n.includes("ryzen");
        if (!isCpu) return false;

        // Filtro por plataforma Intel o AMD si está seleccionada
        if (selectedPlatform === "intel") {
          return n.includes("intel") || n.includes("core i") || n.includes("celeron") || n.includes("pentium");
        }
        if (selectedPlatform === "amd") {
          return n.includes("amd") || n.includes("ryzen") || n.includes("athlon");
        }
        return true;
      });
    } else if (stepId === "placa-madre") {
      matched = componentsOnly.filter((p) => {
        const c = normalize(p.category);
        const n = normalize(p.name);
        const isMobo =
          c.includes("placa") ||
          c.includes("mother") ||
          n.includes("b450") ||
          n.includes("b550") ||
          n.includes("b650") ||
          n.includes("b760") ||
          n.includes("h610") ||
          n.includes("h510") ||
          n.includes("a520") ||
          n.includes("z790") ||
          n.includes("x670") ||
          n.includes("h81") ||
          n.includes("h110");
        if (!isMobo) return false;

        // FILTRO DE COMPATIBILIDAD CON EL PROCESADOR O PLATAFORMA SELECCIONADA:
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
        } else if (selectedPlatform === "intel") {
          return (
            n.includes("1700") ||
            n.includes("1200") ||
            n.includes("1151") ||
            n.includes("h610") ||
            n.includes("b760") ||
            n.includes("z790") ||
            n.includes("b660") ||
            n.includes("h510") ||
            n.includes("b460") ||
            n.includes("h410") ||
            n.includes("h81") ||
            n.includes("h110") ||
            n.includes("lga")
          );
        } else if (selectedPlatform === "amd") {
          return (
            n.includes("am4") ||
            n.includes("am5") ||
            n.includes("a320") ||
            n.includes("a520") ||
            n.includes("b450") ||
            n.includes("b550") ||
            n.includes("x570") ||
            n.includes("a620") ||
            n.includes("b650") ||
            n.includes("x670") ||
            n.includes("b850")
          );
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
  }, [allDbProducts, step.id, selectedPlatform, cpuInfo]);

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
    // Si estamos en procesadores y viendo el catálogo, volver a seleccionar Intel/AMD
    if (currentStep === 0 && selectedPlatform !== null) {
      setSelectedPlatform(null);
      setSelection((prev) => ({
        ...prev,
        procesador: null,
      }));
      setSearch("");
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setSearch("");
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  // 6. Clasificación de Procesadores Intel (según Image 2)
  const intelSections = useMemo(() => {
    if (step.id !== "procesador" || selectedPlatform !== "intel") return null;

    const procs = [...filteredProducts];
    const s1Estudio: Product[] = [];
    const s2Comienzos: Product[] = [];
    const s3Multitarea: Product[] = [];
    const s4Avanzado: Product[] = [];
    const s5AltoRendimiento: Product[] = [];

    const classified = new Set<string>();

    procs.forEach((p) => {
      const n = normalize(p.name);
      // Tareas básicas: i3 10ma / Celeron / Pentium
      if (n.includes("10100") || n.includes("10105") || n.includes("celeron") || n.includes("pentium") || n.includes("g6400")) {
        s1Estudio.push(p);
        classified.add(p.id);
      }
      // Comienzos gaming: i3 12va / 13va / 14va
      else if (n.includes("12100") || n.includes("13100") || n.includes("14100")) {
        s2Comienzos.push(p);
        classified.add(p.id);
      }
      // Gaming o multitarea: i5 no K (10400, 11400, 12400, 13400, 14400)
      else if (
        (n.includes("i5") || n.includes("core i5")) &&
        (n.includes("10400") || n.includes("11400") || n.includes("12400") || n.includes("13400") || n.includes("14400") || n.includes("10500") || n.includes("11500") || n.includes("12500")) &&
        !n.includes("12600") && !n.includes("13600") && !n.includes("14600")
      ) {
        s3Multitarea.push(p);
        classified.add(p.id);
      }
      // Gaming avanzado: i5 K (12600K, 13600K, 14600K) o i7 estándar (12700, 13700, 14700)
      else if (
        n.includes("12600k") || n.includes("13600k") || n.includes("14600k") ||
        ((n.includes("i7") || n.includes("core i7")) && (n.includes("12700") || n.includes("13700") || n.includes("14700")) && !n.includes("kf") && !n.includes("14700k"))
      ) {
        s4Avanzado.push(p);
        classified.add(p.id);
      }
      // Alto rendimiento: i7 K / KF / i9 (14700k, 14700kf, 13700k, 12700k, 10700k, 11700k, 12900, 13900, 14900)
      else if (
        n.includes("i9") || n.includes("core i9") ||
        n.includes("14700k") || n.includes("14700kf") || n.includes("13700k") || n.includes("12700k") || n.includes("10700k") || n.includes("11700k")
      ) {
        s5AltoRendimiento.push(p);
        classified.add(p.id);
      }
    });

    // Asignación de procesadores que no hayan entrado en los filtros estrictos por precio
    procs.forEach((p) => {
      if (!classified.has(p.id)) {
        if (p.price < 500) s1Estudio.push(p);
        else if (p.price < 750) s2Comienzos.push(p);
        else if (p.price < 1000) s3Multitarea.push(p);
        else if (p.price < 1500) s4Avanzado.push(p);
        else s5AltoRendimiento.push(p);
      }
    });

    return {
      secEstudio: s1Estudio,
      secComienzos: s2Comienzos,
      secMultitarea: s3Multitarea,
      secAvanzado: s4Avanzado,
      secAltoRendimiento: s5AltoRendimiento,
    };
  }, [filteredProducts, step.id, selectedPlatform]);

  // 7. Clasificación de Procesadores AMD (según Image 3)
  const amdSections = useMemo(() => {
    if (step.id !== "procesador" || selectedPlatform !== "amd") return null;

    const procs = [...filteredProducts];
    const s1Estudio: Product[] = [];
    const s2Comienzos: Product[] = [];
    const s3Multitarea: Product[] = [];
    const s4Avanzado: Product[] = [];
    const s5AltoRendimiento: Product[] = [];

    const classified = new Set<string>();

    procs.forEach((p) => {
      const n = normalize(p.name);
      // Tareas básicas: Ryzen 3 / Athlon / Ryzen 5 4500
      if (n.includes("3200g") || n.includes("3100") || n.includes("4100") || n.includes("4500") || n.includes("athlon")) {
        s1Estudio.push(p);
        classified.add(p.id);
      }
      // Comienzos gaming: Ryzen 5 5000 mainstream (5500, 5600, 5600g, 5600gt, 5600x)
      else if (n.includes("5500") || n.includes("5600")) {
        s2Comienzos.push(p);
        classified.add(p.id);
      }
      // Multitarea: Ryzen 5 7000 / 8000 (7600, 7600x, 8400f, 8500g, 8600g)
      else if (
        n.includes("7500") || n.includes("7600") || n.includes("8400") || n.includes("8500") || n.includes("8600") || n.includes("9600")
      ) {
        s3Multitarea.push(p);
        classified.add(p.id);
      }
      // Gaming avanzado: Ryzen 7 (5700x, 5700x3d, 5800x, 5800xt, 7700)
      else if (
        (n.includes("5700") || n.includes("5800") || n.includes("7700")) && !n.includes("7800")
      ) {
        s4Avanzado.push(p);
        classified.add(p.id);
      }
      // Alto rendimiento: Ryzen 7 X3D (7800x3d) o Ryzen 9 (7900, 7950, 9900, 9950)
      else if (
        n.includes("7800x3d") || n.includes("9800x3d") || n.includes("ryzen 9") || n.includes("7900") || n.includes("7950") || n.includes("9900") || n.includes("9950")
      ) {
        s5AltoRendimiento.push(p);
        classified.add(p.id);
      }
    });

    // Fallback para no omitir ningún producto de la base de datos
    procs.forEach((p) => {
      if (!classified.has(p.id)) {
        if (p.price < 400) s1Estudio.push(p);
        else if (p.price < 700) s2Comienzos.push(p);
        else if (p.price < 950) s3Multitarea.push(p);
        else if (p.price < 1400) s4Avanzado.push(p);
        else s5AltoRendimiento.push(p);
      }
    });

    return {
      secEstudio: s1Estudio,
      secComienzos: s2Comienzos,
      secMultitarea: s3Multitarea,
      secAvanzado: s4Avanzado,
      secAltoRendimiento: s5AltoRendimiento,
    };
  }, [filteredProducts, step.id, selectedPlatform]);

  // 8. Secciones para los demás componentes (Placa Madre, etc. - según Image 4)
  const generalSections = useMemo(() => {
    if (step.id === "procesador") return null;

    const empty = {
      secGamingAlto: [] as Product[],
      secOficinaBasico: [] as Product[],
      secMejorValorada: null as Product | null,
      secPreciosEconomicos: [] as Product[],
      secPrecioEconomico: [] as Product[],
      secNuestrosProductos: [] as Product[],
    };

    if (filteredProducts.length === 0) return empty;

    const sorted = [...filteredProducts].sort((a, b) => b.price - a.price);
    const withPrice = sorted.filter((p) => p.price > 0);

    if (withPrice.length === 0) {
      return { ...empty, secNuestrosProductos: filteredProducts };
    }

    const prices = withPrice.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;

    const highCut = min + range * 0.65;
    const midCut = min + range * 0.35;

    // Alta gama
    const gamingAlto = sorted.filter((p) => p.price >= highCut).slice(0, 4);

    // Oficina / básico (rango medio/alto)
    const oficinaBasico = sorted
      .filter((p) => p.price < highCut && p.price >= midCut)
      .slice(0, 4);

    // Mejor valorada (producto con precio representativo)
    const midPrice = min + range * 0.5;
    const mejorValorada = withPrice.reduce((best, p) =>
      Math.abs(p.price - midPrice) < Math.abs(best.price - midPrice) ? p : best
    );

    // Precios económicos
    const preciosEconomicos = sorted
      .filter((p) => p.price < midCut && p.price > 0 && p.id !== mejorValorada?.id)
      .slice(0, 4);

    // Precio económico (rango más accesible)
    const precioEconomico = sorted
      .filter((p) => p.price <= min + range * 0.2 && p.id !== mejorValorada?.id)
      .slice(0, 4);

    // Resto en Nuestros productos
    const usedIds = new Set([
      ...gamingAlto.map((p) => p.id),
      ...oficinaBasico.map((p) => p.id),
      mejorValorada?.id,
      ...preciosEconomicos.map((p) => p.id),
      ...precioEconomico.map((p) => p.id),
    ].filter(Boolean));

    const nuestrosProductos = filteredProducts.filter((p) => !usedIds.has(p.id));

    return {
      secGamingAlto: gamingAlto,
      secOficinaBasico: oficinaBasico,
      secMejorValorada: mejorValorada,
      secPreciosEconomicos: preciosEconomicos,
      secPrecioEconomico: precioEconomico,
      secNuestrosProductos: nuestrosProductos,
    };
  }, [filteredProducts, step.id]);

  return (
    <div className="home-page bg-white min-h-screen flex flex-col font-sans">
      <Navbar />
      <SecondaryNav />

      <main className="atp-page w-full flex-1">
        {/* ── Breadcrumb idéntico a la imagen ── */}
        <div className="atp-breadcrumb">
          <button onClick={() => navigate("/")} className="atp-breadcrumb__back">
            <span className="atp-breadcrumb__arrow">←</span>
            <span>Home/Arma tu pc</span>
          </button>
        </div>

        {/* ── Banner hero rosado estilo Figma ── */}
        <div className="atp-hero">
          <h1 className="atp-hero__title">PASOS PARA ARMAR TU PC</h1>
          <button className="atp-hero__review-btn" onClick={() => setShowQuote(true)}>
            Revisar PC
          </button>
        </div>

        {/* ── Stepper de 10 iconos circulares según Image 1 ── */}
        <div className="atp-stepper">
          {STEPS.map((s, idx) => {
            const isDone = !!selection[s.id];
            const isActive = idx === currentStep;
            return (
              <button
                key={s.id}
                className={`atp-stepper__item${isActive ? " atp-stepper__item--active" : ""}${isDone ? " atp-stepper__item--done" : ""}`}
                onClick={() => {
                  if (idx === 0 && currentStep === 0) {
                    setSelectedPlatform(null);
                    setSelection((prev) => ({
                      ...prev,
                      procesador: null,
                    }));
                  }
                  setCurrentStep(idx);
                  setSearch("");
                }}
                aria-label={s.label}
                aria-current={isActive ? "step" : undefined}
              >
                <div className="atp-stepper__icon-wrap">
                  {s.renderIcon(isActive)}
                </div>
                <span className="atp-stepper__label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Área de contenido a ancho completo ── */}
        <div className="atp-content-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
          {/* Encabezado del paso */}
          <div className="atp-step-header mb-4 flex flex-wrap items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#e81950] tracking-tight uppercase">
              {step.label}
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              Revisa tu progeso en la opcion "revisar compra"
            </span>
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
              fontSize: "0.85rem",
              color: "#1e40af",
            }}>
              <AlertCircle size={18} />
              <span>
                Filtro de compatibilidad activo con tu <strong>{selectedCpu.name}</strong> ({cpuInfo?.socket}). Mostrando únicamente componentes 100% compatibles.
              </span>
            </div>
          )}

          {/* Barra de controles: Anterior / Buscar / Omitir */}
          <div className="atp-controls mb-6">
            <button
              className="atp-controls__prev"
              onClick={handlePrev}
              disabled={currentStep === 0 && selectedPlatform === null}
            >
              ← Anterior
            </button>

            <div className="atp-controls__search-wrap flex-1">
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

          {/* ══════════════════════════════════════════════════════════════════════
              CASO 1: PASO PROCESADOR SIN PLATAFORMA SELECCIONADA (Image 1)
             ══════════════════════════════════════════════════════════════════════ */}
          {currentStep === 0 && selectedPlatform === null ? (
            <div className="atp-platform-wrap">
              <h3 className="atp-platform-title">Selecciona tu plataforma</h3>
              <p className="atp-platform-subtitle">
                Elige si quieres armar tu PC con Intel o AMD para filtrar los componentes compatibles.
              </p>

              <div className="atp-platform-grid">
                {/* Tarjeta Intel */}
                <button
                  type="button"
                  onClick={() => handleSelectPlatform("intel")}
                  className="atp-platform-card"
                  aria-label="Plataforma Intel"
                >
                  <img
                    src="/armatupc-proce/intel.png"
                    alt="Intel"
                    className="atp-platform-img"
                  />
                </button>

                {/* Tarjeta AMD */}
                <button
                  type="button"
                  onClick={() => handleSelectPlatform("amd")}
                  className="atp-platform-card"
                  aria-label="Plataforma AMD Ryzen"
                >
                  <img
                    src="/armatupc-proce/AMD.png"
                    alt="AMD Ryzen"
                    className="atp-platform-img"
                  />
                </button>
              </div>
            </div>
          ) : loading ? (
            /* Estado de carga */
            <div className="atp-loading">Cargando catálogo de productos...</div>
          ) : filteredProducts.length === 0 ? (
            /* Estado vacío */
            <div className="atp-empty">
              No hay productos registrados en esta categoría aún en la base de datos.
              <br />
              <small style={{ color: "#9ca3af", marginTop: "0.5rem", display: "inline-block" }}>
                Puedes hacer clic en <strong>'Omitir este paso →'</strong> para continuar con los demás componentes.
              </small>
            </div>
          ) : search.trim() ? (
            /* ══════════════════════════════════════════════════════════════════════
                VISTA DE BÚSQUEDA ACTIVA
               ══════════════════════════════════════════════════════════════════════ */
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
          ) : currentStep === 0 && selectedPlatform === "intel" && intelSections ? (
            /* ══════════════════════════════════════════════════════════════════════
                CASO 2: PROCESADORES INTEL (Image 2)
               ══════════════════════════════════════════════════════════════════════ */
            <div className="atp-sections-wrap">
              {/* Fila 1: 2 Columnas (Estudio | Comienzos gaming) */}
              <div className="atp-sections-row-2col">
                {intelSections.secEstudio.length > 0 && (
                  <section className="atp-section">
                    <div className="atp-section__header">
                      <h3 className="atp-section__title">Procesador para estudio o tareas basicas</h3>
                    </div>
                    <div className="atp-products-grid">
                      {intelSections.secEstudio.map((product) => (
                        <SelectCard
                          key={product.id}
                          product={product}
                          stepLabel="INTEL PROCESADOR"
                          isSelected={selection[step.id]?.id === product.id}
                          onSelect={() => handleSelect(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {intelSections.secComienzos.length > 0 && (
                  <section className="atp-section">
                    <div className="atp-section__header">
                      <h3 className="atp-section__title">Ideal para tus comienzos gaming</h3>
                    </div>
                    <div className="atp-products-grid">
                      {intelSections.secComienzos.map((product) => (
                        <SelectCard
                          key={product.id}
                          product={product}
                          stepLabel="INTEL PROCESADOR"
                          isSelected={selection[step.id]?.id === product.id}
                          onSelect={() => handleSelect(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Fila 2: Gaming o multitarea */}
              {intelSections.secMultitarea.length > 0 && (
                <section className="atp-section mb-10">
                  <div className="atp-section__header">
                    <h3 className="atp-section__title">Procesador para gaming o multitarea</h3>
                  </div>
                  <div className="atp-products-grid">
                    {intelSections.secMultitarea.map((product) => (
                      <SelectCard
                        key={product.id}
                        product={product}
                        stepLabel="INTEL PROCESADOR"
                        isSelected={selection[step.id]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Fila 3: Gaming avanzado y creación de contenido */}
              {intelSections.secAvanzado.length > 0 && (
                <section className="atp-section mb-10">
                  <div className="atp-section__header">
                    <h3 className="atp-section__title">Procesador para gaming avanzado y creación de contenido</h3>
                  </div>
                  <div className="atp-products-grid">
                    {intelSections.secAvanzado.map((product) => (
                      <SelectCard
                        key={product.id}
                        product={product}
                        stepLabel="INTEL PROCESADOR"
                        isSelected={selection[step.id]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Fila 4: Procesadores de alto rendimiento */}
              {intelSections.secAltoRendimiento.length > 0 && (
                <section className="atp-section mb-10">
                  <div className="atp-section__header">
                    <h3 className="atp-section__title">Procesadores de alto rendimiento</h3>
                  </div>
                  <div className="atp-products-grid">
                    {intelSections.secAltoRendimiento.map((product) => (
                      <SelectCard
                        key={product.id}
                        product={product}
                        stepLabel="INTEL PROCESADOR"
                        isSelected={selection[step.id]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : currentStep === 0 && selectedPlatform === "amd" && amdSections ? (
            /* ══════════════════════════════════════════════════════════════════════
                CASO 3: PROCESADORES AMD (Image 3)
               ══════════════════════════════════════════════════════════════════════ */
            <div className="atp-sections-wrap">
              {/* Fila 1: 2 Columnas (Estudio | Comienzos gaming) */}
              <div className="atp-sections-row-2col">
                {amdSections.secEstudio.length > 0 && (
                  <section className="atp-section">
                    <div className="atp-section__header">
                      <h3 className="atp-section__title">Procesador para estudio o tareas basicas</h3>
                    </div>
                    <div className="atp-products-grid">
                      {amdSections.secEstudio.map((product) => (
                        <SelectCard
                          key={product.id}
                          product={product}
                          stepLabel="AMD PROCESADOR"
                          isSelected={selection[step.id]?.id === product.id}
                          onSelect={() => handleSelect(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {amdSections.secComienzos.length > 0 && (
                  <section className="atp-section">
                    <div className="atp-section__header">
                      <h3 className="atp-section__title">Ideal para tus comienzos gaming</h3>
                    </div>
                    <div className="atp-products-grid">
                      {amdSections.secComienzos.map((product) => (
                        <SelectCard
                          key={product.id}
                          product={product}
                          stepLabel="AMD PROCESADOR"
                          isSelected={selection[step.id]?.id === product.id}
                          onSelect={() => handleSelect(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Fila 2: Gaming o multitarea */}
              {amdSections.secMultitarea.length > 0 && (
                <section className="atp-section mb-10">
                  <div className="atp-section__header">
                    <h3 className="atp-section__title">Procesador para gaming o multitarea</h3>
                  </div>
                  <div className="atp-products-grid">
                    {amdSections.secMultitarea.map((product) => (
                      <SelectCard
                        key={product.id}
                        product={product}
                        stepLabel="AMD PROCESADOR"
                        isSelected={selection[step.id]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Fila 3: 2 Columnas (Gaming avanzado | Alto rendimiento) */}
              <div className="atp-sections-row-2col">
                {amdSections.secAvanzado.length > 0 && (
                  <section className="atp-section">
                    <div className="atp-section__header">
                      <h3 className="atp-section__title">Procesador para gaming avanzado y creación de contenido</h3>
                    </div>
                    <div className="atp-products-grid">
                      {amdSections.secAvanzado.map((product) => (
                        <SelectCard
                          key={product.id}
                          product={product}
                          stepLabel="AMD PROCESADOR"
                          isSelected={selection[step.id]?.id === product.id}
                          onSelect={() => handleSelect(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {amdSections.secAltoRendimiento.length > 0 && (
                  <section className="atp-section">
                    <div className="atp-section__header">
                      <h3 className="atp-section__title">Procesadores de alto rendimiento</h3>
                    </div>
                    <div className="atp-products-grid">
                      {amdSections.secAltoRendimiento.map((product) => (
                        <SelectCard
                          key={product.id}
                          product={product}
                          stepLabel="AMD PROCESADOR"
                          isSelected={selection[step.id]?.id === product.id}
                          onSelect={() => handleSelect(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : generalSections ? (
            /* ══════════════════════════════════════════════════════════════════════
                CASO 4: PLACA MADRE Y DEMÁS PASOS (Image 4)
               ══════════════════════════════════════════════════════════════════════ */
            <div className="atp-sections-wrap">
              {/* Fila 1: Opciones gaming alto rendimiento | Opciones oficina/estudio/gaming básico */}
              {(generalSections.secGamingAlto.length > 0 || generalSections.secOficinaBasico.length > 0) && (
                <div className="atp-sections-row-2col">
                  {generalSections.secGamingAlto.length > 0 && (
                    <section className="atp-section">
                      <div className="atp-section__header">
                        <h3 className="atp-section__title">Opciones gaming de alto rendimiento</h3>
                      </div>
                      <div className="atp-products-grid">
                        {generalSections.secGamingAlto.map((product) => (
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

                  {generalSections.secOficinaBasico.length > 0 && (
                    <section className="atp-section">
                      <div className="atp-section__header">
                        <h3 className="atp-section__title">Opciones para oficina, estudio y gaming básico</h3>
                      </div>
                      <div className="atp-products-grid">
                        {generalSections.secOficinaBasico.map((product) => (
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

              {/* Fila 2: Opción mejor valorada | Precios económicos */}
              {(generalSections.secMejorValorada || generalSections.secPreciosEconomicos.length > 0) && (
                <div className="atp-sections-row-aside">
                  {generalSections.secMejorValorada && (
                    <section className="atp-section">
                      <div className="atp-section__header">
                        <h3 className="atp-section__title">Opcion mejor valorada</h3>
                      </div>
                      <SelectCard
                        product={generalSections.secMejorValorada}
                        stepLabel={step.label}
                        badge="CIBERWOW"
                        badgeClass="atp-card__badge--ciberwow"
                        isSelected={selection[step.id]?.id === generalSections.secMejorValorada.id}
                        onSelect={() => handleSelect(generalSections.secMejorValorada!)}
                      />
                    </section>
                  )}

                  {generalSections.secPreciosEconomicos.length > 0 && (
                    <section className="atp-section">
                      <div className="atp-section__header">
                        <h3 className="atp-section__title">Precios economicos</h3>
                      </div>
                      <div className="atp-products-grid">
                        {generalSections.secPreciosEconomicos.map((product) => (
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

              {/* Fila 3: Precio económico */}
              {generalSections.secPrecioEconomico.length > 0 && (
                <section className="atp-section mb-10">
                  <div className="atp-section__header">
                    <h3 className="atp-section__title">Precio economico</h3>
                  </div>
                  <div className="atp-products-grid">
                    {generalSections.secPrecioEconomico.map((product) => (
                      <SelectCard
                        key={product.id}
                        product={product}
                        stepLabel={step.label}
                        badge="NUEVO"
                        isSelected={selection[step.id]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Fila 4: Nuestros productos (el resto del catálogo sin repetir) */}
              {generalSections.secNuestrosProductos.length > 0 && (
                <section className="atp-section mb-10">
                  <div className="atp-section__header">
                    <h3 className="atp-section__title">Nuestros productos</h3>
                  </div>
                  <div className="atp-products-grid">
                    {generalSections.secNuestrosProductos.map((product) => (
                      <SelectCard
                        key={product.id}
                        product={product}
                        stepLabel={step.label}
                        badge="NUEVO"
                        isSelected={selection[step.id]?.id === product.id}
                        onSelect={() => handleSelect(product)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : null}

          {/* ── Banner de Boletín según Image 2, 3, 4 ── */}
          <div className="atp-newsletter-bar">
            <span className="atp-newsletter-bar__text">
              Suscríbete a Nuestro Boletín Obtén la información sobre eventos, ventas y ofertas.
            </span>
            <button
              className="atp-newsletter-bar__btn"
              onClick={() => alert("¡Gracias por suscribirte a nuestro boletín!")}
            >
              Suscribirme
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal cotización accesible con 'Revisar PC' */}
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

export default ArmaTuPCPage;
