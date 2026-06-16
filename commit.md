feat(skillpool): add CLI banner, two skills, and skill scaffolder

Description:
- Show a branded ASCII banner with author credit on bare invocation and help,
  while keeping command output clean so piping and scripting are unaffected
- Add a diff-reviewer skill that reviews only changed hunks of a git diff for
  bugs, regressions, and risks before commit
- Add a python-backend skill covering API design, async correctness, error
  handling, and security for Python services
- Add a project-scoped scaffolder skill that creates a new registry skill and
  regenerates the index, so adding skills follows one consistent flow
- Refresh the generated registry index to publish the new skills

Impact:
- Users see clear branding when exploring the CLI without losing parseable output
- New skills become installable immediately after pushing, with no CLI release

Affected Components:
- .claude/skills/add-registry-skill/SKILL.md
- packages/skillpool/src/banner.ts
- packages/skillpool/src/index.ts
- registry.json
- skills/diff-reviewer/README.md
- skills/diff-reviewer/examples.md
- skills/diff-reviewer/skill.json
- skills/diff-reviewer/system.md
- skills/python-backend/README.md
- skills/python-backend/examples.md
- skills/python-backend/skill.json
- skills/python-backend/system.md
