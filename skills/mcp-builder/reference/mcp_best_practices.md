# MCP Best Practices

Universal guidelines for any MCP server, regardless of language/SDK.

## Naming

- Prefix tool names with the service (`github_create_issue`, `slack_send_message`) so agents can tell which server a tool belongs to at a glance.
- Use action-oriented verbs first or last consistently (`create_`, `list_`, `get_`, `update_`, `delete_`) — pick one convention and keep it across every tool.
- Server name should match the package/service it wraps; avoid generic names like `api-server`.

## Tool Design

- Prefer many small, composable tools over one giant "do everything" tool — agents can combine them, and errors are easier to localize.
- Balance full API coverage with a few high-value workflow tools for very common multi-step operations (e.g. `create_pr_with_review_request`).
- Keep each tool's input schema minimal but complete — every required field should be genuinely required, every optional field should have a sensible default documented in the description.
- Add examples directly in field descriptions (Zod/Pydantic `.describe()`), not just in prose docs — agents read schemas, not READMEs.

## Response Format

- Return structured data (`structuredContent` / `outputSchema`) whenever the SDK supports it — it lets clients parse results without scraping text.
- For text content, prefer Markdown over raw JSON dumps when the result is meant to be read by the model directly (tables, lists) — but return JSON when the agent is likely to post-process the result programmatically.
- Keep responses focused: return only the fields the agent is likely to need, not the entire upstream API payload. Provide a `fields` or `verbose` parameter if agents sometimes need more.

## Pagination

- Every "list" tool that can return more than ~50 items must paginate. Accept `cursor`/`page` and `limit`/`page_size` parameters with sane defaults and hard caps.
- Return a `next_cursor` (or equivalent) in the response so agents can continue without guessing offsets.
- Document the default and max page size directly in the parameter description.

## Transport

- **Streamable HTTP** for remote/hosted servers. Prefer stateless JSON responses over SSE streaming unless the tool genuinely needs incremental output — stateless is simpler to scale, load-balance, and debug.
- **stdio** for local servers (CLI-installed, run as a subprocess by the client). No network config, no auth handshake needed beyond env vars.
- Never mix transport assumptions into tool logic — keep transport selection in the server bootstrap only.

## Security

- Never log secrets (API keys, tokens, PII) — scrub them from error messages and structured logs.
- Validate all inputs at the schema layer (Zod/Pydantic) before they reach business logic; don't rely on the upstream API to reject bad input.
- Scope credentials to the minimum permissions the tool set actually needs; document required scopes in the server's README.
- Treat every tool as attacker-reachable input if the server is exposed to third-party agents — sanitize anything that flows into shell commands, file paths, or SQL.

## Error Handling

- Error messages must be actionable: state what went wrong, why, and what the agent should try next (e.g. "Missing `repo` parameter — pass `owner/repo`, not just `repo`").
- Distinguish user-fixable errors (bad input, missing permission) from transient/server errors (rate limit, timeout) so agents know whether to retry or change their call.
- Never swallow exceptions silently — surface them as tool errors, not empty successful responses.

## Annotations

Set these on every tool so clients (and agents) can reason about safety without calling the tool:

- `readOnlyHint` — true if the tool never mutates state.
- `destructiveHint` — true if the tool can delete or irreversibly change data.
- `idempotentHint` — true if calling it twice with the same input has the same effect as calling it once.
- `openWorldHint` — true if the tool's effect space is unbounded/external (e.g. web search) vs. a closed, well-defined domain.
