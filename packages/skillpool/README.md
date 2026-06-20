# skillpool

Package manager for the [AI Skills Registry](../../README.md). Installs three
kinds of Claude Code resources into your project's `.claude/` folder so Claude
Code (and compatible agents) can use them:

| Type | Installs to | What it is |
|------|-------------|------------|
| **skill**   | `.claude/skills/<name>/`   | A folder of prompt files + `skill.json` — the model auto-invokes it by description. |
| **command** | `.claude/commands/<name>.md` | A slash command (`/<name>`) the user triggers manually. |
| **agent**   | `.claude/agents/<name>.md`  | A subagent the model delegates to, in its own context with its own tools. |

## Install

```bash
npm i -g skillpool
# or
npx skillpool <command>
```

## Commands

```bash
skillpool list                  # interactive multi-select picker (installs your selection)
skillpool list --long           # plain list with version + description
skillpool list --type agent     # filter by type: skill | command | agent
skillpool search react          # search all types by name / description / tag

skillpool add                   # no arg → open the picker
skillpool add react-architect   # install by name (when unique across types)
skillpool add command:commit    # disambiguate with type:name
skillpool add agent:code-reviewer@1.0.0

skillpool info command:commit   # details + file list
skillpool remove command:commit # remove an installed resource
skillpool update                # update all installed
skillpool update skill:docx
```

### Picker controls

`skillpool list` (in a TTY) and `skillpool add` with no argument open a
multi-select picker:

```
↑↓ move · space select · a all · enter install · q quit
```

### Names and collisions

A name may exist in more than one type (e.g. a `code-reviewer` skill **and** a
`code-reviewer` agent). Use a bare name when it's unique; otherwise prefix the
type: `skill:code-reviewer`, `command:commit`, `agent:code-reviewer`. Installs
are tracked in `.claude/skills/manifest.json` keyed by `type:name`.

## Registry source

By default the CLI reads `registry.json` from the public GitHub raw URL.
Override for testing or private registries:

```bash
skillpool --registry ./path/to/ai-skills-registry list   # local folder
SKILLPOOL_REGISTRY=https://raw.githubusercontent.com/you/repo/main skillpool list
```

## How it works

The CLI never hardcodes the resource list. At runtime it fetches `registry.json`,
which lists every skill, command, and agent plus the files each contains, and
downloads them by raw URL. Adding a new resource to the registry repo requires
**no CLI release** — the next `skillpool list` sees it automatically.
