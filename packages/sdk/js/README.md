# JS SDK Starter

```js
import { createAtom9Auth } from './atom9-auth.js';

const atom9 = createAtom9Auth({
  tenantId: '11111111-1111-1111-1111-111111111111',
  appSlug: 'demo-app',
  callbackUrl: 'https://example.com/auth/callback'
});

const readiness = await atom9.quickstart();
console.log(readiness);
```
