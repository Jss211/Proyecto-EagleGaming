<?php
declare(strict_types=1);
require dirname(__DIR__).'/vendor/autoload.php';

use Eagle\RestVerification\{AccessTokenProvider, Factory, FirebaseTokenVerifier, GoogleOAuth, Http, HttpResult,
    HttpEntry, IdentityApi, IdentityToolkit, InvalidIdentity, Mail, Mailer, PrivateStore, Request, SmtpMailer, TemplateRenderer, VerificationService};
use Firebase\JWT\{JWT, Key};

function check(bool $condition, string $message = 'Assertion failed'): void { if (!$condition) { throw new RuntimeException($message); } }
function same(mixed $expected, mixed $actual): void { check($expected === $actual, 'Values differ'); }
function rejects(callable $callback): void { try { $callback(); } catch (Throwable) { return; } throw new RuntimeException('Expected rejection'); }
$count = 0;
function testCase(string $name, callable $callback): void { global $count; $callback(); $count++; echo 'OK ', $name, PHP_EOL; }

final class FakeHttp implements Http
{
    public array $calls = [];
    public function __construct(private Closure $callback) {}
    public function request(string $method, string $url, array $headers = [], string $body = ''): HttpResult
    {
        $this->calls[] = [$method, $url, $headers, $body];
        return ($this->callback)($method, $url, $headers, $body);
    }
}
final class FakeApi implements IdentityApi
{
    public array $users = []; public array $links = []; public bool $fail = false;
    public array $account = ['localId' => 'owner', 'email' => 'owner@example.test', 'displayName' => 'Ana',
        'validSince' => '0', 'emailVerified' => false, 'disabled' => false, 'providerUserInfo' => [['providerId' => 'password']]];
    public function lookup(string $uid): array { $this->users[] = $uid; return $this->account; }
    public function link(string $email): string { $this->links[] = $email; if ($this->fail) { throw new RuntimeException('upstream secret'); } return 'https://auth.example.test/__/auth/action?mode=verifyEmail&oobCode=MOCK_ONLY&lang=es'; }
}
final class FakeMailer implements Mailer
{
    public array $messages = []; public bool $fail = false;
    public function send(Mail $mail): void { $this->messages[] = $mail; if ($this->fail) { throw new RuntimeException('SMTP secret'); } }
}

$temp = sys_get_temp_dir().'/eagle-rest-tests-'.bin2hex(random_bytes(8));
mkdir($temp, 0700);
$sequence = 0;
function store(?Closure $clock = null): PrivateStore {
    global $temp, $sequence; $sequence++;
    return new PrivateStore($temp.'/state-'.$sequence.'.sqlite', str_repeat('test-only-', 4), $clock);
}
$resource = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
openssl_pkey_export($resource, $privateKey);
$publicKey = openssl_pkey_get_details($resource)['key'];
$project = 'eagle-test-project';
$base = ['sub' => 'owner', 'aud' => $project, 'iss' => 'https://securetoken.google.com/'.$project,
    'iat' => time() - 10, 'auth_time' => time() - 20, 'exp' => time() + 3600];
$token = static fn (array $overrides = [], string $kid = 'test-key'): string => JWT::encode(array_replace($base, $overrides), $privateKey, 'RS256', $kid);
$templatesDir = dirname(__DIR__, 3).'/email-templates/verification';
$renderer = TemplateRenderer::load($templatesDir, 'https://auth.example.test', 'https://store.example.test/cuenta');
$noNetwork = new FakeHttp(static fn () => throw new RuntimeException('Network forbidden in test'));
function verifier(PrivateStore $store): FirebaseTokenVerifier {
    global $publicKey, $project, $noNetwork;
    $store->put('firebase-certificates', ['test-key' => $publicKey], 3600);
    return new FirebaseTokenVerifier($project, $noNetwork, $store);
}
function scenario(bool $enabled = true): array {
    global $renderer;
    $s = store(); $api = new FakeApi(); $mail = new FakeMailer();
    return [new VerificationService($enabled, 'https://store.example.test', verifier($s), $api, $s, $renderer, $mail), $api, $mail];
}
function request(string $jwt, string $body = '{}', string $ip = '192.0.2.1', string $origin = 'https://store.example.test', bool $https = true, string $method = 'POST'): Request {
    return new Request($method, $origin, $https, $ip, $jwt === '' ? '' : 'Bearer '.$jwt, $body);
}

