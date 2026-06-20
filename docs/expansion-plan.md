# skillpool — commands və agents dəstəyi (genişlənmə planı)

> **Status: TAMAMLANDI.** Bu sənəd registry-nin tək tipdən (yalnız skill) üç tipə
> (skill + command + agent) keçidini təsvir edir. İcra edilib və lokal test olunub.

## Kontekst (niyə)

Əvvəl `ai-skills-registry` yalnız **skill** saxlayırdı, `skillpool` CLI isə yalnız
skilləri `.claude/skills/` qovluğuna yükləyirdi. İstifadəçi paketi genişləndirmək
istədi: registry həm **slash command**-ları, həm də **subagent**-ləri saxlasın və
CLI user-ə bunların hamısından **seçib yükləməyə** kömək etsin.

Niyə hər üç növ lazımdır (eyni deyillər):

| | Skill | Command | Agent |
|---|---|---|---|
| Kim işə salır | Model özü (description-a görə avtomatik) | İstifadəçi (`/ad`) | Model deleqasiya edir |
| Kontekst | Əsas söhbət | Əsas söhbət | Ayrı, izolyasiya pəncərə |
| Alət/model | Söhbətinki | Söhbətinki | Öz alət dəsti + öz modeli |

## Claude Code standartı (saxlanılır)

- **command** = `.claude/commands/<ad>.md` — tək `.md`, YAML frontmatter, gövdə = prompt.
- **agent** = `.claude/agents/<ad>.md` — tək `.md`, YAML frontmatter, gövdə = system prompt.
- **skill** = qovluq + `skill.json` + prompt faylları.

Registry kökündə struktur:

```
skills/<ad>/skill.json + fayllar
commands/<ad>.md          (frontmatter: name, description, version, author, tags, ...)
agents/<ad>.md            (frontmatter: name, description, tools, model, tags, ...)
registry.json             (avtomatik — əl ilə düzəliş YOX)
```

Yükləmə hədəfləri istifadəçinin layihəsində:
`.claude/skills/<ad>/`, `.claude/commands/<ad>.md`, `.claude/agents/<ad>.md`.

## Ad toqquşması

Fərqli tiplərdə eyni ad ola bilər (məs. skill `code-reviewer` + agent
`code-reviewer`). Həll: registry və manifest-də **tip ilə namespace** —
`skill:code-reviewer`, `agent:code-reviewer`. CLI-də ad unikaldırsa tip yazmaq
lazım deyil; toqquşma olarsa `tip:ad` tələb olunur (aydın xəta verilir).

## İcra olunan dəyişikliklər

### Build script — `scripts/build-registry.mjs`
- Üç qovluq skan edir: `skills/`, `commands/`, `agents/`.
- skills: əvvəlki kimi `skill.json` + rekursiv fayl siyahısı, `type: "skill"`.
- commands/agents: hər `*.md` bir resursdur; asılılıqsız **YAML frontmatter
  parser** metadatanı oxuyur (`name`, `description`, `version`, `author`, `tags`).
- `registry.json` yeni sxem: `count`, `counts {skills,commands,agents}` və
  `skills[] / commands[] / agents[]`. Hər entry-də `type` sahəsi var.

### CLI — `packages/skillpool/src/`
- **config.ts** — `ResourceType`, `CLAUDE_DIR`, `targetDir(type)` helper.
- **registry.ts** — `ResourceEntry` (+ `SkillEntry` alias), `allResources`,
  `findResource(reg, name, type?)` (toqquşmada throw), `parseSpec` artıq
  `tip:ad@versiya` ayırır, `fetchResourceFile`.
- **installer.ts** — manifest açarları namespace-li (`tip:ad`); köhnə (namespace-siz)
  manifestlər oxunarkən `skill:` kimi **miqrasiya** olunur. `installResource`
  (skill → qovluq, command/agent → tək fayl), `removeResource(key)`.
- **picker.ts** (YENİ) — interaktiv **çox-seçimli** siyahı (↑↓ hərəkət, space seç,
  a hamısı, enter yüklə, q çıx); tip teqi göstərir.
- **commands/** — `list` (filter `--type`, TTY-də picker yükləyir), `add` (arqumentsiz
  picker, və ya `tip:ad`), `info`/`remove`/`update` `tip:ad` qəbul edir, `search`
  bütün tiplərdə axtarır.

### Seed məzmun
- `commands/`: `commit.md`, `review-diff.md`, `explain.md`.
- `agents/`: `code-reviewer.md`, `test-writer.md`.

## Yoxlama (icra olunub)

```bash
npm run build:registry      # 23 skill + 3 command + 2 agent, counts düz
npm run build:cli           # tsup build success; tsc --noEmit təmiz

node packages/skillpool/dist/index.js --registry . list --type agent
node packages/skillpool/dist/index.js --registry . add command:commit
node packages/skillpool/dist/index.js --registry . add agent:code-reviewer
node packages/skillpool/dist/index.js --registry . add skill:docx
node packages/skillpool/dist/index.js --registry . info command:commit
node packages/skillpool/dist/index.js --registry . update
node packages/skillpool/dist/index.js --registry . remove command:commit
```

Təsdiqləndi: fayllar düzgün `.claude/{skills,commands,agents}` altına düşür,
manifest açarları namespace-li, toqquşan ad (`code-reviewer`) bloklanır, köhnə
manifest avtomatik miqrasiya olunur.
