# skillhub

Package manager for the [AI Skills Registry](../../README.md). Installs AI
agent skills (system prompts, examples, rules) into your project's `.skills/`
folder so Claude Code, Cursor, Windsurf, and MCP agents can read them.

## Install

```bash
npm i -g skillhub
# or
npx skillhub <command>
```

## Commands

```bash
skillhub list                  # all skills
skillhub list --long           # with version + description
skillhub search react          # by name / description / tag
skillhub info react-architect  # details + file list
skillhub add react-architect   # install into ./.skills
skillhub add react-architect@1.0.0
skillhub remove react-architect
skillhub update                # update all installed
skillhub update react-architect
```

## Registry source

By default the CLI reads `registry.json` from the public GitHub raw URL.
Override for testing or private registries:

```bash
skillhub --registry ./path/to/ai-skills-registry list   # local folder
SKILLHUB_REGISTRY=https://raw.githubusercontent.com/you/repo/main skillhub list
```

## How it works

The CLI never hardcodes the skill list. At runtime it fetches `registry.json`,
which lists each skill and its files. Adding a new skill to the registry repo
requires **no CLI release** — the next `skillhub list` sees it automatically.
