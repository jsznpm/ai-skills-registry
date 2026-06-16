# AI Skills Registry

A registry + package manager for **AI agent skills**. Each skill is a folder of
prompt files (`SKILL.md`, `examples.md`, `rules.md`, …) plus a `skill.json`
manifest. The [`skillpool`](packages/skillpool) CLI installs them into a project's
`.claude/skills/` folder for Claude Code, Cursor, Windsurf, and MCP-based agents.

## Why this design

The CLI does **not** hardcode the skill list. It reads `registry.json` from the
GitHub raw URL at runtime. So adding hundreds of skills over time never requires
republishing the CLI — you just add a folder and push.

```text
ai-skills-registry/
├── registry.json          # AUTO-GENERATED index (do not edit by hand)
├── scripts/
│   └── build-registry.mjs # regenerates registry.json from skills/
├── skills/
│   └── <name>/
│       ├── skill.json     # { name, version, description, author, tags }
│       ├── SKILL.md
│       └── ...            # any files; all are bundled
└── packages/skillpool/    # the CLI (published to npm)
```

## Use the CLI

```bash
npm i -g skillpool
skillpool list
skillpool add react-architect     # -> ./.claude/skills/react-architect/
```

See [packages/skillpool/README.md](packages/skillpool/README.md) for all commands.

## Add a new skill

1. Create `skills/<name>/skill.json`:
   ```json
   {
     "name": "<name>",
     "version": "1.0.0",
     "description": "...",
     "author": "you",
     "tags": ["..."]
   }
   ```
2. Add prompt files (`SKILL.md`, `examples.md`, `rules.md`, …).
3. Regenerate the index:
   ```bash
   npm run build:registry
   ```
4. Commit and push. The CLI picks it up immediately — no CLI release needed.

## Develop the CLI

```bash
npm install                       # installs workspace deps
npm run build:cli                 # builds packages/skillpool/dist
# test against the local registry without pushing:
node packages/skillpool/dist/index.js --registry . list
```
