import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";
import { Footer } from "../components/home/Footer";
import { ProductCard } from "../components/home/ProductCard";
import type { Product } from "../components/home/ProductCard";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { buildNormalizedProduct, normalizeDocumentData, resolveProductCategory, resolveProductSubcategory } from "../utils/productUtils";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Normaliza texto: minúsculas, sin tildes, sin guiones → espacios */
const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // quita tildes
    .replace(/-/g, " ")               // guiones → espacios
    .replace(/[^a-z0-9 ]+/g, "")      // quita otros caracteres especiales para comparar
    .trim();

export const normalizeSlug = (text: string) => 
  text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

/**
 * Mapa de id-de-ruta → términos que pueden aparecer en el campo "categoria"
 * de Firestore (ya normalizados). Si el valor normalizado del campo contiene
 * alguno de estos términos, el producto pertenece a esta categoría.
 */
const CATEGORY_TERMS: Record<string, string[]> = {
  // Monitores
  "monitores":         ["monitor", "pantalla"],
  "monitor":           ["monitor", "pantalla"],

  // Case
  "case":              ["case", "gabinete", "caja", "chasis"],
  "cases":             ["case", "gabinete", "caja", "chasis"],

  // PC Completa y variaciones
  "pc-completa":       ["pc completa", "pc-completa", "computadora completa", "equipo completo", "computadora pc", "computadora gamer", "computadora", "pc gamer", "pc oficina", "pc ingenieria", "pc completo"],
  "pc-gamer":          ["pc completa gamer", "pc gamer", "computadora gamer", "gamer", "gaming"],
  "pc-oficina":        ["pc completa oficina", "pc oficina", "computadora oficina", "oficina", "estudio"],
  "pc-ingenieria":     ["pc completa ingenieria", "pc completa ingenierias", "ingenieria", "ingenierias", "workstation"],
  "pc-ingenierias":    ["pc completa ingenieria", "pc completa ingenierias", "ingenieria", "ingenierias", "workstation"],
  "pc-diseno":         ["pc completa diseno", "pc completa diseño", "diseno", "diseño", "render"],

  // Disco SSD / Almacenamiento
  "disco-ssd":         ["disco ssd", "ssd", "disco solido", "disco duro ssd", "almacenamiento", "nvme", "m.2", "sata"],
  "memoria-ssd":       ["disco ssd", "ssd", "disco solido", "disco duro ssd", "almacenamiento", "nvme", "m.2", "sata"],
  "discos-ssd":        ["disco ssd", "ssd", "disco solido", "disco duro ssd", "almacenamiento", "nvme", "m.2", "sata"],
  "memorias-ssd":      ["disco ssd", "ssd", "disco solido", "disco duro ssd", "almacenamiento", "nvme", "m.2", "sata"],
  "ssd":               ["disco ssd", "ssd", "disco solido", "disco duro ssd", "almacenamiento", "nvme", "m.2", "sata"],
  "almacenamiento":    ["disco ssd", "ssd", "disco solido", "disco duro ssd", "almacenamiento", "nvme", "m.2", "sata"],

  // Estabilizador
  "estabilizador":     ["estabilizador", "estabilizadores", "ups", "regulador"],
  "estabilizadores":   ["estabilizador", "estabilizadores", "ups", "regulador"],
  "ups":               ["estabilizador", "estabilizadores", "ups", "regulador"],

  // Fuente de poder
  "fuente-de-poder":   ["fuente de poder", "fuente poder", "fuentes de poder", "psu"],
  "fuente-poder":      ["fuente de poder", "fuente poder", "fuentes de poder", "psu"],
  "fuentes-de-poder":  ["fuente de poder", "fuente poder", "fuentes de poder", "psu"],

  // Memoria RAM
  "memoria-ram":       ["memoria ram", "memoria-ram", "memorias ram", "ram"],
  "memoria-rams":      ["memoria ram", "memoria-ram", "memorias ram", "ram"],
  "memorias-ram":      ["memoria ram", "memoria-ram", "memorias ram", "ram"],
  "ram":               ["memoria ram", "memoria-ram", "memorias ram", "ram"],

  // Periféricos
  "perifericos":       ["periferico", "perifericos", "audifonos", "teclado", "mouse", "webcam", "camara", "parlante", "cooler", "kit", "cable", "adaptador", "adaptadores"],
  "periferico":        ["periferico", "perifericos", "audifonos", "teclado", "mouse", "webcam", "camara", "parlante", "cooler", "kit", "cable", "adaptador", "adaptadores"],

  // Placa madre
  "placa-madre":       ["placa madre", "placas madre", "motherboard", "mainboard"],
  "placas-madre":      ["placa madre", "placas madre", "motherboard", "mainboard"],

  // Tarjetas de video
  "tarjetas-de-video": ["tarjeta de video", "tarjetas de video", "tarjeta de videos", "tarjetas de videos", "gpu", "grafica", "graficas", "grafico", "video card"],
  "tarjeta-de-video":  ["tarjeta de video", "tarjetas de video", "tarjeta de videos", "tarjetas de videos", "gpu", "grafica", "graficas", "grafico", "video card"],
  "tarjeta-grafica":   ["tarjeta de video", "tarjetas de video", "tarjeta de videos", "tarjetas de videos", "gpu", "grafica", "graficas", "grafico", "video card"],
  "tarjetas-graficas": ["tarjeta de video", "tarjetas de video", "tarjeta de videos", "tarjetas de videos", "gpu", "grafica", "graficas", "grafico", "video card"],

  // Procesadores
  "procesadores":      ["procesador", "procesadores", "cpu", "intel", "amd ryzen", "ryzen"],
  "procesador":        ["procesador", "procesadores", "cpu", "intel", "amd ryzen", "ryzen"],

  // Laptops
  "laptops":           ["laptop", "laptops", "portatil", "portatiles", "notebook"],
  "laptop":            ["laptop", "laptops", "portatil", "portatiles", "notebook"],

  // Refrigeración líquida
  "refrigeracion":     ["refrigeracion", "refrigeracion liquida", "liquida", "cooler", "enfriamiento"],
  "refrigeracion-liquida": ["refrigeracion", "refrigeracion liquida", "liquida", "cooler", "enfriamiento"],
};

