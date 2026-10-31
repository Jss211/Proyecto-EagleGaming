// Solo vista previa local: no importa Firebase, no lee .env y no envía correos.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const template = await readFile(new URL('./verification.html', import.meta.url), 'utf8');
const output = new URL('./verification.preview.local.html', import.meta.url);
const preview = template
  .replaceAll('{{CUSTOMER_NAME}}', 'Cliente de ejemplo')
  .replaceAll('href="{{VERIFICATION_URL}}"', 'href="#verification-preview"')
  .replaceAll('{{VERIFICATION_URL}}', '[Enlace pendiente de generación segura por Firebase]')
  .replace('<head>', `<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">`)
  .replace('<body ', '<body id="verification-preview" ');

if (/\{\{[^}]+\}\}/.test(preview)) {
  throw new Error('La vista previa contiene marcadores sin resolver.');
}

await writeFile(output, preview, 'utf8');
console.info(`Vista previa local (botón sin verificación real): ${fileURLToPath(output)}`);
