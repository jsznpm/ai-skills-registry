# mobile-design

Mobile-first design thinking and decision-making for iOS and Android apps. Touch
interaction, performance patterns, platform conventions. Teaches principles, not
fixed values. Use when building React Native, Flutter, or native mobile apps.

Install:
```bash
skillpool add mobile-design
```

## What's inside

- `SKILL.md` — the agent system prompt (anti-patterns, checkpoint, decision trees).
- Reference files (read on demand):
  - `mobile-design-thinking.md` — anti-memorization, context-first thinking.
  - `touch-psychology.md` — Fitts' Law, thumb zone, gestures, haptics.
  - `mobile-performance.md` — RN/Flutter 60fps, memory, battery.
  - `mobile-backend.md` — push, offline sync, mobile API design.
  - `mobile-testing.md` — testing pyramid, E2E, platform specifics.
  - `mobile-debugging.md` — native vs JS debugging, Flipper, Logcat.
  - `mobile-navigation.md` — tab/stack/drawer, deep linking.
  - `mobile-typography.md` — system fonts, Dynamic Type, accessibility.
  - `mobile-color-system.md` — OLED, dark mode, battery-aware color.
  - `decision-trees.md` — framework/state/storage selection.
  - `platform-ios.md` — Human Interface Guidelines, SF Pro, SwiftUI.
  - `platform-android.md` — Material Design 3, Roboto, Compose.
- `scripts/mobile_audit.py` — static mobile UX/touch/perf audit. Run, don't read:
  ```bash
  python scripts/mobile_audit.py <project_path>
  ```
