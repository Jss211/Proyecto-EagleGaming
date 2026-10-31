<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

final readonly class TemplateRenderer
{
    public function __construct(private string $html, private string $text, private string $actionOrigin, private string $continueUrl) {}
    public static function load(string $directory, string $origin, string $continue): self
    {
        $html = file_get_contents($directory.'/verification.html'); $text = file_get_contents($directory.'/verification.txt');
        if ($html === false || $text === false) { throw new \RuntimeException('Templates unavailable'); }
        return new self($html, $text, $origin, $continue);
    }
    public static function origin(string $url): string
    {
        $parts = parse_url($url);
        if (($parts['scheme'] ?? '') !== 'https' || empty($parts['host']) || isset($parts['user']) ||
            isset($parts['pass']) || preg_match('/[\x00-\x20\x7f]/', $url)) { throw new \RuntimeException('Invalid URL'); }
        return 'https://'.strtolower($parts['host']).(isset($parts['port']) && $parts['port'] !== 443 ? ':'.$parts['port'] : '');
    }
    public function render(string $email, ?string $name, #[\SensitiveParameter] string $link): Mail
    {
        parse_str((string) parse_url($link, PHP_URL_QUERY), $query);
        if (self::origin($link) !== $this->actionOrigin || str_contains($link, '#') ||
            ($query['mode'] ?? null) !== 'verifyEmail' || !is_string($query['oobCode'] ?? null) || $query['oobCode'] === '' ||
            (isset($query['continueUrl']) && $query['continueUrl'] !== $this->continueUrl) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \RuntimeException('Invalid verification link or recipient');
        }
        $name = mb_substr(trim(preg_replace('/[\x00-\x1f\x7f]/u', '', $name ?? '') ?? ''), 0, 150);
        $values = ['CUSTOMER_NAME' => $name === '' ? 'cliente' : $name, 'VERIFICATION_URL' => $link];
        $replace = static function (string $source, bool $html) use ($values): string {
            return preg_replace_callback('/\{\{([^{}]+)\}\}/', static function (array $match) use ($values, $html): string {
                if (!isset($values[$match[1]])) { throw new \RuntimeException('Unknown template marker'); }
                return $html ? htmlspecialchars($values[$match[1]], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : $values[$match[1]];
            }, $source) ?? throw new \RuntimeException('Template unavailable');
        };
        return new Mail($email, 'Confirma tu correo electrónico', $replace($this->html, true), $replace($this->text, false));
    }
}
