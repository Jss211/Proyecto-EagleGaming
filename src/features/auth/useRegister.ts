import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { api, ApiError } from "../../lib/api";
import type { RegisterFormValues, UserProfile } from "./auth.types";

interface RegisterState {
  isSubmitting: boolean;
  errorMessage: string | null;
}

export function useRegister() {
  const [state, setState] = useState<RegisterState>({
    isSubmitting: false,
    errorMessage: null,
  });

  async function saveProfile(
    credential: UserCredential,
    firstName: string,
    lastName: string,
    email: string
  ): Promise<boolean> {
    try {
      const token = await credential.user.getIdToken();
      await api.post<UserProfile>(
        "/users",
        { uid: credential.user.uid, firstName, lastName, email },
        { authToken: token }
      );
      return true;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Tu cuenta se creó, pero no pudimos guardar tu perfil. Intenta de nuevo.";
      setState({ isSubmitting: false, errorMessage: message });
      return false;
    }
  }

  async function register(values: RegisterFormValues): Promise<boolean> {
    setState({ isSubmitting: true, errorMessage: null });

    let credential: UserCredential;
    try {
      credential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await updateProfile(credential.user, {
        displayName: `${values.firstName} ${values.lastName}`,
      });
    } catch (error) {
      setState({ isSubmitting: false, errorMessage: mapFirebaseError(error) });
      return false;
    }

    const saved = await saveProfile(
      credential,
      values.firstName,
      values.lastName,
      values.email
    );
    if (!saved) return false;

    setState({ isSubmitting: false, errorMessage: null });
    return true;
  }

  async function registerWithGoogle(): Promise<boolean> {
    setState({ isSubmitting: true, errorMessage: null });

    let credential: UserCredential;
    try {
      credential = await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error en Google Sign-In:", error);
      setState({ isSubmitting: false, errorMessage: mapFirebaseError(error) });
      return false;
    }

    const [firstName, ...rest] = (credential.user.displayName ?? "").split(" ");
    const lastName = rest.join(" ");

    const saved = await saveProfile(
      credential,
      firstName || "",
      lastName || "",
      credential.user.email ?? ""
    );
    if (!saved) return false;

    setState({ isSubmitting: false, errorMessage: null });
    return true;
  }

  return { register, registerWithGoogle, ...state };
}

function mapFirebaseError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/weak-password":
      return "La contraseña es demasiado débil.";
    case "auth/popup-closed-by-user":
      return "Cerraste la ventana de Google antes de terminar.";
    case "auth/popup-blocked":
      return "El navegador bloqueó la ventana emergente. Habilítala e intenta de nuevo.";
    default:
      return "No pudimos crear tu cuenta. Intenta de nuevo.";
  }
}