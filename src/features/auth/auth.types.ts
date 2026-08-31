import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Ingresa tu nombre"),
    lastName: z.string().trim().min(1, "Ingresa tu apellido"),
    email: z.string().trim().email("Ingresa un correo válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    confirmPassword: z.string(),
    optOutNewsletter: z.boolean().optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar los términos para continuar" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}