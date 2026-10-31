# Informe previo: PHP 8.4 para el servicio de verificación

Fecha: 31/10/2026, America/Lima. Repositorio `Jss211/Proyecto-EagleGaming`, rama `master`.

Este informe prepara acciones manuales; **no ejecuta cambios en Hostinger**. Situación confirmada por el usuario: Premium, PHP 8.1, SSH inactivo, Firebase Spark. No se accedió a hPanel ni se inspeccionaron los otros sitios. Los nombres del menú pueden mostrarse en español o inglés; usar el buscador lateral indicado cuando no coincidan.

Actualización para la prueba temporal: usar el [kit de diagnóstico protegido](diagnostic/README.md), que añade un bloqueo inicial, validación de identidad del servidor y comprobación de extensiones. Sus instrucciones sustituyen el ejemplo simplificado de diagnóstico de este informe. El inventario de archivos siguiente describe la revisión previa al kit; ahora también existen el diagnóstico y sus pruebas, siempre fuera de `public/`.

## Conclusión y alcance

La web React/Vite de este repositorio no necesita PHP para compilar ni para funcionar como sitio estático. El único archivo PHP encontrado es `server/php-verification/bin/check-environment.php`, una comprobación CLI fuera de la web. No hay servicio PHP activo, manifiesto Composer ni dependencia Kreait instalada.

