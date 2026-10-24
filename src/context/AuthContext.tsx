import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase";
import { isAdminEmail, verifyAdminDocument } from "../utils/admin";

interface AuthState {
  user: FirebaseUser | null;
  /** true mientras onAuthStateChanged aún no disparó */
  loading: boolean;
  /** true solo si el usuario EXISTE en /admins/{uid} en Firestore */
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setState({ user: null, loading: false, isAdmin: false });
        return;
      }

      // Solo consultar Firestore si el email pasa la lista blanca
      // (evita un getDoc innecesario para cada usuario normal)
      const couldBeAdmin = isAdminEmail(currentUser.email);
      const adminVerified = couldBeAdmin
        ? await verifyAdminDocument(currentUser)
        : false;

      setState({
        user: currentUser,
        loading: false,
        isAdmin: adminVerified,
      });
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
