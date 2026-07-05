# MCP Server Evaluation Guide

## Purpose

Evaluations test whether an LLM can actually use your MCP server's tools to answer realistic, complex questions — not just whether the server starts and responds to a ping.

## Process

1. **Tool Inspection** — list every tool the server exposes; read each description and schema to understand real capabilities and limits.
2. **Content Exploration** — using only read-only tool calls, explore the data actually available (a real account/workspace/repo, not hypothetical data). Note concrete entities you find (names, IDs, dates) — these become the basis for verifiable answers.
3. **Question Generation** — write 10 questions that require chaining multiple tool calls against the real data explored in step 2.
4. **Answer Verification** — solve each question yourself, tool call by tool call, and record the exact expected answer string.

## Requirements per Question

- **Independent** — answerable without context from any other question.
- **Read-only** — solvable using only non-destructive tool calls.
- **Complex** — requires 2+ tool calls, filtering, or cross-referencing; not a single direct lookup.
- **Realistic** — the kind of question an actual user of the underlying service would ask.
- **Verifiable** — has one unambiguous answer checkable by exact or near-exact string match.
- **Stable** — the answer won't drift over time (avoid "how many issues are open right now").

## Output Format

```xml
<evaluation>
  <qa_pair>
    <question>Find discussions about AI model launches with animal codenames. One model needed a specific safety designation that uses the format ASL-X. What number X was being determined for the model named after a spotted wild cat?</question>
    <answer>3</answer>
  </qa_pair>
  <!-- 9 more qa_pairs -->
</evaluation>
```

Save as `evaluations/questions.xml` (or similar) alongside the server source.

## Running an Evaluation

1. Give the agent under test access only to your MCP server's tools (no web search / filesystem unless the task genuinely needs them).
2. Feed each question independently, in a fresh context.
3. Compare the agent's final answer to the recorded answer via exact or normalized string match (case-insensitive, trimmed).
4. Score = correct / 10. Investigate every miss: is the tool description ambiguous, the schema unclear, the error message unhelpful, or pagination hiding the needed item?

## Common Failure Signals

- Agent calls the wrong tool repeatedly → tool names/descriptions aren't discoverable enough.
- Agent gets stuck on pagination → missing or unclear `next_cursor` handling.
- Agent gives a plausible but wrong answer → response format buries the needed field, or an error was silently swallowed.
- Agent gives up after one failed call → error message wasn't actionable enough to recover from.

Feed these failures back into Phase 2/3 of the build process and re-run the evaluation after fixing.
