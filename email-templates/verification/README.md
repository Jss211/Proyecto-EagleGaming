# Fase 1: verificación de correo de Eagle Gaming Perú

Análisis del repositorio `Jss211/Proyecto-EagleGaming`, rama `master`, el 31/10/2026. Esta entrega prepara el diseño y la arquitectura. No integra envíos ni cambia la autenticación.

## Archivos y vista previa

| Archivo | Uso |
| --- | --- |
| `verification.html` | Cuerpo HTML del futuro correo. Tablas de presentación, estilos principales inline, fuentes del sistema, ancho máximo de 600 px y ajuste móvil. Sin scripts, imágenes remotas ni rastreadores. |
| `verification.txt` | Cuerpo alternativo de texto plano para un futuro mensaje multipart/alternative. |
| `preview.mjs` | Genera una copia local con nombre de ejemplo y botón que solo apunta a un fragmento del mismo documento. |
| `README.md` | Diagnóstico, contrato de la plantilla, propuesta y pendientes. |

**Asunto de ambas versiones:** `Confirma tu correo electrónico`.
El asunto se configurará como cabecera del mensaje en el futuro servicio de envío; no forma parte del cuerpo de texto plano.

Ajuste de diseño posterior a la fase 1: fondo completamente blanco, título «Bienvenido» centrado, botón rojo centrado mediante tablas y texto simplificado. Se retiraron los bloques negros, los mensajes promocionales, las repeticiones de marca y el pie de copyright. Se conservan los estilos inline, el ajuste móvil y los marcadores seguros. La versión de texto refleja el nuevo contenido. La vista previa se regenera con el mismo comando, sin integrar servicios de envío.

Desde la raíz del proyecto:

```powershell
node email-templates/verification/preview.mjs
```

Abrir `email-templates/verification/verification.preview.local.html` en el navegador. No necesita Vite, Firebase, variables de entorno, servidor ni conexión de red. El archivo generado queda ignorado por la regla `*.preview.local.html` del `.gitignore` de esta carpeta.

La copia incorpora una política CSP que bloquea recursos de red y scripts. El botón no verifica ninguna cuenta y no contiene un enlace Firebase simulado. Las plantillas fuente conservan los marcadores sin resolver. Esta carpeta está fuera de `src` y `public`, por lo que Vite no la publica en `dist`.

### Contrato de sustitución para la fase 2

- `{{CUSTOMER_NAME}}`: nombre obtenido de la cuenta autenticada; si falta, usar un saludo genérico. Escapar `&`, `<`, `>`, comillas dobles y simples para HTML. En texto plano usar texto, sin entidades HTML, y normalizar caracteres de control.
- `{{VERIFICATION_URL}}`: exclusivamente el enlace real devuelto por Firebase Admin SDK. No aceptar una URL del cliente ni construir códigos manualmente. Verificar HTTPS y el host permitido para el proyecto; escapar como atributo/texto HTML sin alterar el destino. Para texto plano conservar la URL original, sin entidades HTML.
- Sustituir todas las apariciones en una sola pasada mediante callback o un motor con escape contextual; no reevaluar marcadores que provengan de datos del usuario. Rechazar la salida si quedan marcadores de la plantilla sin resolver. No usar sustitución mediante `eval` ni concatenación de HTML sin escape.
- El renderer y el remitente definitivos no están implementados. `preview.mjs` usa exclusivamente valores fijos y no acepta credenciales, usuarios ni enlaces reales como entrada.

## Diagnóstico de autenticación

