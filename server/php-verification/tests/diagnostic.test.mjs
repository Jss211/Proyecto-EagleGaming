import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const php = process.env.EAGLE_TEST_PHP;
if (!php) throw new Error('Indica la ruta del PHP local con EAGLE_TEST_PHP. No usa Hostinger.');
const diagnostic = fileURLToPath(new URL('../diagnostic/runtime-check.php', import.meta.url));
const source = readFileSync(diagnostic, 'utf8');
const htaccess = readFileSync(new URL('../diagnostic/.htaccess', import.meta.url), 'utf8');

function inspect(changes = {}, options = []) {
  const server = { HTTPS: 'on', REMOTE_USER: 'local-test-only', REQUEST_METHOD: 'GET', QUERY_STRING: '', ...changes };
  const result = spawnSync(php, [...options, '-r',
    '$_SERVER = json_decode($argv[1], true, flags: JSON_THROW_ON_ERROR); require $argv[2];',
    JSON.stringify(server), diagnostic], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  return JSON.parse(result.stdout);
}

test('requiere TLS directo y no confia en cabeceras de proxy', () => {
  assert.deepEqual(inspect({ HTTPS: '', HTTP_X_FORWARDED_PROTO: 'https' }), { code: 'https_required' });
});

test('no revela version sin autenticacion del servidor', () => {
  assert.deepEqual(inspect({ REMOTE_USER: '' }), { code: 'server_authentication_required' });
  assert.deepEqual(inspect({ REMOTE_USER: '', PHP_AUTH_USER: 'spoof', HTTP_REMOTE_USER: 'spoof' }), { code: 'server_authentication_required' });
});

test('permite la identidad REDIRECT_REMOTE_USER de Apache', () => {
  assert.equal(inspect({ REMOTE_USER: null, REDIRECT_REMOTE_USER: 'local-test-only' }).diagnostic, 'eagle_php84_probe_v1');
});

test('rechaza metodos distintos de GET y parametros', () => {
  for (const method of ['POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']) {
    assert.deepEqual(inspect({ REQUEST_METHOD: method }), { code: 'method_not_allowed' });
  }
  assert.deepEqual(inspect({ QUERY_STRING: 'debug=1' }), { code: 'query_not_allowed' });
});

test('devuelve solo campos permitidos, sin identidad, rutas ni configuracion', () => {
  const result = inspect();
  assert.deepEqual(Object.keys(result).sort(), [
    'diagnostic', 'php_version', 'php_84', 'sdk_extensions', 'integration_extensions',
    'storage_extensions', 'diagnostic_passed', 'scope',
  ].sort());
  assert.ok(!JSON.stringify(result).includes('local-test-only'));
  for (const group of ['sdk_extensions', 'integration_extensions', 'storage_extensions']) {
    assert.ok(Object.values(result[group]).every(value => typeof value === 'boolean'));
  }
  assert.equal(result.php_84, result.php_version.startsWith('8.4.'));
  const extensions = [result.sdk_extensions, result.integration_extensions, result.storage_extensions];
  assert.equal(result.diagnostic_passed, result.php_84 && extensions.every(group => Object.values(group).every(Boolean)));
});

test('con extensiones opcionales desactivadas informa fallo sin falsear compatibilidad', () => {
  const result = inspect({}, ['-n']);
  assert.equal(result.sdk_extensions.mbstring, false);
  assert.equal(result.integration_extensions.curl, false);
  assert.equal(result.diagnostic_passed, false);
});

test('acceso bloqueado por defecto y regla PHP limitada a la carpeta', () => {
  assert.ok(htaccess.includes('SetHandler application/x-lsphp84'));
  assert.match(htaccess, /BEGIN EAGLE SAFETY LOCK[\s\S]*Require all denied[\s\S]*END EAGLE SAFETY LOCK/);
  assert.ok(!/RewriteRule|RewriteBase|AddHandler/.test(htaccess));
  assert.ok(htaccess.includes('Options -Indexes'));
});

test('diagnostico sin lecturas de secretos, dependencias, correo ni conexiones', () => {
  assert.ok(!/\b(?:phpinfo|getenv|file_get_contents|curl_exec|mail|require|include|session_start)\s*\(/i.test(source));
  assert.ok(!source.includes('$_ENV'));
  assert.ok(!/\b(?:var_dump|print_r)\s*\(/i.test(source));
  assert.ok(source.includes('no-store, private'));
});
