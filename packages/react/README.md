# @atom9/react

React bindings for Atom9's `a9sites-bff` customer-facing auth.

## Install

```bash
npm install @atom9/react @atom9/bff
```

## Setup

Wrap your app with the provider:

```jsx
import { Atom9Provider } from '@atom9/react';

function Root() {
  return (
    <Atom9Provider>
      <App />
    </Atom9Provider>
  );
}
```

By default it talks to `/auth/*`, `/api/*`, `/media/*` on the **same origin**.
That means your React app must be served from the same origin as `a9sites-bff`,
OR proxied through a thin server (see `examples/node-express`).

## Using auth

```jsx
import { useAtom9 } from '@atom9/react';

function Profile() {
  const { user, authenticated, auth } = useAtom9();
  if (!authenticated) return <LoginForm onLogin={auth.login} />;
  return (
    <div>
      <p>Hello {user.email}</p>
      <button onClick={() => auth.logout()}>Log out</button>
    </div>
  );
}
```

## Protecting routes

```jsx
import { ProtectedRoute } from '@atom9/react';

<ProtectedRoute fallback="/auth/login">
  <Dashboard />
</ProtectedRoute>
```

## All auth methods

```js
const { auth } = useAtom9();

// Magic link
await auth.magicLink({ email, returnTo: '/dashboard' });

// Password
await auth.login({ email, password });        // may return { mfa_required, challenge_id }
await auth.register({ email, password });
await auth.recover({ email });
await auth.resetPassword({ token, newPassword });
await auth.changePassword({ currentPassword, newPassword });

// MFA (TOTP)
await auth.mfa({ challengeId, code });
await auth.totp.setup();
await auth.totp.verifySetup({ code });
await auth.totp.disable({ code });

// OIDC (navigates)
auth.startGoogle({ returnTo: '/' });
auth.startMicrosoft({ returnTo: '/' });

// Passkey (WebAuthn)
await auth.passkey.login();
await auth.passkey.register({ name: 'My device' });
await auth.passkey.list();
await auth.passkey.remove(passkeyId);

// Logout
await auth.logout();
```

## Session & privacy APIs

```js
const { sessions, privacy } = useAtom9();

await sessions.list();
await sessions.revoke(sessionId);
await sessions.revokeAll({ keepCurrent: true });

await privacy.data();
await privacy.requestExport();
await privacy.requestDeletion({ confirm: 'DELETE', reason });
await privacy.cancelDeletion();
await privacy.getConsent();
await privacy.updateConsent(consent);
```
