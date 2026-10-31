# Fase 3: compatibilidad PHP antes de integrar

Estado al 31/10/2026: **integración PHP detenida por compatibilidad**, de acuerdo con la última instrucción del usuario. Infraestructura confirmada por el usuario: Hostinger Premium, PHP 8.1, SSH inactivo y Firebase Spark. No se accedió ni cambió hPanel, Firebase, DNS o correo.

Actualización de la investigación: Hostinger sí documenta selección PHP por carpeta/subdominio mediante `SetHandler`, separada del selector global y sin trasladar extensiones/opciones. El procedimiento manual y las limitaciones están en [PLAN-HOSTINGER-PHP84.md](PLAN-HOSTINGER-PHP84.md). La recomendación actual es evaluar primero ese ámbito limitado, conservando el PHP global mientras se revisan los demás sitios; no se ha aplicado ninguna regla.

Para la validación temporal ya existe el [kit protegido de diagnóstico](diagnostic/README.md), con `runtime-check.php`, un `.htaccess` bloqueado por defecto e instrucciones de retirada. Se preparó localmente; no se ha subido a Hostinger ni se ha confirmado allí PHP 8.4. Sus pruebas están en `tests/diagnostic.test.mjs`. No agrega dependencias PHP ni implementa el envío.

## Decisión

Recomendar **PHP 8.4**, con la revisión de todos los sitios del plan antes de autorizar un cambio. PHP 8.3 es una alternativa técnica si alguna aplicación todavía no admite 8.4, pero no se puede certificar esa necesidad sin revisar las aplicaciones existentes. No se fuerza una dependencia moderna a ejecutarse sobre PHP 8.1 y no se rebajan requisitos con `--ignore-platform-reqs`.

| Componente evaluado | Compatibilidad comprobada en requisitos publicados | Decisión actual |
| --- | --- | --- |
| `kreait/firebase-php` 8.6.0 | PHP 8.3, 8.4, 8.5 o 8.6; no admite PHP 8.1. | No queda instalado ni declarado en el repositorio. |
| `kreait/firebase-php` 7.24.1 | Declara PHP 8.1–8.5 por ramas menores. | Existe compatibilidad de versión declarada con 8.1; no se instaló ni se validó toda su resolución transitiva sobre ese runtime. No se recomienda iniciar el servicio sobre PHP 8.1, sin soporte oficial. No se afirma que Kreait 7 haya dejado de mantenerse: no se verificó una política de mantenimiento que lo establezca. |
| `phpmailer/phpmailer` 7.1.1 | Declara PHP >=5.5 y extensiones ctype, filter y hash; SMTP cifrado requiere OpenSSL. | No es el bloqueo de versión principal; el SDK y el runtime sí. No queda instalado ni declarado. |
| Composer 2 | Hostinger lo documenta para Premium mediante SSH. | SSH está inactivo en esta cuenta; no se habilitó ni se asumió acceso disponible. |

