# useAtom9Auth example

```jsx
const auth = useAtom9Auth({ tenantId, appSlug, callbackUrl });
await auth.quickstart();
await auth.testLogin('google_oidc', 'user@example.com');
```
