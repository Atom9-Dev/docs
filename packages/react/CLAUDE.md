# Claude rules — @atom9/react (public)

This repo is **public** (Atom9-Dev/react). The workspace-level [`../CLAUDE.md`](../CLAUDE.md) also applies.

## Public boundary (hard rule)

This is a React wrapper around the public API surface (`/auth/*`, `/api/*`, `/media/*`, `/account/*`). Do not name internal services, internal ports, DB schemas, Highway, Gateway internals, or RLS mechanics.

## Contract with the SDK

`@atom9/react` wraps `@atom9/sdk` (or the raw fetch contract if SDK isn't imported). When the SDK gains a method, react should expose a React-idiomatic version:

- Add it to the `useAtom9()` return value.
- Add a `ProtectedRoute`-style component if it's a gate.
- Add a test in `examples/react` (if that example exists) or update the integration guide in `docs/`.

## React conventions

- Hooks first (`useAtom9`, `useSession`, etc.). Components second (`Atom9Provider`, `ProtectedRoute`).
- No Redux, no Zustand — the provider holds state.
- Client-side only. No SSR-specific logic unless explicitly needed; document when added.
- Target React 18+ with hooks.
