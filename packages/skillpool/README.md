# skillpool

Package manager for the [AI Skills Registry](../../README.md). Installs AI
agent skills (system prompts, examples, rules) into your project's `.skills/`
folder so Claude Code, Cursor, Windsurf, and MCP agents can read them.

## Install

```bash
npm i -g skillpool
# or
npx skillpool <command>
```

## Commands

```bash
skillpool list                  # all skills
skillpool list --long           # with version + description
skillpool search react          # by name / description / tag
skillpool info react-architect  # details + file list
skillpool add react-architect   # install into ./.skills
skillpool add react-architect@1.0.0
skillpool remove react-architect
skillpool update                # update all installed
skillpool update react-architect
```

## Registry source

By default the CLI reads `registry.json` from the public GitHub raw URL.
Override for testing or private registries:

```bash
skillpool --registry ./path/to/ai-skills-registry list   # local folder
SKILLPOOL_REGISTRY=https://raw.githubusercontent.com/you/repo/main skillpool list
```

## How it works

The CLI never hardcodes the skill list. At runtime it fetches `registry.json`,
which lists each skill and its files. Adding a new skill to the registry repo
requires **no CLI release** — the next `skillpool list` sees it automatically.
