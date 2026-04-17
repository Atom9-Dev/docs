/**
 * Atom9Auth — browser-side auth SDK
 *
 * Usage:
 *   <script src="https://cdn.atom9.com/sdk/atom9-auth.js"></script>
 *   <script>
 *     const auth = Atom9Auth.init({ tenantId: 'T', appId: 'my-app' });
 *     auth.onAuth(user => console.log('Hello', user.email));
 *     auth.login();
 *   </script>
 */
(function (root) {
  'use strict';

  var STORAGE_KEY = 'atom9_token';
  var HASH_KEY = 'atom9_token';

  function base64UrlDecode(str) {
    var s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return JSON.parse(atob(s));
  }

  function decodeJwt(token) {
    try {
      var parts = token.split('.');
      if (parts.length !== 3) return null;
      return base64UrlDecode(parts[1]);
    } catch (_) {
      return null;
    }
  }

  function isExpired(payload) {
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 < Date.now();
  }

  function Atom9Auth() {}

  /**
   * Atom9Auth.init({ tenantId, appId, issuer })
   *
   * Returns an auth instance with login/register/logout/getUser/onAuth.
   */
  Atom9Auth.init = function (opts) {
    opts = opts || {};
    var tenantId = opts.tenantId;
    var appId = opts.appId || '';
    var issuer = (opts.issuer || 'https://auth.atom9.com').replace(/\/$/, '');
    var callbacks = [];

    if (!tenantId) {
      console.warn('[Atom9Auth] tenantId is required');
    }

    var instance = {
      /** Navigate to the Atom9 login page */
      login: function (options) {
        options = options || {};
        var redirect = options.redirectUrl || window.location.href;
        var url = issuer + '/connect?tenant=' + encodeURIComponent(tenantId) +
          '&app=' + encodeURIComponent(appId) +
          '&mode=login' +
          '&redirect=' + encodeURIComponent(redirect);
        window.location.href = url;
      },

      /** Navigate to the Atom9 register page */
      register: function (options) {
        options = options || {};
        var redirect = options.redirectUrl || window.location.href;
        var url = issuer + '/connect?tenant=' + encodeURIComponent(tenantId) +
          '&app=' + encodeURIComponent(appId) +
          '&mode=register' +
          '&redirect=' + encodeURIComponent(redirect);
        window.location.href = url;
      },

      /** Register a callback for successful auth. Fires immediately if already authenticated. */
      onAuth: function (cb) {
        if (typeof cb !== 'function') return;
        callbacks.push(cb);
        var user = instance.getUser();
        if (user) {
          try { cb(user); } catch (_) {}
        }
      },

      /** Decode and return the JWT payload, or null if not authenticated */
      getUser: function () {
        var token = instance.getToken();
        if (!token) return null;
        var payload = decodeJwt(token);
        if (!payload || isExpired(payload)) {
          instance.logout();
          return null;
        }
        return {
          id: payload.sub,
          email: payload.email || '',
          isNew: !!payload.is_new,
          tenant: payload.tenant || '',
          sessionId: payload.session_id || '',
          amr: payload.amr || [],
          iat: payload.iat,
          exp: payload.exp,
        };
      },

      /** Get the raw JWT string, or null */
      getToken: function () {
        try {
          return localStorage.getItem(STORAGE_KEY) || null;
        } catch (_) {
          return null;
        }
      },

      /** Check if the user has a valid, non-expired token */
      isAuthenticated: function () {
        return instance.getUser() !== null;
      },

      /** Clear stored token and auth state */
      logout: function () {
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      },
    };

    // On load: check for token in hash fragment
    function checkHash() {
      var hash = window.location.hash;
      if (!hash) return;
      var match = hash.match(new RegExp('[#&]' + HASH_KEY + '=([^&]+)'));
      if (!match) return;
      var token = decodeURIComponent(match[1]);
      if (!token) return;

      // Store the token
      try { localStorage.setItem(STORAGE_KEY, token); } catch (_) {}

      // Clean the hash
      var cleaned = hash.replace(new RegExp('[#&]' + HASH_KEY + '=[^&]*'), '');
      if (cleaned === '#' || cleaned === '') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } else {
        history.replaceState(null, '', window.location.pathname + window.location.search + cleaned);
      }

      // Fire callbacks
      var user = instance.getUser();
      if (user) {
        for (var i = 0; i < callbacks.length; i++) {
          try { callbacks[i](user); } catch (_) {}
        }
      }
    }

    // Run immediately (script may load after DOMContentLoaded)
    checkHash();

    return instance;
  };

  // Expose globally
  root.Atom9Auth = Atom9Auth;

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