Requisitos consultados en [Kreait 8.x](https://github.com/beste/firebase-php/blob/8.x/composer.json), [Kreait 7.x](https://github.com/beste/firebase-php/blob/7.x/composer.json) y [PHPMailer](https://github.com/PHPMailer/PHPMailer/blob/master/composer.json). También se consultaron las versiones estables y sus requisitos en Packagist. Kreait es una biblioteca comunitaria de administración Firebase para PHP; no se ejecutaría en React.

Según el [calendario oficial de PHP](https://www.php.net/supported-versions.php), PHP 8.4 tiene soporte activo hasta el 31/12/2026 y de seguridad hasta el 31/12/2028; PHP 8.3 conserva soporte de seguridad hasta el 31/12/2027. [PHP 8.1 terminó el soporte oficial el 31/12/2025](https://www.php.net/eol.php). Esto describe PHP upstream, no certifica qué parches adicionales pueda aplicar el alojamiento.

## Riesgos para los sitios existentes

Hostinger documenta que la selección PHP se aplica a todos los sitios del plan, con excepciones para su AI Builder. También informa que versiones inferiores a 8.2 ya no están disponibles para selección normal. Por ello, la indicación actual de PHP 8.1 merece confirmación del runtime efectivo con soporte/hPanel y **no se debe asumir que volver a 8.1 será posible con un clic**. No se usarán reglas antiguas de Apache para eludir ese límite. Fuente: [alcance y versiones de PHP en Hostinger](https://www.hostinger.com/support/1575755-how-to-change-the-php-version-of-your-hostinger-hosting-plan/).

La aplicación Eagle Gaming de este repositorio compila a HTML/CSS/JS y no usa PHP para ejecutar React o Firebase en el navegador. Por inspección del código, cambiar PHP no debería alterar directamente esos archivos estáticos. Es una conclusión sobre este repositorio, no sobre todos los dominios alojados: WordPress, plugins, temas, formularios PHP, tareas cron o integraciones externas pueden verse afectados.

El salto 8.1 → 8.4 incluye cambios de comportamiento, advertencias y posibles excepciones nuevas. Revisar código y dependencias de cada sitio con las guías oficiales [8.2](https://www.php.net/manual/en/migration82.incompatible.php), [8.3](https://www.php.net/manual/en/migration83.incompatible.php) y [8.4](https://www.php.net/manual/en/migration84.incompatible.php). Los riesgos incluyen extensiones ausentes, incompatibilidad de plugins, validaciones más estrictas y diferencias de configuración entre PHP web y CLI. No se ha auditado ningún otro sitio del plan ni se garantiza su compatibilidad.

Antes de una actualización autorizada:

1. Inventariar dominios, aplicaciones PHP y cron del mismo plan; identificar responsables y versiones soportadas.
2. Obtener copias recuperables de archivos, bases de datos y configuración; confirmar con Hostinger el alcance y las opciones reales de restauración/versión anterior.
3. Probar las aplicaciones en un entorno aislado con PHP 8.4 actualizado. Un subdominio en el mismo plan no garantiza aislamiento si comparte selección PHP.
4. Comprobar login, panel, formularios, compras y cron de esos sitios; revisar errores privados sin publicar `phpinfo()`.
5. Autorizar por separado la actualización, su ventana y el procedimiento de recuperación. No se realizó ninguno de esos cambios.

## Arquitectura propuesta después de resolver la compatibilidad

Conservar `server/verification/` y `src/features/auth/emailVerification.ts` de la Fase 2. Adaptar sus contratos a PHP en un módulo privado fuera de `public_html`, usando Kreait para validar el ID token con comprobación de revocación, obtener UID/correo desde Auth y generar el enlace con `getEmailVerificationLink`. Este método genera un enlace auténtico; no envía el mensaje predeterminado ni marca manualmente la cuenta como verificada. Véase [autenticación en Kreait](https://firebase-php.readthedocs.io/8.2.0/authentication.html).

El futuro adaptador SMTP autenticado enviaría el HTML y texto aprobados con escape contextual, TLS obligatorio y credenciales fuera del código y del directorio público. No se presupone que exista un buzón corporativo ni un proveedor contratado. Configuración y envío seguirían desactivados mientras no se prueben identidad, errores, límites persistentes y reenvíos sin duplicados.

Solo un endpoint JSON se expondría bajo una ruta física como `/api/email-verification.php`. No serviría la plantilla como página. Las reglas Apache actuales excluyen archivos existentes del fallback React, lo que permite planificar ese punto de entrada sin cambiar ahora `public/.htaccess`. En su implementación futura habría que comprobar HTTPS, CORS de origen exacto, IP confiable, límites de cuerpo, errores controlados y limitación transaccional persistente (SQLite si está habilitado y admite bloqueos fiables en el alojamiento, o una base de datos privada disponible). Esto es arquitectura propuesta; no un endpoint implementado o probado en Hostinger.

El uso de PHP privado no requiere por sí mismo pasar Firebase de Spark a Blaze. Authentication publica cuotas de generación de enlaces para Spark; comprobar las cuotas efectivas del proyecto antes de activar. No se necesita Cloud Functions para esta propuesta. Fuente: [límites de Firebase Auth](https://firebase.google.com/docs/auth/limits).

## Archivos y dependencias que quedan

Solo se agregan en esta revisión:

- Este `README.md` con el diagnóstico, requisitos y próximos pasos.
- `bin/check-environment.php`: comprobador CLI sin dependencias; informa si el runtime admite la propuesta y si están las extensiones previstas. No es una página pública ni realiza conexiones, envíos o cambios.

**Ninguna dependencia PHP nueva queda agregada al repositorio.** No quedan `composer.json`, `composer.lock`, `vendor`, adaptadores o endpoint de Fase 3. Los borradores y dependencias se evaluaron en el entorno local PHP 8.3 mientras se esperaba la versión de hPanel y se retiraron al confirmar PHP 8.1. No se instalaron en Hostinger. Las herramientas locales portables para evaluación están fuera del repositorio, en `../.verification-tools`, sin cambios globales a PHP, Composer o PATH.

No se modificaron los archivos de Fases 1 y 2 durante esta revisión: plantilla y vista previa aprobadas, módulo TypeScript, cliente preparatorio y sus scripts permanecen. El cambio de `package.json` visible en Git corresponde a la Fase 2 previa.

## Pruebas y estado de integración

- `npm run build`: correcto; incluye TypeScript de la aplicación.
- `npm run typecheck:verification`: correcto.
- `npm run test:verification`: las 14 pruebas existentes con mocks pasan.
- `npm run lint`: correcto con las mismas 20 advertencias preexistentes de React.
- HTML/texto aprobados conservan sus hashes SHA-256 originales.
- El comprobador CLI pasó sintaxis y requisitos en PHP **local 8.3.36**, no en el alojamiento. No certifica PHP 8.1 ni PHP 8.4 de Hostinger. El código del comprobador puede ejecutarse en PHP 8.1 para informar la incompatibilidad sin cargar SDK alguno, cuando exista acceso autorizado a CLI.
- No se ejecutaron pruebas de un nuevo backend PHP: la implementación quedó detenida al confirmar el runtime incompatible. No se probó SMTP, conexión real a Firebase, Apache del alojamiento ni otros sitios.

**React sigue sin llamar al servicio de envío.** Google, cuentas existentes, administradores, recuperación, carrito, compras de invitados y reglas Firestore permanecen intactos. No hay restricciones por `emailVerified` nuevas.

Pendiente para reanudar Fase 3: validar el impacto de PHP 8.4 en todos los sitios, autorizar la actualización cuando corresponda, confirmar runtime/extensiones efectivos y decidir acceso a Composer (SSH o empaquetado privado local). Después se prepararán y probarán los adaptadores PHP; las credenciales de servicio Firebase, secreto de limitación y SMTP se configurarán manualmente en privado solo cuando sea necesario. No se necesitan credenciales para este análisis y no deben pegarse en el chat.

No hubo cambios de Hostinger/Firebase, commits, push, despliegues, correos reales, cambios de plan ni servicios de pago. La Fase 3 no está completa y la Fase 4 no se inició.
