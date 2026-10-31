<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

final readonly class IdentityToolkit implements IdentityApi
{
    public function __construct(private string $project, private string $continueUrl, private AccessTokenProvider $oauth, private Http $http) {}
    private function call(string $method, array $data): array
    {
        $response = $this->http->request('POST', 'https://identitytoolkit.googleapis.com/v1/projects/'.rawurlencode($this->project).'/accounts:'.$method,
            ['Authorization' => 'Bearer '.$this->oauth->token(), 'Content-Type' => 'application/json'], json_encode($data, JSON_THROW_ON_ERROR));
        if ($response->status !== 200) { throw new \RuntimeException('Identity service unavailable'); }
        return $response->json();
    }
    public function lookup(string $uid): array
    {
        $response = $this->call('lookup', ['localId' => [$uid]]);
        if (count($response['users'] ?? []) !== 1 || ($response['users'][0]['localId'] ?? null) !== $uid) {
            throw new InvalidIdentity('Account unavailable');
        }
        return $response['users'][0];
    }
    public function link(string $email): string
    {
        $response = $this->call('sendOobCode', ['requestType' => 'VERIFY_EMAIL', 'email' => $email,
            'returnOobLink' => true, 'continueUrl' => $this->continueUrl, 'canHandleCodeInApp' => false]);
        if (!is_string($response['oobLink'] ?? null) || $response['oobLink'] === '') {
            throw new \RuntimeException('Action link unavailable');
        }
        return $response['oobLink'];
    }
}
