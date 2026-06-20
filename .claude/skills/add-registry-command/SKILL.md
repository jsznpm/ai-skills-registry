---
name: add-registry-command
description: Scaffolds a new slash command in this AI Skills Registry (commands/<name>.md) and regenerates registry.json. Use when the user wants to add a new command (e.g. "add a command for X", "create a new registry command", "yeni command elave et"). Project-specific to ai-skills-registry.
---

# Add Registry Command

Automates adding a new **slash command** to **this** repository's registry. A
command is a single Markdown file under `commands/<name>.md` with YAML
frontmatter — the native Claude Code format. The CLI reads the generated
`registry.json` at runtime, so a new command needs **no CLI release** — only a
regenerated index. It installs to a consuming project's `.claude/commands/`.

## When to use
User asks to add/create a new slash command in this registry (any language).
Examples: "add a command for running tests", "yeni command yarat: changelog",
"create a /scaffold command". For a **skill** use `add-registry-skill`; for a
**subagent** use `add-registry-agent`.

## Inputs to gather
Ask only for what's missing — infer sensible values otherwise:
- **name** — kebab-case file/command name (e.g. `run-tests`). Required. Becomes
  `/run-tests` for the user.
- **description** — one line, what the command does. Required.
- **behavior** — what steps the command should perform when invoked. Required —
  this becomes the prompt body. Ask if not given.
- **argument-hint** — short hint for `$ARGUMENTS` (e.g. `"<path>"`), if the
  command takes input. Optional.
- **tags** — lowercase keywords. Infer from name/description if absent.
- **author** — default `ai-skills-registry`.

Do not proceed if `commands/<name>.md` already exists — tell the user and stop
(or ask whether to overwrite).

## Steps

1. Verify the working directory is the registry root (a `commands/` folder and
   `scripts/build-registry.mjs` exist). If `commands/` is missing, create it.
   If `scripts/build-registry.mjs` is missing, stop and say so.

2. Create `commands/<name>.md` with frontmatter + a real prompt body:
   ```markdown
   ---
   name: <name>
   description: <description>
   version: 1.0.0
   author: <author>
   argument-hint: "<hint>"   # omit if the command takes no input
   tags: [<tag>, ...]
   ---

   # /<name>

   <One-line statement of what this command does. Use `$ARGUMENTS` where the
   user's input belongs.>

   ## Steps
   1. ...
   2. ...

   ## Rules
   - ...
   ```
   `name` in frontmatter MUST equal the file name (build script warns otherwise).
   Write real, useful content — no placeholders. Match the tone of existing files
   in `commands/`.

3. Regenerate the index:
   ```bash
   npm run build:registry
   ```

4. Verify the CLI sees it (uses the local registry, no push needed):
   ```bash
   node packages/skillpool/dist/index.js --registry . info command:<name>
   ```
   If `dist/` is missing, run `npm run build:cli` first.

5. Report: file created, new command/total counts from the build output, and
   remind the user that pushing to GitHub makes `skillpool add command:<name>`
   work for everyone — no CLI republish required.

## Rules
- A command is exactly one `.md` file — never a folder.
- Always disambiguate with `command:<name>` in CLI checks, since a skill or agent
  may share the name.
- Never hand-edit `registry.json` — always regenerate via the script.
- Match the structure and tone of existing files under `commands/`.
