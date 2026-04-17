# Claude rules — @atom9/sdk (public)

This repo is **public** (Atom9-Dev/sdk). The workspace-level [`../CLAUDE.md`](../CLAUDE.md) also applies.

## Public boundary (hard rule)

No references to internal service names, ports, DB schemas, Highway, Gateway internals, RLS mechanics, or compliance triggers. This repo speaks only through the **public API surface** exposed by `a9sites-bff` and the external Gateway:

- `/auth/*` — login, callback, password reset, OIDC, passkey, MFA
- `/api/*` — session, sessions list, privacy, consent, profile
- `/media/*` — media proxy
- `/account/*` — member account area

If you need to reference how something is implemented, put it in `atom9-server/` and link only from other private docs.

## Contract parity

The SDK exposes methods. The server exposes endpoints. If you change one, the other needs to follow:

1. New SDK method → confirm the endpoint exists in server (check `atom9-server/docs/state.json`).
2. New endpoint in server → SDK method added here, then `react/` and `vue/` wrappers, then `examples/`.
3. Changed shape → update all four repos in the same pass.

## Style

- Plain JS (ES modules), no TypeScript types in output.
- No transpilation required for consumers — ships as-is.
- Keep the public method set minimal. If in doubt, leave it out.
