import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
  Headset,
} from "lucide-react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, storage, db } from "../firebase";
import { Navbar } from "../components/home/Navbar";
import { SecondaryNav } from "../components/home/SecondaryNav";

export function AccountPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordPanelOpen, setIsPasswordPanelOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  
  // States for editing
  const [phoneNumber, setPhoneNumber] = useState("");
  const [editingField, setEditingField] = useState<"name" | "phone" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      if (user) {
        // Load phone number from Firestore when user loads
        getDoc(doc(db, "users", user.uid)).then((docSnap) => {
          if (docSnap.exists() && docSnap.data().phoneNumber) {
            setPhoneNumber(docSnap.data().phoneNumber);
          }
        }).catch(() => {}); // ignore errors silently
      }
    });
  }, []);

  function openEdit(field: "name" | "phone", currentValue: string) {
    setEditingField(field);
    setEditValue(currentValue);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    setErrorMessage(null);
    setMessage(null);
    try {
      if (editingField === "name") {
        await updateProfile(currentUser, { displayName: editValue });
        await currentUser.reload();
        setCurrentUser(auth.currentUser);
      } else if (editingField === "phone") {
        await setDoc(doc(db, "users", currentUser.uid), { phoneNumber: editValue }, { merge: true });
        setPhoneNumber(editValue);
      }
      setMessage("Información actualizada exitosamente.");
      setEditingField(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("No pudimos actualizar la información.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (!isLoading && !currentUser) navigate("/", { replace: true });
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return <main className="account-page account-page--loading">Cargando tu cuenta...</main>;
  }

  if (!currentUser) return null;

  const displayName = currentUser.displayName?.trim() || "Usuario Eagle";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const user = currentUser;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!user) return;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("La imagen no puede superar los 5 MB.");
      return;
    }

    setIsUploadingPhoto(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Subimos a ImgBB usando la API Key del .env
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Error al subir la imagen a ImgBB");
      }

      // ImgBB devuelve la URL directa de la imagen en data.data.url
      const photoURL = data.data.url;
      
      // Guardamos la URL de ImgBB en el perfil de Firebase Auth del usuario
      await updateProfile(user, { photoURL });
      await user.reload();
      setCurrentUser(auth.currentUser);
      setMessage("Tu foto de perfil se actualizó exitosamente.");
    } catch (error) {
      console.error("Error al subir avatar a ImgBB:", error);
      setErrorMessage("No pudimos subir la imagen. Inténtalo de nuevo más tarde.");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSendingReset(true);
    setResetFeedback(null);
    setResetError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetFeedback(`Enviamos un enlace de recuperación a ${email}.`);
    } catch (error) {
      setResetError(mapFirebaseError(error));
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  return (
    <>
      <Navbar />
      <SecondaryNav />
      <main className="account-page">
        <div className="account-shell">
          <header className="mb-10 border-b border-slate-700/30 pb-8">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Mi Cuenta</h1>
            <p className="mt-2 text-sm text-slate-400 font-medium tracking-wide">Administra tu información y credenciales</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-12 lg:gap-24">
            {/* Sidebar */}
            <aside className="flex flex-col gap-6">
              {/* Profile Overview */}
              <div className="flex items-center gap-5 mb-4">
                <label className="relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-red-500 bg-black text-white" title="Cambiar foto de perfil">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={`Foto de ${displayName}`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black">{initials || "A"}</span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/65 opacity-0 transition-opacity hover:opacity-100">
                    <Camera className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isUploadingPhoto} />
                </label>
                <div className="flex min-w-0 flex-col">
                  <h2 className="truncate text-xl font-bold">{displayName}</h2>
                  <p className="truncate text-sm text-slate-500">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="truncate">{phoneNumber || "No registrado"}</span>
                  </div>
                  {isUploadingPhoto && <p className="mt-1 text-xs font-semibold text-red-600">Subiendo foto...</p>}
                </div>
              </div>

              {/* Security Card */}
              <div className="rounded-2xl shadow-sm border border-slate-200/50 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Seguridad</h3>
                  <ShieldCheck className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-bold">contraseña</p>
                    <p className="mt-1 text-xl tracking-widest text-slate-400 leading-none">••••••••••</p>
                  </div>
                  <button type="button" onClick={() => setIsPasswordPanelOpen(true)} className="text-xs font-bold text-red-500 hover:text-red-400 transition-all hover:scale-110 active:scale-95">Cambiar</button>
                </div>
              </div>

              {/* Support Card */}
              <div className="rounded-2xl shadow-sm border border-slate-200/50 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Soporte</h3>
                  <Headset className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">¿Necesitas ayuda?</p>
                  <p className="mt-1 text-xs text-slate-500">Estamos para ayudarte</p>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" className="text-xs font-bold text-red-500 hover:text-red-400 transition-all hover:scale-110 active:scale-95">Contáctanos</button>
                </div>
              </div>
            </aside>

              {/* Main Details */}
            <section className="flex flex-col pb-8">
              <h2 className="mb-8 text-xl font-bold">Información Personal</h2>
              <div className="flex flex-col gap-6">
                <InfoRow 
                  icon={<UserRound className="h-8 w-8" />} 
                  label="Nombre de usuario" 
                  value={displayName} 
                  onEdit={() => openEdit("name", displayName)}
                />
                <InfoRow 
                  icon={<Phone className="h-8 w-8" />} 
                  label="Número de teléfono" 
                  value={phoneNumber || "No registrado"} 
                  onEdit={() => openEdit("phone", phoneNumber || "")}
                />
                <InfoRow 
                  icon={<Mail className="h-8 w-8" />} 
                  label="Correo electrónico" 
                  value={currentUser.email || "No registrado"} 
                  onEdit={() => setErrorMessage("Para cambiar el correo, por favor contáctanos por seguridad.")}
                />
              </div>

              {(message || errorMessage) && (
                <div role={errorMessage ? "alert" : "status"} className={`mt-8 flex items-start gap-2 border-l-4 px-4 py-3 text-sm ${errorMessage ? "border-red-600 bg-red-50 text-red-800" : "border-emerald-500 bg-emerald-50 text-emerald-800"}`}>
                  {message && !errorMessage && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{errorMessage || message}</span>
                </div>
              )}

              <div className="mt-12 flex justify-center">
                <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-red-500 border-2 border-red-500/80 rounded-xl transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Edit Profile Field Modal */}
      {editingField && (
        <div className="account-reset-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-title">
          <section className="account-reset-panel">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 flex justify-center pl-6">
                <img src="/icono.png" alt="Eagle Gaming" className="h-12 w-auto drop-shadow-md" />
              </div>
              <button type="button" onClick={() => setEditingField(null)} className="account-reset-panel__close -mr-2" aria-label="Cerrar ventana"><X className="h-5 w-5" /></button>
            </div>
            <h2 id="edit-title" className="m-0 text-xl font-bold mb-2">Editar {editingField === "name" ? "Nombre" : "Teléfono"}</h2>
            <form onSubmit={handleSaveEdit} className="account-reset-form mt-4">
              <label htmlFor="edit-input">Nuevo valor</label>
              <input 
                id="edit-input" 
                type={editingField === "phone" ? "tel" : "text"} 
                value={editValue} 
                onChange={(event) => setEditValue(event.target.value)} 
                required 
              />
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </section>
        </div>
      )}

      {isPasswordPanelOpen && (
        <div className="account-reset-overlay" role="dialog" aria-modal="true" aria-labelledby="password-title">
          <section className="account-reset-panel">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 flex justify-center pl-6">
                <img src="/icono.png" alt="Eagle Gaming" className="h-12 w-auto drop-shadow-md transition-transform hover:scale-105" />
              </div>
              <button type="button" onClick={() => setIsPasswordPanelOpen(false)} className="account-reset-panel__close -mr-2" aria-label="Cerrar ventana"><X className="h-5 w-5" /></button>
            </div>
            <h2 id="password-title" className="m-0 text-xl font-bold mb-2">Cambiar contraseña</h2>
            <p className="account-reset-panel__description">Escribe tu correo y te enviaremos un enlace seguro para crear una contraseña nueva.</p>
            <form onSubmit={handlePasswordReset} className="account-reset-form">
              <label htmlFor="account-reset-email">Correo electrónico</label>
              <input id="account-reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <button type="submit" disabled={isSendingReset}>
                <KeyRound className="h-4 w-4" />
                {isSendingReset ? "Enviando..." : "Enviar enlace seguro"}
              </button>
              {resetFeedback && <p className="account-reset-feedback account-reset-feedback--success" role="status">{resetFeedback}</p>}
              {resetError && <p className="account-reset-feedback account-reset-feedback--error" role="alert">{resetError}</p>}
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function InfoRow({ icon, label, value, onEdit }: { icon: React.ReactNode; label: string; value: string; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between pb-6">
      <div className="flex items-center gap-6">
        <span className="text-red-500 flex items-center justify-center">
          {icon}
        </span>
        <div>
          <p className="text-base font-bold">{label}</p>
          <p className="text-sm text-slate-500 mt-1">{value}</p>
        </div>
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="text-xs font-bold text-red-500 hover:text-red-400 transition-all hover:scale-110 active:scale-95">Editar</button>
      )}
    </div>
  );
}

function mapFirebaseError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "El correo electrónico no es válido.";
    case "auth/user-not-found":
      return "No encontramos una cuenta con ese correo.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.";
    default:
      return "No pudimos enviar el enlace. Inténtalo de nuevo.";
  }
}
