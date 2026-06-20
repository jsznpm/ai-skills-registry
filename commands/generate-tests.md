---
name: generate-tests
description: Generate comprehensive test cases with automatic analysis, intelligent mocking, and coverage optimization.
version: 1.0.0
author: ai-skills-registry
argument-hint: "[target] | [scope] | --unit | --integration | --edge-cases | --automatic"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
tags: [testing, test-generation, coverage, unit, integration]
---

# /generate-tests

Generate a comprehensive, well-mocked test suite for the target in `$ARGUMENTS`.
The target may be a file path, a scope, or a mode flag — `--unit`,
`--integration`, `--edge-cases`, or `--automatic`. With no argument, infer the
most-changed or most-complex target and generate comprehensive coverage.

## Steps

1. Build context first:
   - Test framework: detect `jest.config.*`, `vitest.config.*`, `pytest.ini`,
     `*.test.*` / `*.spec.*` files. Match the project's framework — never
     introduce a new one.
   - Existing patterns: read 1-3 nearby test files; copy their structure,
     naming, assertion style, and mock conventions.
   - Target code: read the file(s) under test. Parse signatures, control flow,
     branches, and external dependencies.
2. Apply the scope from `$ARGUMENTS`:
   - `--unit` — isolated function/method tests with mocked dependencies.
   - `--integration` — multi-component tests across real boundaries.
   - `--edge-cases` — boundary values, error paths, empty/null/overflow inputs.
   - `--automatic` (default) — all of the above, prioritized by risk.
3. Design the cases:
   1. **Positive** — expected inputs produce expected outputs.
   2. **Negative** — invalid input raises/handles errors correctly.
   3. **Boundary** — min/max, empty, zero, off-by-one, overflow.
   4. **Equivalence classes** — one representative per input partition.
4. Plan mocks: identify external deps (I/O, network, time, randomness),
   stub them, build reusable test-data factories, keep tests isolated.
5. Optimize coverage: cover every branch, drop redundant cases, name each test
   for the behavior it verifies.
6. Write the test file next to existing tests using the detected framework,
   then report: cases added, branches covered, and any gaps left untested.

## Rules

- Match the existing framework and conventions — detect, don't assume.
- Tests must be runnable as written — real imports, no placeholder TODOs.
- One behavior per test; assert outcomes, not implementation details.
- Mock only true external dependencies; don't mock the unit under test.
- Report coverage gaps honestly rather than faking exhaustive coverage.
