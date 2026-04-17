# Claude rules — Atom9 Docs + SDKs (public monorepo)

This repo is **public** (Atom9-Dev/docs on GitHub). It contains customer-facing developer documentation **and** the integration libraries (`sdk/`, `react/`, `vue/`, `examples/`). The workspace-level [`../CLAUDE.md`](../CLAUDE.md) also applies.

## Audience

External developers integrating Atom9 into their own product. Not internal engineers.

## Public boundary (hard rule)

Do NOT reference:
- Internal service names (`clients-api`, `automation-api`, `highway`, `gateway`, `id-api`, `ai-api`, `cms-api`, `contacts-api`, `compliance-api`, `users-api`, `a9sites-bff`).
- Internal ports (`7001`..`7099`, `7100`, `7200`, `7301`, `7302`, `7400`, `7402`).
- Internal DB schemas, RLS predicates, compliance triggers, tenant-context internals.
- Implementation file paths inside `atom9-server/`.

Talk about the platform through its **public shape**:

- Endpoints: `/auth/*`, `/api/*`, `/media/*`, `/account/*`
- Concepts: "tenant", "app", "session", "auth method", "magic link", "passkey"
- SDKs: `@atom9/sdk`, `@atom9/react`, `@atom9/vue`

## Layout

| Folder | Contract | Audience |
|--------|----------|----------|
| `packages/sdk/` | Plain JS ES modules | Framework-agnostic consumers |
| `packages/react/` | React hooks + components (wraps sdk) | React apps |
| `packages/vue/` | Vue composables + plugin (wraps sdk, mirrors react API) | Vue apps |
| `examples/` | Runnable demos | Anyone learning |
| `guides/` | Per-feature how-to | Developers with a task |
| `cookbook/` | Endpoint-by-endpoint reference | Developers with an API question |
| `plans/` | Public roadmap | Developers wanting to know what's next |

Each code folder (`packages/*/`, `examples/`) keeps its own `CLAUDE.md` with folder-specific rules — read those too.

## Cross-surface consistency

If you change one, consider all:

- SDK method signature changed → `react/` hook + `vue/` composable need matching updates → `examples/` need to show the new usage → `guides/` and `cookbook/` reference the new API.
- New endpoint on the server → SDK method added, then react/vue wrappers, then example, then guide.
- Deprecated auth flow → update ALL guides that reference it; don't leave stale prose.

The value of this monorepo is **atomic changes across the public surface**. Use it.

## Style

- Code examples that actually run.
- Short sentences, explicit prerequisites.
- Every "what next" is a link to the next step.
- Markdown only for now. If a docs site generator is adopted later (docusaurus / nextra / mintlify), content stays the same.
