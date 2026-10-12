import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { User as FirebaseUser } from "firebase/auth";

export const ADMIN_EMAILS = [
  "eaglegaming@gmail.com",
  "admin@eaglegaming.com",
  "eaglegamingperu@gmail.com",
  "administrador@eaglegaming.com",
];

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(clean) || clean.includes("admin");
}

export async function ensureAdminDocument(user: FirebaseUser | null): Promise<boolean> {
  if (!user) return false;
  try {
    const adminRef = doc(db, "admins", user.uid);
    const snap = await getDoc(adminRef);
    if (!snap.exists()) {
      await setDoc(adminRef, {
        email: user.email || "",
        uid: user.uid,
        role: "admin",
        createdAt: serverTimestamp(),
      });
      console.log("Registro admin creado en Firestore para:", user.email);
    }
    return true;
  } catch (err) {
    console.warn("No se pudo verificar registro admin en Firestore:", err);
    return false;
  }
}

/**
 * Convierte de manera segura cualquier formato de precio ("2,799.00", "S/ 3,500", 3500)
 * a un número válido y nunca devuelve NaN.
 */
export function parsePrice(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
