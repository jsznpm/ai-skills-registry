# Examples

## Whole project (default)
```
/code-to-lesson
```
Analyzes the current working directory, detects the stack from `package.json`,
and writes `code_tutorial.md` to the project root.

## Single feature folder
```
/code-to-lesson src/features/auth
```
Scopes the deep-dive to one feature; the tutorial is written next to the
analyzed directory and cites only real symbols from that folder.

## Sample framework & version table (Step 2 output)
```
Framework | Current | Latest | Status
React     | 17.0.2  | 19.x   | ⚠️ old — no automatic batching, no Suspense SSR
Vite      | 4.5.0   | 6.x    | ⚠️ old — verify config against the v5/v6 migration guide
TypeScript| 4.9.5   | 5.x    | ⚠️ old — missing const type params, `satisfies` ergonomics
```

## Sample anti-pattern finding (Step 9 output)
```
Smell: God component — Dashboard.tsx (612 lines, 4 responsibilities)
Detect: data fetching + layout + filtering + chart rendering in one file
Refactor:
- Extract useDashboardData() hook for fetching/caching
- Split into <DashboardContainer> (state) and <DashboardView> (presentation)
- Move filter logic to a Strategy map keyed by filter type
Benefit: testable units, fewer re-renders, reusable view
```