**Sí existe una vía documentada para usar PHP 8.4 solo en una carpeta o subdominio.** Hostinger describe una regla local `SetHandler` que sobrescribe la versión del plan en esa ubicación. La versión global, la CLI y las extensiones/opciones son asuntos distintos. Debe confirmarse que el handler esté disponible en esta cuenta. Esto completa el informe anterior, que solo contemplaba el riesgo del selector global. Fuente: [PHP por carpeta o subdominio](https://www.hostinger.com/support/4047803-how-to-change-the-php-version-for-subfolders-or-subdomains-in-hostinger/).

La primera opción a evaluar es una **carpeta exclusiva para el endpoint**, sin cambiar el PHP global. Si no es viable, no pasar directamente a una actualización del plan: revisar antes todas sus aplicaciones y la recuperación. No se garantiza que la cuenta concreta admita todos los requisitos por el solo nombre Premium.

## 1. Qué depende de PHP en el repositorio

| Archivo o componente revisado | Dependencia de PHP | Implicación |
| --- | --- | --- |
| `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json` | Ninguna. Build con Node/npm, TypeScript y Vite. | Cambiar PHP no cambia el compilador ni las dependencias npm. |
| `index.html`, `src/main.tsx`, `src/App.tsx`, páginas y componentes | Ninguna ejecución PHP. React corre en el navegador. | El `dist` publicado debe conservarse sin reconstruir ni reemplazar para esta evaluación. |
| `src/firebase.ts`, Auth, Firestore, Google y recuperación | SDK Firebase web, no PHP local. | No cambiar proyecto, dominios autorizados, reglas ni permisos. |
| `src/features/auth/useRegister.ts`, `src/lib/api.ts` | API de perfiles opcional por `VITE_API_BASE_URL`; implementación desconocida. | Si se usa en el bundle publicado, identificar su host y tecnología. Podría estar fuera de este repositorio y sí depender de PHP. No se leyeron valores de `.env`. |
| Contacto y reclamaciones | Fetch a Formspree/FormSubmit y servicios Firebase. | No hay controlador PHP local que sustituir; no enviar formularios como parte del diagnóstico. |
| `src/pages/AdminPanel.tsx` | Usa un endpoint PHP de **Catbox externo**, además de ImgBB. | Ese PHP pertenece a otro proveedor; la versión de Hostinger no lo controla. |
| Carrito y pedidos | React/localStorage, Firestore y WhatsApp. | No se encontró PHP local en ese flujo. |
| `server/verification/*`, `src/features/auth/emailVerification.ts` | Preparación TypeScript de Fase 2. | Cliente aún desconectado de pantallas; ningún envío se activa por este informe. |
| `email-templates/verification/*` | Archivos HTML/texto y generador Node de vista previa. | Diseño aprobado preservado byte a byte. No alojar el contenido como página pública. |
| `server/php-verification/bin/check-environment.php` | Sí, únicamente comprobación manual por CLI. | No se ejecuta en producción y rechaza acceso HTTP. |
| `public/.htaccess` | Configura servidor HTTP, no ejecuta PHP. | Mantiene HTTPS, cabeceras, caché y fallback SPA. No se modifica. |
| `firebase.json`, `firestore.rules`, `cors.json` | Configuración/datos de servicios; no runtime PHP. | No se cambian durante esta preparación. |

No se encontraron `index.php`, `composer.json`, `composer.lock`, `.user.ini`, `php.ini`, `AddHandler` o `SetHandler` activos en el código revisado. Las redirecciones de antiguas rutas WordPress en `.htaccess` no demuestran que WordPress siga instalado: hay que inspeccionar el alojamiento.

**Verificación razonada:** PHP 8.4 no debería afectar directamente al JavaScript/CSS/HTML de Eagle Gaming. No equivale a certificar la web publicada: faltan los archivos reales del servidor, posibles reglas superiores, cron y la API opcional. Un cambio incorrecto en `.htaccess` puede romper las rutas aunque React no dependa de PHP.

El fallback actual excluye archivos y directorios físicos (`!-f`, `!-d`). Un futuro endpoint real en `/api-verificacion/email-verification.php` podría quedar fuera del fallback sin cambiar las rutas React. Esta compatibilidad debe comprobarse con un archivo diagnóstico inofensivo antes de desplegar un backend; no se crea ahora esa ruta.

## 2. Revisión manual que puedes hacer ahora sin actualizar PHP

1. Entra a hPanel → **Sitios web / Websites**. Anota todos los sitios que pertenecen al **mismo plan Premium**, incluidos subdominios, dominios adicionales y sitios sin tráfico. No asumas que todos los sitios de la cuenta comparten plan.
2. Para cada sitio, abre **Administrar sitio / Manage site**. Busca **Configuración de PHP / PHP Configuration** y registra la versión seleccionada sin pulsar Actualizar. Busca **PHP Info** y registra la versión observada. Una regla local puede hacer que la versión de una carpeta sea distinta de la que muestra el panel. [Comprobación oficial](https://www.hostinger.com/support/5920192-how-to-check-the-php-version-in-hostinger/).
3. Busca **Administrador de archivos / File Manager**. Activa la visualización de archivos ocultos. Identifica la raíz de cada sitio y de sus subdominios. Descarga para inspección sus `.htaccess` y, si existen, `.user.ini` y `php.ini`. Revisa también reglas de carpetas superiores accesibles; no las edites.
4. En cada raíz identifica si hay `index.php`, `wp-config.php`, `wp-content`, Laravel u otro framework, carpetas `vendor`, manifiestos Composer, scripts de formularios o código propio. No abras ni compartas el contenido de contraseñas o claves; basta registrar el tipo de aplicación y su versión.
5. Busca **Bases de datos / Databases** y **Tareas cron / Cron Jobs**. Registra qué base y tarea corresponde a cada sitio, su frecuencia y runtime; evita copiar contraseñas. Si no puedes identificar una tarea, marca el sitio como pendiente.
6. Para WordPress, consulta versiones de núcleo, plugins y tema desde su administración; contrástalas con sus proveedores para PHP 8.4. No actualices plugins, PHP y tema a la vez en producción. Para otras aplicaciones, revisar requisitos del framework, dependencias y extensiones con su responsable.
7. Identifica la API opcional de perfiles de Eagle, si se utiliza. Un responsable puede consultar la configuración privada de build y registrar solo dominio, runtime y propietario de la API; no copiar tokens ni valores secretos. Si no puede identificarse, dejar esa dependencia como incertidumbre.

Completa esta ficha para **cada** sitio:

| Sitio / raíz | Tipo y versión | PHP panel / efectivo | Reglas locales | Base / cron | Extensiones | Evidencia de PHP 8.4 | Copia restaurada de prueba | Responsable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Eagle Gaming | React/Vite estático; API opcional pendiente | 8.1 / por confirmar | Registrar | Firebase externo | Futuro servicio pendiente | Revisión de repositorio favorable | Pendiente | Completar |
| Otros dominios y subdominios | Completar | Completar | Completar | Completar | Completar | Pendiente | Pendiente | Completar |

## 3. Preguntas exactas para soporte de Hostinger

Desde la ayuda de hPanel, envía tú mismo estas preguntas, sin adjuntar claves:

> Tengo Premium con PHP 8.1 y SSH inactivo. Quiero evaluar PHP 8.4 solo en una carpeta nueva para un servicio privado de correo, manteniendo la versión global. ¿Está disponible `application/x-lsphp84` en mi servidor? ¿La regla local queda limitada a esa carpeta y sus descendientes? ¿Qué extensiones y opciones se aplican a ese handler y cómo puedo comprobarlas sin cambiar las de otros sitios? Necesitaré ctype, filter, json, mbstring, cURL, OpenSSL, sodium, PDO y posiblemente pdo_sqlite. ¿Está permitido guardar configuración, credenciales y plantillas fuera de todos los directorios públicos y leerlos desde el endpoint? ¿SQLite tiene bloqueos fiables para procesos PHP concurrentes en este almacenamiento? ¿Hay alguna limitación de salida HTTPS a Firebase/Google o SMTP autenticado con TLS? ¿Cómo se revierte únicamente esa regla local? ¿Qué implica el PHP 8.1 que muestra mi cuenta y qué recuperación de versión ofrece realmente el selector global? No autorizo cambios, activación de SSH ni servicios de pago.

Registra la respuesta, fecha y número de conversación. La publicación de una receta general no certifica extensiones, permisos ni rutas privadas de tu cuenta.

## 4. Carpeta frente a subdominio

| Opción | Ventajas para este proyecto | Límites y riesgos |
| --- | --- | --- |
| Carpeta dedicada bajo el mismo dominio | Evita DNS nuevo; el `connect-src 'self'` de la CSP ya permite peticiones al mismo origen. Menos cambios para el futuro cliente. | Hereda reglas y seguridad de la raíz. Verificar fallback, autenticación y ausencia de PHP ajeno en descendientes. |
| Subdominio con raíz exclusiva | Separa la dirección y las reglas del endpoint. | El subdominio no selecciona automáticamente otro PHP. Requiere handler local, HTTPS y confirmar raíz. La CSP actual de la tienda no autoriza ese nuevo host en `connect-src`; habría que revisarla después. CORS exacto y preflight también serían necesarios. |
| Selector PHP global de hPanel | Administración central. | Hostinger documenta alcance a los sitios del plan; requiere auditoría y pruebas de todos. No es la primera opción aquí. [Alcance global](https://www.hostinger.com/support/1575755-how-to-change-the-php-version-of-your-hostinger-hosting-plan/). |

La carpeta/subdominio ofrece **separación de versión**, no aislamiento de cuenta, permisos, CPU, memoria o fallos del alojamiento compartido. No resuelve la obsolescencia de otros sitios que sigan en PHP 8.1. El `includeSubDomains` de HSTS en la web exige prever certificado válido si se usa un subdominio.

Las extensiones y opciones **no se trasladan automáticamente** con la regla de versión. Tampoco cambia el PHP de Composer o cron. No utilizar `.user.ini` para intentar seleccionar el intérprete. No mezclar recetas cPanel, `AddHandler` antiguos o rutas de binarios no confirmadas con la configuración hPanel/LiteSpeed.

### Prueba manual futura del handler — no ejecutar todavía

Solo después de copias verificadas, respuesta de soporte y autorización de la prueba:

1. En **File Manager**, confirma la raíz de Eagle y crea una carpeta nueva y vacía, por ejemplo `public_html/_prueba_php84/`. Comprueba que ese nombre no esté usado. No cambies el `.htaccess` raíz ni el selector global.
2. Protege **solo esa carpeta** con contraseña desde **Manage site → Password Protect Directories**, conservando las reglas que genere. Comprueba que su URL exija contraseña antes de subir scripts. Esta protección será para diagnóstico, no para el endpoint final con token Bearer. [Protección de directorios](https://www.hostinger.com/support/1583470-how-to-password-protect-a-website-in-hostinger/).
3. En el `.htaccess` de esa carpeta, conserva la protección y añade al principio, con la confirmación de soporte, esta regla limitada a archivos `.php`:

```apache
<FilesMatch "\.php$">
    SetHandler application/x-lsphp84
</FilesMatch>
```

Es una adaptación limitada a `.php` del mecanismo oficial; no es un archivo instalado ni se debe copiar a la raíz del plan. La regla afecta a solicitudes PHP en ese ámbito, no al JavaScript. Si aparece un error HTTP 500, restaurar inmediatamente el archivo local anterior y consultar soporte.

4. Crea temporalmente `runtime-check.php` **dentro de la carpeta protegida**, con solo este contenido; no usar `phpinfo()` ni mostrar rutas, entorno o credenciales:

```php
<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$extensions = [];
foreach (['ctype', 'filter', 'json', 'mbstring', 'curl', 'openssl', 'sodium', 'PDO', 'pdo_sqlite'] as $name) {
    $extensions[$name] = extension_loaded($name);
}
echo json_encode(['php' => PHP_VERSION, 'extensions' => $extensions]);
```

5. Abre la URL exacta por HTTPS tras autenticarte. Debe responder JSON con PHP `8.4.x`. Si descarga el archivo o muestra código PHP, detener la prueba y eliminar el diagnóstico: el handler no está funcionando. No subir dependencias o secretos hasta resolverlo.
6. Verifica que páginas de Eagle y de los demás sitios sigan respondiendo como antes. La versión efectiva fuera de la carpeta debe conservarse; obtén evidencia desde el panel o con ayuda de soporte, sin instalar diagnósticos públicos en todos los sitios.
7. Registra versión/extensiones/resultados. Elimina `runtime-check.php` al terminar y comprueba que la información ya no sea accesible; una respuesta HTML del fallback React no significa que el diagnóstico siga instalado. Conserva la carpeta protegida solo si se acordó; en caso contrario recupera el estado inicial.

Los archivos PHP privados incluidos por el futuro endpoint se ejecutarán con el intérprete de la solicitud de ese endpoint. Colocar una biblioteca fuera de `public_html` no selecciona por sí mismo PHP 8.4. No subir allí ninguna plantilla pública de correo.

## 5. Copias de seguridad antes de cualquier prueba que escriba en hosting

**Exportaciones disponibles, sin contratar servicios:** por cada sitio, abre **Websites → Manage site → Backups → Restore and download**. En **Files backups**, elige fecha y **Download files**; espera la preparación y descarga el `.tar.gz`. En **Database backups**, selecciona base/fecha y **Download database**, descargando el `.sql.gz`. Registrar el alcance: la descarga de archivos puede abarcar el plan completo. Fuente: [descarga de copias](https://www.hostinger.com/support/5981435-how-to-download-backups-at-hostinger/).

Premium incluye copias semanales según esa documentación. **No asumir copia reciente ni el botón de generación manual:** la generación bajo demanda está documentada para Business o superior. No pulsar una oferta de actualización. Fuente: [creación de copias](https://www.hostinger.com/support/2298928-how-to-create-backups-at-hostinger/).

Procedimiento propuesto para una copia actual complementaria:

1. En File Manager descarga los archivos actuales de cada sitio, incluidos ocultos, `.htaccess`, configuración y subdominios; segmenta la descarga si el panel impone límites. Guarda fuera de la web pública, no un ZIP descargable en `public_html`. Si el panel exige crear un archivo temporal, colócalo fuera de las raíces públicas y retíralo tras descargarlo.
2. Para sitios MySQL, abre **Databases → phpMyAdmin**, selecciona la base correcta → **Exportar / Export**, formato SQL, estructura y datos. Guarda una copia actual y anota su correspondencia con los archivos. Para grandes bases o tiendas con escrituras constantes, coordina una copia consistente con el responsable/soporte; no anunciar consistencia solo porque ambas descargas terminaron. [Exportación oficial](https://support.hostinger.com/en/articles/4529011-how-to-export-a-database-with-phpmyadmin-in-hostinger).
3. Guarda capturas de versión PHP, opciones/extensiones, mapeo dominio-raíz, cron y reglas locales; protege cualquier secreto visible. Una copia de archivos no respalda necesariamente estos ajustes del panel.
4. Conserva una copia local cifrada y una segunda copia privada independiente. Verifica que los archivos abran, tengan tamaño razonable y contengan los directorios esperados; calcula SHA-256 para detectar cambios. No subir copias con datos de clientes a Git ni al chat.
5. Prueba la extracción y restauración en un destino aislado, sin sobrescribir el sitio real. Una descarga sin ensayo de restauración no completa la prueba de recuperación.
6. Anota fechas y horas con zona **America/Lima**, responsables y el punto de recuperación aceptado. Para sitios con pedidos, documenta cuántos cambios posteriores a la copia podrían perderse y cómo conservarlos.

Hostinger no es la copia de Firebase: Auth, Firestore y Storage quedan fuera de estos archivos/MySQL. No se necesita restaurarlos ni cambiarlos para evaluar PHP. Una restauración Hostinger tampoco revierte por sí sola el selector PHP, DNS o credenciales externas.

## 6. Compatibilidad de otros sitios: pruebas aisladas

Preparar un clon con archivos y base **independientes** de cada aplicación PHP, inicialmente local con PHP 8.4 o en un entorno de pruebas autorizado. No asumir que Premium incluye el staging automático de WordPress: Hostinger lo documenta para Business o superior. No contratarlo para este análisis. [Disponibilidad de staging](https://www.hostinger.com/support/5720286-how-to-create-a-wordpress-staging-environment-in-hostinger/).

Antes de abrir un clon, su responsable debe reemplazar conexiones de producción, desactivar cron/webhooks/correos y usar pasarelas de prueba. Proteger el acceso y bloquear indexación; `noindex` no sustituye contraseña. Usar datos mínimos o anonimizados. No clonar y abrir con credenciales de producción sin esa separación: puede ejecutar tareas aunque nadie pulse Enviar.

| Sitio o área | Prueba en clon | Criterio de aprobación |
| --- | --- | --- |
| WordPress | Acceso, administración, edición, carga de imágenes, tema y plugins esenciales. | Sin errores fatales ni incompatibilidades sin resolver; evidencia del proveedor cuando corresponda. |
| Tienda PHP/WooCommerce | Carrito, cálculo, inventario, pedido de prueba y pago sandbox. | Solo datos del clon; sin pagos, correos ni webhooks reales. |
| Aplicación PHP propia | Sesión, formularios, base privada, cron manual y subida de archivos. | Funciones esenciales correctas; errores privados revisados. |
| Eagle Gaming estático | Inicio, categoría/producto existentes, navegación directa y recarga de `/login`, `/cuenta`, `/carrito`, ruta inexistente, recursos y HTTPS. | Mismas rutas y archivos; sin errores nuevos de servidor o contenido PHP expuesto. |
| Auth/Firestore y futuras funciones de Eagle | Los 14 mocks existentes; para pruebas integrales, un proyecto aislado/emuladores. | Sin nuevas cuentas, escrituras o correos en producción. No basta abrir un clon del bundle publicado: puede seguir apuntando a Firebase real. |

En la web publicada limitarse a navegación de lectura y comparación de respuestas; no enviar reclamaciones, formularios, recuperación ni pedidos de prueba. No hacer pruebas de carga en el hosting compartido. Cada sitio debe tener resultado firmado por su responsable; un WordPress compatible no certifica los demás.

## 7. Recuperación preparada

| Situación futura | Recuperación propuesta |
| --- | --- |
| Falla solo la carpeta PHP 8.4 de prueba | Restaurar su `.htaccess` exacto anterior o retirar únicamente la regla agregada; mantener la protección durante la investigación. Retirar scripts de prueba. No tocar PHP global, React ni bases. |
| Error de rutas después de editar por equivocación la raíz | Restaurar el `.htaccess` raíz descargado antes de la prueba y verificar rutas directas. No restaurar toda la cuenta como primera medida. |
| Se alteraron archivos de un sitio | Recuperar solo los archivos afectados con alcance confirmado; conservar una copia del estado de fallo antes de sobrescribir. |
| Una aplicación de prueba escribió en una base real | Detener las escrituras y contactar al responsable. Conservar cambios posteriores a la copia; evaluar conciliación antes de restaurar. No importar un SQL antiguo indiscriminadamente sobre pedidos nuevos. |
| Se autorizara después un cambio global y falla algún sitio | Usar únicamente un procedimiento de reversión confirmado con Hostinger antes del cambio. No asumir que PHP 8.1 seguirá seleccionable. Si no existe recuperación viable, no autorizar ese cambio global. |

Para una restauración hPanel autorizada: **Manage site → Backups → Files backups → fecha → Show files**, seleccionar únicamente sitio/carpeta/archivo afectado y **Restore selected / Restore files** según la pantalla. Revisar **Restore History**. Si hacen falta datos MySQL, **Database backups → base/fecha → Restore Database**, solo tras aprobar la pérdida/conciliación de datos recientes. Fuente: [restauración oficial](https://www.hostinger.com/support/4283700-how-to-restore-backups-at-hostinger/).

No restaurar todo el plan por un error local. Verificar después HTTPS, rutas, recursos y funciones de los sitios afectados. Guardar evidencia de antes/después sin publicar secretos. La duración de recuperación depende del tamaño y del soporte: no prometer una cantidad de minutos sin ensayo.

## 8. Condiciones para retomar la integración PHP/Firebase

Debe quedar registrado:

- Inventario completo y dependencia opcional de perfiles identificada o descartada con evidencia.
- Confirmación de Hostinger del handler local, permisos privados, extensiones y límites.
- Copias descargadas, restauración ensayada y reversión local definida.
- Diagnóstico HTTP protegido mostrando PHP 8.4 en el ámbito previsto y versión externa sin cambios, cuando se autorice esa prueba.
- Pruebas de rutas y otros sitios aprobadas, sin operaciones reales de correo o pago.
- Una ruta para instalar dependencias sin activar SSH ahora: Composer local en PHP compatible y paquete privado reproducible, o acceso SSH posterior con autorización. El PHP CLI debe comprobarse aparte; un `config.platform` de Composer no convierte PHP 8.1 en 8.4.
- Decisión sobre carpeta o subdominio, CSP/CORS futuro y almacenamiento privado; todavía sin credenciales ni envío activado.

No hay que cambiar Firebase de plan, generar claves, configurar SMTP, modificar reglas ni integrar formularios React para completar esta revisión. Esos trabajos siguen pendientes de una fase autorizada después de validar la infraestructura.

## 9. Entrega de esta revisión

Solo cambia documentación: este informe y una nota de enlace/actualización en `README.md` de esta carpeta. No se modifican código React, Firebase, Apache, dependencias, plantillas o pruebas. La plantilla conserva los SHA-256 aprobados:

- HTML: `a141186f6aad6c7e6ed670f5a4df70e63de7318b0a637dddef550c28e7bb44ef`.
- Texto: `8458474edb81bc675c29cbaf98ad7a63f8ca50c05aea76d1c4163bdd703ea7ad`.

El análisis verifica el repositorio y documentación pública; **no certifica la configuración efectiva de Hostinger ni los otros sitios**. No se activó SSH, cambió PHP, accedió a producción, envió correo, desplegó, contrató servicios, hizo commit o push. La Fase 3 sigue en preparación y la Fase 4 no se inició.
