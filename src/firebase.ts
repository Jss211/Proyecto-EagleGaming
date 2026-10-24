// Declaración global para soporte del debug token en desarrollo sin errores de TypeScript
declare global {
  // eslint-disable-next-line no-var
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

// Activar debug token ÚNICAMENTE en desarrollo local (DEV).
// En producción (Hostinger / PROD), se desactiva para que los usuarios finales
// utilicen reCAPTCHA Enterprise real y ningún token de depuración se imprima en consola.
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const customDebugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = customDebugToken || true;
}

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from "firebase/app-check";

// Configuración web de Firebase usando variables de entorno (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 1. Inicializamos la aplicación de Firebase
export const app = initializeApp(firebaseConfig);

// 2. Firebase App Check (reCAPTCHA Enterprise)
export let appCheck: AppCheck | undefined = undefined;

if (typeof window !== "undefined") {
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (recaptchaSiteKey) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[Firebase App Check] Aviso no crítico:", error);
      }
    }
  } else if (import.meta.env.DEV) {
    console.warn(
      "[Firebase App Check] VITE_RECAPTCHA_SITE_KEY no configurado en .env."
    );
  }
}

// 3. Servicios de Firebase
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export const analytics =
  typeof window !== "undefined" && firebaseConfig.measurementId
    ? getAnalytics(app)
    : undefined;
