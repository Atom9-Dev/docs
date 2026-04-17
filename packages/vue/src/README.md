# useAtom9Auth (Vue)

```js
const auth = useAtom9Auth({ tenantId, appSlug, callbackUrl });
await auth.value.quickstart();
await auth.value.testLogin('magic_link', 'user@example.com');
```
