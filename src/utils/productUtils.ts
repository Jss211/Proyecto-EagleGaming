/**
 * Utilidades universales para la ingesta, normalización y visualización de productos de Firestore.
 * Garantiza que espacios en blanco en claves ('titulo ', 'categoria ', etc.), variaciones de nombres
 * de imágenes (url, url1, imagen, etc.), formatos de precio ('2,799.00', 'S/ 1,599') y especificaciones
 * técnicas dinámicas se lean y procesen de forma consistente en toda la tienda.
 */

import type { Product } from "../components/home/ProductCard";

export const PERIPHERAL_SUBCATEGORIES = [
  "AUDIFONOS",
  "CABLE",
  "COOLER",
  "KIT TECLADO Y MOUSE",
  "MOUSE",
  "PARLANTES",
  "TECLADO",
  "WEBCAM (CAMARA)",
] as const;

export type PeripheralSubcategory = (typeof PERIPHERAL_SUBCATEGORIES)[number];

export const PC_SUBCATEGORIES = [
  { id: "PC COMPLETA GAMER", label: "PC Gamer" },
  { id: "PC COMPLETA OFICINA", label: "PC de Oficina" },
  { id: "PC COMPLETA INGENIERIAS", label: "PC de Ingenierías" },
] as const;

export type PcSubcategory = (typeof PC_SUBCATEGORIES)[number]["id"];

/**
 * Normaliza las claves de un documento de Firestore eliminando espacios antes y después ('titulo ' -> 'titulo').
 */
export function normalizeDocumentData(raw: Record<string, any>): Record<string, any> {
  if (!raw || typeof raw !== "object") return {};
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw)) {
    clean[k.trim()] = v;
  }
  return clean;
}

/**
 * Convierte de forma robusta cualquier precio (número, string con comas '2,799.00', 'S/ 1,500', etc.) a number.
 */
