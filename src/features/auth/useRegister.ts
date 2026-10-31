import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type UserCredential,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { api, ApiError } from "../../lib/api";
import type { RegisterFormValues, UserProfile } from "./auth.types";
import { completePasswordRegistration } from './registrationFlow';
import { configuredVerificationEndpoint, requestVerificationEmail, type VerificationCode } from './emailVerification';

interface RegisterState {
  isSubmitting: boolean;
  errorMessage: string | null;
  createdUser: User | null;
  verificationCode: VerificationCode | null;
  profileWarning: string | null;
}

export function useRegister() {
  const [state, setState] = useState<RegisterState>({
    isSubmitting: false,
    errorMessage: null,
    createdUser: null,
    verificationCode: null,
    profileWarning: null,
  });

  async function saveProfile(
    user: User,
    firstName: string,
    lastName: string,
    email: string
  ): Promise<void> {
    // Si no hay URL de API configurada, omitimos la llamada al backend
    // y consideramos el registro exitoso (solo cuenta Firebase).
    const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (!apiBase) {
      return;
    }

    try {
      const token = await user.getIdToken();
      await api.post<UserProfile>(
        "/users",
        { uid: user.uid, firstName, lastName, email },
        { authToken: token, signal: AbortSignal.timeout(10_000) }
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Tu cuenta se creó, pero no pudimos guardar tu perfil. Intenta de nuevo.";
      throw new Error(message);
    }
  }

  async function register(values: RegisterFormValues): Promise<boolean> {
    setState({ isSubmitting: true, errorMessage: null, createdUser: null, verificationCode: null, profileWarning: null });
    try {
      const result = await completePasswordRegistration(values, {
        create: async (email, password) => (await createUserWithEmailAndPassword(auth, email, password)).user,
        onCreated: user => setState(previous => ({ ...previous, createdUser: user })),
        updateName: (user, name) => updateProfile(user, { displayName: name }),
        saveProfile: (user, data) => saveProfile(user, data.firstName, data.lastName, data.email),
        send: user => requestVerificationEmail(user, configuredVerificationEndpoint()),
      });
      setState({ isSubmitting: false, errorMessage: null, createdUser: result.user,
        verificationCode: result.verificationCode, profileWarning: result.warning });
      return true;
    } catch (error) {
      setState(previous => ({ ...previous, isSubmitting: false, errorMessage: mapFirebaseError(error) }));
      return false;
    }
  }

  async function registerWithGoogle(): Promise<boolean> {
    setState(previous => ({ ...previous, isSubmitting: true, errorMessage: null }));

    let credential: UserCredential;
    try {
      credential = await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setState(previous => ({ ...previous, isSubmitting: false, errorMessage: mapFirebaseError(error) }));
      return false;
    }

    const [firstName, ...rest] = (credential.user.displayName ?? "").split(" ");
    const lastName = rest.join(" ");

    try { await saveProfile(
      credential.user,
      firstName || "",
      lastName || "",
      credential.user.email ?? ""
    ); } catch (error) {
      setState(previous => ({ ...previous, isSubmitting: false,
        errorMessage: error instanceof Error ? error.message : 'No pudimos guardar tu perfil.' }));
      return false;
    }

    setState(previous => ({ ...previous, isSubmitting: false, errorMessage: null }));
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
