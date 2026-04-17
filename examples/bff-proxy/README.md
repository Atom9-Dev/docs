# Atom9 BFF-proxy example

The minimal pattern for adding Atom9 auth to your own website.

## What it does

1. Serves your static HTML/JS from `public/` on port 3000
2. Proxies `/auth/*`, `/api/*`, `/media/*` to `a9sites-bff` (port 7402)
3. Cookies flow automatically because everything is same-origin

## Run it

```bash
# Ensure Atom9 stack is running first
# (cd atom9-server/infra/docker && ./dev-start.ps1)

# Point at your CMS site slug (dev only)
export A9_SITE_SLUG=my-site
export A9SITES_BFF_URL=http://localhost:7402

node server.mjs
# → open http://localhost:3000
```

## The important bits

- `server.mjs`: ~70 lines, all you need for the proxy
- `public/atom9-bff.js`: the SDK (copy from `@atom9/bff`)
- `public/index.html`: your app, uses `createAtom9Client()` from the SDK

## Production

In production you point your DNS at the Atom9 gateway directly — `a9sites-bff`
serves your CMS pages, so this example's server isn't needed. Use this pattern
only when you need to run a framework (Next.js / Vite / Nuxt / SvelteKit) that
has its own dev server and needs to proxy auth calls to the BFF.