export function parsePrice(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  if (typeof val === "string") {
    let s = val.trim();
    // Caso de formato europeo/latino con punto para miles y coma para decimales (ej. '1.799,00')
    if (/^\d{1,3}(\.\d{3})+,\d{2}$/.test(s)) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // Formato estándar con comas para miles (ej. '2,799.00' o '2,799')
      s = s.replace(/,/g, "");
    }
    // Quitar cualquier carácter residual que no sea dígito ni punto
    s = s.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(s);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Obtiene la imagen principal de un producto revisando url, url1, imagen, imagenes[], etc.
 */
export function resolveProductImage(
  data: Record<string, any>,
  fallback = "https://placehold.co/400x300?text=Producto"
): string {
  if (!data) return fallback;

  // 1. url directa
  if (data.url && typeof data.url === "string" && data.url.trim()) {
    return data.url.trim();
  }
  if (data.Url && typeof data.Url === "string" && data.Url.trim()) {
    return data.Url.trim();
  }

  // 2. url1 (muy común si el producto sólo tiene numeración de fotos)
  if (data.url1 && typeof data.url1 === "string" && data.url1.trim()) {
    return data.url1.trim();
  }
  if (data.Url1 && typeof data.Url1 === "string" && data.Url1.trim()) {
    return data.Url1.trim();
  }

  // 3. imagen / image
  if (data.imagen && typeof data.imagen === "string" && data.imagen.trim()) {
    return data.imagen.trim();
  }
  if (data.Imagen && typeof data.Imagen === "string" && data.Imagen.trim()) {
    return data.Imagen.trim();
  }
  if (data.image && typeof data.image === "string" && data.image.trim()) {
    return data.image.trim();
  }
  if (data.Image && typeof data.Image === "string" && data.Image.trim()) {
    return data.Image.trim();
  }

  // 4. Array imagenes / images
  if (Array.isArray(data.imagenes) && data.imagenes.length > 0 && typeof data.imagenes[0] === "string") {
    return data.imagenes[0].trim();
  }
  if (Array.isArray(data.images) && data.images.length > 0 && typeof data.images[0] === "string") {
    return data.images[0].trim();
  }

  // 5. Otras numeradas (url2 .. url10)
  for (let i = 2; i <= 10; i++) {
    const k = `url${i}`;
    if (data[k] && typeof data[k] === "string" && data[k].trim()) {
      return data[k].trim();
    }
  }

  // 6. Buscar cualquier clave que contenga URL HTTP
  for (const [k, v] of Object.entries(data)) {
    if (
      typeof v === "string" &&
      (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:image/")) &&
      (k.toLowerCase().startsWith("url") || k.toLowerCase().includes("img") || k.toLowerCase().includes("foto"))
    ) {
      return v.trim();
    }
  }

  return fallback;
}

/**
 * Devuelve todas las imágenes únicas de un producto en orden para galerías y carruseles.
 */
export function resolveAllProductImages(data: Record<string, any>): string[] {
  if (!data) return [];
  const images: string[] = [];

  const addImg = (url?: unknown) => {
    if (typeof url === "string" && url.trim() && !images.includes(url.trim())) {
      images.push(url.trim());
    }
  };

  // 1. Array de imágenes
  if (Array.isArray(data.imagenes)) {
    data.imagenes.forEach(addImg);
  }
  if (Array.isArray(data.images)) {
    data.images.forEach(addImg);
  }

  // 2. url principal
  addImg(data.url);
  addImg(data.Url);

  // 3. Numeradas url1..url10
  for (let i = 1; i <= 10; i++) {
    addImg(data[`url${i}`]);
    addImg(data[`Url${i}`]);
  }

  // 4. Campos imagen / image
  addImg(data.imagen);
  addImg(data.Imagen);
  addImg(data.image);
  addImg(data.Image);
  addImg(data.foto);

  // 5. Claves adicionales con URLs
  for (const [k, v] of Object.entries(data)) {
    const cleanK = k.trim().toLowerCase();
    if (
      cleanK.startsWith("url") &&
      typeof v === "string" &&
      (v.startsWith("http://") || v.startsWith("https://"))
    ) {
      addImg(v);
    }
  }

  return images;
}

/**
 * Resuelve el título / nombre del producto.
 */
export function resolveProductTitle(data: Record<string, any>): string {
  if (!data) return "Producto sin título";

  const candidates = [
    data.titulo,
    data.Titulo,
    data.título,
    data.Título,
    data.nombre,
    data.Nombre,
    data.title,
    data.Title,
    data.name,
    data.Name,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }

  const marca = String(data.marca || data.Marca || "").trim();
  const modelo = String(data.modelo || data.Modelo || "").trim();
  if (marca || modelo) {
    return `${marca} ${modelo}`.trim();
  }

  return "Producto sin título";
}

/**
 * Resuelve la categoría canónica para un producto según sus campos de Firestore.
 */
export function resolveProductCategory(data: Record<string, any>): string {
  let raw = "";
  for (const [k, v] of Object.entries(data)) {
    const cleanK = k.trim().toLowerCase();
    if (
      (cleanK === "categoria" || cleanK === "categoría" || cleanK === "category" || cleanK === "categorias") &&
      v &&
      typeof v === "string" &&
      v.trim()
    ) {
      raw = v.trim();
      break;
    }
  }

  const norm = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const title = resolveProductTitle(data)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Placa Madre
  if (
    norm.includes("placa") ||
    norm.includes("motherboard") ||
    (!norm && (title.includes("placa madre") || title.includes("motherboard")) && !title.includes("pc ") && !title.includes("computadora"))
  ) {
    return "Placa madre";
  }

  // Tarjetas de Video
  if (
    norm.includes("tarjeta") ||
    norm.includes("video") ||
    norm.includes("grafica") ||
    (!norm &&
      (title.includes("tarjeta de video") || title.includes("rtx ") || title.includes("gtx ") || title.includes("rx ")) &&
      !title.includes("pc ") &&
      !title.includes("computadora"))
  ) {
    return "Tarjetas de video";
  }

  // Procesadores
  if (
    norm.includes("procesador") ||
    norm.includes("cpu") ||
    (!norm && title.includes("procesador") && !title.includes("pc ") && !title.includes("computadora"))
  ) {
    return "Procesadores";
  }

  // Monitores (excluyendo PC completas)
  if (
    (norm.includes("monitor") || (!norm && title.includes("monitor"))) &&
    !norm.includes("pc") &&
    !norm.includes("computadora") &&
    !title.includes("pc completa") &&
    !title.includes("computadora")
  ) {
    return "Monitores";
  }

  // Laptops
  if (norm.includes("laptop") || norm.includes("portatil") || (!norm && title.includes("laptop"))) {
    return "Laptops";
  }

  // Refrigeración líquida
  if (
    norm.includes("refrig") ||
    norm.includes("liquida") ||
    (!norm && title.includes("refrigeracion liquida"))
  ) {
    return "Refrigeración líquida";
  }

  // Periféricos
  if (
    norm.includes("periferic") ||
    norm.includes("audifono") ||
    norm.includes("teclado") ||
    norm.includes("mouse") ||
    norm.includes("parlante") ||
    norm.includes("webcam") ||
    norm.includes("cable") ||
    (!norm && (title.includes("audifono") || title.includes("teclado") || title.includes("mouse") || title.includes("webcam") || title.includes("cable")))
  ) {
    return "Periféricos";
  }

  // Memoria RAM
  if (
    norm.includes("ram") ||
    (!norm && title.includes("memoria") && title.includes("ddr") && !title.includes("pc ") && !title.includes("computadora"))
  ) {
    return "Memoria RAM";
  }

  // PC Completas (Unificadas bajo la categoría "PC Completa", desglosada por subcategoría)
  if (
    norm.includes("pc") ||
    norm.includes("computadora") ||
    title.includes("pc ") ||
    title.includes("computadora")
  ) {
    return "PC Completa";
  }

  // Otros componentes
  if (norm.includes("disco") || norm.includes("ssd")) return "Disco SSD";
  if (norm.includes("fuente")) return "Fuente de poder";
  if (norm.includes("case") || norm.includes("gabinete")) return "Case";
  if (norm.includes("estabilizador")) return "Estabilizador";

  return raw || "General";
}

/**
 * Resuelve la subcategoría de un producto (tanto para Periféricos como para PC Completa).
 */
export function resolveProductSubcategory(data: Record<string, any>): string {
  if (!data) return "";
  const candidates = [
    data.subcategoria,
    data.Subcategoria,
    data.subcategoría,
    data.Subcategoría,
    data.subcategory,
    data.Subcategory,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim().toUpperCase();
  }

  const rawCat = String(data.categoria || data.Categoria || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const title = resolveProductTitle(data)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Si es PC Completa: inferir Gamer, Oficina o Ingenierías
  if (
    rawCat.includes("pc") ||
    rawCat.includes("computadora") ||
    title.includes("pc ") ||
    title.includes("computadora")
  ) {
    if (rawCat.includes("ingenier") || title.includes("ingenier")) {
      return "PC COMPLETA INGENIERIAS";
    }
    if (rawCat.includes("oficina") || title.includes("oficina")) {
      return "PC COMPLETA OFICINA";
    }
    return "PC COMPLETA GAMER";
  }

  // Si es Periférico: inferir audífonos, cable, cooler, teclado, etc.
  if (title.includes("audifono") || title.includes("auricular") || title.includes("headset")) {
    return "AUDIFONOS";
  }
  if (title.includes("cable") || rawCat.includes("cable")) {
    return "CABLE";
  }
  if (title.includes("cooler") || title.includes("ventilador") || title.includes("fan")) {
    return "COOLER";
  }
  if (title.includes("kit") || title.includes("combo teclado") || title.includes("4 en 1")) {
    return "KIT TECLADO Y MOUSE";
  }
  if (title.includes("mouse") || title.includes("raton")) {
    return "MOUSE";
  }
  if (title.includes("parlante") || title.includes("speaker") || title.includes("bocina")) {
    return "PARLANTES";
  }
  if (title.includes("teclado") || title.includes("keyboard")) {
    return "TECLADO";
  }
  if (title.includes("webcam") || title.includes("camara") || title.includes("camweb")) {
    return "WEBCAM (CAMARA)";
  }

  return "";
}

/**
 * Extrae y formatea todas las especificaciones técnicas del producto deduplicadas.
 */
export function extractProductSpecifications(
  productData: Record<string, any>
): { id: string; text: string; isSubItem: boolean }[] {
  const cleanData = normalizeDocumentData(productData);
  const displaySpecs: { id: string; text: string; isSubItem: boolean }[] = [];
  const seenKeys = new Set<string>();

  const addSpec = (raw: string) => {
    if (!raw || !raw.trim()) return;
    const clean = raw.trim();
    const parts = clean.split(":");
    const keyPart = parts[0]
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (keyPart && seenKeys.has(keyPart)) return;
    if (keyPart) seenKeys.add(keyPart);

    const isSubItem = clean.startsWith("-") || clean.startsWith("  ") || clean.startsWith("\t");
    displaySpecs.push({
      id: `spec-${displaySpecs.length}-${keyPart}`,
      text: clean.replace(/^[-•*]\s*/, ""),
      isSubItem,
    });
  };

  // 1. Procesar array especificaciones o caracteristicas
  const rawArray = cleanData.especificaciones || cleanData.caracteristicas;
  if (Array.isArray(rawArray)) {
    rawArray.forEach((item: string) => {
      if (typeof item === "string") addSpec(item);
    });
  } else if (typeof rawArray === "string") {
    rawArray.split("\n").forEach((line: string) => addSpec(line));
  }

  // 2. Claves a ignorar (campos de metadata o imágenes)
  const ignoredKeys = new Set([
    "id",
    "titulo",
    "nombre",
    "title",
    "name",
    "precio",
    "price",
    "categoria",
    "category",
    "subcategoria",
    "subcategory",
    "descripcion",
    "description",
    "especificaciones",
    "caracteristicas",
    "imagenes",
    "images",
    "stock",
    "creadoen",
    "createdat",
    "actualizadoen",
    "updatedat",
    "tendencia",
    "marca",
    "modelo",
  ]);

  // También ignorar todas las claves que comiencen con url (url, url1..url10, etc.)
  Object.entries(cleanData).forEach(([key, value]) => {
    const normKey = key
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    if (normKey.startsWith("url")) return;
    if (ignoredKeys.has(normKey)) return;

    if (typeof value === "string" && value.trim() !== "") {
      // Si el valor es una URL http, no es una especificación
      if (value.startsWith("http://") || value.startsWith("https://")) return;

      if (!seenKeys.has(normKey)) {
        seenKeys.add(normKey);
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
        displaySpecs.push({
          id: `field-${normKey}`,
          text: `${formattedKey}: ${value.trim()}`,
          isSubItem: false,
        });
      }
    }
  });

  return displaySpecs;
}

/**
 * Construye un objeto Product estándar para tarjetas y listados con todas las correcciones aplicadas.
 */
export function buildNormalizedProduct(id: string, raw: Record<string, any>): Product {
  const clean = normalizeDocumentData(raw);
  const name = resolveProductTitle(clean);
  const price = parsePrice(clean.precio ?? clean.Precio);
  const imageUrl = resolveProductImage(clean);
  const category = String(clean.categoria || clean.Categoria || resolveProductCategory(clean));

  return {
    id,
    name,
    category,
    price,
    imageUrl,
    inStock: clean.stock !== false && clean.stock !== 0,
  };
}
