---
name: add-registry-agent
description: Scaffolds a new subagent in this AI Skills Registry (agents/<name>.md) and regenerates registry.json. Use when the user wants to add a new agent (e.g. "add an agent for X", "create a new registry agent", "yeni agent elave et"). Project-specific to ai-skills-registry.
---

# Add Registry Agent

Automates adding a new **subagent** to **this** repository's registry. An agent
is a single Markdown file under `agents/<name>.md` with YAML frontmatter — the
native Claude Code format. The CLI reads the generated `registry.json` at
runtime, so a new agent needs **no CLI release** — only a regenerated index. It
installs to a consuming project's `.claude/agents/`.

## When to use
User asks to add/create a new subagent in this registry (any language).
Examples: "add an agent that reviews migrations", "yeni agent yarat: doc-writer",
"create a security-auditor agent". For a **skill** use `add-registry-skill`; for
a **slash command** use `add-registry-command`.

## Inputs to gather
Ask only for what's missing — infer sensible values otherwise:
- **name** — kebab-case file/agent name (e.g. `migration-reviewer`). Required.
- **description** — one line describing WHEN to use the agent. This is what the
  main thread reads to decide delegation, so make it trigger-oriented. Required.
- **role / behavior** — what the agent does and how it works. Required — becomes
  the system-prompt body. Ask if not given.
- **tools** — comma-separated tool allowlist (e.g. `Read, Grep, Glob`). Default
  to a minimal read-only set for review-type agents; include `Edit, Write, Bash`
  only when the agent must change files. Optional.
- **model** — `sonnet` (default), `haiku`, or `opus`. Optional.
- **tags** — lowercase keywords. Infer from name/description if absent.
- **author** — default `ai-skills-registry`.

Do not proceed if `agents/<name>.md` already exists — tell the user and stop (or
ask whether to overwrite).

## Steps

1. Verify the working directory is the registry root (an `agents/` folder and
   `scripts/build-registry.mjs` exist). If `agents/` is missing, create it. If
   `scripts/build-registry.mjs` is missing, stop and say so.

2. Create `agents/<name>.md` with frontmatter + a real system prompt:
   ```markdown
   ---
   name: <name>
   description: <when-to-use description>
   version: 1.0.0
   author: <author>
   tools: <Tool1, Tool2>   # omit to inherit the full tool set
   model: sonnet
   tags: [<tag>, ...]
   ---

   <System prompt: state the agent's role and what it must NOT do. Then a
   "## Process" section with concrete steps, and an "## Output" section defining
   the exact return format. End with "## Rules" for guardrails.>
   ```
   `name` in frontmatter MUST equal the file name (build script warns otherwise).
   Write real, useful content — no placeholders. Match the tone of existing files
   in `agents/`.

3. Regenerate the index:
   ```bash
   npm run build:registry
   ```

4. Verify the CLI sees it (uses the local registry, no push needed):
   ```bash
   node packages/skillpool/dist/index.js --registry . info agent:<name>
   ```
   If `dist/` is missing, run `npm run build:cli` first.

5. Report: file created, new agent/total counts from the build output, and remind
   the user that pushing to GitHub makes `skillpool add agent:<name>` work for
   everyone — no CLI republish required.

## Rules
- An agent is exactly one `.md` file — never a folder.
- Keep `tools` as narrow as the job allows; read-only agents should not get
  `Edit`/`Write`/`Bash`.
- Always disambiguate with `agent:<name>` in CLI checks, since a skill or command
  may share the name.
- Never hand-edit `registry.json` — always regenerate via the script.
- Match the structure and tone of existing files under `agents/`.
