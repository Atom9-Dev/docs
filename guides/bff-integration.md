# BFF Integration Guide

The **BFF model** is the modern, production-ready way to add Atom9 auth to
your site. Your website runs on the same origin as `a9sites-bff` (or proxies
auth calls to it), and session cookies are managed server-side as HttpOnly
JWTs. Your JavaScript code never touches raw tokens.

> **Which integration should I use?**
>
> - **BFF model** (this guide) — for customer-facing websites. Recommended.
> - **SDK-only model** ([auth-as-a-service.md](./auth-as-a-service.md)) — for
>   pure-SPA apps where tokens live in `localStorage`. Simpler to start with
>   but less secure — the token is readable by any JS on the page.

## The pattern

```
visitor browser
  ↓ HTTPS
customer-site.com
  ├─ / → your HTML pages (static) or CMS-rendered
  ├─ /auth/* → proxied to a9sites-bff
  ├─ /api/* → proxied to a9sites-bff
  └─ /media/public/* → proxied to a9sites-bff
       ↓
   a9sites-bff (port 7402)
     ↓ signed envelope
   Atom9 gateway → id-api / cms-api / …
```

Same-origin proxying is what makes the HttpOnly cookie automatically travel
with every request. The browser never needs to know about the session — it
just sends cookies with every fetch.

## Minimal integration

**1. Set up a proxy** (Node, Nginx, Caddy — any HTTP server). Forward these
prefixes to `a9sites-bff`:

| Path | Purpose |
|---|---|
| `/auth/*` | Login, logout, callbacks, CSRF |
| `/api/*` | Current user, account, privacy |
| `/media/public/*` | Tenant's public media files |

See [examples/bff-proxy](../../examples/bff-proxy/) for a ~70-line Node proxy.

**2. Install the SDK:**

```bash
npm install @atom9/bff
# or for frameworks:
npm install @atom9/react  # or @atom9/vue
```

**3. Use it:**

```js
import { createAtom9Client } from '@atom9/bff';
const a9 = createAtom9Client();

// Get current session
const me = await a9.me();
if (me?.authenticated) console.log('Hello', me.user.email);

// Password login
const result = await a9.auth.login({ email, password });
if (result.mfa_required) {
  await a9.auth.mfa({ challengeId: result.challenge_id, code });
}

// Magic link
await a9.auth.magicLink({ email, returnTo: '/dashboard' });

// OIDC
a9.auth.startGoogle({ returnTo: '/dashboard' });

// Passkey
await a9.auth.passkey.login();

// Logout
await a9.auth.logout();
```

## Available auth methods

| Method | Purpose |
|---|---|
| `magicLink({ email, returnTo })` | Send magic-link email |
| `login({ email, password })` | Password login (may return `{ mfa_required, challenge_id }`) |
| `register({ email, password })` | Create account (requires email verification) |
| `recover({ email })` | Start password reset |
| `resetPassword({ token, newPassword })` | Complete reset |
| `mfa({ challengeId, code })` | Complete MFA after password login |
| `startGoogle({ returnTo })` | Begin Google OAuth (navigates) |
| `startMicrosoft({ returnTo })` | Begin Microsoft OAuth (navigates) |
| `passkey.login()` | Sign in with an existing passkey |
| `passkey.register({ name })` | Enroll a new passkey (requires login) |
| `logout()` | Clear cookie + revoke session |

## Account management

```js
// Sessions
await a9.sessions.list();
await a9.sessions.revoke(sessionId);
await a9.sessions.revokeAll({ keepCurrent: true });

// Passkeys
await a9.auth.passkey.list();
await a9.auth.passkey.remove(id);

// TOTP
await a9.auth.totp.setup();                  // → { secret, otpauth_uri }
await a9.auth.totp.verifySetup({ code });    // → { backup_codes }
await a9.auth.totp.disable({ code });

// Password change
await a9.auth.changePassword({ currentPassword, newPassword });
```

## GDPR / Privacy

```js
await a9.privacy.data();                                    // download personal data
await a9.privacy.requestExport();                           // async export
await a9.privacy.requestDeletion({ confirm: 'DELETE' });    // 30-day grace period
await a9.privacy.cancelDeletion();
await a9.privacy.getConsent();
await a9.privacy.updateConsent([{ category, granted: true }]);
```

## React

```jsx
import { Atom9Provider, useAtom9, ProtectedRoute } from '@atom9/react';

<Atom9Provider>
  <App />
</Atom9Provider>

function App() {
  const { user, authenticated, auth } = useAtom9();
  return authenticated
    ? <><p>Hello {user.email}</p><button onClick={auth.logout}>Log out</button></>
    : <LoginForm />;
}

// Gate a route
<ProtectedRoute fallback="/auth/login"><Dashboard /></ProtectedRoute>
```

## Vue

```vue
<!-- main.js -->
import { createAtom9 } from '@atom9/vue';
app.use(createAtom9());

<!-- Component -->
<script setup>
import { useAtom9 } from '@atom9/vue';
const { user, authenticated, auth } = useAtom9();
</script>
```

## Security properties

| Concern | Protection |
|---|---|
| XSS stealing session | Cookie is `HttpOnly` — JS cannot read it |
| CSRF | Double-submit `a9_csrf` cookie + `X-CSRF-Token` header + `SameSite=Strict` |
| Cross-tenant cookie replay | JWT carries `tenant`, checked on every request against resolved Host |
| Stolen cookie | 15-min JWT TTL + logout adds to revocation set |
| MITM | `Secure` flag + HSTS (enforced in production) |
| Brute force | Per-IP+email rate limits on auth endpoints |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` in CSP |

## Session cookie

| Property | Value |
|---|---|
| Name | `a9_sess` |
| Flags | `HttpOnly; Secure; SameSite=Strict; Path=/` |
| TTL | 15 minutes |
| Format | HS256 JWT signed by a9sites-bff |
| Refresh | Silent, when within 2 min of expiry |

The SDK handles refresh transparently — you don't need to do anything.

## Switching from the localStorage model

If you previously used the SDK-only model (tokens in localStorage):

1. Stop storing tokens on the frontend.
2. Add the BFF proxy (see `examples/bff-proxy`).
3. Replace `localStorage.setItem('atom9_token', t)` calls with the SDK's auth
   methods — login/register/magic-link call the BFF which sets the cookie.
4. Replace `atom9_token` header reads with `await a9.me()`.
5. The `#atom9_token=...` URL fragment pattern is gone — the BFF handles
   magic-link / OIDC callbacks server-side now.

## See also

- [examples/bff-proxy](../../examples/bff-proxy/) — 70-line reference integration
- [examples/DevCartro](../../TestCompanies/DevCartro/) — full demo with every auth method
- [security-model.md](./security-model.md) — trust boundary details
- [sessions.md](./sessions.md) — session lifecycle
- [magic-link.md](./magic-link.md), [google-oidc.md](./google-oidc.md),
  [microsoft-oidc.md](./microsoft-oidc.md) — flow specifics