/**
 * Términos adicionales de SUBCATEGORÍA para filtrar dentro de una categoría.
 * Si la subcategoría o título del producto (normalizado) contiene el término, coincide.
 */
const SUBCATEGORY_TERMS: Record<string, string[]> = {
  "monitores-24":      ["24", "238", "23.8", "g24i", "te 24", "2477"],
  "monitores-27":      ["27", "g27i", "g27qi", "gs27qa", "hs2703fc", "te 27"],
  "monitores-34":      ["34", "te 34", "3412g", "curvo", "curved", "wqhd"],
  "gaming":            ["gaming", "gamer", "hz", "144hz", "200hz"],
  "alta-frecuencia":   ["alta frecuencia", "alta-frecuencia", "hz", "144hz", "200hz"],
  "curvos":            ["curvo", "curved"],
  "calidad-de-imagen": ["calidad de imagen", "4k", "2k", "qhd", "uhd", "ips", "oled"],
  "pantalla-grande":   ["pantalla grande", "grande", "32", "34", "27"],
  "oficina-y-estudio": ["oficina", "estudio", "trabajo"],
  "con-fuente":        ["con fuente", "con-fuente"],
  "sin-fuente":        ["sin fuente", "sin-fuente"],
  "compactos":         ["compacto", "mini", "itx"],
  "pc-oficina":        ["oficina", "estudio", "trabajo"],
  "pc-gamer":          ["gamer", "gaming"],
  "pc-combos":         ["monitor", "kit", "combo", "4 en 1", "completa"],
  "pc-ingenierias":    ["ingenieria", "ingenierias", "workstation"],
  "pc-diseno":         ["diseno", "diseño", "render"],
  "intel":             ["intel", "core", "i3", "i5", "i7", "i9"],
  "amd":               ["amd", "ryzen", "am4", "am5"],
  "amd-ryzen":         ["ryzen", "amd"],
  "nvidia-rtx":        ["rtx", "geforce", "nvidia"],
  "amd-radeon":        ["radeon", "rx"],
  "oficina":           ["laptop", "lenovo", "oficina", "estudio", "trabajo", "portatil", "v15"],
  "240mm":             ["240"],
  "360mm":             ["360"],
  "sd-m2":             ["m.2", "m2", "pcie", "nvme"],
  "ssd-m2":            ["m.2", "m2", "pcie", "nvme"],
  "ssd-sata":          ["sata", "2.5"],
  "ddr3":              ["ddr3"],
  "ddr4":              ["ddr4"],
  "ddr5":              ["ddr5"],
  "certificadas":      ["80 plus", "80+", "certificad", "bronze", "gold", "white"],
  "modulares":         ["modular", "semi modular"],
  "adaptador":           ["adaptador", "adaptadores", "converter", "conversor", "dongle"],
  "adaptadores":         ["adaptador", "adaptadores", "converter", "conversor", "dongle"],
  "audifonos":           ["audifono", "auricular", "headset"],
  "cable":               ["cable", "adaptador", "hdmi", "displayport", "vga", "usb"],
  "cables":              ["cable", "adaptador", "hdmi", "displayport", "vga", "usb"],
  "cooler":              ["cooler", "ventilador", "fan"],
  "teclados":            ["teclado", "keyboard"],
  "teclado":             ["teclado", "keyboard"],
  "mouse":               ["mouse", "raton"],
  "parlantes":           ["parlante", "speaker", "bocina"],
  "webcam":              ["webcam", "camara", "camweb", "streaming"],
  "webcam-camara":       ["webcam", "camara", "camweb", "streaming"],
  "combos":              ["kit", "combo", "4 en 1", "kit gamer"],
  "kit-teclado-mouse":   ["kit", "combo teclado", "teclado y mouse"],
  "kit-teclado-y-mouse": ["kit", "combo teclado", "teclado y mouse"],
  "estabilizadores":     ["estabilizador", "regulador"],
  "ups":                 ["ups", "bateria"],
};

