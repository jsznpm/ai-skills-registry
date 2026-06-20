# Decision Trees

> Use these to REASON, not to auto-pick. Each leaf is a default for a context —
> confirm the context holds before committing.

---

## Framework

```
WHAT ARE YOU BUILDING?
│
├── Web team + OTA updates + fast iteration
│   └── React Native + Expo
│
├── Pixel-perfect custom UI, perf-critical, highly branded
│   └── Flutter
│
├── Single platform, deep native features
│   ├── iOS only  → SwiftUI (+ UIKit where needed)
│   └── Android only → Kotlin + Jetpack Compose
│
├── Existing RN codebase
│   └── React Native (bare if native modules needed)
│
└── Existing Flutter / enterprise Flutter
    └── Flutter
```

Tie-breakers: team's existing skills > theoretical "best". Native modules needed
often + RN → bare workflow, not Expo Go.

---

## State management

```
HOW MUCH SHARED, CROSS-SCREEN, MUTABLE STATE?
│
├── Almost none (local component state suffices)
│   └── useState / setState — add nothing
│
├── A bit of shared app state (auth, theme, cart)
│   ├── RN      → Zustand (simple) or Context (tiny)
│   └── Flutter → Provider / Riverpod (light)
│
├── Lots of complex shared state, time-travel/debug needs
│   ├── RN      → Redux Toolkit
│   └── Flutter → Riverpod / BLoC
│
└── Mostly SERVER state (fetch/cache/sync)
    └── TanStack Query (RN) / dio+repository or Riverpod async (Flutter)
        — don't put server cache in a global client store
```

Key insight: **server state ≠ client state.** A query/cache library often removes
most of your "global state" need.

---

## Local storage

```
WHAT ARE YOU STORING?
│
├── Secrets / tokens
│   └── SecureStore / Keychain / EncryptedSharedPreferences   (never plain)
│
├── Small key-value (flags, prefs, simple cache)
│   └── MMKV (fast) / AsyncStorage / SharedPreferences
│
├── Structured/relational, queries, offline data set
│   └── SQLite (expo-sqlite, drift) / WatermelonDB / Realm
│
└── Large blobs (images, files)
    └── Filesystem + cache lib; store paths in DB, not blobs in DB
```

---

## Navigation pattern

```
HOW MANY TOP-LEVEL DESTINATIONS, HOW OFTEN SWITCHED?
│
├── 2–5, frequent, equal importance  → Bottom tabs (+ stack per tab)
├── Drill-down flow                   → Stack
├── Many secondary / settings         → Drawer (overflow only)
├── Self-contained task               → Modal / bottom sheet
└── Views of the same content         → Segmented control / top tabs
```
See [mobile-navigation.md](mobile-navigation.md).

---

## List rendering

```
HOW MANY ITEMS?
│
├── Tiny, fixed, known count  → map() in a View is fine
├── Long / unbounded / dynamic
│   ├── RN      → FlatList, or FlashList for large/varied rows
│   └── Flutter → ListView.builder / SliverList
└── Grid → FlatList numColumns / GridView.builder
```
Always: stable keys, memoized rows, layout hints. See
[mobile-performance.md](mobile-performance.md).

---

## Offline requirement

```
DOES IT WORK WITHOUT NETWORK?
│
├── No (online-only)        → cache for speed, show clear offline states
└── Yes (offline-first)     → local DB as source of truth + sync queue
                              See mobile-backend.md
```
