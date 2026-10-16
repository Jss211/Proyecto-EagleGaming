import type { User as FirebaseUser } from "firebase/auth";
import { isAdminUser } from "./admin";

export interface TimeGreeting {
  greeting: string; // "buenos días" | "buenas tardes" | "buenas noches"
  capitalizedGreeting: string; // "Buenos días" | "Buenas tardes" | "Buenas noches"
  period: "dia" | "tarde" | "noche";
}

/**
 * Obtiene el saludo correspondiente según la hora actual del día:
 * - 05:00 a 11:59 -> Buenos días
 * - 12:00 a 18:59 -> Buenas tardes
 * - 19:00 a 04:59 -> Buenas noches
 */
export function getTimeGreeting(): TimeGreeting {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      greeting: "buenos días",
      capitalizedGreeting: "Buenos días",
      period: "dia",
    };
  } else if (hour >= 12 && hour < 19) {
    return {
      greeting: "buenas tardes",
      capitalizedGreeting: "Buenas tardes",
      period: "tarde",
    };
  } else {
    return {
      greeting: "buenas noches",
      capitalizedGreeting: "Buenas noches",
      period: "noche",
    };
  }
}

/**
 * Obtiene el nombre del usuario para el saludo, buscando en displayName o derivando del correo
 */
export function getUserDisplayName(
  user: FirebaseUser | null,
  firestoreName?: string | null
): string {
  if (!user) return "";
  if (firestoreName && firestoreName.trim()) {
    return firestoreName.trim();
  }
  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim();
  }
  if (user.email) {
    const prefix = user.email.split("@")[0].trim();
    if (prefix.toLowerCase() === "eaglegaming") {
      return "Eagle Gaming";
    }
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return "Usuario";
}

/**
 * Obtiene el primer nombre para textos más compactos (ej. Navbar)
 */
export function getUserFirstName(fullName: string): string {
  if (!fullName) return "";
  return fullName.split(/\s+/)[0] || fullName;
}

/**
 * Determina si el rol del usuario es "Admin" o "Cliente"
 */
export function getUserRole(email?: string | null): "Admin" | "Cliente" {
  return isAdminUser(email) ? "Admin" : "Cliente";
}

/**
 * Determina el nombre formal del rol: "Administrador" o "Cliente"
 */
export function getUserRoleFull(email?: string | null): "Administrador" | "Cliente" {
  return isAdminUser(email) ? "Administrador" : "Cliente";
}
