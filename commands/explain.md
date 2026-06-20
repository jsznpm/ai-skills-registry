---
name: explain
description: Explain how a file, function, or selected code works in clear, layered detail.
version: 1.0.0
author: ai-skills-registry
argument-hint: "<path | symbol>"
tags: [explain, onboarding, documentation, learning]
---

# /explain

Explain the target the user names in `$ARGUMENTS` (a file path, a function or
symbol name, or "this" for the open selection).

## Steps

1. Locate the target. If it is a symbol, find its definition and primary uses.
2. Give a layered explanation:
   - **One line** — what it is and why it exists.
   - **Flow** — how it works, step by step, in plain language.
   - **Inputs / outputs** — parameters, return value, side effects.
   - **Gotchas** — edge cases, assumptions, or surprising behavior.
3. Reference real lines as `path:line` so the user can jump to them.
4. Keep it proportional — a one-liner does not need five paragraphs.

## Rules

- Explain the actual code in front of you, not how it "should" work.
- Define jargon the first time it appears.
- No code rewrites unless the user asks — this is explanation, not refactor.
