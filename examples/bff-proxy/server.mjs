/**
 * BFF-proxy example — the minimal customer-site integration.
 *
 * Your static frontend (HTML/JS) lives here. This server:
 *   1. Serves static files from ./public
 *   2. Proxies /auth/*, /api/*, /media/* to a9sites-bff
 *
 * Same-origin proxying is what makes HttpOnly session cookies flow
 * automatically — the browser sets them on this origin, and every API
 * call from the frontend carries them back.
 *
 * In production you typically skip this server entirely: point DNS at
 * the Atom9 gateway and let a9sites-bff serve your CMS pages directly.
 * This example exists for frameworks (Next.js, Vite, Nuxt, SvelteKit)
 * that need a local static server with a proxy layer during dev.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const BFF_URL = process.env.A9SITES_BFF_URL || 'http://localhost:7402';
const SITE_SLUG = process.env.A9_SITE_SLUG || ''; // dev fallback

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css',
  '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
const PROXY_PREFIXES = ['/auth/', '/api/', '/media/'];

async function proxyToBff(req, res, url) {
  const params = new URLSearchParams(url.search);
  if (SITE_SLUG && !params.has('slug')) params.set('slug', SITE_SLUG);
  const target = `${BFF_URL}${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;

  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  const fwdHeaders = { ...req.headers };
  delete fwdHeaders.host;
  delete fwdHeaders['content-length'];
  delete fwdHeaders.connection;

  const upstream = await fetch(target, {
    method: req.method,
    headers: fwdHeaders,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
    redirect: 'manual',
  });

  const respHeaders = {};
  upstream.headers.forEach((v, k) => {
    if (k.toLowerCase() !== 'set-cookie') respHeaders[k] = v;
  });
  const setCookie = upstream.headers.getSetCookie?.();
  if (setCookie?.length) respHeaders['set-cookie'] = setCookie;

  res.writeHead(upstream.status, respHeaders);
  res.end(Buffer.from(await upstream.arrayBuffer()));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (PROXY_PREFIXES.some(p => url.pathname.startsWith(p))) {
    return proxyToBff(req, res, url);
  }

  const filePath = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403); return res.end('forbidden');
  }
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n  bff-proxy example running\n  URL  http://localhost:${PORT}\n  BFF  ${BFF_URL}\n`);
});