| Área / archivo revisado | Comportamiento observado |
| --- | --- |
| `src/features/auth/useRegister.ts` | `createUserWithEmailAndPassword` crea la cuenta e inicia sesión. Después `updateProfile` guarda nombre y apellido como `displayName`. No envía verificación. |
| `src/features/auth/RegisterForm.tsx` | React Hook Form y Zod validan el registro; llama `onSuccess` al recibir `true`. Google tiene su propio botón y no pasa por la validación del formulario de contraseña. |
| `src/features/auth/auth.types.ts` | Contraseña de 8 caracteres mínimo, mayúscula, número, confirmación y aceptación de términos. `UserProfile` no tiene estado de verificación. Los campos de consentimiento no se envían en `saveProfile`. |
| `src/pages/RegisterPage.tsx` | Tras el éxito hace `window.location.assign('/')`. No hay pantalla de correo pendiente. |
| `src/components/login/LoginForm.tsx` | Contraseña: `signInWithEmailAndPassword`. Google: `signInWithPopup`. Redirige a `/` o `/admin` según lista de emails; consulta el documento admin, pero aquí no utiliza el booleano devuelto para decidir la redirección. También usa `sendPasswordResetEmail`, que es recuperación, no verificación. |
| Google en `useRegister.ts` | El popup permite registro o acceso a una cuenta existente; toma nombre y correo del usuario Firebase y llama al guardado opcional de perfil. No distingue cuenta nueva con `getAdditionalUserInfo`. |
| `src/context/AuthContext.tsx` | `onAuthStateChanged` mantiene `user`, `loading`, `isAdmin`. Para candidatos de la lista admin consulta `/admins/{uid}`. No comprueba `emailVerified`. |
| `src/firebase.ts` | Inicializa SDK web: Auth, Firestore, Storage, Analytics y App Check si hay site key. No Admin SDK, SMTP ni servicio de correo. No configura `setPersistence`: se usa la persistencia predeterminada del SDK web, local cuando está disponible. |
| `src/pages/AccountPage.tsx` | Exige sesión, usa nombre/foto de Auth, lee teléfono de `/users/{uid}` y lo guarda con `setDoc(..., {merge:true})`. Nombre/foto se actualizan en Auth. No exige correo verificado. |
| `src/components/AdminRoute.tsx`, `src/utils/admin.ts`, `src/pages/AdminLogin.tsx` | Ruta admin usa contexto y documento admin; login dedicado sí rechaza cuando no existe documento. La consulta desde React sigue siendo cliente: el límite de seguridad real lo aplican las reglas de Firestore. |
| `firestore.rules` | Perfiles propios requieren UID autenticado. Productos se escriben por admins. Pedidos, reclamaciones y creación de reseñas admiten acceso público bajo validaciones de datos. No usan `email_verified`. Se revisaron sin cambios; no se comprobó que coincidan con las reglas desplegadas. |
| `package.json`, `firebase.json` | App Vite estática; scripts `dev`, `build`, `lint`, `preview`. Firebase configura únicamente la ruta de reglas de Firestore. Sin carpeta Functions, servidor, Admin SDK ni dependencia de correo. |

### Perfiles y sesiones

`saveProfile` solo intenta `POST /users` si existe `VITE_API_BASE_URL`, enviando el ID token como Bearer y un cuerpo con UID, nombre, apellido y correo. Si la variable falta, el registro se considera exitoso sin guardar un perfil en ese backend. No hay implementación de `/users` aquí: no se puede confirmar su disponibilidad, seguridad ni almacenamiento. Tampoco puede afirmarse que el registro cree `/users/{uid}` en Firestore.

Auth mantiene la identidad y su perfil básico; Firestore guarda al menos el teléfono al editarlo. La forma `UserProfile` del posible backend y el documento parcial de Firestore son contratos distintos. El cierre de sesión usa Firebase. Navbar, cuenta y reseñas también tienen observadores propios; no todo el estado pasa por `AuthContext`.

No se encontraron llamadas a `sendEmailVerification`, consultas a `emailVerified`, listener `onIdTokenChanged` ni ruta para procesar verificaciones en `src`. Esto describe el código local, no la consola ni acciones manuales externas.

## Problemas y riesgos encontrados

