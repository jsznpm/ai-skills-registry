# AI Skills Registry

A registry + package manager for **AI agent skills**. Each skill is a folder of
prompt files (`system.md`, `examples.md`, `rules.md`, …) plus a `skill.json`
manifest. The [`skillhub`](packages/skillhub) CLI installs them into a project's
`.skills/` folder for Claude Code, Cursor, Windsurf, and MCP-based agents.

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
│       ├── system.md
│       └── ...            # any files; all are bundled
└── packages/skillhub/     # the CLI (published to npm)
```

## Use the CLI

```bash
npm i -g skillhub
skillhub list
skillhub add react-architect      # -> ./.skills/react-architect/
```

See [packages/skillhub/README.md](packages/skillhub/README.md) for all commands.

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
2. Add prompt files (`system.md`, `examples.md`, `rules.md`, …).
3. Regenerate the index:
   ```bash
   npm run build:registry
   ```
4. Commit and push. The CLI picks it up immediately — no CLI release needed.

## Develop the CLI

```bash
npm install                       # installs workspace deps
npm run build:cli                 # builds packages/skillhub/dist
# test against the local registry without pushing:
node packages/skillhub/dist/index.js --registry . list
```
