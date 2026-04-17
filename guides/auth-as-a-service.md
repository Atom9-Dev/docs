# Auth-as-a-Service

Add authentication to any website with Atom9 Auth. Your users sign in via a hosted auth page, and your site receives a signed JWT with their identity.

## Quick Start

### 1. Add the SDK

```html
<script src="https://cdn.atom9.com/sdk/atom9-auth.js"></script>
<script>
  const auth = Atom9Auth.init({
    tenantId: 'YOUR_TENANT_ID',
    appId: 'YOUR_APP_SLUG',
    issuer: 'https://auth.atom9.com',
  });

  auth.onAuth((user) => {
    console.log('Authenticated:', user.email, user.isNew ? '(new)' : '(returning)');
  });
</script>
```

### 2. Add login/register buttons

```html
<button onclick="auth.login()">Log In</button>
<button onclick="auth.register()">Sign Up</button>
```

### 3. Check auth state

```js
if (auth.isAuthenticated()) {
  const user = auth.getUser();
  // user.id, user.email, user.isNew, user.tenant, user.sessionId
}

const token = auth.getToken(); // raw JWT string
auth.logout(); // clear stored token
```

## How It Works

1. Your site calls `auth.login()` which redirects to `https://auth.atom9.com/connect`
2. The user authenticates (magic link, Google, or Microsoft)
3. Atom9 redirects back to your site with `#atom9_token=JWT` in the URL hash
4. The SDK reads the token, stores it in `localStorage`, cleans the URL, and fires `onAuth`

The JWT is signed with HS256 using your app's `jwt_secret`. The hash fragment is never sent to any server.

## Setting Up Auth Methods

### Via the CMS Wizard

1. Open the ops console and navigate to your site
2. Click **+ Add Package** and select **Auth**
3. The wizard guides you through:
   - Choosing methods (magic link is always enabled)
   - Entering Google/Microsoft OIDC credentials if selected
   - Setting redirect URLs
4. After setup you receive your JWT secret and integration snippet

### Via AI Assistant

Ask the AI: "Set up auth for my site with Google login"

The AI uses these tools:
- `auth.app.create` — creates the app
- `auth.oidc_provider.configure` — sets up Google/Microsoft
- `auth.integration.snippet` — returns the SDK code

## Google OIDC Setup

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add this authorized redirect URI: `https://auth.atom9.com/id-bff/id/oidc/google/callback`
4. Copy the **Client ID** and **Client Secret**
5. Enter them in the wizard or via `auth.oidc_provider.configure`

## Microsoft OIDC Setup

1. Go to [Azure Portal > App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Register a new application
3. Add this redirect URI: `https://auth.atom9.com/id-bff/id/oidc/microsoft/callback`
4. Create a client secret under **Certificates & secrets**
5. Copy the **Application (client) ID** and **Client secret value**
6. Enter them in the wizard or via `auth.oidc_provider.configure`

## JWT Reference

### Payload fields

| Field | Type | Description |
|-------|------|-------------|
| `iss` | string | Issuer (`atom9`) |
| `sub` | string | User ID (UUID) |
| `aud` | string | App slug |
| `tenant` | string | Tenant ID |
| `email` | string | User's email |
| `is_new` | boolean | `true` if this is a new registration |
| `session_id` | string | Session ID |
| `amr` | string[] | Authentication methods used (e.g. `["magic_link"]`, `["google_oidc"]`) |
| `iat` | number | Issued at (Unix timestamp) |
| `exp` | number | Expires at (Unix timestamp, default 1 hour) |

### Verifying the JWT

The JWT is signed with HS256 using your app's `jwt_secret`. Verify it server-side in any language:

**Node.js:**
```js
import crypto from 'node:crypto';

function verifyJwt(token, secret) {
  const [header, payload, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', secret)
    .update(`${header}.${payload}`).digest('base64url');
  if (signature !== expected) throw new Error('Invalid signature');
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}
```

**Python:**
```python
import hmac, hashlib, base64, json

def verify_jwt(token, secret):
    header, payload, signature = token.split('.')
    expected = base64.urlsafe_b64encode(
        hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    ).rstrip(b'=').decode()
    assert signature == expected, "Invalid signature"
    return json.loads(base64.urlsafe_b64decode(payload + '=='))
```

**PHP:**
```php
function verifyJwt($token, $secret) {
    [$header, $payload, $signature] = explode('.', $token);
    $expected = rtrim(strtr(base64_encode(
        hash_hmac('sha256', "$header.$payload", $secret, true)
    ), '+/', '-_'), '=');
    if ($signature !== $expected) throw new Exception('Invalid signature');
    return json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
}
```

## Non-JS Integration

If you don't want the SDK, just link directly to the connect page:

```
https://auth.atom9.com/connect?tenant=YOUR_TENANT&app=YOUR_APP&mode=login&redirect=https://yoursite.com/callback
```

After auth, the user is redirected to:
```
https://yoursite.com/callback#atom9_token=eyJ...
```

Read the JWT from the URL hash fragment in your callback page.

## SDK Reference

| Method | Description |
|--------|-------------|
| `Atom9Auth.init({ tenantId, appId, issuer })` | Create an auth instance |
| `auth.login({ redirectUrl })` | Redirect to login page |
| `auth.register({ redirectUrl })` | Redirect to register page |
| `auth.onAuth(callback)` | Register auth callback; fires immediately if already authenticated |
| `auth.getUser()` | Decode JWT and return user object, or `null` |
| `auth.getToken()` | Return raw JWT string, or `null` |
| `auth.isAuthenticated()` | `true` if token exists and is not expired |
| `auth.logout()` | Clear stored token |
