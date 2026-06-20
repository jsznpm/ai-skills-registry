---
name: architecture-review
description: Comprehensive system architecture analysis with design-pattern review and a prioritized improvement roadmap.
version: 1.0.0
author: ai-skills-registry
argument-hint: "[scope] | --modules | --patterns | --dependencies | --security"
allowed-tools: Read, Glob, Grep, Bash
tags: [architecture, review, design-patterns, dependencies, security]
---

# /architecture-review

Analyze the system's architecture and produce an actionable improvement plan.
Scope the review with `$ARGUMENTS` — a module path, or one of `--modules`,
`--patterns`, `--dependencies`, `--security`. With no argument, review the whole
project.

## Steps

1. Build context first:
   - Languages / structure: list top-level source files and dirs.
   - Project type: detect `package.json`, `requirements.txt`, `go.mod`, `pom.xml`,
     `Cargo.toml`, etc.
   - Tests: locate `*.test.*` / `*spec*` files, note the framework.
   - Docs: count `README*` / `*.md` files.
2. Apply the scope from `$ARGUMENTS`. Skip framework sections that don't match it.
3. Run the analysis framework:
   1. **System structure** — component hierarchy, module boundaries, layering.
   2. **Design patterns** — patterns in use, consistency, anti-patterns.
   3. **Dependencies** — coupling, circular deps, injection, boundary leaks.
   4. **Data flow** — information flow, state management, persistence.
   5. **Scalability & performance** — bottlenecks, caching, resource use.
   6. **Security** — trust boundaries, authn/authz flows, data protection.
4. Note cross-cutting concerns: testability, configuration, error handling,
   observability, extensibility, technical debt.
5. Output a report:
   - Findings grouped by framework section, each with file/line evidence.
   - Each finding tagged `critical` / `high` / `medium` / `low`.
   - A prioritized roadmap: what to fix first, refactor strategy, est. effort.

## Rules

- Cite real files and lines — no generic advice ungrounded in this codebase.
- Read before judging; don't infer architecture from file names alone.
- Recommend, don't rewrite — this command analyzes and plans, it doesn't edit.
- Most severe findings first; lead with what blocks scaling or security.
