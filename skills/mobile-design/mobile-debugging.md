# Mobile Debugging

> Mobile bugs hide across two worlds: the JS/Dart layer and the native layer.
> Know which side a bug lives on before you chase it.

---

## Pick the right layer

```
Symptom in your code's logic, props, state  → JS/Dart debugging
Crash with native stack trace, SIGABRT,     → Native debugging
 ANR, "app not responding", startup crash      (Xcode / Android Studio)
```

A red-screen JS error ≠ a native crash. A native crash often shows nothing in the
JS console — check device logs.

---

## React Native

- **Flipper** — network inspector, layout inspector, logs, React DevTools, plugin
  for Redux/MMKV/DB. Primary debugging hub.
- **React DevTools** — component tree, props/state, Profiler for re-renders.
- **Hermes debugger** — set breakpoints in JS.
- **Native logs:**
  - iOS: Xcode console / `Console.app`, or `xcrun simctl spawn booted log stream`.
  - Android: `adb logcat` (filter by tag / package).
- **Network:** Flipper network plugin; or proxy through Charles/Proxyman/mitmproxy
  (mind SSL pinning in debug).
- **Crashes:** Sentry / Crashlytics with source maps so JS stacks are readable.

```bash
adb logcat --pid=$(adb shell pidof -s com.yourapp)   # only your app's logs
xcrun simctl spawn booted log stream --predicate 'process == "YourApp"'
```

---

## Flutter

- **Flutter DevTools** — widget inspector, timeline (jank), memory, network,
  logging, CPU profiler.
- **`debugPrint`** (rate-limited, safer than `print`).
- **Inspector flags:** `debugPaintSizeEnabled`, `debugRepaintRainbowEnabled` to
  see layout boundaries and excessive repaints.
- **Native:** `flutter logs`, plus `adb logcat` / Xcode console for platform code.
- **Crashes:** Crashlytics / Sentry; symbolicate with the build's symbols.

---

## Logging discipline

- **Never** log tokens, passwords, PII — logs are extractable.
- **Strip `console.log` / verbose logs from release builds** — on RN they block
  the JS thread and tank performance.
- Use levels (debug/info/warn/error) and a logger that no-ops in production.

---

## Common mobile bug classes

| Symptom | Likely cause |
|---------|--------------|
| Works in dev, crashes in release | Dead-code stripping, missing env, source-map-only error, Proguard/R8 rules |
| Memory grows over time | Un-removed listeners, timers, retained closures, image cache |
| Jank on scroll | ScrollView for lists, non-memoized rows, heavy `build()` |
| White screen on launch | JS bundle/init error, native init crash — check device logs |
| Works on simulator, fails on device | Permissions, signing, hardware (camera/GPS), slower CPU |
| Deep link/notification opens wrong screen | Cold-start link handling not wired |
| State lost after backgrounding | No state persistence/restoration |

---

## Reproduce before you fix

1. Capture **device, OS version, app version, build type** (debug vs release).
2. Reproduce on a **real device**, release build, if it doesn't repro in dev.
3. Bisect: last known good build / commit.
4. Add crash reporting breadcrumbs to narrow the path.
