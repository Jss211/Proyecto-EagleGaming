# Publicación y prueba controlada de verificación

El código está integrado; el envío real **no se ha probado ni activado**. Seguir estas instrucciones manualmente cuando se autorice publicar. No usar la carpeta de diagnóstico ni su contraseña para el endpoint del frontend. Ninguna credencial debe enviarse al chat o guardarse en Git.

## 1. Firebase y OAuth

1. En Firebase Console selecciona el **mismo proyecto** de la web. Copia su project ID (Configuración del proyecto → General), sin cambiar el proyecto del frontend.
2. Authentication → Sign-in method: confirma que Email/Password y Google mantienen su configuración. Authentication → Settings → Authorized domains: confirma el hostname real de la tienda, por ejemplo `eaglegamingperu.com`. No agregar `/cuenta` en la lista de dominios; es una ruta, no un hostname.
3. Conserva el manejador alojado de acciones Firebase. La continuación será `https://TU-DOMINIO/cuenta` y el origen esperado del enlace normalmente `https://PROJECT_ID.firebaseapp.com`. Confirma el dominio de acciones del proyecto; no pongas el HTML como página ni cambies el enlace a una ruta React que no procese códigos. Los enlaces vencidos/usados los procesa Firebase; la web permite consultar el estado y reenviar uno nuevo.
4. Google Cloud Console → APIs y servicios → APIs habilitadas: confirma **Identity Toolkit API** (`identitytoolkit.googleapis.com`). Si falta o pide actualizar Identity Platform/facturación, detenerse y revisar; no habilitar servicios de pago como atajo.
5. IAM y administración → Roles → Crear rol, en ese proyecto: usa el título y los dos permisos del archivo `deployment/firebase-role.example.json`: `firebaseauth.users.get` y `firebaseauth.users.sendEmail`. Revisa que ambos sean admitidos en el rol personalizado. No conceder Owner, Editor ni permisos de escritura Firestore.
6. IAM y administración → Cuentas de servicio → Crear cuenta de servicio dedicada, por ejemplo `eagle-verification-mailer`. Asígnale únicamente ese rol de proyecto. No conceder delegación de dominio ni acceso a administradores de la tienda.
7. Si las políticas permiten claves JSON y autorizas su uso: cuenta de servicio → Claves → Agregar clave → Crear nueva clave → JSON. Guarda la descarga en privado. Si la organización prohíbe claves, detenerse; no eludir la política.

