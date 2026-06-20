# Mobile Color System

> Color on mobile must survive sunlight, save battery, work in dark mode, and stay
> accessible. Design it as a semantic system, not a pile of hex codes.

---

## Semantic tokens, not raw hex

Name colors by ROLE so they can flip per theme:

```
background / surface / surfaceVariant
onBackground / onSurface (text & icons ON those)
primary / onPrimary
secondary / onSecondary
error / onError
outline / divider
```

Components reference tokens (`color: theme.onSurface`), never literal hex. One
palette swap → entire app re-themes. This is what makes light/dark trivial.

---

## Dark mode is its own design, not an inversion

Pure color inversion destroys depth and contrast. Design dark deliberately:

- **Don't use pure black (#000) for everything** — pure black + bright text
  causes halation (smearing) and looks flat. Use a very dark gray surface
  (e.g. `#121212` Material baseline) and convey elevation with lighter overlays.
- **Desaturate** bright accent colors slightly — neon pops on dark are harsh.
- **Re-check contrast** in dark: a color that passed on white may fail on dark.
- Elevation in dark = lighter surface (Material) rather than shadows (which are
  invisible on dark).

```ts
const light = { background: "#FFFFFF", surface: "#F7F7F7", onSurface: "#1A1A1A" };
const dark  = { background: "#121212", surface: "#1E1E1E", onSurface: "#ECECEC" };
```

Respect the system theme (`useColorScheme` / `MediaQuery.platformBrightness`) and
offer an in-app override (light/dark/system).

---

## OLED & battery

On OLED screens each pixel emits its own light — **black pixels are off**.

- True-dark themes cut display power on OLED (a real battery win on dark-heavy
  screens like maps, reading, media).
- For OLED-optimized / "AMOLED" themes you can use near-black surfaces, but keep
  the halation caveat — test legibility.
- LCD screens don't get this benefit (backlight always on) — don't over-index on
  pure black there.

---

## Sunlight & contrast

Phones are used outdoors. Low-contrast "elegant" grays vanish in sun.

- Body text/icons: **≥ 4.5:1** contrast (WCAG AA); large text/UI: **≥ 3:1**.
- Verify EVERY token pair (`onSurface` on `surface`, etc.) in light AND dark.
- Don't rely on subtle color differences for important state — sunlight + color
  blindness both erase them.

---

## Color as information — with redundancy

~8% of men have color-vision deficiency. Never use color as the ONLY signal:

- Error = red **+ icon + message**, not just red border.
- Success/selected = color **+ checkmark/label**.
- Charts/status = color **+ shape/pattern/label**.

---

## Practical palette rules

- Keep the accent palette small (1 primary, 1 secondary, semantic error/warn/
  success). Restraint reads as polish.
- Tint, don't repaint: derive hover/pressed/disabled states from the base token
  (opacity/lightness shifts) for consistency.
- Map to platform systems where possible (iOS system colors, Material 3 dynamic
  color) so the app harmonizes with the OS.
