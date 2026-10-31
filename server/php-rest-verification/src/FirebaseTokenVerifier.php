<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final readonly class FirebaseTokenVerifier implements TokenVerifier
{
    public const CERTIFICATES = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
    public function __construct(private string $project, private Http $http, private PrivateStore $store) {}

    public function verify(#[\SensitiveParameter] string $token): array
    {
        try {
            if (strlen($token) > 8192) { throw new InvalidIdentity(); }
            $parts = explode('.', $token);
            if (count($parts) !== 3) { throw new InvalidIdentity(); }
            $header = JWT::jsonDecode(JWT::urlsafeB64Decode($parts[0]));
            $kid = $header->kid ?? null;
            if (($header->alg ?? null) !== 'RS256' || !is_string($kid) ||
                !preg_match('/\A[A-Za-z0-9_-]{1,128}\z/', $kid) || isset($header->crit)) {
                throw new InvalidIdentity();
            }
        } catch (\Throwable) { throw new InvalidIdentity('Invalid identity'); }
        // La clave se obtiene solo de una URL fija de Google, nunca de jku/x5u del JWT.
        $certificates = $this->store->get('firebase-certificates');
        if (!isset($certificates[$kid])) {
            // Reserva persistente evita que kids inventados provoquen consultas masivas.
            if (!$this->store->reserve([['certificate-refresh', 1, 60]])) { throw new InvalidIdentity('Unknown key'); }
            $response = $this->http->request('GET', self::CERTIFICATES);
            if ($response->status !== 200) { throw new \RuntimeException('Certificates unavailable'); }
            $certificates = $response->json();
            foreach ($certificates as $name => $certificate) {
                if (!is_string($certificate) || openssl_pkey_get_public($certificate) === false) {
                    throw new \RuntimeException('Invalid certificates');
                }
            }
            preg_match('/(?:^|,)\s*max-age=(\d+)/i', $response->headers['cache-control'] ?? '', $age);
            $this->store->put('firebase-certificates', $certificates, min(21600, max(1, (int) ($age[1] ?? 300))));
        }
        if (!is_string($certificates[$kid] ?? null)) { throw new InvalidIdentity('Unknown key'); }
        try {
            $claims = (array) JWT::decode($token, new Key($certificates[$kid], 'RS256'));
            $now = time();
            foreach (['exp', 'iat', 'auth_time'] as $name) {
                if (!is_int($claims[$name] ?? null) || $claims[$name] < 0) { throw new InvalidIdentity(); }
            }
            if (($claims['iss'] ?? null) !== 'https://securetoken.google.com/'.$this->project ||
                ($claims['aud'] ?? null) !== $this->project || !is_string($claims['sub'] ?? null) ||
                $claims['sub'] === '' || strlen($claims['sub']) > 128 ||
                $claims['exp'] <= $now || $claims['iat'] > $now || $claims['auth_time'] > $claims['iat'] ||
                $claims['exp'] <= $claims['iat'] || isset($claims['firebase']->tenant)) {
                throw new InvalidIdentity();
            }
            return $claims;
        } catch (\Throwable) { throw new InvalidIdentity('Invalid identity'); }
    }
}
