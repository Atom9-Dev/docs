/**
 * @atom9/bff — browser SDK for a9sites-bff integrated sites.
 *
 * The BFF model: your site runs on the same origin as a9sites-bff (or proxies
 * /auth/*, /api/*, /media/* to it). The SDK issues same-origin fetch calls
 * with credentials:'include' so HttpOnly cookies flow automatically.
 *
 * Usage:
 *   import { createAtom9Client } from '@atom9/bff';
 *   const a9 = createAtom9Client();
 *
 *   // Get current user (null if anonymous)
 *   const me = await a9.me();
 *
 *   // Magic link
 *   await a9.auth.magicLink({ email, returnTo: '/dashboard' });
 *
 *   // Password
 *   const r = await a9.auth.login({ email, password });
 *   if (r.mfa_required) { await a9.auth.mfa({ challengeId: r.challenge_id, code }); }
 *
 *   // OIDC (navigates)
 *   a9.auth.startGoogle({ returnTo: '/dashboard' });
 *
 *   // Logout
 *   await a9.auth.logout();
 *
 *   // Passkey
 *   await a9.auth.passkey.login();                  // login existing user
 *   await a9.auth.passkey.register({ name: 'My MacBook' }); // enroll
 */

const DEFAULT_BASE = '';  // same-origin by default

/**
 * @typedef {Object} Atom9User
 * @property {string} id
 * @property {string} email
 * @property {string[]} amr
 * @property {string} acr
 */

