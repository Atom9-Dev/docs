# First 20 Minutes with Atom9 Auth

This is the fastest path from zero to first successful login test.

## Step 1 — Open onboarding UI
Go to: `https://id.atom9.com`

## Step 2 — Create app config
Use these fields:
- app name: `My App`
- app slug: `my-app`
- callback URL: `https://example.com/auth/callback`
- methods: `magic_link,google_oidc,microsoft_oidc`

Click: **1) start onboarding**

## Step 3 — Validate readiness
Click:
- **3) validate app**
- **4) quickstart check**

If blockers appear, use the fix suggestion panel.

## Step 4 — Run test logins
Click:
- **test magic-link**
- **test google**
- **test microsoft**

## Step 5 — Verify session behavior
Use endpoints:
- `GET /id-bff/id/sessions`
- `POST /id-bff/id/session/refresh`
- `POST /id-bff/id/session/revoke`

## Step 6 — Integrate quickly
Pick one public starter:
- `Atom9-Dev/examples/vanilla-js`
- `Atom9-Dev/examples/node-express`

Use SDK starter if needed:
- `Atom9-Dev/sdk/js/atom9-auth.js`

---

If you get stuck, check `guides/troubleshooting.md`.
