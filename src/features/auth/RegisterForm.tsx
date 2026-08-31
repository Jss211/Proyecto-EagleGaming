import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "./auth.types";
import { useRegister } from "./useRegister";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const { register, registerWithGoogle, isSubmitting, errorMessage } = useRegister();

  async function onSubmit(values: RegisterFormValues) {
    const ok = await register(values);
    if (ok) onSuccess?.();
  }

  async function handleGoogleClick() {
    const ok = await registerWithGoogle();
    if (ok) onSuccess?.();
  }

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Crea tu cuenta</h1>
      <p className="auth-card__subtitle">Únete a EagleGaming en segundos</p>

      <button
        type="button"
        className="oauth-button"
        onClick={handleGoogleClick}
        disabled={isSubmitting}
      >
        <GoogleIcon />
        Registrarme con Google
      </button>

      <div className="auth-divider">
        <span>o</span>
      </div>

      <form className="register-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="name-row">
          <InlineField
            label="Nombre"
            error={errors.firstName?.message}
            {...registerField("firstName")}
          />
          <InlineField
            label="Apellido"
            error={errors.lastName?.message}
            {...registerField("lastName")}
          />
        </div>

        <InlineField
          label="Correo"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...registerField("email")}
        />
        <InlineField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...registerField("password")}
        />
        <InlineField
          label="Confirmar"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...registerField("confirmPassword")}
        />

        <label className="checkbox-row">
          <input type="checkbox" {...registerField("optOutNewsletter")} />
          <span>No quiero recibir novedades de EagleGaming por correo</span>
        </label>

        <label className="checkbox-row">
          <input type="checkbox" {...registerField("acceptTerms")} />
          <span>
            Acepto los <a href="/terminos">Términos</a> y la{" "}
            <a href="/privacidad">Política de privacidad</a>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="field__error">{errors.acceptTerms.message}</p>
        )}

        {errorMessage && (
          <p role="alert" className="register-form__error">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="register-form__submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}

interface InlineFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function InlineField({ label, error, id, ...props }: InlineFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="field-inline-wrap">
      <label htmlFor={fieldId} className="field-inline__label">
        {label}
      </label>
      <input
        id={fieldId}
        className="field-inline__input"
        data-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.9v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.05z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.95l3.07 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}