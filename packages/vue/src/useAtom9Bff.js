/**
 * @atom9/vue — Vue composables for a9sites-bff integrated sites.
 *
 * Usage:
 *   import { createAtom9, useAtom9, useSession } from '@atom9/vue';
 *
 *   // In main.js:
 *   app.use(createAtom9());
 *
 *   // In components:
 *   const { user, authenticated, auth } = useAtom9();
 */

import { ref, reactive, readonly, inject, provide, onUnmounted } from 'vue';
import { createAtom9Client } from '@atom9/bff';

const ATOM9_KEY = Symbol('atom9');

/**
 * Vue plugin factory. Pass the result to `app.use()`.
 */
export function createAtom9({ baseUrl, refreshMs = 5 * 60 * 1000 } = {}) {
  return {
    install(app) {
      const ctx = _makeContext({ baseUrl, refreshMs });
      app.provide(ATOM9_KEY, ctx);
    },
  };
}

/**
 * Alternative: provide Atom9 context in a specific component subtree only.
 * Call inside a component's setup.
 */
export function provideAtom9({ baseUrl, refreshMs = 5 * 60 * 1000 } = {}) {
  const ctx = _makeContext({ baseUrl, refreshMs });
  provide(ATOM9_KEY, ctx);
  return ctx;
}

/** Primary composable: reactive auth state + all SDK methods. */
export function useAtom9() {
  const ctx = inject(ATOM9_KEY);
  if (!ctx) throw new Error('useAtom9: call provideAtom9() or install createAtom9() first');
  return ctx;
}

/** Just the session (shortcut). */
export function useSession() {
  const { authenticated, user, session, loading } = useAtom9();
  return { authenticated, user, session, loading };
}

// ── Internals ────────────────────────────────────────────────────────────

function _makeContext({ baseUrl, refreshMs }) {
  const state = reactive({
    loading: true,
    authenticated: false,
    user: null,
    session: null,
    error: null,
  });

  const client = createAtom9Client({
    baseUrl,
    onUnauthorized: () => {
      state.authenticated = false;
      state.user = null;
      state.session = null;
    },
  });

  async function refresh() {
    const me = await client.me();
    if (me?.authenticated) {
      state.loading = false;
      state.authenticated = true;
      state.user = me.user;
      state.session = me.session;
      state.error = null;
    } else {
      state.loading = false;
      state.authenticated = false;
      state.user = null;
      state.session = null;
      state.error = me?.reason || null;
    }
  }

  refresh();
  let timer = null;
  if (refreshMs) {
    timer = setInterval(refresh, refreshMs);
    // Try to clear on scope disposal (best-effort)
    try { onUnmounted(() => { if (timer) clearInterval(timer); }); } catch {}
  }

  return {
    // reactive state refs (auto-unwrapped in templates)
    get loading() { return state.loading; },
    get authenticated() { return state.authenticated; },
    get user() { return state.user; },
    get session() { return state.session; },
    get error() { return state.error; },
    state: readonly(state),
    client,
    refresh,
    auth: {
      magicLink: (args) => client.auth.magicLink(args),
      login: async (args) => { const r = await client.auth.login(args); if (r?.authenticated) await refresh(); return r; },
      register: async (args) => { const r = await client.auth.register(args); if (r?.authenticated) await refresh(); return r; },
      recover: (args) => client.auth.recover(args),
      resetPassword: (args) => client.auth.resetPassword(args),
      changePassword: (args) => client.auth.changePassword(args),
      mfa: async (args) => { const r = await client.auth.mfa(args); if (r?.authenticated) await refresh(); return r; },
      startGoogle: (args) => client.auth.startGoogle(args),
      startMicrosoft: (args) => client.auth.startMicrosoft(args),
      passkey: {
        login: async () => { const r = await client.auth.passkey.login(); await refresh(); return r; },
        register: (args) => client.auth.passkey.register(args),
        list: () => client.auth.passkey.list(),
        remove: (id) => client.auth.passkey.remove(id),
      },
      totp: client.auth.totp,
      logout: async () => { const r = await client.auth.logout(); await refresh(); return r; },
    },
    sessions: client.sessions,
    privacy: client.privacy,
  };
}
