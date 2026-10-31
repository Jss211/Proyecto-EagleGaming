import { readFile } from 'node:fs/promises';
import type { Mail } from './contracts.ts';

export async function loadTemplates(): Promise<{ html: string; text: string }> {
  const directory = new URL('../../email-templates/verification/', import.meta.url);
  const [html, text] = await Promise.all([
    readFile(new URL('verification.html', directory), 'utf8'),
    readFile(new URL('verification.txt', directory), 'utf8'),
  ]);
  return { html, text };
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, character => entities[character]!);
}

export function renderMail(
  templates: { html: string; text: string },
  account: { email: string; displayName?: string },
  link: string,
  actionOrigin: string,
): Mail {
  const url = new URL(link);
  if (url.protocol !== 'https:' || url.origin !== actionOrigin || url.username || url.password) {
    throw new Error('Invalid action URL');
  }
  const name = Array.from(account.displayName ?? '')
    .filter(character => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
    .join('').trim().slice(0, 150) || 'cliente';
  const replace = (source: string, html: boolean) => source.replace(
    /\{\{([^{}]+)\}\}/g,
    (_match: string, key: string) => {
      const value = key === 'CUSTOMER_NAME' ? name : key === 'VERIFICATION_URL' ? link : undefined;
      if (value === undefined) throw new Error('Unknown template marker');
      return html ? escapeHtml(value) : value;
    },
  );
  return {
    to: account.email,
    subject: 'Confirma tu correo electrónico',
    html: replace(templates.html, true),
    text: replace(templates.text, false),
  };
}
