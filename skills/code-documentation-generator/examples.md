# Examples

## Document a file
```
/code-documentation-generator src/auth/PasswordHasher.ts
```
Reads the file, documents the public surface, and writes `README.md`,
`API_DOCS.md`, and `IMPLEMENTATION_NOTES.md`.

## Document a pasted snippet
```
/code-documentation-generator
```
Then paste the code. The skill documents exactly what was pasted, inferring types
from usage when the language is untyped.

## Sample API_DOCS.md method entry
```markdown
### hash(password)

Signature: `hash(password: string): Promise<string>`

Parameters

| name     | type   | description                        |
| -------- | ------ | ---------------------------------- |
| password | string | Plaintext password to hash. Required. |

Returns: `Promise<string>` — the hex-encoded SHA-256 digest.

Throws
- `TypeError` — when `password` is not a string.

Usage
\`\`\`ts
const digest = await hasher.hash("hunter2");
\`\`\`
```

## Sample IMPLEMENTATION_NOTES.md security finding
```markdown
## Security notes
- ⚠️ Passwords hashed with unsalted SHA-256 — vulnerable to rainbow-table attacks.
  Switch to bcrypt/scrypt/argon2 with a per-user salt and work factor.
- ⚠️ No input length cap — large inputs can stall the event loop.
```
