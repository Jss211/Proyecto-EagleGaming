import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const BASE_NAME = "EAGLE GAMING PERÚ";

const ROUTE_TITLES: Record<string, string> = {
  "/": "EAGLE GAMING PERÚ: Tienda de componentes para pc",
  "/carrito": `Tu Carrito de Compras | ${BASE_NAME}`,
  "/admin": `Panel de Administración | ${BASE_NAME}`,
  "/admin-login": `Acceso Administrador | ${BASE_NAME}`,
  "/nosotros": `Sobre Nosotros | ${BASE_NAME}`,
  "/contactenos": `Contáctanos | ${BASE_NAME}`,
  "/buscar": `Resultados de Búsqueda | ${BASE_NAME}`,
  "/arma-tu-pc": `Arma tu PC Gamer a Medida | ${BASE_NAME}`,
  "/libro-de-reclamaciones": `Libro de Reclamaciones | ${BASE_NAME}`,
  "/reclamaciones": `Libro de Reclamaciones | ${BASE_NAME}`,
  "/login": `Iniciar Sesión | ${BASE_NAME}`,
  "/register": `Crear Cuenta | ${BASE_NAME}`,
  "/cuenta": `Mi Cuenta | ${BASE_NAME}`,
  "/forgot-password": `Recuperar Contraseña | ${BASE_NAME}`,
  "/terminos": `Términos y Condiciones | ${BASE_NAME}`,
  "/privacidad": `Política de Privacidad | ${BASE_NAME}`,
};

const CATEGORY_TITLES: Record<string, string> = {
  "pc-completa": "PC Completas",
  "procesadores": "Procesadores",
  "tarjetas-de-video": "Tarjetas de Video",
  "monitores": "Monitores",
  "laptops": "Laptops",
  "perifericos": "Periféricos",
  "memoria-ram": "Memorias RAM",
  "disco-ssd": "Discos SSD",
  "placa-madre": "Placas Madre",
  "fuente-de-poder": "Fuentes de Poder",
  "case": "Cases / Gabinetes",
  "refrigeracion": "Refrigeración Líquida",
  "estabilizador": "Estabilizadores",
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
    let resolvedTitle = "EAGLE GAMING PERÚ: Tienda de componentes para pc";

    if (customTitle) {
      resolvedTitle = `${customTitle} | ${BASE_NAME}`;
    } else if (ROUTE_TITLES[pathname]) {
      resolvedTitle = ROUTE_TITLES[pathname];
    } else if (pathname.startsWith("/categoria/")) {
      const catSlug = pathname.replace("/categoria/", "").split("/")[0].toLowerCase();
      const prettyName = CATEGORY_TITLES[catSlug] || (
        catSlug.replace(/-/g, " ").charAt(0).toUpperCase() + catSlug.replace(/-/g, " ").slice(1)
      );
      resolvedTitle = `${prettyName} | ${BASE_NAME}`;
    } else if (pathname.startsWith("/producto/")) {
      resolvedTitle = `Detalle del Producto | ${BASE_NAME}`;
    }

    currentTitleRef.current = resolvedTitle;
    document.title = resolvedTitle;

    // Manejar visibilidad de la pestaña (Efecto persuasivo al cambiar de pestaña)
    const handleVisibilityChange = () => {
      if (document.hidden) {
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
