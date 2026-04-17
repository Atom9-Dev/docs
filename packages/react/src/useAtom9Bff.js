/**
 * @atom9/react — React hooks for a9sites-bff integrated sites.
 *
 * The BFF model: your React app runs on the same origin as a9sites-bff (or
 * proxies /auth/* /api/* /media/* to it). Cookies are HttpOnly and managed
 * server-side; React only interacts through fetch.
 *
 * Usage:
 *   import { Atom9Provider, useAtom9, useSession, ProtectedRoute } from '@atom9/react';
 *
 *   // Wrap your app:
 *   <Atom9Provider>
 *     <App />
 *   </Atom9Provider>
 *
 *   // In any component:
 *   const { user, authenticated, auth } = useAtom9();
 *   if (!authenticated) return <LoginForm onSubmit={(creds) => auth.login(creds)} />;
 *   return <p>Hello {user.email}</p>;
 *
 *   // Protect a route:
 *   <ProtectedRoute fallback="/login"><Dashboard /></ProtectedRoute>
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createAtom9Client } from '@atom9/bff';

const Atom9Context = createContext(null);

/**
 * Provider that creates a single shared Atom9 client and tracks session state.
 *
 * Props:
 *   baseUrl?      — defaults to same-origin (recommended)
 *   refreshMs?    — auto-refresh interval for session (default 5 min)
 */
export function Atom9Provider({ children, baseUrl, refreshMs = 5 * 60 * 1000 }) {
  const [state, setState] = useState({
    loading: true,
    authenticated: false,
    user: null,
    session: null,
    error: null,
  });

  const client = useMemo(
    () => createAtom9Client({ baseUrl, onUnauthorized: () => setState(s => ({ ...s, authenticated: false, user: null, session: null })) }),
    [baseUrl]
  );

  const refresh = useCallback(async () => {
    const me = await client.me();
    if (me?.authenticated) {
      setState({ loading: false, authenticated: true, user: me.user, session: me.session, error: null });
    } else {
      setState({ loading: false, authenticated: false, user: null, session: null, error: me?.reason || null });
    }
  }, [client]);

  // Initial fetch + periodic refresh
  useEffect(() => {
    refresh();
    if (!refreshMs) return;
    const t = setInterval(refresh, refreshMs);
    return () => clearInterval(t);
  }, [refresh, refreshMs]);

  const value = useMemo(() => ({
    ...state,
    client,
    refresh,
    // Wrapped auth methods that refresh state on success
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
  }), [state, client, refresh]);

  return <Atom9Context.Provider value={value}>{children}</Atom9Context.Provider>;
}

/** Primary hook — returns auth state + all SDK methods. */
export function useAtom9() {
  const ctx = useContext(Atom9Context);
  if (!ctx) throw new Error('useAtom9 must be used inside <Atom9Provider>');
  return ctx;
}

/** Just the session (shortcut). */
export function useSession() {
  const { authenticated, user, session, loading } = useAtom9();
  return { authenticated, user, session, loading };
}

/**
 * Gate a subtree behind authentication. Redirects (via window.location) to
 * `fallback` when the user isn't authenticated. While loading, renders
 * `renderLoading()` (defaults to null).
 */
export function ProtectedRoute({ children, fallback = '/auth/login', renderLoading }) {
  const { authenticated, loading } = useAtom9();
  useEffect(() => {
    if (!loading && !authenticated) {
      const rt = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${fallback}?return_to=${rt}`;
    }
  }, [authenticated, loading, fallback]);
  if (loading) return renderLoading ? renderLoading() : null;
  if (!authenticated) return null;
  return children;
}

/**
 * Gate that requires a specific role claim. Assumes your JWT includes `role`.
 */
export function RoleGate({ children, role, fallback = null }) {
  const { user, authenticated } = useAtom9();
  if (!authenticated) return fallback;
  if (user?.role !== role) return fallback;
  return children;
}
