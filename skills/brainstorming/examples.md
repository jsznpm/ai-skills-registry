# Examples

## 1. Vague feature request

> "I want to add notifications to my app."

Don't start designing. Read the project state, then ask one question:
"What should trigger a notification — (a) another user's action, (b) a scheduled
event, (c) a system alert, or (d) something else?" Refine one answer at a time
until purpose, constraints, and success criteria are clear. Then propose 2-3
approaches (e.g. polling vs. WebSocket vs. third-party push) with trade-offs and
a recommendation, and only then present the sectioned design.

## 2. Exploring approaches

> User wants offline support.

Lead with a recommendation:
"I'd suggest a local cache with background sync (option A) over a full local-first
CRDT store (option B) — A covers your read-mostly use case at a fraction of the
complexity. Option C, no offline support with a clear error, is viable if offline
is rare. I recommend A. Want me to expand it?"

## 3. Sectioned validation

After understanding the idea, present the design in 200-300 word chunks:
architecture → components → data flow → error handling → testing. After each:
"Does this look right so far?" Go back and revise before moving on. End by
writing the validated design to `docs/plans/2026-06-20-notifications-design.md`
and committing it.

## 4. YAGNI in action

> User lists 8 "must-have" features for a v1.

Push back: "Of these, which are needed to validate the core idea? I'd cut
multi-language, theming, and the admin dashboard from v1 — they add scope without
testing the hypothesis. Ship the 3 that prove it works, defer the rest."
