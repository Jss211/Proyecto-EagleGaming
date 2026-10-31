<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

final class HttpEntry
{
    public static function request(array $server, string $body, array $trustedProxyIps = []): Request
    {
        $ip = (string) ($server['REMOTE_ADDR'] ?? '');
        $https = in_array(strtolower((string) ($server['HTTPS'] ?? '')), ['on', '1'], true);
        // Solo proxies enumerados en configuración PRIVADA pueden atestiguar TLS.
        // Nunca tomar la IP de límites de un X-Forwarded-For libre del cliente.
        if (!$https && in_array($ip, $trustedProxyIps, true)) {
            $https = ($server['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
        }
        return new Request((string) ($server['REQUEST_METHOD'] ?? ''), (string) ($server['HTTP_ORIGIN'] ?? ''), $https, $ip,
            (string) ($server['HTTP_AUTHORIZATION'] ?? $server['REDIRECT_HTTP_AUTHORIZATION'] ?? ''),
            $body, (string) ($server['QUERY_STRING'] ?? ''));
    }
}
