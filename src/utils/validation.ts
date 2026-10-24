import { z } from "zod";

/**
 * Esquema de validación para el formulario de contacto
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido")
    .max(150, "El correo no puede exceder 150 caracteres"),
  subject: z
    .string()
    .trim()
    .min(3, "El asunto debe tener al menos 3 caracteres")
    .max(150, "El asunto no puede exceder 150 caracteres"),
  message: z
    .string()
    .trim()
    .max(2000, "El mensaje no puede exceder 2000 caracteres")
    .optional()
    .or(z.literal("")),
  // Campo honeypot antispam para bots (debe llegar vacío)
  website_hp: z.string().max(0, "Spam detectado").optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/**
 * Esquema de validación para el checkout / datos del cliente en el carrito
 */
export const checkoutCustomerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Ingresa tu nombre y apellido completo")
    .max(120, "El nombre es demasiado largo"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+ ]{7,15}$/, "Ingresa un número de celular/teléfono válido"),
  cityOrDepartment: z
    .string()
    .trim()
    .min(2, "Ingresa tu ciudad o departamento")
    .max(80, "Nombre de ciudad demasiado largo"),
  address: z
    .string()
    .trim()
    .max(200, "La dirección no puede exceder 200 caracteres")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Las observaciones no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  // Honeypot antispam
  company_hp: z.string().max(0, "Spam detectado").optional().or(z.literal("")),
});

export type CheckoutCustomerValues = z.infer<typeof checkoutCustomerSchema>;

/**
 * Esquema de validación para el Libro de Reclamaciones
 */
export const claimFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Ingresa tu nombre completo")
    .max(150, "Nombre demasiado largo"),
  docType: z.enum(["DNI", "CE", "RUC", "PASAPORTE"]),
  docNumber: z
    .string()
    .trim()
    .min(8, "Número de documento no válido")
    .max(15, "Número de documento no válido"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+ ]{7,15}$/, "Ingresa un número telefónico válido"),
  email: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido")
    .max(150, "Correo demasiado largo"),
  address: z
    .string()
    .trim()
    .min(5, "Ingresa tu dirección completa")
    .max(200, "Dirección demasiado larga"),
  department: z.string().trim().min(2, "Selecciona o ingresa departamento"),
  province: z.string().trim().min(2, "Selecciona o ingresa provincia"),
  district: z.string().trim().min(2, "Ingresa tu distrito"),
  isMinor: z.boolean(),
  guardianName: z.string().trim().max(150).optional().or(z.literal("")),
  guardianDoc: z.string().trim().max(20).optional().or(z.literal("")),
  itemType: z.enum(["producto", "servicio"]),
  claimedAmount: z.string().trim().max(20).optional().or(z.literal("")),
  orderNumber: z.string().trim().max(50).optional().or(z.literal("")),
  itemDescription: z
    .string()
    .trim()
    .min(3, "Describe el producto o servicio contratado")
    .max(500, "Descripción demasiado larga"),
  claimType: z.enum(["reclamo", "queja"]),
  detail: z
    .string()
    .trim()
    .min(10, "El detalle debe contener al menos 10 caracteres")
    .max(2000, "El detalle no puede exceder 2000 caracteres"),
  request: z
    .string()
    .trim()
    .min(5, "Indica tu pedido concreto")
    .max(1000, "El pedido no puede exceder 1000 caracteres"),
  termsAccepted: z.literal(true, "Debes aceptar la declaración jurada"),
});

export type ClaimFormValues = z.infer<typeof claimFormSchema>;
