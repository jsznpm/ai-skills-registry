# agenticpool

Package manager for the [AI Skills Registry](../../README.md) — the Ink TUI
edition of [skillpool](../skillpool). Installs three kinds of Claude Code
resources into your project's `.claude/` folder:

| Type | Installs to | What it is |
|------|-------------|------------|
| **skill**   | `.claude/skills/<name>/`   | A folder of prompt files + `skill.json` — the model auto-invokes it by description. |
| **command** | `.claude/commands/<name>.md` | A slash command (`/<name>`) the user triggers manually. |
| **agent**   | `.claude/agents/<name>.md`  | A subagent the model delegates to, in its own context with its own tools. |

## Install

```bash
npm i -g claude-agentpool
# or
npx claude-agentpool <command>
```

(npm package is `claude-agentpool`; the installed command is `agenticpool`.)

## Commands

```bash
agenticpool list                  # interactive TUI (installs your selection)
agenticpool list --long           # plain list with version + description
agenticpool list --type agent     # filter by type: skill | command | agent
agenticpool search react          # search all types by name / description / tag

agenticpool add                   # no arg → open the TUI
agenticpool add react-architect   # install by name (when unique across types)
agenticpool add command:commit    # disambiguate with type:name
agenticpool add agent:code-reviewer@1.0.0

agenticpool info command:commit   # details + file list
agenticpool remove command:commit # remove an installed resource
agenticpool update                # update all installed
agenticpool update skill:docx
```

### TUI controls

`agenticpool list` (in a TTY) and `agenticpool add` with no argument open a
full-screen picker: tabs across the top (Skills | Commands | Agents), each
with its own paginated, multi-select list.

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` / `←` `→` | switch tab (wraps) |
| `↑` `↓` | move cursor (wraps within the current page) |
| `[` `]` | previous / next page in the current tab |
| `Space` | toggle selection of the highlighted item |
| `a` | toggle select-all for the **current tab only** |
| `Enter` | install the selection |
| `q` / `Esc` | cancel |

`a` selects everything on the active tab, not globally — this keeps you from
accidentally bulk-installing resources on a tab you haven't even looked at.
Hit `a` on each tab you want to select-all on.

### Names and collisions

A name may exist in more than one type (e.g. a `code-reviewer` skill **and** a
`code-reviewer` agent). Use a bare name when it's unique; otherwise prefix the
type: `skill:code-reviewer`, `command:commit`, `agent:code-reviewer`. Installs
are tracked in `.claude/skills/manifest.json` keyed by `type:name`.

### Interoperability with skillpool

agenticpool and skillpool read/write the exact same
`.claude/skills/manifest.json`. You can install a resource with one and
`remove`/`update` it with the other — they track the same state.

## Registry source

By default the CLI reads `registry.json` from the public GitHub raw URL.
Override for testing or private registries:

```bash
agenticpool --registry ./path/to/ai-skills-registry list   # local folder
AGENTICPOOL_REGISTRY=https://raw.githubusercontent.com/you/repo/main agenticpool list
```

## How it works

The CLI never hardcodes the resource list. At runtime it fetches `registry.json`,
which lists every skill, command, and agent plus the files each contains, and
downloads them by raw URL. Adding a new resource to the registry repo requires
**no CLI release** — the next `agenticpool list` sees it automatically.