1. Una cuenta con contraseña obtiene sesión completa sin demostrar control del correo. No debe equipararse `user != null` con email confirmado.
2. Si falla `updateProfile` después de crear la cuenta, el hook informa fallo aunque la cuenta ya exista. Si falla el backend ocurre algo similar con el perfil. Un reintento puede devolver correo ya registrado. El envío debe manejar un error independiente sin recrear al usuario.
3. La interfaz exige login para reseñar y presenta textos de clientes verificados, pero las reglas locales permiten crear reseñas sin sesión ni coincidencia de UID. Un bloqueo solo en React no protege esas escrituras. Además, las reseñas guardan `userEmail` y tienen lectura pública: revisar la necesidad de publicar ese dato en una tarea posterior.
4. `/users/{uid}` permite al propietario escribir cualquier campo. Un futuro `emailVerified` o rol en ese documento sería manipulable y no debe autorizar operaciones. Usar Firebase Auth y claims verificados en servidor/reglas.
5. Endurecer de golpe todas las reglas cortaría pedidos de invitados, reclamaciones públicas y accesos de cuentas existentes. Definir primero alcance y migración, incluyendo administradores y proveedores Google.
6. Google no debe tratarse como un registro nuevo en cada popup ni verificarse solo por el nombre del proveedor. Leer el estado real de Firebase para decidir si requiere otro envío.
7. La clave de ImgBB se usa actualmente desde `VITE_IMGBB_API_KEY`; esas variables son públicas en el bundle. No copiar ese patrón para SMTP, Admin SDK o tokens privados de correo. No se leyeron ni reprodujeron valores de `.env`.
8. Los límites efectivos de App Check, dominios autorizados, remitente, DNS, cuota y plan de alojamiento no se conocen por el código. CORS y App Check no sustituyen la validación de identidad ni los límites de envío.

Son hallazgos documentados; esta fase no corrige el comportamiento existente.

## Arquitectura recomendada

### Evidencia de infraestructura

`public/.htaccess` contiene reglas de una SPA Apache, y `src/firebase.ts` menciona Hostinger. Esto sugiere publicación de `dist` en Hostinger/Apache; no demuestra qué plan está contratado ni que permita ejecutar Node. `firebase.json` tampoco configura Hosting o Functions. Contacto usa Formspree y reclamaciones FormSubmit; esos servicios no constituyen un backend de confianza para emitir acciones de Auth. El chatbot está desactivado y contiene una URL de API de ejemplo comentada.

### Dos caminos, sin activarlos en esta fase

| Opción | Alcance | Decisión |
| --- | --- | --- |
| `sendEmailVerification(user, actionCodeSettings)` desde el SDK web | Firebase envía su plantilla con personalización limitada. No recibe nuestro HTML. No necesita secretos en React. | Alternativa simple si se acepta el diseño permitido por Firebase. |
| Endpoint seguro + Firebase Admin SDK + proveedor transaccional | El servidor genera el enlace, renderiza HTML/texto y envía el correo personalizado. | Recomendación para el diseño completo solicitado. |