export function createAtom9Client({ baseUrl = DEFAULT_BASE, onUnauthorized } = {}) {
  let csrfToken = null;

  // ── Low-level fetch helpers ──────────────────────────────────────────────
  async function ensureCsrf() {
    if (csrfToken) return csrfToken;
    const r = await fetch(`${baseUrl}/auth/csrf`, { credentials: 'include' });
    if (!r.ok) throw new Error('csrf_fetch_failed');
    const { csrf } = await r.json();
    csrfToken = csrf;
    return csrf;
  }

  async function get(path) {
    const r = await fetch(`${baseUrl}${path}`, { credentials: 'include' });
    if (r.status === 401 && onUnauthorized) onUnauthorized();
    const text = await r.text();
    let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { status: r.status, ok: r.ok, data };
  }

  async function post(path, body = {}) {
    const csrf = await ensureCsrf();
    const r = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
      body: JSON.stringify(body),
    });
    if (r.status === 401 && onUnauthorized) onUnauthorized();
    const text = await r.text();
    let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { status: r.status, ok: r.ok, data };
  }

  async function del(path) {
    const csrf = await ensureCsrf();
    const r = await fetch(`${baseUrl}${path}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'x-csrf-token': csrf },
    });
    const text = await r.text();
    let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { status: r.status, ok: r.ok, data };
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Fetch current session. Returns { authenticated, user, session } or null on error. */
  async function me() {
    const r = await get('/api/me');
    return r.ok ? r.data : null;
  }

  // ── Auth: magic link ──────────────────────────────────────────────────────
  async function magicLink({ email, returnTo = '/' }) {
    const r = await post('/auth/magic-link', { email, return_to: returnTo });
    return r.data;
  }

  // ── Auth: password ────────────────────────────────────────────────────────
  async function login({ email, password }) {
    const r = await post('/auth/password/login', { email, password });
    if (!r.ok && r.status !== 401) throw new Error(r.data?.error || 'login_failed');
    return r.data;
  }

  async function register({ email, password, returnTo = '/' }) {
    const r = await post('/auth/password/register', { email, password, return_to: returnTo });
    return r.data;
  }

  async function recover({ email }) {
    const r = await post('/auth/password/recover', { email });
    return r.data;
  }

  async function resetPassword({ token, newPassword }) {
    const r = await post('/auth/password/reset', { token, newPassword });
    return r.data;
  }

  async function changePassword({ currentPassword, newPassword }) {
    const r = await post('/api/account/password/change', { currentPassword, password: newPassword });
    return r.data;
  }

  // ── MFA TOTP ──────────────────────────────────────────────────────────────
  async function mfa({ challengeId, code }) {
    const r = await post('/auth/mfa/totp/challenge', { challenge_id: challengeId, code });
    return r.data;
  }

  const totp = {
    async setup() { return (await post('/api/account/mfa/totp/setup')).data; },
    async verifySetup({ code }) { return (await post('/api/account/mfa/totp/verify-setup', { code })).data; },
    async disable({ code }) { return (await post('/api/account/mfa/totp/disable', { code })).data; },
  };

  // ── OIDC ──────────────────────────────────────────────────────────────────
  function startGoogle({ returnTo = '/' } = {}) {
    window.location.assign(`${baseUrl}/auth/oidc/google/start?return_to=${encodeURIComponent(returnTo)}`);
  }
  function startMicrosoft({ returnTo = '/' } = {}) {
    window.location.assign(`${baseUrl}/auth/oidc/microsoft/start?return_to=${encodeURIComponent(returnTo)}`);
  }

  // ── Passkey (WebAuthn) ────────────────────────────────────────────────────
  const passkey = {
    async login() {
      const opts = (await post('/auth/passkey/options')).data;
      if (!opts || opts.error) throw new Error(opts?.error || 'passkey_options_failed');
      // Convert server options into WebAuthn request
      const cred = await navigator.credentials.get({
        publicKey: {
          ...opts,
          challenge: b64urlToBuffer(opts.challenge),
          allowCredentials: (opts.allowCredentials || []).map(c => ({ ...c, id: b64urlToBuffer(c.id) })),
        },
      });
      const payload = webauthnAssertionToJson(cred);
      const r = await post('/auth/passkey/verify', payload);
      if (!r.ok) throw new Error(r.data?.error || 'passkey_verify_failed');
      return r.data;
    },

    async register({ name } = {}) {
      const opts = (await post('/api/account/passkeys/register-options')).data;
      if (!opts || opts.error) throw new Error(opts?.error || 'passkey_register_options_failed');
      const cred = await navigator.credentials.create({
        publicKey: {
          ...opts,
          challenge: b64urlToBuffer(opts.challenge),
          user: { ...opts.user, id: b64urlToBuffer(opts.user.id) },
          excludeCredentials: (opts.excludeCredentials || []).map(c => ({ ...c, id: b64urlToBuffer(c.id) })),
        },
      });
      const payload = webauthnAttestationToJson(cred, name);
      const r = await post('/api/account/passkeys/register-verify', payload);
      if (!r.ok) throw new Error(r.data?.error || 'passkey_register_failed');
      return r.data;
    },

    async list() { return (await get('/api/account/passkeys')).data; },
    async remove(id) { return (await del(`/api/account/passkeys/${id}`)).data; },
  };

  // ── Sessions ──────────────────────────────────────────────────────────────
  const sessions = {
    async list() { return (await get('/api/account/sessions')).data; },
    async revoke(sessionId) { return (await post('/api/account/sessions/revoke', { sessionId })).data; },
    async revokeAll({ keepCurrent = true } = {}) { return (await post('/api/account/sessions/revoke-all', { keepCurrent })).data; },
  };

  // ── GDPR / Privacy ────────────────────────────────────────────────────────
  const privacy = {
    async data() { return (await get('/api/privacy/data')).data; },
    async requestExport() { return (await post('/api/privacy/export')).data; },
    async requestDeletion({ confirm, reason } = {}) { return (await post('/api/privacy/delete', { confirm, reason })).data; },
    async cancelDeletion() { return (await post('/api/privacy/delete/cancel')).data; },
    async getConsent() { return (await get('/api/privacy/consent')).data; },
    async updateConsent(consent) { return (await post('/api/privacy/consent', { consent })).data; },
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    const r = await post('/auth/logout');
    csrfToken = null;
    return r.data;
  }

  return {
    me,
    auth: { magicLink, login, register, recover, resetPassword, changePassword, mfa, logout, startGoogle, startMicrosoft, passkey, totp },
    sessions,
    privacy,
  };
}

// ── WebAuthn helpers ──────────────────────────────────────────────────────

function b64urlToBuffer(s) {
  const pad = '='.repeat((4 - s.length % 4) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

function bufferToB64url(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function webauthnAssertionToJson(cred) {
  return {
    id: cred.id,
    rawId: bufferToB64url(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: bufferToB64url(cred.response.clientDataJSON),
      authenticatorData: bufferToB64url(cred.response.authenticatorData),
      signature: bufferToB64url(cred.response.signature),
      userHandle: cred.response.userHandle ? bufferToB64url(cred.response.userHandle) : null,
    },
    clientExtensionResults: cred.getClientExtensionResults(),
  };
}

function webauthnAttestationToJson(cred, name) {
  return {
    id: cred.id,
    rawId: bufferToB64url(cred.rawId),
    type: cred.type,
    name: name || undefined,
    response: {
      clientDataJSON: bufferToB64url(cred.response.clientDataJSON),
      attestationObject: bufferToB64url(cred.response.attestationObject),
    },
    clientExtensionResults: cred.getClientExtensionResults(),
  };
}
