import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { User as FirebaseUser } from "firebase/auth";

/**
 * Lista blanca estricta de emails de administrador.
 * NUNCA uses .includes("admin") — eso deja pasar myadmin@evil.com.
 * Para añadir un nuevo admin: (1) agrégalo aquí, (2) crea el documento
 * manualmente en Firebase Console → Firestore → admins/{uid}.
 */
export const ADMIN_EMAILS: ReadonlySet<string> = new Set([
  "eaglegaming@gmail.com",
  "admin@eaglegaming.com",
  "eaglegamingperu@gmail.com",
  "administrador@eaglegaming.com",
  "elizabethpumafarfaneg@gmail.com",
  "tebotec10@gmail.com"
]);

/**
 * Comprobación SOLO de lista blanca estricta.
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

/**
 * Alias de compatibilidad hacia atrás que usa la lista blanca estricta
 */
export const isAdminUser = isAdminEmail;

/**
 * Verifica en Firestore si el usuario tiene un documento en /admins/{uid}.
 * No crea ni modifica nada — solo lee. La escritura de admins solo ocurre
 * desde Firebase Console o Cloud Functions.
 */
export async function verifyAdminDocument(user: FirebaseUser | null): Promise<boolean> {
  if (!user) return false;
  try {
    const adminRef = doc(db, "admins", user.uid);
    const snap = await getDoc(adminRef);
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * Función segura de compatibilidad: únicamente verifica la existencia sin auto-crear.
 */
export async function ensureAdminDocument(user: FirebaseUser | null): Promise<boolean> {
  return verifyAdminDocument(user);
}

export { parsePrice } from "./productUtils";
