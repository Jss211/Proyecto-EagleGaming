<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

final class Factory
{
    public static function privatePath(string $path, array $publicRoots, bool $outsideSource = false): string
    {
        $resolved = realpath($path);
        if ($resolved === false || $publicRoots === []) { throw new \RuntimeException('Private path unavailable'); }
        $forbidden = $outsideSource ? [...$publicRoots, dirname(__DIR__, 3)] : $publicRoots;
        foreach ($forbidden as $root) {
            $realRoot = realpath($root);
            if ($realRoot === false) { throw new \RuntimeException('Public root unavailable'); }
            $normalize = static fn (string $p): string => PHP_OS_FAMILY === 'Windows' ? strtolower(str_replace('\\', '/', $p)) : $p;
            $candidate = $normalize($resolved); $base = rtrim($normalize($realRoot), '/');
            if ($candidate === $base || str_starts_with($candidate, $base.'/')) { throw new \RuntimeException('Private path required'); }
        }
        return $resolved;
    }
    // Sin config activa retorna null antes de cargar claves o crear conexiones.
    public static function fromPrivateConfig(string $path, array $publicRoots): ?VerificationService
    {
        self::privatePath(__DIR__, $publicRoots);
        $path = self::privatePath($path, $publicRoots, true);
        $config = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        if (($config['enabled'] ?? false) !== true) { return null; }
        if (!preg_match('/\A[a-z][a-z0-9-]{4,28}[a-z0-9]\z/', $config['project_id'] ?? '') ||
            TemplateRenderer::origin($config['allowed_origin']) !== $config['allowed_origin'] ||
            TemplateRenderer::origin($config['action_origin']) !== $config['action_origin'] ||
            TemplateRenderer::origin($config['continue_url']) !== $config['allowed_origin'] ||
            str_contains($config['continue_url'], '#') || ($config['smtp']['enabled'] ?? false) !== true || getenv('FIREBASE_AUTH_EMULATOR_HOST')) {
            throw new \RuntimeException('Configuration incomplete');
        }
        $keyFile = self::privatePath($config['service_account_file'], $publicRoots, true);
        $credentials = json_decode(file_get_contents($keyFile), true, flags: JSON_THROW_ON_ERROR);
        if (($credentials['project_id'] ?? null) !== $config['project_id']) { throw new \RuntimeException('Wrong credential project'); }
        $state = self::privatePath($config['state_directory'], $publicRoots, true);
        umask(0077);
        $store = new PrivateStore($state.'/verification.sqlite', $config['limiter_hmac_key']);
        $http = new CurlHttp(); $oauth = new GoogleOAuth($credentials, $http, $store);
        return new VerificationService(true, $config['allowed_origin'], new FirebaseTokenVerifier($config['project_id'], $http, $store),
            new IdentityToolkit($config['project_id'], $config['continue_url'], $oauth, $http), $store,
            TemplateRenderer::load(dirname(__DIR__, 3).'/email-templates/verification', $config['action_origin'], $config['continue_url']),
            new SmtpMailer($config['smtp']), $config['test_recipient_allowlist'] ?? []);
    }
}
