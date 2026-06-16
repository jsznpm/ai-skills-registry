# Examples

## STRIDE threat model row
```
asset           | threat (STRIDE)        | likelihood | impact | mitigation                          | status
session cookie  | Tampering / Info-disc  | med        | high   | HttpOnly+Secure+SameSite, sign+encrypt | open
upload endpoint | Elevation of privilege | high       | crit   | authz per-object, MIME allowlist, AV scan | planned
```

## Finding format
```
[HIGH] IDOR on GET /api/invoices/:id
Evidence: user A retrieves user B's invoice by incrementing id; no owner check.
Impact: cross-tenant data disclosure of financial records.
Fix: enforce `where ownerId = session.userId` on the query; return 404 on mismatch.
Test: automated test asserting user A gets 404 for user B's invoice id.
OWASP: A01 Broken Access Control.
```

## Password hashing (correct)
```ts
import argon2 from "argon2";
// store the full encoded string; argon2 embeds salt + params
const hash = await argon2.hash(password, { type: argon2.argon2id });
const ok = await argon2.verify(hash, password);
```

## Authenticated encryption (correct)
```ts
import { randomBytes, createCipheriv } from "node:crypto";
const key = await getKeyFromKMS();          // never hardcoded
const iv = randomBytes(12);                  // unique per message
const c = createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([c.update(plaintext), c.final()]);
const tag = c.getAuthTag();                  // store iv + tag + ct together
```

## Anti-pattern (do NOT ship)
```ts
// ❌ ECB mode, static key in source, no integrity
const c = createCipheriv("aes-256-ecb", Buffer.from("hardcoded-key..."), null);
```
