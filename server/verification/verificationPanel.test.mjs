import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

test('panel real renderiza pendiente, envio, confirmado y Google sin inicializar Firebase', async () => {
  const vite = await createServer({ configFile: false, envDir: false, plugins: [react()], server: { middlewareMode: true } });
  try {
    const { EmailVerificationPanel } = await vite.ssrLoadModule('/src/features/auth/EmailVerificationPanel.tsx');
    const user = { uid: 'mock', email: 'owner@example.test', emailVerified: false, providerData: [{ providerId: 'password' }] };
    const render = props => renderToStaticMarkup(React.createElement(EmailVerificationPanel, { user, ...props }));
    const pending = render({ initialCode: 'sent' });
    assert.match(pending, /Reenviar verificación/); assert.match(pending, /Ya confirmé mi correo/);
    assert.match(pending, /Te enviamos un correo/); assert.match(pending, /owner@example.test/);
    const sending = render({ initialSending: true });
    assert.match(sending, /Preparando tu correo/); assert.equal((sending.match(/disabled=""/g) ?? []).length, 2);
    const verified = render({ user: { ...user, emailVerified: true } });
    assert.match(verified, /Correo verificado/); assert.ok(!verified.includes('Reenviar verificación'));
    assert.equal(render({ user: { ...user, providerData: [{ providerId: 'google.com' }] } }), '');
  } finally { await vite.close(); }
});
