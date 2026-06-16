---
name: add-registry-skill
description: Scaffolds a new skill in this AI Skills Registry and regenerates registry.json. Use when the user wants to add a new skill (e.g. "add a skill for X", "create a new registry skill", "yeni skill elave et"). Project-specific to ai-skills-registry.
---

# Add Registry Skill

Automates adding a new skill to **this** repository's registry. A skill is a
folder under `skills/<name>/` plus a `skill.json` manifest; the CLI reads the
generated `registry.json` at runtime, so a new skill needs **no CLI release** —
only a regenerated index.

## When to use
User asks to add/create a new skill in this registry (any language). Examples:
"add a skill for python testing", "yeni skill yarat: sql-tuner", "create a
docs-writer skill".

## Inputs to gather
Ask only for what's missing — infer sensible values otherwise:
- **name** — kebab-case folder/skill name (e.g. `python-tester`). Required.
- **description** — one line, what the skill does. Required.
- **tags** — array of lowercase keywords. Infer from name/description if absent.
- **author** — default `ai-skills-registry`.
- **files** — which prompt files to create. Default: `system.md`, `examples.md`,
  `README.md`. Always include `skill.json`.

Do not proceed if `skills/<name>/` already exists — tell the user and stop (or
ask whether to overwrite).

## Steps

1. Verify the working directory is the registry root (a `skills/` folder and
   `scripts/build-registry.mjs` exist). If not, stop and say so.

2. Create `skills/<name>/skill.json`:
   ```json
   {
     "name": "<name>",
     "version": "1.0.0",
     "description": "<description>",
     "author": "<author>",
     "tags": ["<tag>", "..."]
   }
   ```
   `name` MUST equal the folder name (build script warns otherwise).

3. Create `skills/<name>/system.md` — the agent system prompt. Write real,
   useful content for the skill's domain following the style of existing skills
   in `skills/` (Principles + a checklist or output format). No placeholders.

4. Create `skills/<name>/README.md`:
   ```markdown
   # <name>

   <description>

   Install:
   \`\`\`bash
   skillpool add <name>
   \`\`\`
   ```

5. Create any other requested files (e.g. `examples.md`, `rules.md`) with real
   content.

6. Regenerate the index:
   ```bash
   npm run build:registry
   ```

7. Verify the CLI sees it (uses the local registry, no push needed):
   ```bash
   node packages/skillpool/dist/index.js --registry . info <name>
   ```
   If `dist/` is missing, run `npm run build:cli` first.

8. Report: files created, new skill count from the build output, and remind the
   user that pushing to GitHub makes `skillpool add <name>` work for everyone —
   no CLI republish required.

## Rules
- Match the structure and tone of existing skills under `skills/`.
- Never hand-edit `registry.json` — always regenerate via the script.
- Keep `skill.json` minimal: name, version, description, author, tags.
