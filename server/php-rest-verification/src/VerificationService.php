<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

final readonly class VerificationService
{
    public function __construct(private bool $enabled, private string $origin, private TokenVerifier $verifier,
        private IdentityApi $api, private PrivateStore $store, private TemplateRenderer $renderer, private Mailer $mailer,
        private array $testRecipients = []) {}
    public function handle(#[\SensitiveParameter] Request $r): Reply
    {
        $headers = ['Content-Type' => 'application/json; charset=utf-8', 'Cache-Control' => 'no-store',
            'Referrer-Policy' => 'no-referrer', 'Vary' => 'Origin', 'X-Content-Type-Options' => 'nosniff'];
        if ($r->origin === $this->origin) { $headers['Access-Control-Allow-Origin'] = $this->origin; }
        $reply = static fn (int $status, string $code): Reply => new Reply($status, $code, $headers);
        if (!$this->enabled) { return $reply(503, 'not_configured'); }
        if (!$r->https || $r->origin !== $this->origin) { return $reply(403, 'forbidden'); }
        if ($r->method === 'OPTIONS') {
            return new Reply(204, '', $headers + ['Access-Control-Allow-Methods' => 'POST', 'Access-Control-Allow-Headers' => 'Authorization, Content-Type']);
        }
        if ($r->method !== 'POST') { return new Reply(405, 'method_not_allowed', $headers + ['Allow' => 'POST, OPTIONS']); }
        if ($r->query !== '' || !filter_var($r->ip, FILTER_VALIDATE_IP)) { return $reply(400, 'invalid_request'); }
        try {
            if (!$this->store->reserve([['requests:global', 120, 60], ['requests:ip:'.$r->ip, 10, 60]])) { return $reply(429, 'rate_limited'); }
        } catch (\Throwable) { return $reply(503, 'temporarily_unavailable'); }
        if (!preg_match('/\ABearer ([^\s]{1,8192})\z/', $r->authorization, $match)) { return $reply(401, 'unauthenticated'); }
        if (strlen($r->body) > 1024) { return $reply(413, 'invalid_request'); }
        if (!in_array(trim($r->body), ['', '{}'], true)) { return $reply(400, 'invalid_request'); }
        try {
            $claims = $this->verifier->verify($match[1]);
            $uid = $claims['sub'];
            $account = $this->api->lookup($uid);
            if (($account['localId'] ?? null) !== $uid || ($account['disabled'] ?? false) !== false) { throw new InvalidIdentity(); }
            $validSince = $account['validSince'] ?? '0';
            if (!is_string($validSince) || !ctype_digit($validSince) || $claims['auth_time'] < (int) $validSince) { throw new InvalidIdentity(); }
            $verified = $account['emailVerified'] ?? false;
            if (!is_bool($verified)) { throw new \RuntimeException('Invalid account response'); }
            if ($verified) { return $reply(200, 'already_verified'); }
            $providers = array_column($account['providerUserInfo'] ?? [], 'providerId');
            if (in_array('google.com', $providers, true)) { return $reply(200, 'provider_managed'); }
            $email = $account['email'] ?? null;
            if (!in_array('password', $providers, true) || !is_string($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) { return $reply(409, 'not_eligible'); }
            if ($this->testRecipients !== [] && !in_array(strtolower($email), array_map('strtolower', $this->testRecipients), true)) {
                return $reply(403, 'forbidden');
            }
            if (!$this->store->reserve([['send:uid:'.$uid, 1, 300], ['send:daily:'.$uid, 5, 86400], ['send:global', 100, 86400]])) { return $reply(429, 'rate_limited'); }
            $link = $this->api->link($email);
            $this->mailer->send($this->renderer->render($email, $account['displayName'] ?? null, $link));
            return $reply(200, 'sent');
        } catch (InvalidIdentity) { return $reply(401, 'unauthenticated'); }
        catch (\Throwable) { return $reply(503, 'temporarily_unavailable'); }
    }
}
