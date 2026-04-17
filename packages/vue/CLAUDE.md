# Claude rules — @atom9/vue (public)

This repo is **public** (Atom9-Dev/vue). The workspace-level [`../CLAUDE.md`](../CLAUDE.md) also applies.

## Public boundary (hard rule)

Vue composables around the public API surface (`/auth/*`, `/api/*`, `/media/*`, `/account/*`). No internal service names, ports, DB schemas, or Gateway/Highway internals.

## Contract parity with react

The Vue surface is intentionally **identical** to the React surface (see `react/README.md`). If you change one, mirror the change here. Same method names, same return shapes, same parameter semantics — adapted to Vue's reactivity primitives (`ref`, `computed`, `provide`/`inject`).

## Vue conventions

- Composables first (`useAtom9`). Plugin second (`createAtom9()`).
- Target Vue 3 with Composition API.
- Support both plugin install (global) and scoped `provideAtom9()`.
