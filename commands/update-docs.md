---
name: update-docs
description: Systematically update project documentation to match implementation status, API changes, and recent work — synchronizing specs, README, and CLAUDE.md.
version: 1.0.0
author: ai-skills-registry
argument-hint: "[doc-type] | --implementation | --api | --architecture | --sync | --validate"
allowed-tools: Read, Write, Edit, Bash
tags: [docs, documentation, sync, specs, maintenance]
---

# /update-docs

Bring project documentation back in line with the code. Scope is set by
`$ARGUMENTS`: a doc type to focus on, or a flag —
`--implementation` (status/progress), `--api` (API surface changes),
`--architecture` (structure/design), `--sync` (reconcile all docs with code),
`--validate` (report drift without editing). No argument means a full sync pass.

## Gather state

Run these to ground the update in reality — never edit from memory:

- Doc inventory: `find . -name "*.md" -not -path "*/node_modules/*" | head -40`
- Status markers in docs: `grep -rn "✅\|⚠️\|❌" docs/ specs/ 2>/dev/null | wc -l`
- Recent doc changes: `git log --oneline --since="2 weeks ago" -- "*.md" | head -10`
- Recent code changes: `git log --oneline --since="2 weeks ago" -- "src/" "lib/" | head -20`
- Read the project's `CLAUDE.md` and `README.md` if present, plus any
  `specs/` or `docs/` index file.

## Steps

1. **Reconcile.** Cross-reference each doc against the actual code and recent
   commits. List every drift point: claims that no longer hold, features built
   but undocumented, status markers that are stale.
2. **For `--validate`**, stop here: print the drift list (file:line → issue →
   suggested fix) and a one-line verdict. Make no edits.
3. **Update existing docs in place** — do not create new spec files:
   - Mark shipped work `✅`, in-progress `⚠️`, not-started `❌`, consistently.
   - Update completion percentages and status tables with real numbers.
   - Record notable implementation decisions, deviations (with reason), and
     new best practices or gotchas discovered.
   - Refresh API docs and usage examples to match the current surface.
   - Update `CLAUDE.md`/`README.md` only where genuinely stale.
4. **Preserve original requirements.** When marking a spec item done, strike or
   tag it — never delete the original intent.
5. **Verify.** Re-grep status markers and re-read changed files to confirm the
   docs now match the code.

## Output

End with a summary:
1. Files updated.
2. Major content changes.
3. Updated completion percentages.
4. New best practices or lessons captured.
5. Remaining drift, if any.

## Rules

- Update existing files; never invent new spec/doc files.
- Documentation must reflect actual implementation — verify against code, not
  assumptions.
- Keep status indicators (`✅` `⚠️` `❌`) and Markdown style consistent with the
  surrounding docs.
- Under `--validate`, report only — make no edits.
- Cross-reference related sections so the doc set stays internally consistent.
