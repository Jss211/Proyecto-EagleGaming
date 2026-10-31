# Revisión de Sodium para Kreait en PHP 8.4

Fecha: 31/10/2026. Rama: `master`. El usuario confirmó en el diagnóstico real de Hostinger PHP 8.4.27 y todas las extensiones consultadas presentes salvo Sodium. No se accedió al alojamiento.

## Resultado

**Sodium no es opcional para la resolución estándar de Kreait 8.6.0 evaluada.** El diagnóstico debe seguir fallando cuando `sodium` es `false`. No se cambian sus criterios de aprobación ni los controles de HTTPS, autenticación, métodos, parámetros o privacidad.

La cadena determinante es:

```text
kreait/firebase-php 8.6.0
  requiere lcobucci/jwt ^5.3
    versiones 5.4.0–5.6.1 compatibles con PHP 8.4
      requieren ext-openssl y ext-sodium
```

El manifiesto de [Kreait 8.6.0](https://github.com/beste/firebase-php/blob/8.6.0/composer.json) solo enumera ctype, filter, json y mbstring como extensiones directas; también exige `lcobucci/jwt ^5.3`. Los manifiestos de [lcobucci/jwt 5.4.0](https://github.com/lcobucci/jwt/blob/5.4.0/composer.json) y [5.6.1](https://github.com/lcobucci/jwt/blob/5.6.1/composer.json) sitúan `ext-sodium` en `require`, no en `suggest`. La ausencia de una extensión en el manifiesto raíz no la hace opcional cuando una dependencia obligatoria la exige.

## Protocolo Firebase frente a requisitos del paquete

Firebase especifica firmas **RS256** para los ID tokens. Ver [validación oficial de tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens). Que ese algoritmo pueda verificarse con OpenSSL no elimina los requisitos de instalación de las bibliotecas que incorpora el SDK.

La biblioteca distinta [firebase/php-jwt 7.2.1](https://github.com/firebase/php-jwt/blob/v7.2.1/composer.json) sí enumera Sodium como sugerencia para firmas EdDSA/Ed25519. Esto explica por qué una búsqueda aislada puede indicar que Sodium es opcional para JWT: **no** es la misma declaración de dependencias que la de `lcobucci/jwt`. Kreait incluye ambas bibliotecas; debe satisfacerse el conjunto completo.

El backend PHP aún no está implementado, por lo que no hay un lockfile de producción del servicio. Esta revisión fija la versión Kreait evaluada y resuelve sus dependencias reales; antes de instalar el módulo definitivo se repetirá con su manifiesto y lockfile finales, incluidos el transporte de correo y el almacén elegido.

## Comprobación local reproducida

Se usó una carpeta aislada **fuera del repositorio**, `../.verification-tools/sodium-review`, con un manifiesto de evaluación que exige únicamente `kreait/firebase-php: 8.6.0`. Se ejecutó Composer con `update --dry-run --no-scripts --no-plugins --no-interaction`. No se instalaron paquetes ni se generó un lockfile de producción.

| Prueba | Resultado |
| --- | --- |
| PHP 8.4.27 con Sodium realmente sin cargar; sin ignorar requisitos | Composer falla: las versiones compatibles de `lcobucci/jwt` requieren `ext-sodium`. |
| Mismo PHP y manifiesto, con Sodium disponible | Resolución correcta, seleccionando `lcobucci/jwt 5.6.1`; 38 paquetes previstos, sin instalarlos. |

La prueba sin Sodium se realizó con `php -n` y carga explícita de cURL, mbstring, OpenSSL y ZIP para ejecutar Composer; no se falsificó `config.platform` ni se utilizaron opciones para ignorar requisitos. La comprobación verifica el requisito de dependencia, no conexiones Firebase, SMTP o el estado del servidor Hostinger.

## Clasificación y siguientes pasos

| Comprobación | Clasificación para la propuesta actual |
| --- | --- |
| ctype, filter, json, mbstring | Requisitos directos de Kreait. |
| Sodium | **Requisito transitivo obligatorio** de `lcobucci/jwt` para la resolución evaluada. |
| OpenSSL | Requisito de criptografía y dependencias, conservado. |
| Resto del grupo `integration_extensions` | Comprobación conservadora del servicio propuesto; esta revisión no elimina otros requisitos. |
| PDO/pdo_sqlite | Requisitos de la opción de almacenamiento persistente prevista; no extensiones directas del SDK. No se cambia esa arquitectura aquí. |

Pedir al soporte de Hostinger, sin autorizar cambios todavía:

> En una carpeta de prueba, `application/x-lsphp84` ejecuta PHP 8.4.27. El diagnóstico muestra `extension_loaded('sodium') = false`, con las demás extensiones consultadas disponibles. Kreait 8.6.0 requiere `lcobucci/jwt ^5.3`, cuya resolución para PHP 8.4 exige `ext-sodium`. ¿Puede habilitarse Sodium para ese handler PHP 8.4 sin cambiar la versión global ni afectar las extensiones de los demás sitios? Indiquen primero el procedimiento y su alcance; no autorizo cambios automáticos.

Si el alojamiento lo admite, tras una autorización específica y la comprobación manual correspondiente, repetir el diagnóstico temporal protegido y retirarlo al acabar. No usar `--ignore-platform-reqs`, un falso `provide` de la extensión, un polyfill añadido sin revisión o un SDK antiguo como solución automática. Un polyfill o una arquitectura diferente requiere evaluación separada de compatibilidad, mantenimiento y pruebas, no simplemente cambiar `diagnostic_passed` a verdadero.

**Podemos continuar la preparación y el análisis, pero no dar por compatible ni activar la integración PHP con este SDK hasta resolver Sodium o aprobar una alternativa evaluada.** No se modificaron Firebase, Hostinger, React, reglas, permisos, plantilla, `.htaccess` ni el código del diagnóstico. Solo se documentó el hallazgo y se aclaró su descripción. Sin commits, push, despliegues, credenciales o envíos reales.
