---
name: commit
description: Write a Conventional Commits message for the currently staged changes and create the commit.
version: 1.0.0
author: ai-skills-registry
argument-hint: "[extra context]"
tags: [git, commit, conventional-commits, workflow]
---

# /commit

Generate a clean **Conventional Commits** message for the staged diff and create
the commit. Use any text the user passes as additional context: `$ARGUMENTS`.

## Steps

1. Run `git status` and `git diff --staged`. If nothing is staged, tell the user
   to `git add` first and stop.
2. Pick the correct **type**: `feat`, `fix`, `docs`, `refactor`, `test`,
   `chore`, `perf`, `build`, `ci`, `style`, `revert`.
3. Infer a short **scope** from the touched paths when one is obvious.
4. Write an imperative **subject** ≤ 50 chars: `type(scope): subject`.
5. Add a body only when the *why* is not obvious from the subject. Wrap at 72
   chars. Reference issues if the user mentioned any.
6. Show the proposed message, then create it with `git commit`.

## Rules

- One logical change per commit — if the diff mixes concerns, say so.
- No trailing period in the subject. Imperative mood ("add", not "added").
- Never `git add` on the user's behalf; commit only what is already staged.
