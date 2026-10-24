import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Eagle Gaming | Tienda de Computadoras y Componentes PC en Perú",
  "/carrito": "Tu Carrito de Compras | Eagle Gaming",
  "/admin": "Panel de Administración | Eagle Gaming",
  "/admin-login": "Acceso Administrador | Eagle Gaming",
  "/nosotros": "Sobre Nosotros | Eagle Gaming",
  "/contactenos": "Contáctanos | Eagle Gaming",
  "/buscar": "Resultados de Búsqueda | Eagle Gaming",
  "/arma-tu-pc": "Arma tu PC Gamer a Medida | Eagle Gaming",
  "/libro-de-reclamaciones": "Libro de Reclamaciones | Eagle Gaming",
  "/reclamaciones": "Libro de Reclamaciones | Eagle Gaming",
  "/login": "Iniciar Sesión | Eagle Gaming",
  "/register": "Crear Cuenta | Eagle Gaming",
  "/cuenta": "Mi Cuenta | Eagle Gaming",
  "/forgot-password": "Recuperar Contraseña | Eagle Gaming",
  "/terminos": "Términos y Condiciones | Eagle Gaming",
  "/privacidad": "Política de Privacidad | Eagle Gaming",
};

// Frases estilo Platanitos / E-commerce cuando el usuario cambia de pestaña
const AWAY_TITLES = [
  "¡Vuelve por favor! 🥺🎮",
  "¡No te vayas! Te extrañamos 💔",
  "¡Tenemos ofertas para ti! 👀⚡",
  "¡Tu setup te espera! 🖥️✨",
];

/**
 * Hook para actualizar dinámicamente el título de la pestaña del navegador
 * según la ruta activa y mostrar mensajes persuasivos cuando el usuario sale de la pestaña.
 */
export function useDynamicTitle(customTitle?: string) {
  const { pathname } = useLocation();
  const currentTitleRef = useRef<string>("");

  useEffect(() => {
    let resolvedTitle = "Eagle Gaming | Tienda Gamer";

    if (customTitle) {
      resolvedTitle = `${customTitle} | Eagle Gaming`;
    } else if (ROUTE_TITLES[pathname]) {
      resolvedTitle = ROUTE_TITLES[pathname];
    } else if (pathname.startsWith("/categoria/")) {
      const slug = pathname.replace("/categoria/", "").split("/")[0].replace(/-/g, " ");
      const capitalized = slug.charAt(0).toUpperCase() + slug.slice(1);
      resolvedTitle = `${capitalized} | Eagle Gaming`;
    } else if (pathname.startsWith("/producto/")) {
      resolvedTitle = "Detalle del Producto | Eagle Gaming";
    }

    currentTitleRef.current = resolvedTitle;
    document.title = resolvedTitle;

    // Manejar visibilidad de la pestaña (Efecto estilo Platanitos)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Selecciona una frase aleatoria
        const randomAway = AWAY_TITLES[Math.floor(Math.random() * AWAY_TITLES.length)];
        document.title = randomAway;
      } else {
        document.title = currentTitleRef.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, customTitle]);
}
