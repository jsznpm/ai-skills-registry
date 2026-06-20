# Mobile Backend

> Mobile clients are unreliable, intermittent, and untrusted. Design the backend
> and sync layer for that reality.

---

## Mobile API design

- **Coarse, screen-shaped endpoints.** A "home feed" endpoint that returns
  everything one screen needs beats 6 chatty calls over a high-latency mobile link.
  Consider GraphQL or BFF (backend-for-frontend) to shape payloads per client.
- **Pagination always** — cursor-based, not offset (stable under inserts).
- **Compress** (gzip/brotli) and trim payloads; bandwidth is metered and slow.
- **Versioning** — clients update slowly; never break old app versions. Additive
  changes only; deprecate with a sunset window.
- **Idempotency keys** on writes — flaky networks cause retries; the server must
  dedupe (e.g. payment, "create order").

---

## Offline-first

Assume no network. Online is the exception that syncs.

```
Write path:   UI → local DB (instant) → queue → sync when online
Read path:    UI ← local DB (cache)   ← refresh in background
```

- **Local store:** SQLite (expo-sqlite, drift), WatermelonDB, Realm, or MMKV for
  small KV. Choose by data shape and query needs.
- **Outbox / mutation queue:** persist pending writes; replay on reconnect; retry
  with backoff; surface conflicts.
- **Conflict resolution:** decide a strategy up front — last-write-wins (simple),
  server-authoritative, or CRDT/merge for collaborative data.
- **Sync triggers:** on app foreground, on connectivity regained, on push, and
  periodic background sync.

---

## Auth & sessions

- Store tokens in **secure storage only** (Keychain / EncryptedSharedPreferences
  via `expo-secure-store` / Keychain), never AsyncStorage or plain prefs.
- Short-lived **access token** + long-lived **refresh token**; refresh silently.
- Handle the "token expired mid-request" case: queue, refresh, retry once.
- Support remote logout / token revocation (rooted/stolen device).
- Biometric gate (Face ID / fingerprint) for sensitive apps.

---

## Push notifications

- **iOS:** APNs (via token). Request permission at a meaningful moment, not on
  first launch. Respect the user's choice.
- **Android:** FCM. Channels (Android 8+) let users tune categories — create
  sensible ones.
- **Cross-platform:** FCM can fan out to both; or Expo Push for Expo apps.
- **Deep link payloads:** every notification should carry a route so tapping lands
  on the right screen (see [mobile-navigation.md](mobile-navigation.md)).
- **Silent/data pushes** to trigger background sync — rate-limited by the OS, not
  guaranteed; never rely on them for correctness.
- Token lifecycle: register on login, refresh on rotation, unregister on logout.

---

## Networking robustness

- **Timeouts** on every request; **retry with exponential backoff + jitter** for
  transient failures (5xx, network), NOT for 4xx.
- **Detect connectivity** (NetInfo / connectivity_plus) and adapt UX — show
  "offline" banners, pause uploads.
- **Cancel in-flight requests** on navigation away (AbortController).
- **Rate-limit / debounce** search-as-you-type and autosave.

---

## Security checklist

- [ ] Tokens in secure storage, never logs.
- [ ] TLS everywhere; SSL pinning for high-value apps.
- [ ] No secrets/API keys baked into the binary (extractable from APK/IPA).
- [ ] Server-side authorization on every endpoint — the client is untrusted.
- [ ] Validate & rate-limit on the server; the app can be bypassed entirely.
- [ ] PII minimization; encrypt sensitive local data at rest.
