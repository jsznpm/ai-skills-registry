# Examples

## Safe minor/patch upgrade
```
/upgrade-project
```
Detects the package manager from the lockfile, lists outdated packages, and — when
you pick **patch/minor only** — bumps and installs semver-compatible versions, then
runs tests.

## Sample outdated table (Step 2 output)
```
Package      Current  Wanted   Latest   Type
react        18.2.0   18.3.1   19.1.0   dependencies
vite         4.5.0    4.5.5    6.3.0    devDependencies
zod          3.22.4   3.23.8   3.23.8   dependencies
```

## Sample breaking-change summary (Step 6 output)
```
react 18 → 19 (major)
- ref is now a regular prop; forwardRef no longer required for new components
- Removed legacy string refs and the `react-dom/test-utils` act warning shim
- Action: audit forwardRef usages and any string-ref code paths before shipping
```

## Sample final report (Step 7 output)
```
Upgraded: zod 3.22.4 → 3.23.8, vite 4.5.0 → 4.5.5
Skipped:  react (major, declined this run)
Tests:    PASS (42 passed)
Build:    PASS
Suggested commit: chore(deps): bump zod and vite to latest minor
```
