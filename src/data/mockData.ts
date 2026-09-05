import type { Product } from "../components/home/ProductCard";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "PLACA MADRE ROG GAMING H61M LGA 1150",
    category: "PLACA MADRE",
    price: 160,
    imageUrl: "",
  },
  {
    id: "2",
    name: "MEMORIA RAM CORSAIR VENGEANCE DDR4 16GB 2X8GB 3200 MHZ RGB",
    category: "MEMORIA RAM",
    price: 1000,
    imageUrl: "",
  },
  {
    id: "3",
    name: "SSD PNY CS900",
    category: "DISCO SSD",
    price: 1000,
    imageUrl: "",
  },
  {
    id: "4",
    name: "PC GAMER INTEL CORE I5 12400F + RTX 3060 12GB + 32GB DDR4",
    category: "GAMING",
    price: 3990,
    imageUrl: "",
  },
  {
    id: "5",
    name: "PROCESADOR INTEL CORE I3 10100F",
    category: "PROCESADORES",
    price: 400,
    imageUrl: "",
  },
  {
    id: "6",
    name: "TARJETA DE VIDEO GIGABYTE RTX 4060 OC 8GB GDDR6",
    category: "TARJETA DE VIDEO",
    price: 1850,
    imageUrl: "",
  },
  {
    id: "7",
    name: "MONITOR ASUS TUF VG27AQ 27\" IPS 165HZ",
    category: "MONITORES",
    price: 1200,
    imageUrl: "",
  },
  {
    id: "8",
    name: "FUENTE DE PODER CORSAIR CV650 650W 80 PLUS BRONZE",
    category: "FUENTE DE PODER",
    price: 320,
    imageUrl: "",
  },
  {
    id: "9",
    name: "GABINETE NZXT H510 FLOW ATX NEGRO",
    category: "GABINETES",
    price: 450,
    imageUrl: "",
  },
  {
    id: "10",
    name: "REFRIGERACIÓN LÍQUIDA CORSAIR H100X RGB 240MM",
    category: "REFRIGERACIÓN",
    price: 680,
    imageUrl: "",
  },
];

// ── Slides del hero carousel ─────────────────────────────────────────────────
export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string; 
  accent: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: "PC GAMER RTX 4060",
    subtitle: "Potencia brutal para gaming 1080p y 1440p. Desde S/3,990",
    cta: "Ver ahora",
    href: "#",
    bg: "linear-gradient(135deg, #0f0f0f 0%, #1a0000 50%, #2d0000 100%)",
    accent: "#e11d24",
  },
  { 
    id: 2,
    title: "ARMA TU PC GAMER",
    subtitle: "Componentes de última generación con garantía y envío rápido",
    cta: "Explorar",
    href: "#",
    bg: "linear-gradient(135deg, #0a0a1a 0%, #0d1a2d 50%, #0a1a0d 100%)",
    accent: "#2563eb",
  },
  {
    id: 3,
    title: "OFERTAS DE LA SEMANA",
    subtitle: "Descuentos hasta 30% en procesadores y memorias RAM",
    cta: "Ver ofertas",
    href: "#",
    bg: "linear-gradient(135deg, #0f0f0f 0%, #1a1a00 50%, #2d2200 100%)",
    accent: "#d97706",
  },
];

// ── Banners promocionales ────────────────────────────────────────────────────
export interface PromoBanner {
  id: number;
  label: string;
  text: string;
  sub: string;
  bg: string;
  color: string;
}

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 1,
    label: "Paga en cuotas",
    text: "Hasta 12 cuotas sin intereses",
    sub: "Con Visa y Mastercard",
    bg: "#1e3a5f",
    color: "#fff",
  },
  {
    id: 2,
    label: "Envío gratis",
    text: "Envío gratis a Lima",
    sub: "En compras mayores a S/500",
    bg: "#14532d",
    color: "#fff",
  },
  {
    id: 3,
    label: "Garantía",
    text: "1 año de garantía",
    sub: "En todos nuestros productos",
    bg: "#7f1d1d",
    color: "#fff",
  },
];
