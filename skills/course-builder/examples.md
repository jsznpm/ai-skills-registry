# Examples

## Example 1 — Small topic, single file

**User:** "https://docs.python.org/3/library/dataclasses.html — make me a
course out of this."

**Flow:**
1. Skill asks: "What language should the course be written in?" → user says
   "English".
2. Fetches the page. Topic is narrow (one stdlib module) → single file.
3. Creates `courses/` if missing.
4. Slug: `python-dataclasses`. No existing file → writes
   `courses/python-dataclasses.md`.
5. Course covers: what a dataclass is and why it exists, `@dataclass` basics,
   default values and `field()`, `frozen=True` / immutability, `__post_init__`,
   comparison/ordering, inheritance, and a small "build a `Point3D` class"
   exercise. Ends with a summary and a link back to the docs page.
6. Reports: "Created `courses/python-dataclasses.md` (single file). Covers
   dataclass basics through inheritance and defaults, with a hands-on
   exercise."

## Example 2 — Filename collision

Same request run again later (or a second, related topic that slugs to the
same name). `courses/python-dataclasses.md` already exists, so the skill
writes `courses/python-dataclasses-2.md` instead of overwriting.

## Example 3 — Large topic → plan first, then parts

**User:** "Bu linki oxu və mənə tam Docker kursu hazırla:
https://docs.docker.com/get-started/"

**Flow:**
1. Skill asks the language question → user answers "Azərbaycan dili". Course
   is written entirely in Azerbaijani from here on.
2. Fetches the get-started guide and related core-concepts pages linked from
   it (images, containers, volumes, networking, Compose) since "tam kurs"
   (full course) implies broad coverage.
3. Topic is broad → plan-first. Creates `courses/docker.plan.md` listing, e.g.:
   - Part 1 (`docker-part1.md`) — Docker nədir, konteynerlər vs. VM-lər, quraşdırma
   - Part 2 (`docker-part2.md`) — Image-lər, Dockerfile, layer-lər
   - Part 3 (`docker-part3.md`) — Konteynerləri idarə etmə, volume-lar
   - Part 4 (`docker-part4.md`) — Şəbəkələşmə (networking)
   - Part 5 (`docker-part5.md`) — Docker Compose ilə çoxkonteynerli tətbiqlər
4. Generates `docker-part1.md` through `docker-part5.md` one at a time,
   re-checking the plan before each so terminology and difficulty stay
   consistent (e.g. Part 3 refers back to "Part 1-də qeyd etdiyimiz kimi..."
   instead of re-explaining containers from scratch).
5. Updates `docker.plan.md` to mark all 5 parts complete.
6. Reports all 6 files created (1 plan + 5 parts) with a short summary of each
   part's content.

## Example 4 — Thin source

**User:** "Course məndən: https://example.com/one-line-teaser"

**Flow:**
1. Skill asks the language.
2. Fetches the link — it's a two-sentence teaser with no real content.
3. Skill tells the user the source is too thin to build a faithful course from
   and asks either for a fuller link or permission to proceed using general
   knowledge of the topic (clearly noting which parts come from the source vs.
   general knowledge) rather than inventing specifics.
