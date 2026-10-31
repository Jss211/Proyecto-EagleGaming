import { cp, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'server/php-rest-verification');
await stat(path.join(root, 'dist/index.html'));
await stat(path.join(source, 'vendor/autoload.php'));
for (const [file, expected] of [
  ['verification.html', 'a141186f6aad6c7e6ed670f5a4df70e63de7318b0a637dddef550c28e7bb44ef'],
  ['verification.txt', '8458474edb81bc675c29cbaf98ad7a63f8ca50c05aea76d1c4163bdd703ea7ad'],
]) {
  const bytes = await readFile(path.join(root, 'email-templates/verification', file));
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('La plantilla aprobada cambió; no se empaqueta.');
}
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const output = path.join(root, 'deployment-output', `verification-${stamp}`);
await mkdir(output, { recursive: true });
await cp(path.join(root, 'dist'), path.join(output, 'public_html'), {
  recursive: true, filter: current => path.basename(current) !== '.htaccess',
});
await cp(path.join(root, 'deployment/public-api'), path.join(output, 'public_html/api'), { recursive: true });
const app = path.join(output, 'eagle-private/app/server/php-rest-verification');
await mkdir(app, { recursive: true });
for (const name of ['src', 'vendor', 'composer.json', 'composer.lock']) {
  await cp(path.join(source, name), path.join(app, name), { recursive: true });
}
const templates = path.join(output, 'eagle-private/app/email-templates/verification');
await mkdir(templates, { recursive: true });
for (const name of ['verification.html', 'verification.txt']) {
  await cp(path.join(root, 'email-templates/verification', name), path.join(templates, name));
}
await mkdir(path.join(output, 'eagle-private/secrets'), { recursive: true });
await cp(path.join(source, 'config.example.json'), path.join(output, 'eagle-private/secrets/config.example.json'));
await mkdir(path.join(output, 'eagle-private/state'), { recursive: true });
await writeFile(path.join(output, 'eagle-private/.htaccess'), 'Require all denied\n');
await cp(path.join(root, 'deployment/README.md'), path.join(output, 'LEER-ANTES-DE-SUBIR.md'));
await writeFile(path.join(output, 'manifest.json'), JSON.stringify({
  createdAt: new Date().toISOString(), backendEnabled: false,
  endpoint: '/api/email-verification.php', rootHtaccessIncluded: false,
  credentialsIncluded: false, templatesUnchanged: true,
}, null, 2));
console.info(`Paquete local listo (no desplegado): ${output}`);
