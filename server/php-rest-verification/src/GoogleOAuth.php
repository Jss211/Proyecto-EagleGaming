<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

use Google\Auth\Credentials\ServiceAccountCredentials;
use GuzzleHttp\Psr7\Response;

final readonly class GoogleOAuth implements AccessTokenProvider
{
    public const SCOPE = 'https://www.googleapis.com/auth/identitytoolkit';
    public function __construct(#[\SensitiveParameter] private array $credentials, private Http $http, private PrivateStore $store) {}
    public function token(): string
    {
        $cacheKey = 'oauth:'.hash('sha256', ($this->credentials['project_id'] ?? '').'|'.
            ($this->credentials['client_email'] ?? '').'|'.($this->credentials['private_key_id'] ?? '').'|'.self::SCOPE);
        $cached = $this->store->get($cacheKey);
        if (is_string($cached['access_token'] ?? null)) { return $cached['access_token']; }
        if (($this->credentials['type'] ?? '') !== 'service_account' ||
            ($this->credentials['token_uri'] ?? '') !== 'https://oauth2.googleapis.com/token' ||
            ($this->credentials['universe_domain'] ?? 'googleapis.com') !== 'googleapis.com') {
            throw new \RuntimeException('Invalid OAuth configuration');
        }
        $credential = new ServiceAccountCredentials(self::SCOPE, $this->credentials);
        $response = $credential->fetchAuthToken(function ($request, array $options = []) {
            if ((string) $request->getUri() !== 'https://oauth2.googleapis.com/token') {
                throw new \RuntimeException('Unexpected OAuth endpoint');
            }
            $headers = [];
            foreach ($request->getHeaders() as $key => $values) { $headers[$key] = implode(', ', $values); }
            $result = $this->http->request($request->getMethod(), (string) $request->getUri(), $headers, (string) $request->getBody());
            if ($result->status !== 200) { throw new \RuntimeException('OAuth unavailable'); }
            return new Response($result->status, $result->headers, $result->body);
        });
        if (!is_string($response['access_token'] ?? null) || $response['access_token'] === '' ||
            !is_numeric($response['expires_in'] ?? null) || (int) $response['expires_in'] <= 60) {
            throw new \RuntimeException('Invalid OAuth response');
        }
        $this->store->put($cacheKey, ['access_token' => $response['access_token']], min(3600, (int) $response['expires_in']) - 60);
        return $response['access_token'];
    }
}
