# Fase 2: preparación privada de verificación

## Estado y decisión de infraestructura

Preparación realizada exclusivamente en `master`. El usuario confirmó **Firebase Spark**, la publicación en **Hostinger**, un plan de alojamiento pendiente de identificar y ningún backend privado confirmado. Los archivos `public/.htaccess`, `vite.config.ts` y `firebase.json` son coherentes con una SPA Apache que consume Firebase; no contienen un servidor de correo o Functions. La API opcional `VITE_API_BASE_URL` no prueba que exista un backend operativo. No se inspeccionaron credenciales ni se accedió a consolas de producción.

Se elige un módulo Node privado, desacoplado del alojamiento y sin servidor iniciado, compatible con la API de Firebase Admin SDK. Mantiene la web estática en Hostinger. No se instala Admin SDK en el proyecto React ni se elige un proveedor de pago antes de conocer el runtime disponible. No hay nueva página pública, ruta React, middleware de bloqueo ni envío predeterminado Firebase.

**Limitación real:** Spark + alojamiento exclusivamente estático no pueden ejecutar este módulo. Un frontend no puede guardar con seguridad las credenciales necesarias para personalizar el envío. Hace falta un runtime privado y un transporte transaccional, aunque ambos puedan estar incluidos en un servicio existente o tener cuotas gratuitas.

