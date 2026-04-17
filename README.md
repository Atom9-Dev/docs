# Atom9 — Developer Docs + SDKs

Public monorepo for Atom9 Auth: customer-facing developer documentation **and** the integration libraries. One repo, one source of truth for everything an external developer needs to integrate Atom9.

## What's inside

| Folder | What |
|--------|------|
| [`packages/sdk/`](./packages/sdk/) | `@atom9/sdk` — JavaScript SDK (plain JS, ES modules). |
| [`packages/react/`](./packages/react/) | `@atom9/react` — React bindings: `Atom9Provider`, `useAtom9`, `ProtectedRoute`. |
| [`packages/vue/`](./packages/vue/) | `@atom9/vue` — Vue composables: `createAtom9()`, `useAtom9()`. |
| [`examples/`](./examples/) | Runnable integration examples: vanilla-js, node-express, bff-proxy. |
| [`guides/`](./guides/) | How-to guides per feature (BFF integration, magic link, OIDC, sessions, GDPR, etc.). |
| [`cookbook/`](./cookbook/) | Recipe-style reference (API cookbook). |
| [`plans/`](./plans/) | Public-facing roadmap and design docs. |
| [`first-20-minutes.md`](./first-20-minutes.md) | Get Atom9 running in under 20 minutes. |
| [`quickstart.md`](./quickstart.md) | Shorter quickstart for experienced devs. |

## Start here

- **New to Atom9?** → [first-20-minutes.md](./first-20-minutes.md)
- **Integrating into a React app?** → [packages/react/README.md](./packages/react/README.md)
- **Integrating into a Vue app?** → [packages/vue/README.md](./packages/vue/README.md)
- **Plain JS / vanilla browser?** → [packages/sdk/README.md](./packages/sdk/README.md) + [examples/vanilla-js](./examples/vanilla-js/)
- **Server-side / BFF pattern?** → [guides/bff-integration.md](./guides/bff-integration.md) + [examples/node-express](./examples/node-express/) + [examples/bff-proxy](./examples/bff-proxy/)

## Guides

- [BFF integration](./guides/bff-integration.md) — **recommended** for customer sites (HttpOnly cookies, CSRF, session refresh)
- [Auth-as-a-Service](./guides/auth-as-a-service.md) — SPA-only model with localStorage tokens (simpler, less secure)
- [Magic link auth](./guides/magic-link.md)
- [Google OIDC](./guides/google-oidc.md)
- [Microsoft OIDC](./guides/microsoft-oidc.md)
- [Sessions lifecycle](./guides/sessions.md)
- [Onboarding + readiness](./guides/onboarding.md)
- [Security model](./guides/security-model.md)
- [Pricing tiers](./guides/pricing-tiers.md)
- [Troubleshooting](./guides/troubleshooting.md)

## API reference

See [cookbook/api-cookbook.md](./cookbook/api-cookbook.md) for endpoint-by-endpoint reference.

## History

Before 2026-04-17 this content lived across five separate Atom9-Dev repos: `docs`, `sdk`, `react`, `vue`, `examples`. They were merged so a change affecting the public surface touches one repo, not five.
