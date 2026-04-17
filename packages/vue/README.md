# @atom9/vue

Vue composables for Atom9's `a9sites-bff` customer-facing auth.

## Install

```bash
npm install @atom9/vue @atom9/bff
```

## Setup

As a plugin (global):

```js
// main.js
import { createApp } from 'vue';
import { createAtom9 } from '@atom9/vue';
import App from './App.vue';

createApp(App)
  .use(createAtom9())
  .mount('#app');
```

Or scoped to a component subtree:

```vue
<script setup>
import { provideAtom9 } from '@atom9/vue';
provideAtom9();
</script>
```

## Usage

```vue
<script setup>
import { useAtom9 } from '@atom9/vue';
const { user, authenticated, auth } = useAtom9();
</script>

<template>
  <div v-if="authenticated">
    <p>Hello {{ user.email }}</p>
    <button @click="auth.logout()">Log out</button>
  </div>
  <form v-else @submit.prevent="submit">
    <input v-model="email" type="email">
    <input v-model="password" type="password">
    <button>Log in</button>
  </form>
</template>
```

## API

```js
const a9 = useAtom9();

// Reactive state
a9.authenticated
a9.user
a9.session
a9.loading
a9.error

// Auth
await a9.auth.magicLink({ email, returnTo: '/dashboard' });
await a9.auth.login({ email, password });
await a9.auth.register({ email, password });
await a9.auth.mfa({ challengeId, code });
a9.auth.startGoogle();
a9.auth.startMicrosoft();
await a9.auth.passkey.login();
await a9.auth.passkey.register({ name: 'My device' });
await a9.auth.logout();

// Sessions + privacy
await a9.sessions.list();
await a9.privacy.data();
await a9.privacy.requestDeletion({ confirm: 'DELETE' });
```

See the [@atom9/react README](../react/README.md) for the full method list
(the Vue surface is identical).
