# Atom9 API Cookbook (Copy/Paste)

Use these examples to validate your integration quickly.

Base: `https://id.atom9.com/id-bff/id`

Headers used in examples:
- `x-tenant-id: <tenant-id>`
- `x-client-role: admin`
- `x-actor-user-id: <actor-id>`

---

## 1) Create app config

```bash
curl -X POST https://id.atom9.com/id-bff/id/onboarding/start \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: 11111111-1111-1111-1111-111111111111' \
  -H 'x-client-role: admin' \
  -H 'x-actor-user-id: cookbook-user' \
  -d '{
    "appName":"Cookbook App",
    "appSlug":"cookbook-app",
    "callbackUrl":"https://example.com/auth/callback",
    "methods":["magic_link","google_oidc","microsoft_oidc"]
  }'
```

## 2) Quick readiness check

```bash
curl -X POST https://id.atom9.com/id-bff/id/onboarding/quickstart \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: 11111111-1111-1111-1111-111111111111' \
  -H 'x-client-role: admin' \
  -H 'x-actor-user-id: cookbook-user' \
  -d '{"appSlug":"cookbook-app","callbackUrl":"https://example.com/auth/callback"}'
```

## 3) Test login method

```bash
curl -X POST https://id.atom9.com/id-bff/id/onboarding/test-login \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: 11111111-1111-1111-1111-111111111111' \
  -H 'x-client-role: admin' \
  -H 'x-actor-user-id: cookbook-user' \
  -d '{
    "appSlug":"cookbook-app",
    "callbackUrl":"https://example.com/auth/callback",
    "method":"magic_link",
    "email":"user@example.com"
  }'
```

## 4) Session lifecycle

```bash
# list
curl https://id.atom9.com/id-bff/id/sessions \
  -H 'x-tenant-id: 11111111-1111-1111-1111-111111111111' \
  -H 'x-client-role: admin' \
  -H 'x-actor-user-id: <user-id>'

# refresh
curl -X POST https://id.atom9.com/id-bff/id/session/refresh \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: 11111111-1111-1111-1111-111111111111' \
  -H 'x-client-role: admin' \
  -H 'x-actor-user-id: <user-id>' \
  -d '{"sessionId":"<session-id>"}'

# revoke
curl -X POST https://id.atom9.com/id-bff/id/session/revoke \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: 11111111-1111-1111-1111-111111111111' \
  -H 'x-client-role: admin' \
  -H 'x-actor-user-id: <user-id>' \
  -d '{"sessionId":"<session-id>"}'
```
