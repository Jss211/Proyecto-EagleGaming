# Fase 3: alternativa privada Firebase REST sin Sodium

## Resultado y alcance

**La alternativa es técnicamente viable.** Se preparó un módulo PHP 8.4 privado usando Google Identity Toolkit REST, OAuth 2.0 de cuenta de servicio, `firebase/php-jwt` con RS256/OpenSSL y SMTP autenticado. Se instaló y probó localmente con **PHP 8.4.27 y `extension_loaded('sodium') === false`**, sin ignorar requisitos. No requiere Kreait, lcobucci/jwt ni polyfills de Sodium.

**No está activado ni certificado contra el proyecto/hosting real.** No hay endpoint público, cambio React, envío real, claves de producción ni conexión a Firebase durante las pruebas. La configuración de ejemplo tiene `enabled: false` y SMTP desactivado; la composición privada retorna `null` antes de leer claves si el servicio no está habilitado. No se crea una página con la plantilla.

El usuario confirmó PHP 8.4.27 por carpeta en Hostinger Premium, OpenSSL/cURL/SQLite y extensiones básicas disponibles, salvo Sodium. Eso valida el punto de partida informado, no salida de red, permisos OAuth, bloqueos concurrentes del almacenamiento del hosting ni entrega SMTP. Se conserva todo el código de Fases 1/2 y los diagnósticos previos para Kreait. El criterio obligatorio de Sodium de aquel diagnóstico sigue siendo correcto **para Kreait**; no es el criterio de esta alternativa.

## Contrato oficial utilizado

El método [projects.accounts.sendOobCode](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/projects.accounts/sendOobCode) acepta `returnOobLink: true`: devuelve el enlace y **no envía correo Firebase**. El código fija ese valor, `requestType: VERIFY_EMAIL`, el proyecto y la URL de continuación desde configuración privada; no permite cambiarlos desde el navegador. El correo procede únicamente de la cuenta consultada mediante Auth.

La consulta [projects.accounts.lookup](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/projects.accounts/lookup) envía `localId: [uid_verificado]`. Exige una sola respuesta y UID coincidente. El servidor usa sus campos actuales: email, displayName, emailVerified, disabled, validSince y proveedores. No confía en email, UID, nombre, URL o estado de verificación proporcionados en el cuerpo del cliente.

Permisos mínimos documentados por esos métodos:

| Operación | Permiso IAM |
| --- | --- |
| Consultar cuenta por UID y comprobar su estado/revocación | `firebaseauth.users.get` |
| Obtener enlace administrativo de confirmación | `firebaseauth.users.sendEmail` |

