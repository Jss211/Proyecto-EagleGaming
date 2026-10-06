import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

type StatField = "vistas" | "carrito" | "ventas";

const bump = async (productId: string, field: StatField, amount = 1): Promise<void> => {
  try {
    await updateDoc(doc(db, "productos", productId), { [field]: increment(amount) });
  } catch (error) {
    console.error(`Error al registrar ${field}:`, error);
  }
};

// Una vista por producto por sesión (recargar la página no infla el número)
export const trackProductView = async (productId: string): Promise<void> => {
  const key = `viewed_${productId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Si sessionStorage no está disponible, se cuenta igual
  }
  await bump(productId, "vistas");
};

// Cada vez que alguien añade el producto al carrito
export const trackAddToCart = (productId: string): Promise<void> => bump(productId, "carrito");

// Compras confirmadas (se conectará cuando me pases CartPage / CartContext)
export const trackProductPurchase = (productId: string, quantity = 1): Promise<void> =>
  bump(productId, "ventas", quantity);