El servidor intercambia una aserción RS256 por OAuth con scope `https://www.googleapis.com/auth/identitytoolkit`; no hay pantalla de consentimiento de usuarios ni OAuth client secret del navegador. El método administrativo usa `returnOobLink: true`, por lo que Google no envía un segundo correo. Referencias: [sendOobCode](https://docs.cloud.google.com/identity-platform/docs/reference/rest/v1/projects.accounts/sendOobCode), [permisos IAM](https://docs.cloud.google.com/identity-platform/docs/access-control).

## 2. SMTP y configuración privada

Elegir un buzón/proveedor SMTP autorizado; no se presupone que Hostinger incluya uno ya configurado. Desde su panel obtener host, usuario, contraseña/app password y remitente permitido. Verificar SPF/DKIM/DMARC con los valores exactos que entregue ese proveedor; no inventar registros DNS.

En el hosting, los directorios finales serán hermanos de `public_html`:

```text
DIRECTORIO-DEL-DOMINIO/
  public_html/
    .htaccess                    # conservar el existente
    index.html, assets/, ...     # frontend compilado
    api/
      .htaccess                  # PHP 8.4 local, sin Basic Auth
      email-verification.php     # único archivo PHP público
  eagle-private/
    .htaccess                    # denegación adicional, no reemplaza ubicación privada
    app/
      server/php-rest-verification/{src/,vendor/,composer.json,composer.lock}
      email-templates/verification/{verification.html,verification.txt}
    secrets/
      config.json                # crear manualmente; NO está en el paquete
      service-account.json       # descarga privada de Google; NO está en el paquete
    state/                       # SQLite/caché, fuera del código y de public_html
```

Crear `secrets/` y `state/` con permisos 0700 y los archivos sensibles con 0600 (propietario PHP del sitio). No ubicarlos en un subdirectorio de `public_html`, ni siquiera protegido por contraseña. El código rechaza rutas públicas y secretos/estado dentro del árbol de código `app`. Declarar otros document roots públicos si existen. Otros sitios PHP bajo la misma cuenta del alojamiento no constituyen aislamiento de usuario del sistema; mantenerlos actualizados y restringidos.

Copiar `config.example.json` a **`eagle-private/secrets/config.json`** y completar estos campos sin imprimirlos en logs:

| Campo | Valor que debes configurar |
| --- | --- |
| `enabled` | `false` hasta acabar instalación; `true` solo al iniciar la prueba autorizada. |
| `project_id` | ID exacto del proyecto Firebase de la web. Debe coincidir con el JSON de servicio. |
| `allowed_origin` | Origen HTTPS exacto con el hostname usado en el navegador, sin `/` final ni ruta. |
| `continue_url` | Ese mismo origen más `/cuenta`. |
| `action_origin` | Origen del manejador Firebase, normalmente `https://PROJECT_ID.firebaseapp.com`, sin ruta. |
| `service_account_file` | Ruta absoluta real a `eagle-private/secrets/service-account.json`. |
| `state_directory` | Ruta absoluta real a `eagle-private/state` (directorio ya existente). |
| `limiter_hmac_key` | Secreto aleatorio criptográfico de al menos 32 bytes, por ejemplo 64 caracteres hexadecimales generados en un gestor seguro. No usar el texto de ejemplo ni compartirlo. |
| `test_recipient_allowlist` | **Solo** el correo real de tu cuenta de prueba, en una lista JSON. Inicialmente no dejar `[]`. Restringe envío, no login ni compras. |
| `additional_public_roots` | Lista de rutas absolutas a otras raíces web que deben excluirse; `[]` si no hay otras. `DOCUMENT_ROOT` de este sitio se añade automáticamente. |
| `trusted_proxy_ips` | Mantener `[]`. Si PHP no recibe `HTTPS=on/1`, pedir a Hostinger las IP exactas de sus proxies antes de configurarlas. No poner IPs de visitantes ni comodines. |
| `smtp.enabled` | Mantener `false` durante instalación; `true` con `enabled=true` para la prueba autorizada. |
| `smtp.host` | Host DNS del proveedor, sin `smtp://`, rutas o lista de hosts. |
| `smtp.port`, `smtp.security` | **465** (número JSON) y `"smtps"`, o **587** y `"starttls"`. No usar conexión sin TLS. |
| `smtp.username`, `smtp.password` | Credenciales SMTP privadas proporcionadas por el proveedor. |
| `smtp.from` | Correo remitente verificado y permitido por ese proveedor. El nombre mostrado será Eagle Gaming Perú. |

El endpoint localiza por defecto `eagle-private/` junto a `public_html/`. Si la distribución real es distinta, configurar con soporte la variable privada de servidor `EAGLE_VERIFICATION_PRIVATE_ROOT` con una ruta absoluta; no usar una variable `VITE_`. No activar SSH para cambiarlo sin autorización. No editar la ruta pública para incrustar secretos.

## 3. Construir y subir los archivos

1. Conservar copia privada del frontend publicado, `.htaccess` raíz y cualquier `/api` existente. Registrar fecha y archivos para reversión. No sustituir un `.htaccess` que tenga reglas diferentes a las revisadas en el repositorio.
2. Comprobar las dependencias PHP localmente con un intérprete **8.4 sin Sodium**, en `server/php-rest-verification/`: ejecutar Composer `install --no-dev --prefer-dist --no-interaction --no-scripts --no-plugins`, `check-platform-reqs --no-dev`, y las pruebas. Si el comando `php` usa otro runtime, invocar la ruta explícita al PHP 8.4. Nunca ignorar requisitos de plataforma. No hacer `composer update` en el hosting.
3. Desde la raíz del repositorio ejecutar `npm run package:verification`. Se crea un directorio nuevo `deployment-output/verification-FECHA/`, sin claves, config real o SQLite. Solo empaqueta dependencias instaladas, código, plantilla aprobada y frontend compilado. El `.htaccess` raíz se excluye deliberadamente. **Construir no despliega.**
4. En hPanel → Sitios web → Administrar sitio → Administrador de archivos, confirmar la raíz real. Subir primero el contenido `eagle-private/` del paquete al directorio hermano de `public_html`. No subir el ZIP/paquete completo al directorio público para descomprimirlo allí.
5. Crear la configuración y colocar la clave privada como se indica arriba, con ambas opciones `enabled=false`. Verificar permisos y que ningún alias/document root publique `eagle-private`. No subir el archivo de rol IAM ni esta guía a la web.
6. Revisar `/api/`: **si ya existe o tiene `.htaccess`, no sobrescribirlo ni subir estas reglas sin una revisión de combinación**. El archivo preparado limita la carpeta al endpoint de verificación y selecciona PHP 8.4; una API previa podría verse afectada. Si es una carpeta nueva y libre, subir `public_html/api/.htaccess` y `email-verification.php` del paquete. No usar `_prueba_php84` ni sus reglas de contraseña.
7. No tocar el `.htaccess` raíz. Sus reglas actuales excluyen archivos físicos del fallback y `connect-src 'self'` permite el endpoint del mismo origen. No es necesario cambiar PHP global o DNS para `/api/email-verification.php`.
8. Con el backend desactivado, un POST al endpoint debe devolver JSON `{"code":"not_configured"}` y HTTP 503. Si aparece el HTML de React, 404, descarga del PHP o código fuente: detener la publicación y revisar ruta/handler; no añadir secretos al directorio público.
9. Solo después de preparar el backend y acordar la prueba, subir los archivos del frontend `public_html/` del paquete, conservando el `.htaccess` raíz y los assets anteriores para reversión. Subir assets primero e `index.html` al final. No borrar productos, imágenes, vídeos o archivos ajenos.

El frontend usa automáticamente `https://TU-DOMINIO/api/email-verification.php`. No necesita una variable nueva para el mismo origen. Si se quiere fijarla al construir, el único valor público opcional es `VITE_EMAIL_VERIFICATION_ENDPOINT`; el ejemplo está en `deployment/frontend.env.example`. No cambiar la configuración Firebase existente del frontend.

## 4. Prueba real controlada (solo después de autorización)

1. Elegir un correo bajo tu control que aún no tenga cuenta con contraseña en este proyecto y ponerlo en `test_recipient_allowlist`. No utilizar una cuenta real de cliente. Verificar el dominio y remitente SMTP en su proveedor.
2. Confirmar las credenciales privadas, API, permisos mínimos y cuotas. Activar **solo manualmente** `enabled=true` y `smtp.enabled=true` en la configuración privada. No modificar Firestore, permisos admin o el plan Spark.
3. Comprobar que un POST anónimo con origen correcto devuelve **401**, no genera enlace ni correo. Ejemplo sin token: `curl -i -X POST https://TU-DOMINIO/api/email-verification.php -H "Origin: https://TU-DOMINIO" -H "Content-Type: application/json" --data "{}"`. No pegar tokens de sesión en terminales compartidas o capturas.
4. En una ventana privada, abrir `/register`, crear la cuenta de prueba con email/contraseña. Debe mostrar “Tu cuenta está creada”, el mensaje de correo enviado o un error controlado y los botones de comprobación/reenvío. La sesión permanece; un fallo de envío no exige registrarse otra vez.
5. Verificar en Firebase Console que el usuario existe y al principio no está verificado. Revisar recepción/spam y el diseño exacto del correo. No guardar ni publicar el enlace/código o un HAR con tokens. Este es el primer punto que puede confirmar un envío real.
6. Pulsar el enlace del correo: Firebase maneja la acción y la continuación vuelve a `/cuenta`. Usar “Ya confirmé mi correo”: la web recarga el usuario, renueva el ID token y consulta `emailVerified`. Confirmar también el estado en Firebase Console. En una segunda pestaña o dispositivo, no basta con que el correo se haya enviado: usar la comprobación explícita.
7. Para probar reenvío, hacerlo mientras la cuenta **todavía está pendiente**, antes del paso de confirmación: la solicitud inmediata debe limitarse; esperar cinco minutos y solicitar otra. Verificar que solo ese nuevo intento envía un correo. Para un enlace vencido/usado, Firebase muestra el error; comprobar primero el estado y, si sigue pendiente, solicitar uno nuevo. No se crea ni marca verificado un usuario desde React.
8. Comprobar con cuentas autorizadas Google, una cuenta existente y un administrador: pueden seguir entrando. Google no solicita el correo personalizado; no hay guard global por verificación. Comprobar recuperación solo si autorizas su correo real; no se cambió ese flujo. Revisar carrito y compra de invitado sin enviar un pedido ficticio a producción.
9. Si todo es correcto, guardar el resultado sin secretos. Mantener la lista de prueba hasta aprobar apertura a clientes. Para abrir el envío a todas las cuentas elegibles, poner `test_recipient_allowlist: []` **únicamente tras esa aprobación**. Los límites persistentes siguen activos.

La prueba real crea una cuenta y envía correos, por lo que no ha sido ejecutada por el agente. Disponibilidad del método, SMTP y funcionamiento end-to-end no se afirman hasta completar estos pasos con autorización. La API exige OAuth de servicio y devuelve enlaces sin correo predeterminado; la publicación de documentación no confirma la configuración de tu proyecto.

## 5. Publicación, observación y reversión

- Instalar privado y endpoint primero; configuración desactivada y lista de prueba. Publicar el frontend solo cuando el backend esté preparado y exista una ventana de prueba acordada. No hay commits/push/despliegue automáticos.
- Supervisar recepción y códigos HTTP sin registrar Authorization, cuerpos de petición, enlaces, tokens OAuth, credenciales o correos completos. El endpoint suprime trazas públicas. Confirmar redacción de logs del proxy/proveedor; no activar SMTPDebug.
- Límites: diez peticiones por IP/minuto, 120 globales/minuto; un envío por UID cada cinco minutos, cinco por UID/día y 100 globales/día. La IP procede del socket; si un proxy concentra tráfico, revisar su configuración con soporte sin confiar libremente en `X-Forwarded-For`. Mantener el límite total del host por debajo de 300 s.
- Ante fallo: **primero `enabled=false` y `smtp.enabled=false`**. Restaurar `index.html`/assets anteriores del frontend y, si se actualizó un endpoint previo, sus archivos y reglas locales exactos. No sobrescribir el `.htaccess` raíz con el paquete. Para una instalación nueva, retirar únicamente `/api/email-verification.php` y la regla/carpeta nueva después de revertir el frontend.
- Conservar `eagle-private/state/` y SQLite: borrarlos reinicia límites. No restaurar usuarios, Firestore ni bases ajenas; las cuentas creadas conservan acceso. Mantener secretos privados y, si hubo exposición, revocar/rotar la clave dedicada mediante un procedimiento autorizado.
- No prometer entrega exactamente una vez: un timeout SMTP puede ocultar aceptación. No hay reintentos automáticos; conservar reservas y comprobar el buzón antes del siguiente intento permitido.

## 6. Validaciones locales y archivos

Frontend: registro con envío único, fallos de perfil/envío sin recreación, reenvío, claims de estado, sesión expirada/red, Google y renderizado real del panel probados con mocks/SSR; Google y recuperación productivos no se ejecutaron. Backend: RS256, OAuth, API REST, revocación, límites, SQLite concurrente, MIME y endpoint público probados sin conexiones reales. La plantilla se valida por hash al probar y empaquetar.

Comandos locales: `npm run build`, `npm run typecheck:verification`, `npm run test:verification`, `npm run lint`; pruebas PHP con `php tests/run.php` desde el módulo y configuración PHP 8.4 **sin Sodium**. La suite diagnóstica anterior se repite con `EAGLE_TEST_PHP` apuntando al runtime local. En Windows portable configurar `OPENSSL_CONF` al archivo oficial de ese runtime para generar las claves efímeras de pruebas.

Cambios funcionales: `src/features/auth/{useRegister.ts,RegisterForm.tsx,emailVerification.ts,registrationFlow.ts,EmailVerificationPanel.tsx}`, panel en `src/pages/AccountPage.tsx`, `HttpEntry.php`, composición/lista de prueba del servicio PHP y sus tests. Preparación operativa: `deployment/`, `scripts/package-verification.mjs`, scripts npm/TypeScript y exclusión de paquetes generados. No cambia la plantilla, Firestore, AuthContext, login/recuperación, rutas admin o compras.
