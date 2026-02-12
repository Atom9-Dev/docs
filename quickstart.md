# Atom9 Quickstart (10–20 min)

## 1) Create app config
Use the onboarding UI at `https://id.atom9.com`:
- start onboarding
- set app slug
- set callback URL
- choose methods

## 2) Validate readiness
Run:
- Validate app
- Quickstart check
- Test login method (magic/google/microsoft)

## 3) Run first login flow
Magic link:
- POST `/id-bff/id/magic-link/start`
- open consume URL from email
- verify session in `/id-bff/id/sessions`

## 4) Integrate app
Use the onboarding snippet and endpoints returned by `/id-bff/id/onboarding/start`.
