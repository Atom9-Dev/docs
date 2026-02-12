# Security Model (Current Implementation)

## Trust chain
- BFF signs identity context
- Gateway verifies signature + timestamp
- Highway verifies again (defense in depth)
- Internal APIs trust normalized headers from Highway

## Identity context
Includes: tenant, role, user id, session id, security level, amr, acr.

## Tenant isolation
- Tenant-scoped queries
- RLS policies enabled and forced on key tables

## Sensitive action protection
Policy-driven auth requirements enforce higher assurance for risky endpoints.

## Abuse controls
Basic throttling active on auth-critical endpoints (non-aggressive defaults).
