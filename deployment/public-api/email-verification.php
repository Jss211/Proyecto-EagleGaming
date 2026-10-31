<?php
declare(strict_types=1);

// Único código público del servicio. No usa la carpeta de diagnóstico ni Basic Auth.
ini_set('display_errors', '0');
ini_set('log_errors', '0');
ini_set('zend.exception_ignore_args', '1');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');
header('X-Content-Type-Options: nosniff');

try {
    if (PHP_VERSION_ID < 80400 || PHP_VERSION_ID >= 80500) { throw new RuntimeException(); }
    $root = getenv('EAGLE_VERIFICATION_PRIVATE_ROOT') ?: dirname(__DIR__, 2).'/eagle-private';
    $documentRoot = (string) ($_SERVER['DOCUMENT_ROOT'] ?? '');
    $outside = static function (string $path, array $publicRoots): string {
        $resolved = realpath($path);
        if ($resolved === false || $publicRoots === []) { throw new RuntimeException(); }
        foreach ($publicRoots as $publicRoot) {
            $public = realpath($publicRoot);
            if ($public === false) { throw new RuntimeException(); }
            $normalize = static fn (string $p): string => PHP_OS_FAMILY === 'Windows' ? strtolower(str_replace('\\', '/', $p)) : $p;
            $candidate = $normalize($resolved); $base = rtrim($normalize($public), '/');
            if ($candidate === $base || str_starts_with($candidate, $base.'/')) { throw new RuntimeException(); }
        }
        return $resolved;
    };
    $root = $outside($root, [$documentRoot]);
    $configFile = $outside($root.'/secrets/config.json', [$documentRoot]);
    $config = json_decode(file_get_contents($configFile), true, flags: JSON_THROW_ON_ERROR);
    if (!is_array($config) || ($config['enabled'] ?? false) !== true) { throw new RuntimeException(); }
    $publicRoots = [$documentRoot, ...($config['additional_public_roots'] ?? [])];
    $outside($root, $publicRoots);
    $autoload = $outside($root.'/app/server/php-rest-verification/vendor/autoload.php', $publicRoots);
    require $autoload;
    $service = \Eagle\RestVerification\Factory::fromPrivateConfig($configFile, $publicRoots);
    if ($service === null) { throw new RuntimeException(); }
    $input = fopen('php://input', 'rb');
    if ($input === false) { throw new RuntimeException(); }
    $body = stream_get_contents($input, 1025);
    fclose($input);
    if ($body === false) { throw new RuntimeException(); }
    $service->handle(\Eagle\RestVerification\HttpEntry::request($_SERVER, $body, $config['trusted_proxy_ips'] ?? []))->emit();
} catch (Throwable) {
    http_response_code(503);
    echo '{"code":"not_configured"}';
}