La [documentación de planes](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) sitúa Cloud Functions en Blaze. La [tabla de Authentication](https://firebase.google.com/docs/auth/limits) incluye generación de enlaces de verificación en Spark; esto no implica que Firebase aloje nuestro backend o envíe nuestro HTML. No hace falta cambiar a Blaze solo por diseñar esta integración. Si se decide usar Functions o Cloud Run, revisar facturación y pedir autorización antes de habilitarlos. No se contrataron servicios ni se modificó ningún plan.

Primero confirmar si el Hostinger contratado permite un proceso Node privado con HTTPS, secretos y almacenamiento persistente. Si lo permite, evaluar reutilizarlo. Si solo admite archivos estáticos, comparar un backend independiente con cuotas gratuitas y restricciones reales (suspensión, límites, región, seguridad y soporte de correo), sin asumir que sea gratuito para siempre. No se eligió un proveedor cuya viabilidad aún no puede verificarse.

## Archivos de esta fase

| Archivo | Responsabilidad |
| --- | --- |
| `server/verification/contracts.ts` | Contratos de Auth Admin, correo, configuración y limitador atómico. |
| `server/verification/handler.ts` | Handler HTTP preparatorio con autenticación, autorización, límites y envío inyectado. No abre puertos. |
| `server/verification/template.ts` | Lee HTML y texto aprobados directamente del disco; sustituye marcadores en una pasada con escape contextual. |
| `server/verification/config.example.json` | Configuración de ejemplo desactivada; dominios reservados de prueba, sin secretos. No se carga automáticamente. |
| `server/verification/verification.test.ts` | Pruebas Node con Auth, correo, red y limitador simulados. |
| `server/tsconfig.json` | Validación estricta independiente de la preparación privada y las pruebas. |
| `src/features/auth/emailVerification.ts` | Cliente preparatorio, mensajes y consulta de estado Firebase. No está importado por ninguna pantalla actual. |
| `package.json` | Solo agrega `typecheck:verification` y `test:verification`. No cambia dependencias ni scripts existentes. |

Las plantillas aprobadas y su generador de vista previa no se modificaron. El backend reutiliza sus cuerpos sin duplicarlos ni publicarlos. El asunto sigue siendo `Confirma tu correo electrónico`.

## Contrato y seguridad del endpoint futuro

Montar exclusivamente `POST /auth/email-verification`, más su preflight OPTIONS, cuando se autorice activar el envío. El host debe adaptar su petición al `Request` web y pasar la IP del socket o de un proxy explícitamente confiable. No hay adaptador HTTP de producción en esta fase. Configuración propuesta: `enabled: false`; sin endpoint, el cliente devuelve `not_configured` sin llamar a Firebase o red.

La petición lleva `Authorization: Bearer <ID token>` y cuerpo `{}`. No acepta UID, nombre, destinatario, enlace ni URL de continuación del cliente. El servidor ejecuta `verifyIdToken(token, true)`, resuelve `getUser(uid)`, rechaza cuentas deshabilitadas y obtiene de Auth el correo y nombre actuales. Esto cubre tokens inválidos, revocados o de otro proyecto al usar un Admin SDK configurado para el mismo proyecto.

`already_verified` solo procede de `getUser`, nunca de un campo Firestore editable. Las cuentas vinculadas a Google devuelven `provider_managed` sin correo adicional; las cuentas existentes conservan su acceso y pueden solicitar reenvío si son elegibles. No se consulta ni cambia `/admins`, no se cambia recuperación de contraseña ni se fuerza cierre de sesión.

El handler permite un origen HTTPS exacto, no usa cookies y responde `Cache-Control: no-store`. CORS es defensa del navegador, no sustituye el token. El host debe imponer HTTPS, límites de conexión y timeout; el handler corta el cuerpo después de 1 KiB. No confiar libremente en `X-Forwarded-For`. Un proxy/CDN debe redactar cabeceras Authorization y evitar registrar cuerpos y enlaces de acción.

### Reservas de envío

El puerto `RateLimiter.consume` requiere incrementos atómicos con TTL, reloj del almacén y estado compartido entre procesos/reinicios: 10 intentos por IP/minuto antes de validar Auth, un envío por UID/minuto y cinco por UID/día. La clave por UID cubre tanto envío inicial como reenvío y evita dos envíos simultáneos con el mismo usuario aunque cambie de IP. Un error del almacén falla cerrado. Las reservas se consumen también si falla el envío, para limitar abuso y ambigüedad del transporte.

**Pendiente:** implementar el almacén persistente del runtime elegido (por ejemplo una base transaccional privada o un servicio con operaciones atómicas). El Map de las pruebas no es un adaptador de producción y no expira porque solo modela reservas durante cada prueba. Probar TTL real, carreras entre instancias y reinicios antes de activar. No se usa Firestore ni se cambia ninguna regla en esta fase. Se recomienda almacenar claves HMAC de UID/IP con una clave privada del servidor y expiración para reducir datos personales retenidos. App Check puede agregarse como defensa adicional del endpoint, sin reemplazar Auth y sin modificar su configuración actual.

No hay reintentos automáticos de correo. Si el proveedor responde con un timeout después de aceptar el mensaje, una repetición automática podría duplicarlo. Usar idempotencia nativa del proveedor o un outbox con conciliación al implementar el transporte; documentar la semántica antes de permitir reintentos. El límite actual evita duplicados simultáneos, no garantiza entrega exactamente una vez ante caídas externas.

### Enlace y plantilla

`generateEmailVerificationLink(user.email, {url: continueUrl})` genera el enlace en servidor. `continueUrl` se configura en privado y comparte origen con la tienda autorizada; `actionOrigin` es el origen exacto del manejador Firebase elegido, no una URL enviada por el usuario. El renderer exige HTTPS y ese origen antes de insertarlo. Se propone conservar el manejador alojado por Firebase y volver a `/cuenta`; no hay una nueva página que muestre el HTML del correo. La generación del enlace y la personalización del mensaje siguen el flujo de [Firebase Admin](https://firebase.google.com/docs/auth/admin/email-action-links).

El nombre se obtiene de Auth, elimina controles, tiene un máximo de 150 caracteres y usa `cliente` si falta. HTML escapa `&`, `<`, `>`, comillas simples y dobles; texto conserva el enlace original. Los marcadores desconocidos de la plantilla fallan. Una sola pasada evita interpretar como plantilla el contenido del nombre. El servicio envía un objeto `Mail` con destinatario desde Auth, asunto fijo, HTML y texto; el futuro adaptador debe enviarlo como multipart/alternative, con remitente fijo validado. No devolver ni registrar el enlace, token o contenido completo del correo en respuestas/logs. Errores del SDK y transporte se traducen a códigos públicos sin sus detalles.

## Cómo conectar Admin SDK después, solo en servidor

Cuando se confirme el runtime, crear un paquete privado de backend separado de las dependencias Vite, instalar allí `firebase-admin` con lockfile e inicializar una única instancia con el **projectId explícito del mismo proyecto** y credenciales de servidor. `getAuth(app)` satisface el contrato `AdminAuth` usado por el handler. Usar `applicationDefault()` en un entorno con identidad administrada, o un mecanismo de credenciales privado acorde al host. Nunca poner JSON de cuenta de servicio, claves SMTP o tokens transaccionales en `src`, `public`, `VITE_`, repositorio o respuestas HTTP. Desactivar `FIREBASE_AUTH_EMULATOR_HOST` al preparar el runtime real.

La composición futura será `createVerificationHandler({ auth: getAuth(app), mailer, limiter, templates: await loadTemplates(), config })`, con configuración desactivada hasta autorización. `mailer` y `limiter` son adaptadores que aún deben implementarse y probarse en ese entorno. Empaquetar `email-templates/verification/verification.html` y `.txt` conservando las rutas relativas esperadas por `loadTemplates`; no copiarlos a la web pública. Los tests de esta fase prueban la llamada a la API Admin mediante mocks, no una conexión al SDK real.

Referencias: [instalación del Admin SDK](https://firebase.google.com/docs/admin/setup) y [revocación/validación de sesiones](https://firebase.google.com/docs/auth/admin/manage-sessions).

## Registro, reenvío y confirmación preparados

No se conectó todavía el cliente a `useRegister`, `RegisterForm`, `LoginForm`, `AuthContext` ni `/cuenta`. Sus redirecciones, Google, administradores, carrito, reseñas y recuperación siguen como antes. Tampoco hay restricciones nuevas por `emailVerified`.

Al autorizar la conexión futura:

1. Crear la cuenta y actualizar nombre como hoy; conservar la sesión Firebase que se crea automáticamente.
2. Solicitar el envío solo para el registro con contraseña, utilizando `requestVerificationEmail`. Un resultado distinto de `sent` no revierte la cuenta, no llama de nuevo a crear usuario y no elimina la sesión. Separar también los errores de guardado de perfil, que hoy pueden ocurrir después de crear la identidad.
3. Mostrar el mensaje correspondiente de `verificationMessages` y permitir reenvío explícito a una cuenta ya autenticada. Inicial y reenvío llaman al mismo endpoint; no añadir `sendEmailVerification`, que generaría un segundo correo y usaría el diseño predeterminado.
4. En “Ya confirmé”, llamar `refreshVerificationStatus`: espera `user.reload()`, fuerza `getIdToken(true)` y devuelve el `emailVerified` obtenido de Firebase. Un error se propaga, nunca se convierte en éxito. El futuro componente debe actualizar explícitamente su estado; no esperar que `onAuthStateChanged` detecte una confirmación en otra pestaña.
5. Conservar acceso de usuarios existentes/Google y permisos admin. Cualquier política de bloqueo queda fuera de esta fase.

Los mensajes distinguen envío aceptado, correo ya confirmado, Google, configuración ausente, límite, sesión inválida y fallo temporal. Ni `sent` ni pulsar un enlace significan cuenta confirmada.

## Validaciones y límites

Ejecutar con Node 24 (runtime local usado: 24.20.0), desde la raíz:

```powershell
npm run build
npm run typecheck:verification
npm run lint
npm run test:verification
```

Las pruebas usan dominios `.test` y un código explícitamente `MOCK_ONLY`; nunca invocan servicios Firebase, SMTP o proveedor externo. Verifican preservación por SHA-256 del HTML/texto aprobados, autenticación/revocación, destinatario por UID, rechazo de parámetros ajenos, usuarios Google/verificados/deshabilitados, limitación concurrente, fallo cerrado del almacén, escape contextual, protección de respuestas, cliente sin activar y consulta del estado real mediante dobles.

Resultado local de esta entrega: build correcto (incluido TypeScript de la aplicación), typecheck privado correcto, **14 pruebas aprobadas** y lint correcto con las mismas **20 advertencias preexistentes** de React. Ninguna advertencia nueva en los archivos agregados. La salida Vite conserva los nombres/hashes del build de fase 1: el cliente preparatorio no forma parte del bundle porque todavía no lo importa ningún flujo activo. `git diff --check` pasó. El HTML y texto aprobados mantienen sus hashes originales; sus bytes no se modificaron.

Antes de activar faltan pruebas del SDK real en emuladores o proyecto aislado, persistencia/TTL del limitador, timeout/idempotencia del proveedor, montaje HTTP y revisión del mensaje en clientes de correo. No se afirma que esas conexiones estén verificadas por estos mocks.

## Configuraciones y servicios pendientes

- Identificar plan Hostinger y runtime privado. Si no existe, elegir alojamiento antes de instalar/provisionar servicios.
- Confirmar límites aplicables a Auth Spark y disponibilidad de generación de enlaces en el proyecto. No se accedió a la consola; Spark fue confirmado por el usuario.
- Configurar proyecto Admin, permisos mínimos de su identidad y almacenamiento privado de credenciales. No cambiar roles administrativos de la tienda.
- Confirmar dominio de tienda, dominio autorizado de continuación, origen real del manejador y configuración de acciones en Firebase Console. No se modificaron.
- Elegir transporte, remitente y dominio verificado, revisar cuotas y configurar SPF/DKIM/DMARC. No se contrataron servicios, no se asume un proveedor gratuito disponible ni se validó DNS.
- Implementar y probar adaptadores privados de correo/límites, montar el endpoint HTTPS, empaquetar las plantillas y luego autorizar la conexión al formulario.

No se realizaron envíos reales, despliegues, commits, push, cambios de datos, reglas Firestore, permisos admin, planes ni servicios de pago. La siguiente fase requiere autorización.
