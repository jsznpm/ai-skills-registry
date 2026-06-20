# Mobile Typography

> Text on mobile is read at arm's length, in motion, in bad light, by aging eyes.
> Legibility and respecting the user's font-size choice beat brand flourish.

---

## Use system fonts by default

| Platform | System font | Why |
|----------|-------------|-----|
| iOS | SF Pro / SF Compact | Optical sizing, Dynamic Type, zero download cost, native feel |
| Android | Roboto | Same benefits on Android |

System fonts ship with the OS (no bundle weight), support accessibility scaling
natively, and look "right" on each platform. Use a custom font only for genuine
brand need — and then test it at every Dynamic Type size.

---

## Type scale (starting point — reason from hierarchy, not copy-paste)

| Role | iOS pt | Android sp | Weight |
|------|--------|-----------|--------|
| Large title | 34 | 32 | Bold |
| Title | 28 | 24 | Bold/Medium |
| Headline | 17 | 20 | Semibold |
| Body | 17 | 16 | Regular |
| Callout/Subhead | 15 | 14 | Regular |
| Caption | 12 | 12 | Regular |

- **Body ≥ ~16** so it's comfortable at reading distance.
- Limit to **2–3 sizes + 2 weights per screen** — more is noise.
- Hierarchy comes from size + weight + color/spacing, not many fonts.

---

## Respect Dynamic Type / font scale (non-negotiable)

Users set their preferred text size system-wide. Your UI must adapt.

- **iOS:** use text styles (`.body`, `.headline`) / `UIFontMetrics`; in RN set
  `allowFontScaling` (default true — don't disable globally).
- **Android:** size in `sp` (scales) NOT `dp`; Flutter respects `MediaQuery
  textScaleFactor` / `TextScaler`.
- **Test at the largest accessibility size** — layouts must not clip, truncate
  critical text, or overlap. Prefer flexible/wrapping layouts over fixed heights.

---

## Readability

- **Line length:** ~30–40 characters per line on phones (narrow screen helps).
- **Line height:** ~1.3–1.5× font size for body text.
- **Contrast:** meet WCAG AA — 4.5:1 for body text, 3:1 for large text. Verify in
  BOTH light and dark mode (see [mobile-color-system.md](mobile-color-system.md)).
- **Alignment:** left-align body text (LTR locales); avoid justified (rivers) and
  long centered paragraphs.
- **Truncate gracefully** with ellipsis + a way to see full text; never silently
  cut meaning.

---

## Accessibility

- Don't convey meaning by color alone — pair with text/icon.
- Every text-bearing interactive control has an accessible label.
- Avoid all-caps for long strings (screen readers + readability suffer); use
  letter-spacing styling instead of capitalizing the source text.
- Honor "bold text" and "increase contrast" system settings where the platform
  exposes them.
