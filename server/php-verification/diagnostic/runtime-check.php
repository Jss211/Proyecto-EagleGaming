<?php
declare(strict_types=1);

// Diagnostico temporal: sin phpinfo, archivos, entorno, credenciales ni red.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Referrer-Policy: no-referrer');

$respond = static function (int $status, array $result): void {
    http_response_code($status);
    echo json_encode($result, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
};

// No aceptar X-Forwarded-Proto como prueba de TLS ni nombres de usuario en headers.
if (!in_array(strtolower((string) ($_SERVER['HTTPS'] ?? '')), ['on', '1'], true)) {
    $respond(403, ['code' => 'https_required']);
    exit;
}

// REMOTE_USER lo establece la autenticacion del servidor, no el formulario PHP.
// PHP_AUTH_USER y HTTP_REMOTE_USER NO prueban autenticacion y no se usan.
$authenticatedUser = $_SERVER['REMOTE_USER'] ?? $_SERVER['REDIRECT_REMOTE_USER'] ?? '';
if (!is_string($authenticatedUser) || $authenticatedUser === '') {
    $respond(403, ['code' => 'server_authentication_required']);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    $respond(405, ['code' => 'method_not_allowed']);
    exit;
}

if (($_SERVER['QUERY_STRING'] ?? '') !== '') {
    $respond(400, ['code' => 'query_not_allowed']);
    exit;
}

try {
    $inspect = static function (array $names): array {
        $result = [];
        foreach ($names as $name) {
            $result[$name] = extension_loaded($name);
        }
        return $result;
    };
    $all = static fn (array $checks): bool => !in_array(false, $checks, true);
    $sdk = $inspect(['ctype', 'filter', 'json', 'mbstring']);
    // Comprobacion preliminar para HTTPS, criptografia y dependencias transitivas.
    $integration = $inspect(['curl', 'openssl', 'sodium', 'hash', 'iconv']);
    // SQLite es para la propuesta de limitacion persistente, no requisito de Kreait.
    $storage = $inspect(['PDO', 'pdo_sqlite']);
    $target = PHP_MAJOR_VERSION === 8 && PHP_MINOR_VERSION === 4;
    $passed = $target && $all($sdk) && $all($integration) && $all($storage);
    $respond(200, [
        'diagnostic' => 'eagle_php84_probe_v1',
        'php_version' => PHP_VERSION,
        'php_84' => $target,
        'sdk_extensions' => $sdk,
        'integration_extensions' => $integration,
        'storage_extensions' => $storage,
        'diagnostic_passed' => $passed,
        'scope' => 'runtime_only_no_sdk_or_delivery_test',
    ]);
} catch (Throwable) {
    $respond(500, ['code' => 'diagnostic_failed']);
}