try {
    testCase('runtime PHP 8.4 realmente sin Sodium', static function (): void { same(8, PHP_MAJOR_VERSION); same(4, PHP_MINOR_VERSION); check(!extension_loaded('sodium')); });
    testCase('plantillas aprobadas sin cambios', static function () use ($templatesDir): void {
        same('a141186f6aad6c7e6ed670f5a4df70e63de7318b0a637dddef550c28e7bb44ef', hash_file('sha256', $templatesDir.'/verification.html'));
        same('8458474edb81bc675c29cbaf98ad7a63f8ca50c05aea76d1c4163bdd703ea7ad', hash_file('sha256', $templatesDir.'/verification.txt'));
    });
    testCase('lockfile sin Kreait, lcobucci ni requisito ext-sodium', static function (): void {
        $lock = json_decode(file_get_contents(dirname(__DIR__).'/composer.lock'), true);
        foreach ($lock['packages'] as $package) {
            check(!in_array($package['name'], ['kreait/firebase-php', 'lcobucci/jwt'], true));
            check(!isset($package['require']['ext-sodium']));
        }
    });
    testCase('JWT RS256 valido con OpenSSL', static function () use ($token): void { same('owner', verifier(store())->verify($token())['sub']); });
    testCase('rechaza claims invalidos y expiracion', static function () use ($token): void {
        $v = verifier(store());
        foreach ([['aud' => 'other'], ['aud' => ['eagle-test-project']], ['iss' => 'https://evil.test'], ['sub' => ''],
            ['sub' => str_repeat('x', 129)], ['exp' => time() - 1], ['exp' => null], ['iat' => time() + 60],
            ['auth_time' => time() + 60], ['auth_time' => null], ['iat' => '100'], ['nbf' => time() + 60],
            ['firebase' => ['tenant' => 'unsupported']]] as $claims) { rejects(static fn () => $v->verify($token($claims))); }
    });
    testCase('rechaza firma adulterada, none, HS256 y kid desconocido', static function () use ($token, $base): void {
        $v = verifier(store()); $signed = $token(); $parts = explode('.', $signed); $parts[1] = JWT::urlsafeB64Encode(json_encode($base + ['admin' => true]));
        rejects(static fn () => $v->verify(implode('.', $parts)));
        rejects(static fn () => $v->verify(JWT::encode($base, str_repeat('test-secret', 4), 'HS256', 'test-key')));
        rejects(static fn () => $v->verify('eyJhbGciOiJub25lIn0.e30.'));
        rejects(static fn () => $v->verify($token([], 'unknown')));
    });
    testCase('certificados solo desde URL fija, cache TTL y control de consultas', static function () use ($publicKey, $project, $token): void {
        $http = new FakeHttp(static function ($method, $url) use ($publicKey): HttpResult {
            same('GET', $method); same(FirebaseTokenVerifier::CERTIFICATES, $url);
            return new HttpResult(200, ['cache-control' => 'public, max-age=3600'], json_encode(['test-key' => $publicKey]));
        });
        $v = new FirebaseTokenVerifier($project, $http, store()); $v->verify($token()); $v->verify($token()); same(1, count($http->calls));
        rejects(static fn () => $v->verify($token([], 'random-1'))); same(1, count($http->calls));
    });
    testCase('OAuth Google Auth RS256 con scope minimo y cache privado', static function () use ($project, $privateKey, $publicKey): void {
        $http = new FakeHttp(static function ($method, $url, $headers, $body) use ($publicKey): HttpResult {
            same('POST', $method); same('https://oauth2.googleapis.com/token', $url); parse_str($body, $form);
            same('urn:ietf:params:oauth:grant-type:jwt-bearer', $form['grant_type']);
            $assertion = JWT::decode($form['assertion'], new Key($publicKey, 'RS256'));
            same(GoogleOAuth::SCOPE, $assertion->scope); same('service@example.test', $assertion->iss); same('https://oauth2.googleapis.com/token', $assertion->aud);
            check(!isset($assertion->sub));
            return new HttpResult(200, [], '{"access_token":"MOCK_ACCESS","expires_in":3600,"token_type":"Bearer"}');
        });
        $oauth = new GoogleOAuth(['type' => 'service_account', 'project_id' => $project, 'client_email' => 'service@example.test',
            'private_key' => $privateKey, 'private_key_id' => 'test-key', 'token_uri' => 'https://oauth2.googleapis.com/token'], $http, store());
        same('MOCK_ACCESS', $oauth->token()); same('MOCK_ACCESS', $oauth->token()); same(1, count($http->calls));
    });
    testCase('REST usa proyecto fijo, lookup UID y returnOobLink true sin envio Firebase', static function () use ($project): void {
        $http = new FakeHttp(static function ($method, $url, $headers, $body) use ($project): HttpResult {
            same('POST', $method); same('Bearer MOCK_ACCESS', $headers['Authorization']); $data = json_decode($body, true);
            if (str_ends_with($url, ':lookup')) { same(['localId' => ['owner']], $data); return new HttpResult(200, [], '{"users":[{"localId":"owner"}]}'); }
            same('https://identitytoolkit.googleapis.com/v1/projects/'.$project.'/accounts:sendOobCode', $url);
            same(true, $data['returnOobLink']); same('VERIFY_EMAIL', $data['requestType']); same('owner@example.test', $data['email']);
            same('https://store.example.test/cuenta', $data['continueUrl']); check(!isset($data['idToken']));
            return new HttpResult(200, [], '{"oobLink":"https://auth.example.test/?mode=verifyEmail&oobCode=MOCK_ONLY"}');
        });
        $oauth = new class implements AccessTokenProvider { public function token(): string { return 'MOCK_ACCESS'; } };
        $api = new IdentityToolkit($project, 'https://store.example.test/cuenta', $oauth, $http);
        same('owner', $api->lookup('owner')['localId']); check(str_contains($api->link('owner@example.test'), 'MOCK_ONLY'));
    });
    testCase('API falla cerrado por permisos y respuestas incompletas', static function () use ($project): void {
        $oauth = new class implements AccessTokenProvider { public function token(): string { return 'MOCK'; } };
        foreach ([new HttpResult(403, [], '{"error":"private details"}'), new HttpResult(200, [], '{}')] as $response) {
            $api = new IdentityToolkit($project, 'https://store.example.test/cuenta', $oauth, new FakeHttp(static fn () => $response));
            rejects(static fn () => $api->link('owner@example.test')); rejects(static fn () => $api->lookup('owner'));
        }
    });
    testCase('OAuth no admite redirecciones de credenciales ni errores del proveedor', static function () use ($privateKey): void {
        $credentials = ['type' => 'service_account', 'client_email' => 'service@example.test', 'private_key' => $privateKey,
            'private_key_id' => 'test', 'token_uri' => 'https://oauth2.googleapis.com/token'];
        $http = new FakeHttp(static fn () => new HttpResult(403, [], '{"error":"private details"}'));
        rejects(static fn () => (new GoogleOAuth($credentials, $http, store()))->token());
        $credentials['token_uri'] = 'https://evil.test/token';
        $none = new FakeHttp(static fn () => throw new RuntimeException('Must not be called'));
        rejects(static fn () => (new GoogleOAuth($credentials, $none, store()))->token()); same([], $none->calls);
    });
    testCase('servicio desactivado y peticiones no autorizadas no generan enlaces', static function () use ($token): void {
        [$service, $api] = scenario(false); same('not_configured', $service->handle(request($token()))->code); same([], $api->users);
        [$service, $api] = scenario();
        same(403, $service->handle(request($token(), '{}', '192.0.2.1', 'https://evil.test'))->status);
        same(403, $service->handle(request($token(), '{}', '192.0.2.1', 'https://store.example.test', false))->status);
        same(401, $service->handle(request(''))->status); same(401, $service->handle(request('invalid'))->status);
        same([], $api->links);
    });
    testCase('rechaza datos arbitrarios, metodos y cuerpo excesivo', static function () use ($token): void {
        [$s, $api] = scenario();
        same(400, $s->handle(request($token(), '{"email":"other@example.test"}'))->status);
        same(400, $s->handle(request($token(), '{"uid":"other"}'))->status);
        same(413, $s->handle(request($token(), str_repeat('x', 1025)))->status);
        same(405, $s->handle(request($token(), '{}', '192.0.2.1', 'https://store.example.test', true, 'GET'))->status);
        same(204, $s->handle(request('', '{}', '192.0.2.1', 'https://store.example.test', true, 'OPTIONS'))->status);
        same([], $api->links);
    });
    testCase('consulta actual de cuenta y revocacion; no bloquea Google ni duplica confirmados', static function () use ($token, $base): void {
        foreach ([['disabled' => true], ['localId' => 'other'], ['validSince' => (string) ($base['auth_time'] + 1)]] as $changes) {
            [$s, $api, $mail] = scenario(); $api->account = array_replace($api->account, $changes);
            same(401, $s->handle(request($token()))->status); same([], $mail->messages);
        }
        foreach ([['emailVerified' => true], ['providerUserInfo' => [['providerId' => 'google.com']]]] as $changes) {
            [$s, $api] = scenario(); $api->account = array_replace($api->account, $changes); same(200, $s->handle(request($token()))->status); same([], $api->links);
        }
    });
    testCase('envia solo al correo Auth, sin devolver enlace, y limita reenvio por UID entre IPs', static function () use ($token): void {
        [$s, $api, $mail] = scenario(); $reply = $s->handle(request($token())); same('sent', $reply->code);
        same(['owner'], $api->users); same(['owner@example.test'], $api->links); same('owner@example.test', $mail->messages[0]->to);
        same('no-store', $reply->headers['Cache-Control']); same(429, $s->handle(request($token(), '{}', '192.0.2.2'))->status); same(1, count($mail->messages));
    });
    testCase('errores externos controlados conservan reserva y no reintentan envio', static function () use ($token): void {
        foreach (['api', 'mail'] as $failed) {
            [$s, $api, $mail] = scenario(); if ($failed === 'api') { $api->fail = true; } else { $mail->fail = true; }
            $reply = $s->handle(request($token())); same('temporarily_unavailable', $reply->code); check(!str_contains(json_encode($reply), 'secret'));
            same(429, $s->handle(request($token()))->status);
        }
    });
    testCase('limite IP previo a token y presupuesto global', static function (): void {
        [$s, $api] = scenario(); for ($i = 0; $i < 10; $i++) { same(401, $s->handle(request(''))->status); }
        same(429, $s->handle(request(''))->status); same([], $api->users);
    });
    testCase('limites persistentes atomicos con TTL y sin UID o IP en disco', static function () use ($temp): void {
        $time = time(); $clock = static function () use (&$time): int { return $time; };
        $path = $temp.'/persistent.sqlite'; $secret = str_repeat('test-only-', 4);
        $first = new PrivateStore($path, $secret, $clock); $second = new PrivateStore($path, $secret, $clock);
        same(true, $first->reserve([['uid:owner-private', 1, 60], ['day:owner-private', 2, 86400]]));
        same(false, $second->reserve([['uid:owner-private', 1, 60], ['day:owner-private', 2, 86400]]));
        $time += 61; same(true, $second->reserve([['uid:owner-private', 1, 60], ['day:owner-private', 2, 86400]]));
        $time += 61; same(false, $first->reserve([['uid:owner-private', 1, 60], ['day:owner-private', 2, 86400]]));
        check(!str_contains(file_get_contents($path), 'owner-private'));
    });
    testCase('fallo del almacen impide cualquier consulta a Auth o envio', static function () use ($temp, $token, $renderer): void {
        $path = $temp.'/broken.sqlite'; $s = new PrivateStore($path, str_repeat('test-only-', 4));
        $v = verifier($s); $api = new FakeApi(); $mailer = new FakeMailer();
        $database = new PDO('sqlite:'.$path); $database->exec('DROP TABLE limits');
        $service = new VerificationService(true, 'https://store.example.test', $v, $api, $s, $renderer, $mailer);
        same(503, $service->handle(request($token()))->status); same([], $api->users); same([], $mailer->messages);
    });
    testCase('reserva concurrente entre procesos permite un solo intento', static function () use ($temp): void {
        $processes = []; $path = $temp.'/concurrent.sqlite'; new PrivateStore($path, str_repeat('test-only-', 4));
        for ($i = 0; $i < 4; $i++) {
            $pipes = []; $process = proc_open([PHP_BINARY, '-c', php_ini_loaded_file(), __DIR__.'/limit-worker.php', $path],
                [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
            check(is_resource($process)); $processes[] = [$process, $pipes];
        }
        $allowed = 0;
        foreach ($processes as [$process, $pipes]) {
            $output = stream_get_contents($pipes[1]); $error = stream_get_contents($pipes[2]); fclose($pipes[1]); fclose($pipes[2]);
            same(0, proc_close($process)); same('', $error); if ($output === 'allowed') { $allowed++; } else { same('limited', $output); }
        }
        same(1, $allowed);
    });
    testCase('renderizado escapa sin reevaluar datos y rechaza enlaces ajenos', static function () use ($renderer): void {
        $link = 'https://auth.example.test/?mode=verifyEmail&oobCode=MOCK_ONLY&lang=es';
        $mail = $renderer->render('owner@example.test', '<Ana & "{{VERIFICATION_URL}}">', $link);
        check(str_contains($mail->html, '&lt;Ana &amp; &quot;{{VERIFICATION_URL}}&quot;&gt;')); check(str_contains($mail->html, '&amp;lang=es')); check(str_contains($mail->text, $link));
        foreach (['javascript:alert(1)', 'https://evil.test/?mode=verifyEmail&oobCode=MOCK_ONLY',
            'https://auth.example.test/?mode=resetPassword&oobCode=MOCK_ONLY',
            'https://auth.example.test/?mode=verifyEmail&oobCode=MOCK_ONLY&continueUrl=https://evil.test'] as $bad) {
            rejects(static fn () => $renderer->render('owner@example.test', 'Ana', $bad));
        }
    });
    testCase('SMTP autenticado TLS y multipart sin envio real; desactivado falla cerrado', static function () use ($renderer): void {
        $message = $renderer->render('owner@example.test', 'Ana', 'https://auth.example.test/?mode=verifyEmail&oobCode=MOCK_ONLY');
        rejects(static fn () => (new SmtpMailer(['enabled' => false]))->compose($message));
        $smtp = new SmtpMailer(['enabled' => true, 'host' => 'smtp.example.test', 'port' => 465, 'security' => 'smtps', 'username' => 'test-only', 'password' => 'test-only', 'from' => 'service@example.test']);
        $mail = $smtp->compose($message); same(true, $mail->SMTPAuth); same('ssl', $mail->SMTPSecure); same(0, $mail->SMTPDebug);
        same(true, $mail->SMTPOptions['ssl']['verify_peer']); check($mail->preSend()); check(str_contains($mail->getSentMIMEMessage(), 'multipart/alternative'));
    });
    testCase('composicion rechaza rutas publicas y configuracion desactivada no carga claves', static function () use ($temp): void {
        mkdir($temp.'/public'); file_put_contents($temp.'/disabled.json', '{"enabled":false,"service_account_file":"absent"}');
        same(null, Factory::fromPrivateConfig($temp.'/disabled.json', [$temp.'/public']));
        file_put_contents($temp.'/public/key.json', '{}'); rejects(static fn () => Factory::privatePath($temp.'/public/key.json', [$temp.'/public']));
        unlink($temp.'/public/key.json'); rmdir($temp.'/public');
    });
    testCase('adaptador HTTP no confia en cabeceras de proxy sin lista privada', static function (): void {
        $server = ['REQUEST_METHOD' => 'POST', 'HTTP_ORIGIN' => 'https://store.example.test', 'REMOTE_ADDR' => '192.0.2.1',
            'HTTP_X_FORWARDED_PROTO' => 'https', 'HTTP_X_FORWARDED_FOR' => '198.51.100.99', 'REDIRECT_HTTP_AUTHORIZATION' => 'Bearer MOCK'];
        $r = HttpEntry::request($server, '{}'); same(false, $r->https); same('192.0.2.1', $r->ip); same('Bearer MOCK', $r->authorization);
        same(true, HttpEntry::request($server, '{}', ['192.0.2.1'])->https);
        $server['HTTPS'] = 'on'; same(true, HttpEntry::request($server, '{}')->https);
    });
    testCase('lista privada de prueba limita solo el envio al correo consultado en Auth', static function () use ($token, $renderer): void {
        $store = store(); $api = new FakeApi(); $mailer = new FakeMailer();
        $s = new VerificationService(true, 'https://store.example.test', verifier($store), $api, $store, $renderer, $mailer, ['other@example.test']);
        same(403, $s->handle(request($token()))->status); same([], $api->links); same([], $mailer->messages);
        $store2 = store(); $api2 = new FakeApi();
        $allowed = new VerificationService(true, 'https://store.example.test', verifier($store2), $api2, $store2, $renderer, new FakeMailer(), ['OWNER@example.test']);
        same('sent', $allowed->handle(request($token()))->code);
    });
    testCase('archivo publico real falla cerrado y exige token sin contactar servicios', static function () use ($temp): void {
        $root = $temp.'/entry-private'; $web = $temp.'/entry-public';
        $vendor = $root.'/app/server/php-rest-verification/vendor';
        mkdir($vendor, 0700, true); mkdir($root.'/secrets', 0700); mkdir($root.'/state', 0700); mkdir($web, 0700);
        $autoload = dirname(__DIR__).'/vendor/autoload.php';
        file_put_contents($vendor.'/autoload.php', '<?php require '.var_export($autoload, true).';');
        file_put_contents($root.'/secrets/service-account.json', '{"project_id":"eagle-test-project"}');
        $config = json_decode(file_get_contents(dirname(__DIR__).'/config.example.json'), true);
        $config['project_id'] = 'eagle-test-project'; $config['smtp']['enabled'] = true;
        $config['service_account_file'] = $root.'/secrets/service-account.json'; $config['state_directory'] = $root.'/state';
        $config['limiter_hmac_key'] = str_repeat('test-only-', 4);
        $entry = dirname(__DIR__, 3).'/deployment/public-api/email-verification.php';
        $invoke = static function (string $auth = '') use ($root, $web, $entry): array {
            $server = ['DOCUMENT_ROOT' => $web, 'HTTPS' => 'on', 'REQUEST_METHOD' => 'POST',
                'REMOTE_ADDR' => '192.0.2.1', 'HTTP_ORIGIN' => 'https://store.example.test', 'HTTP_AUTHORIZATION' => $auth];
            $program = 'putenv("EAGLE_VERIFICATION_PRIVATE_ROOT=".$argv[3]); $_SERVER=json_decode($argv[2],true); ob_start(); require $argv[1]; $body=ob_get_clean(); echo json_encode(["status"=>http_response_code(),"body"=>json_decode($body,true)]);';
            $pipes = []; $process = proc_open([PHP_BINARY, '-c', php_ini_loaded_file(), '-r', $program, $entry, json_encode($server), $root],
                [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
            $output = stream_get_contents($pipes[1]); $error = stream_get_contents($pipes[2]); fclose($pipes[1]); fclose($pipes[2]);
            same(0, proc_close($process)); same('', $error); return json_decode($output, true, flags: JSON_THROW_ON_ERROR);
        };
        try {
            file_put_contents($root.'/secrets/config.json', json_encode($config));
            same(['status' => 503, 'body' => ['code' => 'not_configured']], $invoke());
            $config['enabled'] = true; file_put_contents($root.'/secrets/config.json', json_encode($config));
            same(['status' => 401, 'body' => ['code' => 'unauthenticated']], $invoke());
            same(['status' => 401, 'body' => ['code' => 'unauthenticated']], $invoke('Bearer invalid'));
        } finally {
            foreach ([$vendor.'/autoload.php', $root.'/secrets/service-account.json', $root.'/secrets/config.json', $root.'/state/verification.sqlite'] as $file) {
                if (is_file($file)) { unlink($file); }
            }
            foreach ([$vendor, dirname($vendor), dirname($vendor, 2), dirname($vendor, 3), $root.'/secrets', $root.'/state', $root, $web] as $directory) { rmdir($directory); }
        }
    });
    echo $count, ' pruebas aprobadas; sin Sodium ni conexiones reales.', PHP_EOL;
} finally {
    // Solo archivos de la carpeta aleatoria creada por este runner; no borrado recursivo.
    foreach (glob($temp.'/*') as $file) { if (is_file($file) && dirname($file) === $temp) { unlink($file); } }
    rmdir($temp);
}