Firebase documenta la generación de enlaces para plantillas y servicios de envío propios en [Generating Email Action Links](https://firebase.google.com/docs/auth/admin/email-action-links). El endpoint puede vivir en Cloud Functions o Cloud Run sin mover la tienda. Si el alojamiento contratado ofrece un runtime de servidor compatible y secretos privados, evaluar reutilizarlo antes de incorporar otro servicio. La elección final depende de confirmar plan, costes, región y proveedor; no se crea infraestructura aquí.

### Flujo propuesto para fase 2

1. Crear la cuenta en Firebase, guardar `displayName` y mostrar estado pendiente sin perder la sesión. Separar creación, guardado de perfil y resultado de envío.
2. Solicitar el envío al endpoint autenticado. El servidor valida el ID token con Admin SDK y resuelve el usuario por su UID. Correo, destinatario y estado salen de Auth, nunca del cuerpo enviado por React.
3. Si falta correo o ya está verificado, no enviar. Aplicar límites persistentes por UID/IP y tiempo, deduplicación de peticiones y reintentos controlados. Los reenvíos deben funcionar también para una cuenta existente no verificada.
4. Generar el enlace con `generateEmailVerificationLink` y destino HTTPS predefinido. Usar inicialmente el manejador alojado por Firebase; definir la URL de continuación y sus dominios permitidos. Una URL de continuación no equivale a implementar un manejador propio. No redirigir a URLs arbitrarias del cliente.
5. Sustituir los marcadores según su contexto y enviar HTML + texto. Guardar credenciales solo en secretos del servidor, preferir identidad administrada para Admin SDK, configurar remitente y SPF/DKIM/DMARC. No registrar enlaces, códigos ni tokens completos. No devolver el enlace al navegador.
6. Al volver a la tienda, permitir “Ya verifiqué mi correo”: `reload(user)`, leer `emailVerified`, renovar el ID token con `getIdToken(true)` y actualizar explícitamente el estado de React. No asumir que `onAuthStateChanged` detecta una confirmación en otra pestaña. Observar cambios de token cuando corresponda.
7. Restringir únicamente las operaciones acordadas. En APIs verificar el token y la condición de verificación; en futuras reglas evaluar `request.auth.token.email_verified == true` cuando exista autorización para cambiarlas. Conservar la comprobación independiente de administrador.

No combinar los dos mecanismos de envío para un mismo intento: causaría correos duplicados. Firebase Auth es la fuente de verdad; no marcar el perfil de Firestore como confirmado por un clic del cliente.

Para el contrato técnico consultar [gestión de usuarios](https://firebase.google.com/docs/auth/web/manage-users), [referencia del SDK web](https://firebase.google.com/docs/reference/js/auth), [validación de ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens) y [persistencia](https://firebase.google.com/docs/auth/web/auth-state-persistence).

### Impacto antes de exigir verificación

| Funcionalidad actual | Consecuencia de un bloqueo general | Propuesta a acordar |
| --- | --- | --- |
| Registro/login, navbar y cuenta | Sesiones existentes no verificadas perderían acceso; cambiarían las redirecciones actuales. | Mantener sesión con pantalla/aviso pendiente y recuperación clara. |
| Reseñas | Usuarios no verificados no podrían publicar. Cambiar solo UI dejaría acceso directo a Firestore. | Aplicar política coherente en cliente y reglas en fase autorizada. |
| Carrito y pedidos WhatsApp | Actualmente funcionan sin sesión; exigir verificación eliminaría compra de invitados. | Conservar el flujo público salvo decisión explícita distinta. |
| Contacto y libro de reclamaciones | Son formularios públicos con proveedores externos. | Mantener su accesibilidad pública. |
| Administración | Un guard global podría bloquear administradores existentes. | Revisar su estado antes de migrar y mantener permisos por documento admin. |
| Google y cuentas existentes | Reenvíos duplicados o bloqueos si se asume su estado. | Consultar Firebase, distinguir cuenta nueva y permitir recuperación. |

## Validaciones de fase 1

- Antes de editar: `npm run build` pasó (incluye `tsc -b`); `npm run lint` pasó con 20 advertencias previas de React.
- Después de crear las plantillas: `npm run build` pasó sin errores de TypeScript; `npm run lint` pasó con las mismas 20 advertencias previas. Los nombres y hashes de los archivos de salida coinciden con el build inicial.
- `node --check email-templates/verification/preview.mjs` y la generación de la vista previa pasaron. Una comprobación local adicional verificó marcadores, sustitución completa, botón de fragmento, CSP y ausencia de scripts, imágenes y URLs remotas en las plantillas/vista previa.
- `git diff --check` pasó. El diff de `src`, `public`, dependencias y configuración Firebase está vacío; solo se agregaron los cinco archivos de esta carpeta. La vista previa está ignorada y no hay archivos de verificación en `dist`.
- Se intentó inspeccionar la vista previa en el navegador integrado, pero su política bloqueó el protocolo `file:`. No se completó la inspección visual; el archivo generado queda disponible para revisión manual local.
- No hay script `test` ni una suite automatizada configurada. `test-firestore.js` consulta datos remotos y depende de `dotenv`, no declarado; `test-firebase-err.js` también intenta una consulta Firebase con configuración incompleta. No se ejecutan como validaciones locales.
- No se prueban registros, logins o envíos contra producción para evitar crear cuentas, sesiones de prueba o modificar usuarios.
- HTML diseñado con técnicas comunes para Gmail, Outlook y Apple Mail; comprobar en clientes reales y móvil sigue pendiente antes de enviar en producción. Una vista previa en navegador no certifica compatibilidad de todos los clientes.

## Pendientes de fase 2 (requieren autorización)

Confirmar runtime y proveedor de envío; implementar endpoint y renderer con escape contextual; provisionar secretos/remitente y dominios; integrar registro y reenvío con manejo independiente de errores; agregar estado pendiente y actualización de sesión; decidir política para cuentas existentes, Google y admins; autorizar por separado cambios de reglas si se requieren; probar con emuladores/entorno aislado y revisar HTML en clientes de correo. Si se elige un manejador propio, implementar aplicación del código y estados de enlace usado, inválido o caducado.

No se hicieron commits, push, despliegues, envíos reales ni cambios de reglas, configuración Firebase o datos de usuarios. No se inició la fase 2.
