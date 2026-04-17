# Claude rules — @atom9/examples (public)

This repo is **public** (Atom9-Dev/examples). The workspace-level [`../CLAUDE.md`](../CLAUDE.md) also applies.

## Purpose

Runnable integration examples for real consumers. Each example must be:

1. **Minimal** — shortest path to a working auth flow.
2. **Runnable** — copy-paste and it works after setting env vars.
3. **Public-boundary clean** — no internal service references.

## Public boundary

Only use the public API surface (`/auth/*`, `/api/*`, `/media/*`, `/account/*`) and the public SDK packages (`@atom9/sdk`, `@atom9/react`, `@atom9/vue`, `@atom9/bff`).

## Structure

- `vanilla-js/` — browser-only, no framework.
- `node-express/` — thin backend that proxies to Atom9.
- `bff-proxy/` — BFF-pattern proxy for customer sites.

New examples should be added as new folders at this level. Keep each self-contained (own package.json, README, minimal deps).

## When the SDK changes

Update all affected examples to reflect the new API in the same change. Examples that fail to follow lead new users into wrong patterns.
