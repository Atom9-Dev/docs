import { computed } from 'vue';

export function useAtom9Auth({ issuer='https://id.atom9.com', tenantId, appSlug, callbackUrl, actorUserId='vue-user', clientRole='admin' }) {
  return computed(() => {
    async function post(path, body) {
      const r = await fetch(`${issuer}/id-bff/id${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': tenantId,
          'x-client-role': clientRole,
          'x-actor-user-id': actorUserId,
        },
        body: JSON.stringify(body || {}),
      });
      const text = await r.text();
      try { return { ok: r.ok, status: r.status, data: JSON.parse(text) }; }
      catch { return { ok: r.ok, status: r.status, data: { raw: text } }; }
    }

    return {
      quickstart: () => post('/onboarding/quickstart', { appSlug, callbackUrl }),
      testLogin: (method, email) => post('/onboarding/test-login', { appSlug, callbackUrl, method, email }),
      startMagicLink: (email) => post('/magic-link/start', { appSlug, email }),
    };
  });
}
