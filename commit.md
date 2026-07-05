feat(agenticpool): add Ink TUI package manager as skillpool sibling

Description:
- Introduce agenticpool, a separately publishable CLI offering the same registry
  install workflow as skillpool but with a full-screen Ink (React) interface
  instead of a raw-readline picker
- Add tabbed browsing by resource type (skills, commands, agents), per-tab
  pagination, multi-select, and live per-file install progress
- Fork the core registry/config/installer/color logic rather than depending on
  skillpool, keeping the new package fully standalone for independent
  publishing and versioning
- Read and write the same .claude/skills/manifest.json schema as skillpool so
  installs, removals, and updates remain interoperable between both tools
- Lazily import the Ink runtime only on interactive TTY code paths, keeping
  non-interactive commands (search, info, remove, update, list --long) free of
  any React/Ink overhead
- Wire the new package into the workspace build scripts and document the CLI,
  keybindings, and cross-tool manifest compatibility

Impact:
- Registry consumers gain an alternative install experience with grouped,
  paginated browsing without affecting existing skillpool users
- Both CLIs can be installed and used interchangeably against the same
  project without manifest conflicts

Affected Components:
- CLAUDE.md
- package-lock.json
- package.json
- packages/agenticpool/README.md
- packages/agenticpool/package.json
- packages/agenticpool/src/banner.ts
- packages/agenticpool/src/colors.ts
- packages/agenticpool/src/commands/add.ts
- packages/agenticpool/src/commands/info.ts
- packages/agenticpool/src/commands/list.ts
- packages/agenticpool/src/commands/remove.ts
- packages/agenticpool/src/commands/search.ts
- packages/agenticpool/src/commands/update.ts
- packages/agenticpool/src/config.ts
- packages/agenticpool/src/index.ts
- packages/agenticpool/src/installer.ts
- packages/agenticpool/src/registry.ts
- packages/agenticpool/src/tui/App.tsx
- packages/agenticpool/src/tui/Footer.tsx
- packages/agenticpool/src/tui/InstallProgress.tsx
- packages/agenticpool/src/tui/ResourceList.tsx
- packages/agenticpool/src/tui/Tabs.tsx
- packages/agenticpool/src/tui/runInstallTui.ts
- packages/agenticpool/src/tui/types.ts
- packages/agenticpool/tsconfig.json
- packages/agenticpool/tsup.config.ts
