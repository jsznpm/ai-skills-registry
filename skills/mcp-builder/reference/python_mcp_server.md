# Python MCP Server Guide (FastMCP)

## Project Structure

```
my-mcp-server/
├── pyproject.toml
├── src/
│   └── my_mcp_server/
│       ├── __init__.py
│       ├── server.py       # FastMCP instance + entrypoint
│       ├── client.py        # API client (auth, base request wrapper)
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── create_issue.py
│       │   └── list_issues.py
│       └── format.py        # shared response formatting helpers
```

## pyproject.toml essentials

```toml
[project]
name = "my-mcp-server"
version = "1.0.0"
dependencies = [
    "mcp[cli]>=1.0.0",
    "pydantic>=2.0",
    "httpx>=0.27",
]

[project.scripts]
my-mcp-server = "my_mcp_server.server:main"
```

## Server Bootstrap (stdio)

```python
from mcp.server.fastmcp import FastMCP
from my_mcp_server.tools import register_tools

mcp = FastMCP("my-mcp-server")
register_tools(mcp)

def main():
    mcp.run(transport="stdio")

if __name__ == "__main__":
    main()
```

## Server Bootstrap (streamable HTTP, stateless)

```python
from mcp.server.fastmcp import FastMCP
from my_mcp_server.tools import register_tools

mcp = FastMCP("my-mcp-server", stateless_http=True)
register_tools(mcp)

def main():
    mcp.run(transport="streamable-http")

if __name__ == "__main__":
    main()
```

## Tool Registration Pattern

```python
from pydantic import BaseModel, Field
from mcp.server.fastmcp import FastMCP, Context
from my_mcp_server.client import api_client

class CreateIssueInput(BaseModel):
    repo: str = Field(..., description="Repository in owner/repo form, e.g. 'octocat/hello-world'")
    title: str = Field(..., min_length=1, description="Issue title")
    body: str | None = Field(None, description="Issue body in Markdown")

class CreateIssueOutput(BaseModel):
    number: int
    url: str

def register_create_issue(mcp: FastMCP):
    @mcp.tool(
        name="github_create_issue",
        description="Create a new issue in a GitHub repository.",
        annotations={
            "readOnlyHint": False,
            "destructiveHint": False,
            "idempotentHint": False,
            "openWorldHint": True,
        },
    )
    async def github_create_issue(input: CreateIssueInput) -> CreateIssueOutput:
        try:
            issue = await api_client.create_issue(input.repo, title=input.title, body=input.body)
            return CreateIssueOutput(number=issue["number"], url=issue["html_url"])
        except Exception as e:
            raise ValueError(
                f"Failed to create issue in {input.repo}: {e}. "
                "Check that 'repo' is in owner/repo form and your token has 'repo' scope."
            )
```

## Pagination Pattern

```python
class PaginationInput(BaseModel):
    cursor: str | None = Field(None, description="Opaque cursor from a previous response's next_cursor")
    limit: int = Field(25, ge=1, le=100, description="Max items to return (1-100, default 25)")
```

## Quality Checklist

- [ ] Every tool name is prefixed with the service name
- [ ] Every field uses `Field(..., description=...)` with an example
- [ ] Every mutating tool sets `destructiveHint`/`idempotentHint` correctly
- [ ] List tools accept `cursor`/`limit` and return `next_cursor`
- [ ] Errors raise with actionable messages, never bare exceptions
- [ ] Output models are defined and returned as structured Pydantic objects
- [ ] `python -m py_compile` (or `mypy`) passes with no errors
- [ ] Verified in MCP Inspector (`npx @modelcontextprotocol/inspector python -m my_mcp_server.server`)
- [ ] No secrets appear in logs or error messages
