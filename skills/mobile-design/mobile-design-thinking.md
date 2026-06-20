# Mobile Design Thinking (Anti-Memorization)

> **Purpose:** Stop reaching for memorized defaults. Derive decisions from THIS
> app's context, users, and constraints. Numbers in other files are starting
> points to reason about — not laws to paste.

---

## The core failure mode

AI tools memorize "the answer" (e.g. "use Redux", "44px targets", "tab bar at
bottom") and apply it everywhere regardless of fit. That produces apps that are
technically correct and contextually wrong.

**Antidote:** for every decision, state the CONTEXT first, the OPTIONS second,
and the CHOICE last — with a reason tied to the context.

```
Context  → who uses this, on what device, in what conditions?
Options  → what are 2-3 viable approaches here?
Choice   → which, and WHY for THIS context?
```

---

## Questions that force thinking

Before any screen or component, answer:

1. **Who** is the user? (age, ability, tech comfort, one-handed or two?)
2. **Where** are they? (commute, couch, bright sun, poor signal?)
3. **What** is the ONE job of this screen? (everything else is secondary)
4. **How often** do they do this? (rare = guide them; frequent = get out of the way)
5. **What** happens when it fails? (no network, empty data, denied permission)

If you can't answer 1–2, ask the user. Don't invent a persona to justify a default.

---

## Derive, don't memorize — worked examples

| Memorized default | The thinking instead |
|-------------------|----------------------|
| "Touch targets are 44px" | Fingers cover ~7–10mm. Target ≥ that. Older users / gloves / motion → go bigger. The number serves the finger, not vice versa. |
| "Put a tab bar at the bottom" | Bottom = thumb-reachable. Good for ≤5 frequent destinations. 6+ or hierarchical → reconsider (drawer, or restructure IA). |
| "Use Redux" | Redux pays off with lots of shared, cross-screen, frequently-mutated state. A 4-screen app with local state needs none of it. |
| "Dark mode = invert colors" | OLED black saves battery and reduces glare at night — but pure inversion kills contrast and depth. Design dark as its own palette. |

---

## Constraint-first mindset

Mobile constraints are the design brief, not obstacles:

- **Network** is intermittent → assume offline, treat online as a bonus.
- **Battery** is finite → cheap animations, dark where it helps, batch network.
- **Attention** is fragmented → resumable flows, no long uninterruptible tasks.
- **Input** is imprecise → forgiving targets, undo over confirm-dialogs.
- **Screen** is small → one primary action per view, progressive disclosure.

---

## The "would I defend this?" test

Before shipping a decision, can you finish this sentence with a context reason
(not "because it's standard")?

> "I chose ___ because, for these users in this situation, ___."

If the blank only fills with "it's the common pattern," you memorized — go back
to Context → Options → Choice.
