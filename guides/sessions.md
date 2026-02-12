# Sessions Lifecycle

## Endpoints
- `GET /id-bff/id/sessions`
- `POST /id-bff/id/session/refresh`
- `POST /id-bff/id/session/revoke`

## Behavior
- refresh rotates session and revokes old one
- revoke invalidates session immediately
