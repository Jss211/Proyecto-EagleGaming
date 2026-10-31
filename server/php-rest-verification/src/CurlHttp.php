<?php
declare(strict_types=1);
namespace Eagle\RestVerification;

final class CurlHttp implements Http
{
    public function request(string $method, string $url, #[\SensitiveParameter] array $headers = [], #[\SensitiveParameter] string $body = ''): HttpResult
    {
        $parts = parse_url($url);
        if (($parts['scheme'] ?? '') !== 'https' || isset($parts['user']) || isset($parts['pass']) ||
            isset($parts['port']) || !in_array($parts['host'] ?? '', ['oauth2.googleapis.com', 'identitytoolkit.googleapis.com', 'www.googleapis.com'], true)) {
            throw new \RuntimeException('Untrusted upstream');
        }
        $curl = curl_init($url);
        $result = ''; $responseHeaders = [];
        $lines = [];
        foreach ($headers as $key => $value) {
            if (strpbrk($key.$value, "\r\n") !== false) { throw new \RuntimeException('Invalid header'); }
            $lines[] = $key.': '.$value;
        }
        curl_setopt_array($curl, [
            CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $lines,
            CURLOPT_FOLLOWLOCATION => false, CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => 8,
            CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$result): int {
                if (strlen($result) + strlen($chunk) > 262144) { return 0; }
                $result .= $chunk; return strlen($chunk);
            },
            CURLOPT_HEADERFUNCTION => static function ($handle, string $line) use (&$responseHeaders): int {
                $pair = explode(':', $line, 2);
                if (count($pair) === 2) { $responseHeaders[strtolower(trim($pair[0]))] = trim($pair[1]); }
                return strlen($line);
            },
        ]);
        if ($method === 'POST') { curl_setopt($curl, CURLOPT_POSTFIELDS, $body); }
        try {
            if (curl_exec($curl) === false) { throw new \RuntimeException('Upstream unavailable'); }
            $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
            return new HttpResult($status, $responseHeaders, $result);
        } finally { curl_close($curl); }
    }
}