Se usa únicamente el scope OAuth `https://www.googleapis.com/auth/identitytoolkit`, admitido por ambos métodos. Scope e IAM cumplen funciones distintas: el scope no concede por sí solo los permisos del proyecto. Una cuenta de servicio dedicada y un rol personalizado con esos permisos serían la opción de mínimo privilegio a revisar manualmente. No se necesitan Owner, Editor, permisos de actualización de usuarios, privilegios Firestore ni modificar los administradores de la tienda. [Mapa oficial de permisos](https://docs.cloud.google.com/identity-platform/docs/access-control).

Los permisos administrativos son por proyecto, no por cada cliente final; la restricción al UID de quien solicita se aplica en este servicio. No exponer una función genérica de lookup o envío arbitrario al navegador. No se concedió ningún rol en esta fase.

## Arquitectura preparada

1. El futuro cliente autenticado enviaría `POST` con Bearer ID token y cuerpo `{}`; el módulo no está conectado aún al registro o cuenta.
2. Antes de acceder a Google, el servicio limita peticiones por IP y presupuesto global usando SQLite privado. Requiere HTTPS y un origen exacto; CORS no reemplaza el Bearer.
3. Verifica el ID token con `firebase/php-jwt`, permitiendo solo RS256 y claves obtenidas de la URL fija de certificados públicos Google. Valida firma, `kid`, emisor, audiencia exacta, UID no vacío de máximo 128 bytes, expiración, `iat`, `auth_time` y restricciones temporales. Rechaza tenants, que no se soportan aquí. No consume `jku`/`x5u` del token para elegir una URL. [Requisitos oficiales de tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens).
4. Google Auth obtiene un access token OAuth mediante una aserción de servicio RS256, sin delegación de usuarios ni scopes adicionales. El intercambio usa el endpoint fijo `oauth2.googleapis.com/token`. Se cachea en SQLite privado hasta antes de su expiración, separado por identidad/proyecto/clave/scope. [Flujo de servicio](https://developers.google.com/identity/protocols/oauth2/service-account).
5. Consulta la cuenta actual. Rechaza cuentas deshabilitadas, UID distinto y sesiones cuyo `auth_time` sea anterior a `validSince`. Cuentas verificadas o vinculadas a Google no generan un nuevo envío. No consulta ni modifica permisos admin.
6. Reserva atómicamente el envío inicial/reenvío por UID; obtiene el `oobLink` mediante REST y comprueba HTTPS, origen permitido, acción `verifyEmail`, código presente y URL de continuación si viene incluida.
7. Lee las plantillas originales en `email-templates/verification/`, sustituye nombre/enlace en una sola pasada y escapa HTML según contexto. La versión de texto conserva el enlace original. No reevalúa marcadores introducidos en un nombre. No modifica el diseño aprobado.
8. El adaptador PHPMailer construye un correo multipart/alternative, con remitente fijo, SMTP autenticado, TLS validado, depuración apagada y tiempos limitados. El transporte queda desacoplado por la interfaz `Mailer`; un futuro proveedor API puede implementarla sin cambiar identidad o plantilla.
9. Responde solo con códigos públicos. No devuelve el enlace, el token OAuth ni los detalles de Google/SMTP. `sent` expresa aceptación del envío, no que la cuenta esté verificada. No existe código que marque `emailVerified` manualmente.

La capa cURL solo admite HTTPS a los hosts Google previstos, valida certificados, no sigue redirecciones, limita el cuerpo de respuesta a 256 KiB y usa conexión de 3 s/total de 8 s. Los certificados públicos respetan una caché con TTL acotado y una reserva de refresco para evitar consultas masivas por `kid` inventados. Si falla una validación o el almacén, el servicio no envía.

## Controles persistentes y duplicados

`PrivateStore` usa `BEGIN IMMEDIATE` y una reserva de todos los límites o ninguno. SQLite guarda claves HMAC para no almacenar UID/IP en texto claro; el secreto permanece en configuración privada. Límites preparados:

- Diez peticiones por IP/minuto y 120 globales/minuto antes de validar el token.
- Un envío por UID cada **cinco minutos**, cinco por UID/día y 100 envíos globales/día como presupuesto inicial conservador.
- Una reserva de refresco de certificados cada minuto.

El envío inicial y reenvío usan el mismo método y reserva, también entre procesos y con IP distintas. Se conserva la reserva si falla Google o SMTP; no hay reintentos automáticos, porque un timeout puede ocultar un mensaje ya aceptado. Esto evita intentos simultáneos y rápidos, pero no garantiza entrega exactamente una vez ante fallos externos. Antes de activar, definir un límite total de solicitud del host inferior a la reserva de 300 s y revisar la semántica del proveedor; cualquier reintento/outbox necesita conciliación o idempotencia propia.

SQLite contiene también el access token OAuth en caché: es un archivo sensible. Se crea con máscara privada; en Linux se rechazan permisos de grupo/otros. Usar un directorio 0700 y archivos 0600, fuera de **todas** las raíces públicas y del árbol fuente. Hay que comprobar bloqueos fiables en el almacenamiento real y acceso restringido a la cuenta PHP del sitio. Si no hay garantías de SQLite, revisar otra base privada antes de activar; no reemplazarlo por contadores del navegador.

## Archivos y dependencias

Todo el código nuevo se encuentra en `server/php-rest-verification/`:

| Archivo | Función |
| --- | --- |
| `composer.json`, `composer.lock`, `.gitignore` | Paquete privado separado del frontend; versiones reproducibles y exclusión de vendor/configuración/estado. |
| `config.example.json` | Configuración desactivada y sin secretos, con dominios `.test`. |
| `src/Contracts.php` | Contratos de HTTP, OAuth, verificación, API, correo, petición y respuesta. |
| `src/CurlHttp.php` | HTTP restringido con TLS y límites. |
| `src/GoogleOAuth.php` | Google Auth, scope acotado y caché privada. |
| `src/FirebaseTokenVerifier.php` | Validación RS256/claims y certificados públicos. |
| `src/IdentityToolkit.php` | Lookup administrativo por UID y generación REST del enlace. |
| `src/PrivateStore.php` | Caché y reservas transaccionales persistentes. |
| `src/TemplateRenderer.php` | Reutilización segura de HTML y texto aprobados. |
| `src/SmtpMailer.php` | Adaptador SMTP autenticado; sin envío si no está configurado. |
| `src/VerificationService.php` | Flujo, límites, autorización, estado de cuenta y errores controlados. |
| `src/Factory.php` | Composición privada, validación de ubicaciones y proyecto; no abre puertos. |
| `tests/run.php`, `tests/limit-worker.php` | Pruebas locales, dobles de red/correo y concurrencia SQLite. |

Dependencias directas fijadas por el lockfile:

| Paquete | Versión resuelta | Uso |
| --- | --- | --- |
| `firebase/php-jwt` | 7.2.1 | JWT RS256 con OpenSSL; Sodium es sugerido para EdDSA, que no se usa. |
| `google/auth` | 1.55.3 | OAuth de servicio mantenido por Google; no se programa un firmador propio. |
| `phpmailer/phpmailer` | 7.1.1 | SMTP autenticado y cuerpo HTML/texto. |

El lockfile contiene 14 paquetes en total, ninguno exige `ext-sodium` ni incluye Kreait/lcobucci. Se instaló con PHP realmente sin Sodium, sin `--ignore-platform-reqs`, sin `config.platform` ficticio, sin plugins ni scripts de instalación. `vendor` es local y está ignorado. No hay dependencias npm nuevas. Referencias: [Google Auth PHP](https://github.com/googleapis/google-auth-library-php), [JWT PHP](https://github.com/googleapis/php-jwt), [PHPMailer](https://github.com/PHPMailer/PHPMailer).

## Pruebas ejecutadas

**23 pruebas PHP aprobadas** en PHP 8.4.27 sin Sodium, usando claves RSA generadas en memoria solo para pruebas, dominios `.test`, enlaces `MOCK_ONLY`, HTTP falso y correo falso. Ninguna prueba llama a `CurlHttp` con un servicio real; la prueba SMTP usa `preSend`, no `send`.

Cubren: integridad SHA-256 de la plantilla, ausencia de dependencia Sodium, firma válida/adulterada, algoritmos prohibidos, claims/expiración/tenant, claves/caché, OAuth y scope, peticiones REST exactas con `returnOobLink`, falta de permisos simulada, cuentas revocadas/deshabilitadas/Google/verificadas, ausencia de token, cuerpo ajeno/excesivo, CORS/HTTPS/métodos, errores de proveedor sin detalles, límites por UID/IP, TTL, persistencia, fallo de almacén y reserva entre cuatro procesos. También escape contextual, MIME multipart/TLS y rechazo de rutas públicas.

`composer validate --strict` y `composer check-platform-reqs --no-dev` pasan en ese mismo entorno. `npm run build`, TypeScript privado y las 14 pruebas previas pasan. Lint mantiene las 20 advertencias preexistentes de React; no se cambió código activo. La salida Vite conserva sus hashes anteriores.

Para repetir en un entorno PHP **8.4 sin Sodium**, dentro de este módulo:

```text
php composer.phar install --no-dev --prefer-dist --no-interaction --no-scripts --no-plugins
php composer.phar check-platform-reqs --no-dev
php tests/run.php
```

Usar rutas reales al PHP y Composer privados del equipo; estos comandos no son instrucciones para activar SSH o ejecutar en producción. En Windows portable puede ser necesario señalar `OPENSSL_CONF` al `openssl.cnf` oficial de ese runtime para generar las claves efímeras de los tests. No se suben las claves de prueba a Hostinger y no se instalan dependencias dentro de `public_html`.

## Disponibilidad, cuotas y costes

La documentación oficial publica este método administrativo y Firebase publica generación de enlaces de verificación en Spark: actualmente **10 000/día**, sujeta a cuotas/protecciones y cambios. Nuestro límite inicial es menor. No confundir generación del enlace con cuota de correos enviados por Google, porque con `returnOobLink: true` Google no entrega este correo. [Cuotas de Auth](https://firebase.google.com/docs/auth/limits).

El diseño no requiere Cloud Functions, Cloud Run ni una actualización automática a Blaze. El runtime PHP usa el alojamiento existente. SMTP/proveedor, buzón, dominio y tráfico pueden tener límites o costes; no se presupone que exista una cuenta corporativa ni un proveedor gratuito. No se habilitaron servicios, facturación ni planes. [Planes Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

**No se comprobó el método contra el proyecto actual**: no hay credenciales autorizadas ni se permite generar enlaces reales en esta fase. Deben verificarse manualmente API habilitada, IAM, dominios autorizados, cuotas efectivas y políticas de la organización. Una referencia pública no acredita que el principal concreto pueda usarla. No actualizar Identity Platform ni activar facturación para resolver un error sin una revisión separada.

## Configuración manual pendiente antes de autorizar el envío

1. **Firebase/Google Cloud, lectura inicial:** identificar el mismo project ID de la tienda, comprobar `identitytoolkit.googleapis.com` en APIs y servicios y revisar cuotas/estado. No habilitar una API, cambiar Firebase o generar un enlace como parte de este informe. Registrar permisos o políticas faltantes.
2. **IAM, con autorización separada:** crear una cuenta de servicio dedicada y revisar un rol personalizado con `firebaseauth.users.get` y `firebaseauth.users.sendEmail`, sin permisos de actualización/borrado/configuración. Verificar soporte de esos permisos en el proyecto. La cuenta no necesita acceso a Firestore ni roles de administrador de la tienda. No usar Owner/Editor como atajo.
3. **Credenciales:** decidir un mecanismo privado de autenticación compatible con Hostinger. Si se autoriza una clave JSON de servicio, almacenarla fuera del repositorio y de todas las raíces públicas, restringir permisos y planificar rotación/revocación. No subirla al chat. No hay que generar una clave para ejecutar los mocks.
4. **Hostinger:** comprobar salida HTTPS con CA válida hacia los tres hosts Google usados, hora del sistema, archivos privados legibles solo por PHP, extensiones del lockfile y SQLite concurrente. Composer CLI y el handler web deben verificarse por separado; no activar SSH sin autorización. Una instalación local sin Sodium no certifica estas propiedades del hosting.
5. **Correo:** elegir proveedor autenticado, remitente y dominio; confirmar TLS, cuotas, puertos y SPF/DKIM/DMARC. Credenciales SMTP permanecen privadas. No realizar envíos durante esta fase.
6. **Configuración privada:** copiar el ejemplo a una ubicación **fuera del árbol fuente y del directorio público**, mantener ambos `enabled` en false y definir project ID, origen HTTPS exacto, URL de continuación autorizada, origen real del manejador Firebase, clave HMAC aleatoria de al menos 32 bytes, estado privado y ruta de la cuenta de servicio. La factory rechaza proyecto distinto y ubicaciones públicas.
7. **Empaquetado futuro:** conservar la estructura `server/php-rest-verification/` y `email-templates/verification/` dentro del árbol privado. La factory calcula esa ruta relativa para leer los cuerpos originales. No copiar plantillas, `.env`, Composer o vendor a la web pública. Si hay varios document roots, pasarlos todos a `Factory::fromPrivateConfig` para validar exclusiones.
8. **Montaje futuro, aún no implementado:** un adaptador HTTP mínimo deberá convertir `$_SERVER` y el cuerpo limitado a 1025 bytes en `Request`, imponer POST/preflight, extraer IP del socket o proxy explícitamente confiable y comprobar HTTPS sin confiar libremente en cabeceras. Debe capturar errores de composición sin mostrar trazas ni logs sensibles. Revisar las reglas Apache y la fecha límite de solicitud; no se creó ni publicó ese endpoint ahora.
9. **Validación aislada posterior:** con autorización, comprobar OAuth/permisos/método en un proyecto de pruebas, montaje HTTP, rotación de certificados, límite total, fallo SMTP y controles de logs. La disponibilidad del proyecto real no está probada por los mocks.
10. **React:** conservar el cliente preparatorio de Fase 2 sin llamadores hasta autorizar integración. El futuro registro separará creación de cuenta y resultado de envío, sin recrear usuarios al fallar correo. No habrá doble envío con `sendEmailVerification` ni restricciones globales. Google, administradores y compras de invitados siguen intactos.

## Riesgos pendientes y decisión

La alternativa evita el bloqueo Sodium mediante otro conjunto de dependencias compatible, **no desactivando validaciones**. Su coste técnico es mantener la capa REST, caché de certificados, comprobación de revocación, OAuth y límites que antes delegaría un SDK más grande. Requiere revisión de seguridad antes de exponerla y pruebas de infraestructura que no están autorizadas ahora.

La caché OAuth es sensible, SQLite depende de bloqueos reales del hosting, una cuenta de servicio comprometida permite operaciones administrativas concedidas y SMTP puede tener aceptación ambigua. Mantener copias privadas con acceso restringido; no registrar tokens, cuerpos, correos completos, claves ni enlaces. El host/proxy deberá redactar Authorization y evitar registrar cuerpos sensibles. No se eliminarán los límites para superar errores de cuota.

Podemos continuar con esta base privada y sin Sodium; **no puede afirmarse que el envío esté listo o disponible en el proyecto de producción** hasta completar las comprobaciones y obtener autorización. No se desplegó, publicó endpoint, modificó Firebase/Firestore, creó cuenta, envió correo, hizo commit/push o activó un servicio de pago.
