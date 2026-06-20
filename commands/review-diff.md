---
name: review-diff
description: Review the current uncommitted diff for bugs, smells, and quick wins, reporting findings inline in chat.
version: 1.0.0
author: ai-skills-registry
argument-hint: "[base branch or ref]"
tags: [review, git, diff, quality]
---

# /review-diff

Review only what changed — no full-project scan. Compare against `$ARGUMENTS`
when given (a base branch or ref), otherwise the working tree.

## Steps

1. Get the diff: `git diff $ARGUMENTS` (or `git diff` / `git diff --staged` when
   no ref is supplied). If empty, say so and stop.
2. Read each changed hunk in the context of its file.
3. Report findings, most severe first. One line each:
   `path:line — <severity>: <problem>. <fix>.`
   Severities: `bug`, `risk`, `smell`, `nit`.
4. Skip pure formatting noise unless it changes meaning.
5. End with a one-line verdict: safe to commit, or blockers remain.

## Rules

- Only comment on changed lines and code they directly affect.
- No praise, no restating the diff. Actionable signal only.
- If you are unsure a finding is real, mark it `risk` and explain the doubt.