/** Devuelve el primer campo que exista en el objeto */
const pickField = (data: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

/** Construye un Product a partir de un doc de Firestore */
const buildProduct = (id: string, data: Record<string, unknown>): Product => {
  return buildNormalizedProduct(id, data);
};

/**
 * Comprueba si un producto pertenece a una categoría dada.
 * SOLO compara contra el campo "categoria" de Firestore — sin fallback al
 * nombre del producto para evitar falsos positivos.
 */
const matchesCategory = (
  data: Record<string, unknown>,
  categoryId: string
): boolean => {
  if (categoryId === "todos" || categoryId === "todos-los-productos") {
    return true;
  }

  const normCatId = normalize(categoryId);
  const terms = CATEGORY_TERMS[categoryId] || CATEGORY_TERMS[normCatId.replace(/\s+/g, "-")] || [normCatId];

  // 1. Obtener campo categoría en Firestore (con todas sus variaciones posibles)
  const catRaw = String(
    pickField(data, ["categoria", "Categoria", "categoría", "Categoría", "category", "Category", "categorias"]) ?? ""
  );
  const catField = normalize(catRaw);

  // 2. Obtener título por si no tiene categoría explícita o para verificar tipo
  const titleField = normalize(
    String(pickField(data, ["titulo", "Titulo", "título", "Título", "nombre", "Nombre", "title", "name"]) ?? "")
  );

  // Exclusiones especiales:
  const isPcOrComputer =
    catField.includes("pc") ||
    catField.includes("computadora") ||
    catField.includes("combo") ||
    titleField.startsWith("pc ") ||
    titleField.startsWith("computadora ");

  // Si se buscan componentes individuales, excluir PC completas que puedan mencionar "ram", "ssd", etc.
  const isComponentSearch = !categoryId.includes("pc");

  if (isComponentSearch && isPcOrComputer) {
    return false;
  }

  // 3. Comparar primero contra el campo categoría de Firestore
  if (catField && terms.some((t) => catField.includes(t))) {
    return true;
  }

  // 4. Si el producto no tiene categoría o es genérica, fallback inteligente por título
  if (!catField || catField === "general" || catField === "producto" || catField === "sin categoria") {
    if (terms.some((t) => titleField.includes(t))) {
      return true;
    }
  }

  // 5. Comparar también contra resolveProductCategory(data)
  const canonicalCategory = normalize(resolveProductCategory(data));
  if (canonicalCategory && terms.some((t) => canonicalCategory.includes(t))) {
    return true;
  }

  return false;
};

/**
 * Comprueba si un producto coincide con una subcategoría.
 * Si es 'todas' o 'todos', muestra todo el catálogo de esa categoría.
 * Utiliza resolveProductSubcategory(data), el campo subcategoría y el título del producto.
 * NUNCA busca en la descripción para evitar que productos con textos de compatibilidad
 * (ej. adaptadores bluetooth que dicen 'sirve para audífonos, teclado y mouse')
 * se mezclen erróneamente en otras subcategorías.
 */
const matchesSubcategory = (
  data: Record<string, unknown>,
  subcategoryId: string,
  categoryId?: string
): boolean => {
  if (!subcategoryId || subcategoryId === "todas" || subcategoryId === "todos") {
    return true;
  }

  const normSubId = normalize(subcategoryId);

  // 1. Extraer campos clave normalizados (SIN descripcion para evitar contaminacion cruzada)
  const subField = normalize(
    String(pickField(data, ["subcategoria", "Subcategoria", "subcategoría", "subcategory"]) ?? "")
  );
  const catField = normalize(
    String(pickField(data, ["categoria", "Categoria", "categoría", "Categoría"]) ?? "")
  );
  const titleField = normalize(
    String(pickField(data, ["titulo", "Titulo", "título", "Título", "nombre", "Nombre", "title", "name"]) ?? "")
  );

  const canonicalSub = normalize(resolveProductSubcategory(data));

  // Periféricos: Aislamiento estricto de subcategorías
  const isAdapterOrCable =
    canonicalSub === "adaptador" ||
    canonicalSub === "cable" ||
    titleField.includes("adaptador") ||
    titleField.includes("dongle") ||
    titleField.includes("converter") ||
    titleField.includes("conversor") ||
    titleField.includes("cable") ||
    subField.includes("adaptador") ||
    subField.includes("cable");

  const isComboOrKit =
    canonicalSub === "kit teclado y mouse" ||
    titleField.includes("kit") ||
    titleField.includes("combo") ||
    titleField.includes("4 en 1") ||
    (titleField.includes("teclado") && titleField.includes("mouse")) ||
    subField.includes("kit") ||
    subField.includes("combo");

  // Subcategoría: AUDIFONOS
  if (normSubId === "audifonos" || normSubId === "audifono" || normSubId === "headset" || normSubId.includes("audifono")) {
    if (isAdapterOrCable || isComboOrKit) return false;
    if (titleField.includes("teclado") || titleField.includes("mouse")) return false;
    return (
      canonicalSub === "audifonos" ||
      subField.includes("audifono") ||
      subField.includes("auricular") ||
      subField.includes("headset") ||
      titleField.includes("audifono") ||
      titleField.includes("auricular") ||
      titleField.includes("headset")
    );
  }

  // Subcategoría: TECLADOS (Teclados Mecánicos)
  if (normSubId === "teclados" || normSubId === "teclado" || normSubId === "keyboard" || normSubId.includes("teclado")) {
    // Excluir adaptadores y cables
    if (isAdapterOrCable) return false;
    // Excluir productos que sean exclusivamente mouse
    if (titleField.includes("mouse") && !titleField.includes("teclado") && !isComboOrKit) return false;
    // Excluir productos que sean exclusivamente audífonos
    if ((titleField.includes("audifono") || titleField.includes("headset") || titleField.includes("auricular")) && !titleField.includes("teclado") && !isComboOrKit) return false;

    return (
      canonicalSub === "teclado" ||
      subField.includes("teclado") ||
      subField.includes("keyboard") ||
      titleField.includes("teclado") ||
      titleField.includes("keyboard") ||
      // Incluir kits y combos con teclado presentes en el catálogo
      (isComboOrKit && (
        titleField.includes("teclado") ||
        titleField.includes("antryx") ||
        titleField.includes("micronics") ||
        titleField.includes("logitech") ||
        subField.includes("teclado")
      ))
    );
  }

  // Subcategoría: MOUSE (Mouse Gamer)
  if (normSubId === "mouse" || normSubId === "raton" || normSubId.includes("mouse")) {
    // Excluir adaptadores y cables
    if (isAdapterOrCable) return false;
    // Excluir combos y teclados para que no contaminen la sección de mouse
    if (isComboOrKit || titleField.includes("teclado") || titleField.includes("keyboard") || subField.includes("teclado")) return false;
    if (titleField.includes("audifono") || titleField.includes("headset")) return false;

    return (
      canonicalSub === "mouse" ||
      subField.includes("mouse") ||
      subField.includes("raton") ||
      titleField.includes("mouse") ||
      titleField.includes("raton") ||
      titleField.includes("pad")
    );
  }

  // Subcategoría: COMBOS / KITS TECLADO + MOUSE
  if (normSubId === "combos" || normSubId === "combo" || normSubId === "kit" || normSubId === "kit teclado mouse" || normSubId === "kit teclado y mouse") {
    if (isAdapterOrCable) return false;
    return (
      canonicalSub === "kit teclado y mouse" ||
      isComboOrKit ||
      subField.includes("kit") ||
      subField.includes("combo")
    );
  }

  // Subcategoría: CABLES Y ADAPTADORES
  if (normSubId === "cables" || normSubId === "cable" || normSubId === "adaptador" || normSubId === "adaptadores") {
    return isAdapterOrCable;
  }

  // Subcategoría: WEBCAM
  if (normSubId === "webcam" || normSubId === "camara" || normSubId === "camweb") {
    return (
      canonicalSub.includes("webcam") ||
      subField.includes("webcam") ||
      subField.includes("camara") ||
      titleField.includes("webcam") ||
      titleField.includes("camara")
    );
  }

  // Subcategoría: COOLER (Periférico)
  if (normSubId === "cooler") {
    return (
      canonicalSub === "cooler" ||
      subField.includes("cooler") ||
      titleField.includes("cooler") ||
      titleField.includes("ventilador") ||
      titleField.includes("fan")
    );
  }

  // Subcategoría: PARLANTES
  if (normSubId === "parlantes" || normSubId === "parlante") {
    return (
      canonicalSub === "parlantes" ||
      subField.includes("parlante") ||
      titleField.includes("parlante") ||
      titleField.includes("speaker")
    );
  }

  // ── Otras Categorías (SSD, RAM, Procesadores, Placas, Tarjetas de Video, Monitores, PC, etc.) ──

  // SSD / Almacenamiento
  if (normSubId === "sd m2" || normSubId === "ssd m2") {
    return titleField.includes("m.2") || titleField.includes("m2") || titleField.includes("nvme") || titleField.includes("pcie") ||
           subField.includes("m.2") || subField.includes("m2") || subField.includes("nvme") || subField.includes("pcie");
  }
  if (normSubId === "ssd sata" || normSubId === "sata") {
    return titleField.includes("sata") || titleField.includes("25") || subField.includes("sata");
  }

  // Memoria RAM
  if (normSubId === "ddr4") {
    return titleField.includes("ddr4") || subField.includes("ddr4");
  }
  if (normSubId === "ddr5") {
    return titleField.includes("ddr5") || subField.includes("ddr5");
  }
  if (normSubId === "ddr3") {
    return titleField.includes("ddr3") || subField.includes("ddr3");
  }

  // Tarjetas de Video
  if (normSubId === "nvidia rtx") {
    return titleField.includes("rtx") || titleField.includes("gtx") || titleField.includes("geforce") || titleField.includes("nvidia") ||
           subField.includes("rtx") || subField.includes("nvidia");
  }
  if (normSubId === "amd radeon") {
    return titleField.includes("radeon") || titleField.includes("rx ") || titleField.includes("rx5") || titleField.includes("rx6") || titleField.includes("rx7") ||
           subField.includes("radeon") || subField.includes("rx");
  }

  // Procesadores
  if (normSubId === "intel" && (categoryId?.includes("procesador") || catField.includes("procesador"))) {
    return (titleField.includes("intel") || titleField.includes("core") || titleField.includes("i3") || titleField.includes("i5") || titleField.includes("i7") || titleField.includes("i9")) &&
           !titleField.includes("ryzen") && !titleField.includes("amd");
  }
  if (normSubId === "amd ryzen" || (normSubId === "amd" && (categoryId?.includes("procesador") || catField.includes("procesador")))) {
    return (titleField.includes("amd") || titleField.includes("ryzen")) && !titleField.includes("intel");
  }

  // Placas Madre
  if (normSubId === "intel" && (categoryId?.includes("placa") || catField.includes("placa"))) {
    return titleField.includes("intel") || titleField.includes("b760") || titleField.includes("b660") || titleField.includes("h610") || titleField.includes("z790") || titleField.includes("z690") || titleField.includes("h510") || subField.includes("intel");
  }
  if (normSubId === "amd" && (categoryId?.includes("placa") || catField.includes("placa"))) {
    return titleField.includes("amd") || titleField.includes("am4") || titleField.includes("am5") || titleField.includes("b550") || titleField.includes("b650") || titleField.includes("a520") || titleField.includes("x670") || subField.includes("amd");
  }

  // PC Completa
  if (normSubId === "pc gamer") {
    return canonicalSub === "pc completa gamer" || (!titleField.includes("oficina") && !titleField.includes("ingenier"));
  }
  if (normSubId === "pc oficina") {
    return canonicalSub === "pc completa oficina" || titleField.includes("oficina") || subField.includes("oficina");
  }
  if (normSubId === "pc ingenieria" || normSubId === "pc ingenierias") {
    return canonicalSub === "pc completa ingenierias" || titleField.includes("ingenier") || titleField.includes("workstation") || subField.includes("ingenier");
  }
  if (normSubId === "pc combos") {
    return titleField.includes("combo") || titleField.includes("kit") || titleField.includes("monitor") || titleField.includes("completa");
  }

  // Monitores
  if (normSubId === "monitores 24") {
    return titleField.includes("24") || titleField.includes("238") || subField.includes("24");
  }
  if (normSubId === "monitores 27") {
    return titleField.includes("27") || subField.includes("27");
  }
  if (normSubId === "monitores 34") {
    return titleField.includes("34") || titleField.includes("curvo") || subField.includes("34");
  }
  if (normSubId === "gaming" && (categoryId?.includes("monitor") || catField.includes("monitor"))) {
    return titleField.includes("gaming") || titleField.includes("gamer") || titleField.includes("hz") || subField.includes("gaming");
  }

  // Cases
  if (normSubId === "con fuente") {
    return titleField.includes("con fuente") || subField.includes("con fuente");
  }
  if (normSubId === "sin fuente") {
    return titleField.includes("sin fuente") || (!titleField.includes("con fuente") && !subField.includes("con fuente"));
  }

  // Fuentes de poder
  if (normSubId === "certificadas") {
    return titleField.includes("80 plus") || titleField.includes("80+") || titleField.includes("certificad") || titleField.includes("bronze") || titleField.includes("gold") || titleField.includes("white") || subField.includes("certificad");
  }
  if (normSubId === "modulares") {
    return titleField.includes("modular") || subField.includes("modular");
  }

  // Laptops
  if (normSubId === "oficina" && (categoryId?.includes("laptop") || catField.includes("laptop"))) {
    return titleField.includes("oficina") || titleField.includes("estudio") || titleField.includes("portatil") || titleField.includes("v15") || subField.includes("oficina");
  }
  if (normSubId === "gaming" && (categoryId?.includes("laptop") || catField.includes("laptop"))) {
    return titleField.includes("gaming") || titleField.includes("gamer") || titleField.includes("rtx") || titleField.includes("tuf") || titleField.includes("loq") || subField.includes("gaming");
  }

  // Refrigeración líquida
  if (normSubId === "240mm") {
    return titleField.includes("240") || subField.includes("240");
  }
  if (normSubId === "360mm") {
    return titleField.includes("360") || subField.includes("360");
  }

  // Estabilizadores
  if (normSubId === "estabilizadores") {
    return titleField.includes("estabilizador") || subField.includes("estabilizador") || !titleField.includes("ups");
  }
  if (normSubId === "ups") {
    return titleField.includes("ups") || titleField.includes("bateria") || subField.includes("ups");
  }

  // Fallback general por términos (SOLO en subField, titleField y canonicalSub, NUNCA descField)
  const terms = SUBCATEGORY_TERMS[subcategoryId] || [normSubId];
  return terms.some((t) => subField.includes(t) || titleField.includes(t) || canonicalSub.includes(t));
};

// ─── Componente ──────────────────────────────────────────────────────────────

const LABEL_MAP: Record<string, string> = {
  "monitores":         "Monitores",
  "case":              "Case",
  "pc-completa":       "PC Completa",
  "disco-ssd":         "Disco SSD",
  "memoria-ssd":       "Memoria SSD",
  "discos-ssd":        "Disco SSD",
  "memorias-ssd":      "Memoria SSD",
  "estabilizador":     "Estabilizador",
  "estabilizadores":   "Estabilizadores de Voltaje",
  "fuente-de-poder":   "Fuente de Poder",
  "fuente-poder":      "Fuente de Poder",
  "memoria-ram":       "Memoria RAM",
  "memoria-rams":      "Memoria RAM",
  "memorias-ram":      "Memoria RAM",
  "perifericos":       "Periféricos",
  "placa-madre":       "Placa Madre",
  "tarjetas-de-video": "Tarjetas de Video",
  "tarjeta-grafica":   "Tarjetas de Video",
  "tarjetas-graficas": "Tarjetas de Video",
  "procesadores":      "Procesadores",
  "laptops":           "Laptops",
  "refrigeracion":     "Refrigeración Líquida",
  "refrigeracion-liquida": "Refrigeración Líquida",
  "monitores-24":      "Monitores 24\" (FHD)",
  "monitores-27":      "Monitores 27\" (2K / 200Hz)",
  "monitores-34":      "Monitores 34\" Curvos",
  "pc-combos":         "PC con Monitor y Kit",
  "gaming":            "Gaming",
  "alta-frecuencia":   "Alta Frecuencia",
  "curvos":            "Curvos",
  "calidad-de-imagen": "Calidad de Imagen",
  "pantalla-grande":   "Pantalla Grande",
  "oficina-y-estudio": "Oficina y Estudio",
  "con-fuente":        "Con Fuente",
  "sin-fuente":        "Sin Fuente",
  "compactos":         "Compactos",
  "pc-oficina":        "PC Oficina",
  "pc-gamer":          "PC Gamer",
  "pc-ingenieria":     "PC Ingenierías",
  "pc-ingenierias":    "PC Ingenierías",
  "pc-diseno":         "PC Diseño",
  "intel":             "Intel Core",
  "amd":               "AMD",
  "amd-ryzen":         "AMD Ryzen",
  "nvidia-rtx":        "NVIDIA GeForce RTX",
  "amd-radeon":        "AMD Radeon RX",
  "oficina":           "Laptops de Oficina / Estudio",
  "240mm":             "Refrigeración 240mm",
  "360mm":             "Refrigeración 360mm",
  "sd-m2":             "SSD M.2 PCIe",
  "ssd-m2":            "SSD M.2 NVMe PCIe",
  "ssd-sata":          "SSD SATA 2.5",
  "ddr3":              "DDR3",
  "ddr4":              "DDR4",
  "ddr5":              "DDR5",
  "certificadas":      "Fuentes 80 Plus",
  "modulares":         "Fuentes Modulares",
  "audifonos":         "Audífonos",
  "adaptador":         "Adaptadores",
  "adaptadores":       "Adaptadores",
  "cable":             "Cables",
  "cables":            "Cables y Adaptadores",
  "cooler":            "Cooler",
  "teclados":          "Teclados Mecánicos",
  "teclado":           "Teclado",
  "mouse":             "Mouse Gamer",
  "parlantes":         "Parlantes",
  "webcam":            "Cámaras & Webcams",
  "combos":            "Kits Teclado + Mouse",
  "kit-teclado-mouse": "Kit Teclado y Mouse",
  "ups":               "Sistemas UPS",
  "todas":             "Todas las Computadoras",
  "todos":             "Todos los Productos",
};

const getLabel = (slug?: string) =>
  slug ? (LABEL_MAP[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())) : "Productos";

export function CategoryPage() {
  const { id, subcategoria } = useParams<{ id: string; subcategoria?: string }>();
  const [searchParams] = useSearchParams();
  const filterMarca = searchParams.get("marca");
  const filterPantalla = searchParams.get("pantalla");
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);

  // Filtros de Sidebar
  const [globalMinPrice, setGlobalMinPrice] = useState<number>(0);
  const [globalMaxPrice, setGlobalMaxPrice] = useState<number>(9999);
  
  const [minPriceInput, setMinPriceInput] = useState<string>("");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("");
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("default");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12;

  const { addItem } = useCart();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Scroll al inicio al cambiar de categoría
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(1);
  }, [id, subcategoria, filterMarca, filterPantalla]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedMinPrice, appliedMaxPrice, sortBy]);

  useEffect(() => {
    if (!id) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchProducts = async () => {
      try {
        // Traemos TODOS los productos y filtramos en el cliente
        // porque los valores de "categoria" en Firestore pueden tener
        // mayúsculas, tildes u otras variaciones que no coinciden
        // exactamente con los slugs de la URL.
        const snapshot = await getDocs(collection(db, "productos"));

        const filtered: Product[] = [];
        let globalMin = Infinity;
        let globalMax = -Infinity;

        snapshot.docs.forEach((doc) => {
          const rawData = doc.data() as Record<string, unknown>;
          const data = normalizeDocumentData(rawData);

          const matchesCat = matchesCategory(data, id);
          if (!matchesCat) return;

          if (subcategoria && !matchesSubcategory(data, subcategoria, id)) return;

          // Check dynamic brand filter
          if (filterMarca) {
            const marca = String(data.marca || data.Marca || "");
            if (normalizeSlug(marca) !== filterMarca) return;
          }

          // Check dynamic attribute filter
          if (filterPantalla) {
            const pantalla = String(data["tamaño de pantalla"] || data["pulgadas"] || data.tamaño || data.procesador || data.capacidad || "");
            if (normalizeSlug(pantalla) !== filterPantalla) return;
          }

          const product = buildProduct(doc.id, data);
          filtered.push(product);
          
          if (product.price < globalMin) globalMin = product.price;
          if (product.price > globalMax) globalMax = product.price;
        });

        setProducts(filtered);
        
        if (filtered.length > 0) {
          setGlobalMinPrice(globalMin);
          setGlobalMaxPrice(globalMax);
          setMinPriceInput(globalMin.toString());
          setMaxPriceInput(globalMax.toString());
          // Optional: we can reset applied prices so it shows all by default
          setAppliedMinPrice(null);
          setAppliedMaxPrice(null);
        } else {
          setGlobalMinPrice(0);
          setGlobalMaxPrice(9999);
          setMinPriceInput("");
          setMaxPriceInput("");
        }

      } catch (err) {
        console.error("Error al obtener productos de categoría:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, subcategoria, filterMarca, filterPantalla]);

  const categoryLabel = getLabel(id);
  const subcategoryLabel = filterPantalla ? filterPantalla.replace(/-/g, ' ') : (filterMarca ? filterMarca.replace(/-/g, ' ') : (subcategoria ? getLabel(subcategoria) : null));

  // Aplicar filtros locales (precio) y ordenamiento
  const displayedProducts = products.filter(p => {
    if (appliedMinPrice !== null && p.price < appliedMinPrice) return false;
    if (appliedMaxPrice !== null && p.price > appliedMaxPrice) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0; // default (podría ser por fecha o id)
  });

  const totalPages = Math.ceil(displayedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = displayedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleApplyPriceFilter = () => {
    setAppliedMinPrice(minPriceInput ? Number(minPriceInput) : null);
    setAppliedMaxPrice(maxPriceInput ? Number(maxPriceInput) : null);
  };

  return (
    <div className="home-page">
      <Navbar />
      <SecondaryNav />

      <main style={{ minHeight: "60vh", background: "#f3f4f6" }}>
        <div className="category-page-container" style={{ maxWidth: "1400px", margin: "0 auto" }}>
          
          {/* Breadcrumb */}
          <nav className="category-breadcrumb" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <Link to="/" style={{ color: "#e81950", textDecoration: "none", fontWeight: 500 }}>Inicio</Link>
            <span>/</span>
            <Link to={`/categoria/${id}`} style={{ color: subcategoria ? "#6b7280" : "#111827", textDecoration: "none", fontWeight: subcategoria ? 400 : 500 }}>
              {categoryLabel}
            </Link>
            {subcategoryLabel && (
              <>
                <span>/</span>
                <span style={{ color: "#111827", fontWeight: 500, textTransform: 'capitalize' }}>{subcategoryLabel}</span>
              </>
            )}
          </nav>

          {/* Botón Filtros Móvil */}
          <div className="category-mobile-filter-bar">
            <button
              type="button"
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="category-mobile-filter-btn"
              aria-expanded={showMobileFilters}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <SlidersHorizontal size={18} color="#e81950" />
                <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem" }}>
                  Filtrar por Precio
                </span>
                {appliedMinPrice !== null || appliedMaxPrice !== null ? (
                  <span style={{ fontSize: "0.75rem", background: "#fef2f2", color: "#e81950", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    Activo
                  </span>
                ) : null}
              </div>
              {showMobileFilters ? <ChevronUp size={18} color="#6b7280" /> : <ChevronDown size={18} color="#6b7280" />}
            </button>
          </div>

          <div className="category-layout">
            
            {/* SIDEBAR (Filtros) */}
            <aside className={`category-sidebar ${showMobileFilters ? "category-sidebar--mobile-open" : ""}`}>
              <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111827", marginBottom: "1.25rem" }}>
                  Filter By Price
                </h3>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <input 
                    type="range" 
                    min={globalMinPrice} 
                    max={globalMaxPrice} 
                    value={maxPriceInput || globalMaxPrice}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    style={{ width: "100%", accentColor: "#ea580c", cursor: "pointer" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Min S/</span>
                    <input 
                      type="number" 
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      placeholder="0"
                      style={{ width: "100%", padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                    />
                  </div>
                  <span style={{ color: "#9ca3af", marginTop: "1rem" }}>—</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Max S/</span>
                    <input 
                      type="number" 
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      placeholder="9999"
                      style={{ width: "100%", padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    handleApplyPriceFilter();
                    setShowMobileFilters(false);
                  }}
                  style={{
                    width: "100%", padding: "0.6rem", background: "#eff6ff", color: "#1d4ed8",
                    border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
                >
                  Filtrar
                </button>
              </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <div style={{ flex: 1, minWidth: 0 }}>
              
              {/* Header Resultados */}
              <div className="category-results-header">
                <h1 className="category-results-title">
                  {subcategoryLabel ?? categoryLabel}
                </h1>
                
                <div className="category-results-controls">
                  <span className="category-results-count">
                    {displayedProducts.length > 0
                      ? `Mostrando: ${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, displayedProducts.length)} de ${displayedProducts.length}`
                      : `0 resultados`}
                  </span>
                  
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="category-sort-select"
                  >
                    <option value="default">Ordenar por defecto</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                  </select>
                </div>
              </div>

              {/* Grid Productos */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>
                  Cargando productos...
                </div>
              ) : displayedProducts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "5rem 0", color: "#9ca3af", background: "#fff", borderRadius: "12px" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: "0 auto 1rem", display: "block" }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#374151" }}>No hay productos registrados en esta categoría en la base de datos.</p>
                  <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.4rem" }}>Actualmente no hay unidades disponibles para este filtro.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
                    {paginatedProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={(product) => addItem(product)}
                      />
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => {
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        style={{
                          padding: "0.5rem 1rem",
                          background: currentPage === 1 ? "#f3f4f6" : "#ffffff",
                          color: currentPage === 1 ? "#9ca3af" : "#111827",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          transition: "all 0.15s",
                        }}
                      >
                        ← Anterior
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          style={{
                            width: "38px",
                            height: "38px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: currentPage === pageNum ? "#e81950" : "#ffffff",
                            color: currentPage === pageNum ? "#ffffff" : "#374151",
                            border: currentPage === pageNum ? "1px solid #e81950" : "1px solid #d1d5db",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            transition: "all 0.15s",
                          }}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "0.5rem 1rem",
                          background: currentPage === totalPages ? "#f3f4f6" : "#ffffff",
                          color: currentPage === totalPages ? "#9ca3af" : "#111827",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          transition: "all 0.15s",
                        }}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}