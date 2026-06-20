# Touch Psychology

> How fingers actually interact with screens — and how to design for them.

---

## Fitts' Law for touch

Time to acquire a target grows as distance increases and target size shrinks:

```
T ≈ a + b · log2(D / W + 1)
   D = distance to target,  W = target size
```

Practical reading:
- **Bigger targets are faster and less error-prone.** Diminishing returns past
  a comfortable finger size, but never go below the finger contact area.
- **Closer targets are faster.** Put frequent actions near the resting thumb.
- **Screen edges/corners are "infinite" size** — you can't overshoot them. Great
  for back-swipe, pull-down, edge menus.

### Sizing starting points (reason from the finger, not the rule)

| Platform | Comfortable minimum | Notes |
|----------|--------------------|-------|
| iOS | 44 × 44 pt | Apple HIG baseline |
| Android | 48 × 48 dp | Material baseline |
| Both | +space for at-risk users | Older, motor-impaired, in-motion → larger |

Keep **≥ 8 dp** gap between adjacent targets to avoid mis-taps.

---

## The thumb zone (one-handed reality)

Most phone use is one-handed, thumb-driven. Reachability for a right hand on a
large phone:

```
┌─────────────────────────────┐
│  HARD (stretch / two hands)  │ ← back, menu, rare destructive actions
├─────────────────────────────┤
│  OK (slight stretch)         │ ← secondary actions, content
├─────────────────────────────┤
│  EASY (natural thumb arc)    │ ← primary CTA, tab bar, main interactions
└─────────────────────────────┘
```

- **Primary CTA** → easy zone (bottom).
- **Destructive action** (delete) → away from easy zone, or behind a swipe +
  confirm, so it isn't fat-fingered.
- **Top corners** are worst for one hand → only for low-frequency controls.

---

## Gestures

| Gesture | Good for | Risks |
|---------|----------|-------|
| Tap | Primary action | None — always provide |
| Long-press | Secondary menu, reorder | Undiscoverable alone — pair with a visible affordance |
| Swipe | Dismiss, reveal actions, paginate | Conflicts with scroll/back; needs hint |
| Pinch / pan | Maps, images, zoom | Fine-motor; never the only way |
| Pull-to-refresh | Lists/feeds | Expected — implement natively |

**Rule:** every gesture-only action MUST have a visible alternative (button,
menu). Gestures are accelerators, never the sole path — motor-impaired users and
discoverability both demand it.

---

## Haptics

Feedback confirms an action happened without the user looking.

- **Light/selection** — toggles, picker ticks, segmented controls.
- **Medium** — successful submit, item added.
- **Heavy/notification** — errors, important alerts (use sparingly).

Don't buzz on every tap — haptic fatigue makes it meaningless and drains battery.
Respect the OS "reduce motion / system haptics off" setting.

---

## Feedback timing

| Delay | User perception | What to do |
|-------|-----------------|------------|
| < 100 ms | Instant | Nothing needed |
| 100 ms–1 s | Slight lag | Immediate visual state change (pressed, spinner) |
| 1 s–10 s | Waiting | Show progress / skeleton; keep UI responsive |
| > 10 s | "Is it broken?" | Progress %, allow cancel, explain |

Optimistic UI (update immediately, reconcile on server response) makes slow
networks feel instant — pair with rollback on failure.
