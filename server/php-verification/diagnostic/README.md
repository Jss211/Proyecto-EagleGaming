# Prueba manual temporal de PHP 8.4

Esta carpeta prepara un diagnóstico de runtime, **no el servicio de correo**. No necesita Composer, Firebase, SMTP, claves, bases de datos ni dependencias. No se ha subido nada a Hostinger. Trabajar sobre una carpeta NUEVA y exclusiva; nunca sustituir el `.htaccess` de la tienda.

## Qué subir

Desde esta carpeta del repositorio, usar únicamente:

| Archivo | Destino temporal |
| --- | --- |
| `.htaccess` | `public_html/_prueba_php84/.htaccess` |
| `runtime-check.php` | `public_html/_prueba_php84/runtime-check.php`, solo después de comprobar la protección |

No subir este README, tests, `server/verification/`, plantillas de correo, archivos `.env`, Composer, `vendor` ni credenciales. El nombre `_prueba_php84` es un ejemplo: confirmar que esté libre y usar el mismo nombre en todos los pasos. No se modifica `public/` ni se añade una ruta al build Vite.

La regla `SetHandler application/x-lsphp84` sigue el mecanismo que [Hostinger documenta para carpetas y subdominios](https://www.hostinger.com/support/4047803-how-to-change-the-php-version-for-subfolders-or-subdomains-in-hostinger/). Se aplica aquí solo a `.php`. Las opciones/extensiones no quedan configuradas por esa regla; tampoco cambia el intérprete CLI.

## 1. Antes de subir archivos

1. Revisar las copias y el inventario del [plan previo](../PLAN-HOSTINGER-PHP84.md). Descargar el `.htaccess` raíz actual y conservar una copia local. Registrar versión PHP global y las rutas principales que funcionan; no pulsar Actualizar PHP.
2. Confirmar con soporte que `application/x-lsphp84` está disponible en la cuenta. Si no lo está, detenerse: no cambiar el selector global ni probar handlers al azar.
3. Entrar a **hPanel → Sitios web / Websites → Administrar sitio / Manage site → Administrador de archivos / File Manager**. Confirmar la raíz real de Eagle Gaming.
4. Crear una carpeta nueva llamada `_prueba_php84` dentro de esa raíz. Si ya existe, no mezclar archivos; elegir otra carpeta vacía y registrar su nombre. No crearla dentro de una aplicación PHP o WordPress existente.

## 2. Proteger la carpeta antes del diagnóstico

1. Subir **primero solo `.htaccess`** a la carpeta nueva. Mostrar archivos ocultos para comprobar su ubicación. Incluye `Options -Indexes`, el handler PHP y un bloqueo inicial `Require all denied`.
2. En **Manage site**, buscar **Password Protect Directories / Proteger directorios con contraseña**. Seleccionar exactamente la carpeta nueva, no la raíz, y configurar un usuario/contraseña exclusivos para esta prueba. Guardarlos en privado; no en el repositorio ni en el chat. [Procedimiento de Hostinger](https://www.hostinger.com/support/1583470-how-to-password-protect-a-website-in-hostinger/).
3. Volver a File Manager y abrir el `.htaccess` de la carpeta nueva. Confirmar que conserva `application/x-lsphp84` y contiene las directivas de protección generadas por hPanel. Si hPanel sustituyó el contenido, combinar ambas partes sin borrar su bloque de autenticación. No editar su ruta privada de contraseñas ni fabricar otra.
4. Solo cuando la protección de hPanel esté configurada, retirar **exclusivamente** el bloque comprendido entre `# BEGIN EAGLE SAFETY LOCK` y `# END EAGLE SAFETY LOCK`, incluidos esos marcadores. Conservar el handler, `Options -Indexes`, el filtro de nombres y toda la autenticación de hPanel. No retirar el otro `Require all denied` del filtro de archivos.
5. Crear en esa carpeta un archivo temporal `access-check.txt` que contenga solo `EAGLE ACCESS CHECK`. Es texto sin información sensible, permitido por el filtro de nombres.
6. Abrir `https://TU-DOMINIO/_prueba_php84/access-check.txt` en una ventana privada **sin credenciales**: debe pedir usuario/contraseña y no mostrar el contenido antes de autenticarse. En las herramientas de red del navegador debe verse el desafío HTTP 401. Si el contenido aparece públicamente, detenerse, reponer el bloqueo inicial y corregir la protección antes de subir PHP.
7. Autenticarse con el usuario de prueba: debe aparecer ese texto. Si sigue devolviendo 403/500, no desactivar protecciones globales; revisar solo la carpeta o consultar soporte. Usar una segunda ventana privada para volver a comprobar que sin credenciales se exige autenticación; el navegador puede recordar Basic Auth en la primera.

La protección de hPanel es obligatoria durante la prueba. El script añade una defensa: exige `REMOTE_USER` o `REDIRECT_REMOTE_USER` del servidor. Un nombre en `PHP_AUTH_USER` o en una cabecera de petición no basta. Si Hostinger no transmite esa identidad autenticada a PHP, se detendrá con un error controlado; pedir a soporte cómo hacerla disponible, sin relajar el control.

## 3. Ejecutar el diagnóstico

1. Una vez aprobada la prueba anterior, subir `runtime-check.php` a esa misma carpeta; mantener el nombre exacto. No subir una clave Firebase ni instalar un SDK.
2. Abrir **por HTTPS**, autenticado, `https://TU-DOMINIO/_prueba_php84/runtime-check.php`, **sin parámetros**. Solo admite GET; no hay formulario, cookies propias ni envío de correo.
3. Guardar el JSON de resultado localmente y anotar fecha/hora America/Lima. No compartir usuario/contraseña; el JSON no incluye identidad, IP, rutas, hostname interno, variables de entorno o configuración privada.
4. En otra ventana privada sin credenciales, comprobar que esa URL sigue protegida. No basta con que el script funcione en tu navegador autenticado.
5. En la web habitual, revisar inicio, categoría/producto ya existentes y recarga directa de `/login` y `/carrito`. No enviar formularios, crear cuentas, iniciar recuperación o hacer pedidos de prueba. Confirmar también las páginas de lectura habituales de otros sitios del plan.
6. Comparar con la versión global registrada y confirmar que no cambió en hPanel. La respuesta de la carpeta solo prueba su propio ámbito, no la versión efectiva de cada otro sitio. Si se necesita evidencia adicional, solicitarla a soporte sin instalar diagnósticos públicos.

Si el navegador descarga PHP o muestra su código fuente, eliminar el diagnóstico y detenerse: no hay ejecución PHP correcta. Si muestra HTML de React, verificar ruta/nombre y existencia física; eso tampoco es un resultado válido.

El script no confía en `X-Forwarded-Proto`. Si Hostinger termina TLS en un proxy y no expone `HTTPS=on` o `1`, aparecerá `https_required` aun usando HTTPS en el navegador. Pedir a soporte cómo obtener una señal de HTTPS confiable; no añadir confianza libre en cabeceras.

## 4. Interpretar el resultado

Una respuesta válida contiene `diagnostic: "eagle_php84_probe_v1"`. Los resultados de versión/extensiones se devuelven con HTTP 200 incluso si faltan requisitos, para distinguirlos de un fallo de servidor.

| Campo / respuesta | Interpretación y acción |
| --- | --- |
| `php_version: "8.4.x"`, `php_84: true` | La solicitud ejecutó PHP 8.4. No certifica por sí sola el SDK, SMTP o Firebase. |
| `php_84: false` | Otra versión ejecuta el archivo. Detener la integración; revisar handler y ubicación. PHP 8.3 puede admitir Kreait, pero no valida esta prueba específica de 8.4. |
| `sdk_extensions` | ctype, filter, json y mbstring: requisitos directos publicados por Kreait 8.x. Todos deben ser `true`. [Requisitos de Kreait](https://github.com/beste/firebase-php/blob/8.x/composer.json). |
| `integration_extensions` | curl, openssl, sodium, hash e iconv. Sodium es obligatorio transitivamente para Kreait 8.6.0 por `lcobucci/jwt`; no debe reclasificarse como opcional. Todos deben ser `true` para aprobar la propuesta actual. Ver la [revisión de dependencias](../DEPENDENCIAS-SODIUM.md). No sustituye comprobar el lockfile definitivo. |
| `storage_extensions` | PDO y pdo_sqlite: comprueba presencia para la propuesta de límites persistentes. SQLite no es un requisito directo de Kreait; si falta, evaluar almacenamiento privado alternativo o soporte, no activar la extensión global sin revisar alcance. |
| `diagnostic_passed: true` | PHP 8.4 y todas las extensiones consultadas presentes. Permite revisar el siguiente paso; no prueba versiones de bibliotecas, escrituras/bloqueos SQLite, conexiones ni entrega de correo. |
| `diagnostic_passed: false` | No continuar con el envío. Identificar campos `false` y consultar soporte. La lectura no habilita extensiones. |
| 401 del servidor | Sin autenticar es lo esperado. Con credenciales correctas, revisar protección local. |
| `server_authentication_required` (403) | PHP no recibió identidad autenticada del servidor. No se muestran versión/extensiones. Resolver con soporte. |
| `https_required` (403) | Falta evidencia confiable de HTTPS. Corregir TLS/señal del servidor. |
| `method_not_allowed` (405) | Usar GET en el navegador. |
| `query_not_allowed` (400) | Abrir la URL sin `?debug`, claves ni otros parámetros. |
| 403 genérico antes de JSON | Puede seguir activo el bloqueo inicial u otra restricción de carpeta. No tocar la raíz para resolverlo. |
| HTTP 500 o `diagnostic_failed` | Restaurar configuración local previa y consultar soporte. No habilitar errores públicos. |

`scope: "runtime_only_no_sdk_or_delivery_test"` recuerda el alcance limitado. No hay escritura en SQLite, consultas Auth, generación de enlaces reales ni conexión SMTP.

## 5. Retirar al terminar — en la misma sesión

1. Guardar el resultado y borrar **primero `runtime-check.php`**, mientras sigue protegida la carpeta. Borrar también `access-check.txt`.
2. Confirmar en File Manager que ambos desaparecieron. Verificar que su URL ya no devuelve el JSON ni el texto de control. Un 404, una denegación o el fallback HTML pueden variar por las reglas padre; lo imprescindible es que no se ejecute el diagnóstico.
3. Restaurar el estado inicial: si la carpeta era nueva y se creó exclusivamente para esto, retirar su regla PHP y su contenido; eliminar su protección desde hPanel seleccionando únicamente ese directorio y retirar la carpeta vacía. Si había algún archivo previo, detenerse y no borrar contenido ajeno. Nunca quitar protección mientras quede PHP diagnóstico.
4. Revisar de nuevo páginas de lectura de Eagle y confirmar el PHP global sin cambios. No hay motivo para restaurar bases de datos por una prueba que solo lee runtime.
5. Si hubo un problema de configuración, recuperar **solo** el `.htaccess` local de prueba o, si se editó la raíz por equivocación, la copia exacta raíz guardada. No restaurar todo el plan indiscriminadamente.

No dejar el diagnóstico público aunque no contenga secretos: la versión y las extensiones son información que solo se necesita durante esta comprobación.

## 6. Composer y dependencias después de confirmar Hostinger

| Capa | PHP necesario |
| --- | --- |
| Herramienta Composer 2 | Su documentación general indica PHP >=7.2.5 para ejecutarla; comprobar los requisitos de la versión concreta. Que Composer arranque en 8.1 no permite ejecutar Kreait 8.x. |
| Kreait Firebase PHP SDK 8.x | Declara ramas PHP 8.3–8.6. No es compatible con 8.1. |
| Runtime elegido para el servicio y su empaquetado | PHP **8.4** real con extensiones verificadas. CLI y web se validan por separado. |

Fuente: [requisitos de Composer](https://getcomposer.org/doc/00-intro.md#system-requirements). El handler `.htaccess` no cambia el comando `php` de una terminal. Hostinger documenta Composer por SSH, pero aquí **no se activa SSH**. [Composer en Hostinger](https://www.hostinger.com/support/5792078-how-to-use-composer-at-hostinger/).

La alternativa prevista es preparar después el paquete en un equipo privado con PHP 8.4 y Composer 2. En la siguiente fase, cuando exista un manifiesto y lockfile revisados, los comandos serían, desde la carpeta privada del módulo:

```powershell
# Ejemplos de rutas: sustituirlas por las del entorno privado validado.
& 'RUTA-PHP84/php.exe' -v
& 'RUTA-PHP84/php.exe' 'RUTA-PRIVADA/composer.phar' validate --strict
& 'RUTA-PHP84/php.exe' 'RUTA-PRIVADA/composer.phar' install --no-dev --prefer-dist --no-interaction --no-scripts --no-plugins --optimize-autoloader
& 'RUTA-PHP84/php.exe' 'RUTA-PRIVADA/composer.phar' check-platform-reqs --no-dev
```

**No ejecutar instalación ahora:** este kit no agrega manifiesto Composer ni dependencias. No usar `--ignore-platform-reqs`, `--ignore-platform-req`, variables equivalentes ni `config.platform` para ocultar PHP/extensiones ausentes. `check-platform-reqs` comprueba el runtime real, independientemente de `config.platform`. [Comprobación de plataforma](https://getcomposer.org/doc/03-cli.md#check-platform-reqs).

Una comprobación local no certifica el PHP web del servidor. Antes de activar, contrastar el lockfile y todas sus extensiones/versiones con el runtime efectivo de Hostinger y validar allí el paquete privado de forma controlada. Si posteriormente se autoriza SSH, soporte debe confirmar un intérprete CLI 8.4 explícito; no suponer rutas de binarios ni que `composer2` lo seleccione automáticamente.

En esa fase posterior, `vendor`, Composer, configuración, claves de cuenta de servicio y plantillas quedarán fuera de **todos** los directorios públicos. Solo el endpoint mínimo podría ser público. Esta prueba no requiere credenciales y no justifica subirlas ni compartirlas.

## 7. Verificación local de este kit

Se prepararon pruebas sin conectarse a Hostinger. Para repetirlas con Node y PHP locales:

```powershell
$env:EAGLE_TEST_PHP = 'RUTA-PHP-LOCAL/php.exe'
node --test server/php-verification/tests/diagnostic.test.mjs
```

El runner simula variables del servidor en subprocesos CLI; prueba controles del script y estructura de reglas, **no Apache/LiteSpeed ni la autenticación real de hPanel**. Incluye negativas por ausencia de TLS/autenticación, cabeceras falsas, métodos, parámetros y extensiones desactivadas. Hay que completar la prueba HTTP manual descrita arriba.

Resultado de preparación local: sintaxis PHP correcta; las ocho pruebas del kit pasan tanto con PHP 8.4.27 como con PHP 8.3.36 (este último debe informar que no es el objetivo 8.4). Las 14 pruebas existentes de Fase 2, build y TypeScript también pasan. Lint conserva las mismas 20 advertencias preexistentes de React, sin advertencias nuevas. Se verificaron los hashes de las plantillas aprobadas y del `.htaccess` raíz, sin cambios. Estos resultados no certifican el runtime de Hostinger.

No se modifican React, Firebase, `.htaccess` de producción o plantilla aprobada. No se realizan despliegues, cambios del plan, envíos, commits ni push. El envío permanece sin implementar hasta confirmar runtime y extensiones reales.
