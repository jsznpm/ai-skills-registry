# Mobile Testing

> Mobile fails in ways desktop doesn't: rotation, backgrounding, permission
> denial, dead network, OS-version drift, tiny + huge screens. Test for those.

---

## The testing pyramid (mobile)

```
        /\        E2E (few)        — Detox / Maestro / XCUITest / Espresso
       /  \       slow, flaky, high value on critical flows
      /----\      Integration (some) — component + navigation + API mocks
     /      \     React Native Testing Library / Flutter widget tests
    /--------\    Unit (many)       — pure logic, reducers, utils, services
   /__________\   fast, deterministic, run on every commit
```

Bias toward many fast unit tests, a moderate band of integration/widget tests,
and a small set of E2E tests on the flows that lose money if broken (auth,
checkout, core action).

---

## Unit tests

- Pure business logic, reducers/stores, formatters, validators, sync/queue logic.
- No UI, no network — mock the boundaries.
- **RN:** Jest. **Flutter:** `flutter test`.

---

## Component / widget tests

- **RN:** React Native Testing Library — query by accessible role/label, assert
  user-visible behavior, fire press/scroll. Avoid testing implementation details.
- **Flutter:** widget tests (`testWidgets`, `WidgetTester`) — pump widgets, tap,
  expect finders.
- Mock navigation and API; test loading / error / empty / success states of each
  screen explicitly.

---

## End-to-end

| Tool | Platforms | Notes |
|------|-----------|-------|
| Maestro | iOS + Android, RN + Flutter + native | Simple YAML flows, low flake — good default |
| Detox | RN | Gray-box, fast, synchronized with app |
| XCUITest | iOS native | Apple's framework |
| Espresso | Android native | Google's framework |

Keep E2E to critical paths. Run on real devices or device farms (Firebase Test
Lab, BrowserStack, AWS Device Farm) for OS/hardware coverage.

---

## Mobile-specific scenarios to ALWAYS test

- [ ] **No network / flaky network** — does it degrade, retry, show offline UI?
- [ ] **Permission denied** (camera, location, notifications) — graceful path?
- [ ] **Backgrounded mid-task** then resumed — state restored, no crash?
- [ ] **Rotation** (if supported) — layout survives, no lost state.
- [ ] **Small + large screens**, notches/safe areas, tablets if supported.
- [ ] **Dynamic Type / large font** — text doesn't clip or overlap.
- [ ] **Dark + light mode.**
- [ ] **Slow device** — perf acceptable on low-end hardware.
- [ ] **Interrupt** (call, alarm) during a flow.
- [ ] **Deep link / notification tap** lands on the right screen, even cold-start.

---

## Accessibility testing

- Screen reader pass: VoiceOver (iOS), TalkBack (Android) — every interactive
  element has a label and is reachable in logical order.
- Contrast and touch-target audits (see `scripts/mobile_audit.py`).
- Test with system "reduce motion" and largest font size.

---

## CI

- Run unit + component tests on every PR (fast).
- Run E2E on merge / nightly on a device matrix.
- Gate releases on a green critical-path E2E run.
