# course-builder

Turns a source link into a complete, example-rich course written to the `courses/` folder, asking the user which language to write it in and splitting large topics into a plan plus multiple parts.

Install:
```bash
skillpool add course-builder
```

## What it does

1. Takes a link you give it (article, docs, README, spec, transcript).
2. Asks what language to write the course in.
3. Reads the source thoroughly, then writes a beginner-friendly, example-heavy
   markdown course into `courses/` at the project root (creating the folder if
   needed, and never overwriting an existing file — collisions get a numeric
   suffix).
4. If the topic is too big for one file, it splits into numbered part files;
   if it's very big, it first writes a `courses/<slug>.plan.md` outline and
   then generates each part from that plan.
