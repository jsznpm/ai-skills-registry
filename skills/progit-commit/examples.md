# Examples

## Feature with impact
```
feat(auth): add refresh token rotation support

Description:
- Issue a new refresh token on every access-token renewal and invalidate the prior one
- Detect reuse of a consumed refresh token and revoke the whole token family
- Persist token lineage so a stolen token cannot outlive a legitimate session

Impact:
- Reduces blast radius of a leaked refresh token to a single rotation window
- Logs out an attacker and the victim on detected reuse, forcing re-auth

Affected Components:
- src/auth/refresh.ts
- src/auth/token-store.ts
- test/auth/refresh.test.ts
```

## Bug fix, no extra sections
```
fix(payment): handle empty gateway responses

Description:
- Treat a blank gateway body as a transient failure instead of a hard decline
- Retry once with backoff before surfacing an error to the checkout flow

Affected Components:
- src/payment/gateway-client.ts
```

## Breaking change
```
refactor(api): replace positional list params with a query object

Description:
- Collapse limit/offset/sort arguments into a single options object
- Validate the object at the boundary and reject unknown keys

Breaking Changes:
- listUsers(limit, offset) is removed; callers must pass listUsers({ limit, offset })

Affected Components:
- src/api/users.ts
- test/api/users.test.ts
```
