<?php
declare(strict_types=1);

// Solo CLI: no publica phpinfo(), secretos ni detalles de entorno por HTTP.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$compatible = PHP_VERSION_ID >= 80300 && PHP_VERSION_ID < 80700;
echo 'PHP ', PHP_VERSION, ': ', $compatible ? 'OK' : 'INCOMPATIBLE (se requiere PHP 8.3–8.6)', PHP_EOL;
foreach (['ctype', 'curl', 'filter', 'json', 'mbstring', 'openssl', 'PDO', 'pdo_sqlite', 'sodium'] as $extension) {
    $available = extension_loaded($extension);
    echo $extension, ': ', $available ? 'OK' : 'FALTA', PHP_EOL;
    $compatible = $compatible && $available;
}
echo 'Composer 2: comprobar por separado con composer2 --version.', PHP_EOL;
echo 'No se realizaron conexiones ni cambios de configuracion.', PHP_EOL;
exit($compatible ? 0 : 1);
