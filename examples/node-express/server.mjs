import express from 'express';

const app = express();
app.use(express.json());

const TENANT_ID = process.env.ATOM9_TENANT_ID || '11111111-1111-1111-1111-111111111111';
const APP_SLUG = process.env.ATOM9_APP_SLUG || 'demo-app';
const CALLBACK_URL = process.env.ATOM9_CALLBACK_URL || 'https://example.com/auth/callback';
const ACTOR_USER_ID = process.env.ATOM9_ACTOR_USER_ID || 'server-example-user';

async function post(path, body) {
  const r = await fetch(`https://id.atom9.com/id-bff/id${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-tenant-id': TENANT_ID,
      'x-client-role': 'admin',
      'x-actor-user-id': ACTOR_USER_ID,
    },
    body: JSON.stringify(body || {}),
  });
  return { status: r.status, data: await r.json() };
}

app.get('/', async (_req, res) => {
  const quickstart = await post('/onboarding/quickstart', { appSlug: APP_SLUG, callbackUrl: CALLBACK_URL });
  res.json({ ok: true, quickstart });
});

app.post('/test/:method', async (req, res) => {
  const out = await post('/onboarding/test-login', {
    appSlug: APP_SLUG,
    callbackUrl: CALLBACK_URL,
    method: req.params.method,
    email: req.body?.email || 'server@example.com',
  });
  res.status(out.status).json(out.data);
});

app.listen(5050, () => console.log('Example running on http://localhost:5050'));
