# Magic Link

## Endpoints
- `POST /id-bff/id/magic-link/start`
- `GET /id-bff/id/magic-link/consume?tenant=...&token=...`
- `POST /id-bff/id/magic-link/verify` (legacy/dev path)

## Notes
- one-time token
- expiry enforced
- appSlug required
- method must be enabled in app config
