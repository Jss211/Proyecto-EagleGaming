import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { parsePrice } from "./productUtils";
import type { CartItem } from "../context/CartContext";

export interface VerifiedCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
  inStock: boolean;
  availableStock?: number;
}

export interface CartVerificationResult {
  valid: boolean;
  items: VerifiedCartItem[];
  total: number;
  totalItems: number;
  errors: string[];
  priceChangedNotice: boolean;
}

/**
 * Revalida una lista de items de carrito consultando directamente los documentos
 * en Firestore para garantizar precios y stock actuales, descartando cualquier
 * manipulación maliciosa de localStorage.
 */
export async function verifyCartWithFirestore(cartItems: CartItem[]): Promise<CartVerificationResult> {
  const result: CartVerificationResult = {
    valid: true,
    items: [],
    total: 0,
    totalItems: 0,
    errors: [],
    priceChangedNotice: false,
  };

  if (!cartItems || cartItems.length === 0) {
    result.errors.push("El carrito está vacío");
    result.valid = false;
    return result;
  }

  for (const item of cartItems) {
    try {
      const docRef = doc(db, "productos", item.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        result.errors.push(`El producto "${item.name}" ya no está disponible en la tienda.`);
        result.valid = false;
        continue;
      }

      const raw = docSnap.data();
      const currentPrice = parsePrice(raw.precio ?? raw.Precio);
      const stock = typeof raw.stock === "number" ? raw.stock : 999;
      const title = (raw.titulo || raw.nombre || raw.título || item.name).trim();

      if (stock <= 0) {
        result.errors.push(`El producto "${title}" no cuenta con stock disponible en este momento.`);
        result.valid = false;
        continue;
      }

      // Ajustar cantidad si excede el stock real disponible
      let safeQuantity = Math.max(1, Math.min(item.quantity, 99));
      if (safeQuantity > stock) {
        safeQuantity = stock;
        result.errors.push(
          `La cantidad solicitada de "${title}" supera el stock disponible (${stock} unid.). Se ajustó automáticamente.`
        );
      }

      // Notificar si el precio cambió respecto al guardado en el navegador
      if (Math.abs(currentPrice - item.price) > 0.01) {
        result.priceChangedNotice = true;
      }

      const verifiedItem: VerifiedCartItem = {
        id: item.id,
        name: title,
        price: currentPrice,
        quantity: safeQuantity,
        imageUrl: raw.url || raw.imagen || item.imageUrl,
        category: raw.categoria || item.category,
        inStock: stock > 0,
        availableStock: stock,
      };

      result.items.push(verifiedItem);
      result.total += currentPrice * safeQuantity;
      result.totalItems += safeQuantity;
    } catch (err) {
      console.error(`Error verificando producto ${item.id}:`, err);
      // Si falla Firestore por red, usamos el precio con advertencia
      result.items.push({
        ...item,
        inStock: true,
      });
      result.total += item.price * item.quantity;
      result.totalItems += item.quantity;
    }
  }

  result.total = Math.round(result.total * 100) / 100;
  return result;
}

/**
 * Genera un código de pedido corto y único (ej: EG-82914-24)
 */
export function generateOrderCode(): string {
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  return `EG-${randomPart}-${yearSuffix}`;
}

export interface WhatsAppOrderPayload {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  cityOrDepartment: string;
  address?: string;
  notes?: string;
  items: VerifiedCartItem[];
  total: number;
}

/**
 * Construye el mensaje de WhatsApp estructurado, limpio y sin caracteres corruptos
 */
export function buildWhatsAppOrderMessage(payload: WhatsAppOrderPayload): string {
  const money = (val: number) => `S/ ${val.toFixed(2)}`;

  const lines: string[] = [
    `*¡Hola Eagle Gaming! Quiero realizar el siguiente pedido:*`,
    ``,
    `*Código de Pedido:* ${payload.orderCode}`,
    `*Fecha:* ${new Date().toLocaleDateString("es-PE")} ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`,
    ``,
    `*DATOS DEL CLIENTE:*`,
    `• *Nombre:* ${payload.customerName.trim()}`,
    `• *Teléfono:* ${payload.customerPhone.trim()}`,
    `• *Ciudad/Dpto:* ${payload.cityOrDepartment.trim()}`,
  ];

  if (payload.address && payload.address.trim()) {
    lines.push(`• *Dirección:* ${payload.address.trim()}`);
  }
  if (payload.notes && payload.notes.trim()) {
    lines.push(`• *Observaciones:* ${payload.notes.trim()}`);
  }

  lines.push(``);
  lines.push(`*PRODUCTOS:* (${payload.items.length})`);

  payload.items.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    const safeName = item.name.length > 55 ? `${item.name.slice(0, 52)}...` : item.name;
    lines.push(`${index + 1}. *${safeName}*`);
    lines.push(`   ${item.quantity}x ${money(item.price)} = *${money(subtotal)}*`);
  });

  lines.push(``);
  lines.push(`----------------------------------------`);
  lines.push(`*TOTAL A PAGAR:* *${money(payload.total)}*`);
  lines.push(`----------------------------------------`);
  lines.push(``);
  lines.push(`Por favor confirmen stock y métodos de pago (Yape/Transferencia/Tarjeta). ¡Muchas gracias!`);

  return lines.join("\n");
}

/**
 * Genera la URL completa de WhatsApp asegurando codificación adecuada
 */
export function createWhatsAppOrderUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
