import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "../components/home/ProductCard";

export interface CartItem extends Product { quantity: number }
const STORAGE_KEY = "eagle-gaming-cart-v1";
const MAX_QUANTITY = 99;

function readCart(): CartItem[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    const ids = new Set<string>();
    return saved.filter((item): item is CartItem => {
      if (!item || typeof item.id !== "string" || !item.id || ids.has(item.id) ||
          typeof item.name !== "string" || typeof item.category !== "string" ||
          typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0 ||
          !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY ||
          (item.imageUrl !== undefined && typeof item.imageUrl !== "string")) return false;
      ids.add(item.id);
      return true;
    });
  } catch { return []; }
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  total: number;
  notice: string;
  storageError: boolean;
  addItem: (product: Product) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setStorageError(false);
    } catch { setStorageError(true); }
  }, [items]);

  function addItem(product: Product) {
    const price = Number(product.price);
    if (!product.id || !Number.isFinite(price) || price < 0) {
      setNotice("No se pudo añadir el producto: precio no válido.");
      return;
    }
    const existing = items.find(item => item.id === product.id);
    if (existing && existing.quantity >= MAX_QUANTITY) {
      setNotice("Puedes añadir hasta 99 unidades por producto.");
      return;
    }
    setItems(previous => {
      const found = previous.find(item => item.id === product.id);
      return found
        ? previous.map(item => item.id === product.id
          ? { ...product, price, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) } : item)
        : [...previous, { ...product, price, quantity: 1 }];
    });
    setNotice(`${product.name} añadido al carrito.`);
  }

  function setQuantity(id: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return;
    setItems(previous => previous.map(item => item.id === id ? { ...item, quantity } : item));
  }

  return (
    <CartContext.Provider value={{
      items, notice, storageError, addItem, setQuantity,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100,
      removeItem: id => { setItems(previous => previous.filter(item => item.id !== id)); setNotice("Producto eliminado del carrito."); },
      clearCart: () => { setItems([]); setNotice("Carrito vaciado."); },
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart debe usarse dentro de CartProvider");
  return cart;
}
