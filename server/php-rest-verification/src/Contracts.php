<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

final readonly class HttpResult
{
    /** @param array<string,string> $headers */
    public function __construct(public int $status, public array $headers, #[\SensitiveParameter] public string $body) {}
    public function json(): array
    {
        $value = json_decode($this->body, true, 32, JSON_THROW_ON_ERROR);
        if (!is_array($value)) { throw new \RuntimeException('Invalid upstream response'); }
        return $value;
    }
}
interface Http
{
    /** @param array<string,string> $headers */
    public function request(string $method, string $url, #[\SensitiveParameter] array $headers = [], #[\SensitiveParameter] string $body = ''): HttpResult;
}
interface AccessTokenProvider { public function token(): string; }
interface TokenVerifier { public function verify(#[\SensitiveParameter] string $token): array; }
interface IdentityApi
{
    public function lookup(string $uid): array;
    public function link(string $email): string;
}
final readonly class Mail
{
    public function __construct(public string $to, public string $subject, public string $html, public string $text) {}
}
interface Mailer { public function send(#[\SensitiveParameter] Mail $mail): void; }
final class InvalidIdentity extends \RuntimeException {}
final readonly class Request
{
    public function __construct(public string $method, public string $origin, public bool $https,
        public string $ip, #[\SensitiveParameter] public string $authorization, public string $body, public string $query = '') {}
}
final readonly class Reply
{
    public function __construct(public int $status, public string $code, public array $headers) {}
    public function emit(): void
    {
        http_response_code($this->status);
        foreach ($this->headers as $name => $value) { header($name.': '.$value); }
        if ($this->status !== 204) { echo json_encode(['code' => $this->code], JSON_THROW_ON_ERROR); }
    }
}
