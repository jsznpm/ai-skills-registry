# TypeScript MCP Server Guide

## Project Structure

```
my-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # server bootstrap, transport wiring
│   ├── client.ts          # API client (auth, base fetch wrapper)
│   ├── tools/
│   │   ├── index.ts       # registers all tools
│   │   ├── create-issue.ts
│   │   └── list-issues.ts
│   └── format.ts          # shared response formatting helpers
└── dist/                  # build output (tsup/tsc)
```

## package.json essentials

```json
{
  "name": "my-mcp-server",
  "type": "module",
  "bin": { "my-mcp-server": "./dist/index.js" },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "dev": "tsup src/index.ts --format esm --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0"
  }
}
```

## Server Bootstrap (stdio)

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";

const server = new McpServer({ name: "my-mcp-server", version: "1.0.0" });
registerTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Server Bootstrap (streamable HTTP, stateless)

```ts
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerTools } from "./tools/index.js";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const server = new McpServer({ name: "my-mcp-server", version: "1.0.0" });
  registerTools(server);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(process.env.PORT ?? 3000);
```

## Tool Registration Pattern

```ts
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiClient } from "../client.js";

const CreateIssueInput = z.object({
  repo: z.string().describe("Repository in owner/repo form, e.g. 'octocat/hello-world'"),
  title: z.string().min(1).describe("Issue title"),
  body: z.string().optional().describe("Issue body in Markdown"),
});

const CreateIssueOutput = z.object({
  number: z.number(),
  url: z.string().url(),
});

export function registerCreateIssue(server: McpServer) {
  server.registerTool(
    "github_create_issue",
    {
      title: "Create GitHub Issue",
      description: "Create a new issue in a GitHub repository.",
      inputSchema: CreateIssueInput,
      outputSchema: CreateIssueOutput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ repo, title, body }) => {
      try {
        const issue = await apiClient.createIssue(repo, { title, body });
        const structured = { number: issue.number, url: issue.html_url };
        return {
          content: [{ type: "text", text: `Created issue #${issue.number}: ${issue.html_url}` }],
          structuredContent: structured,
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create issue in ${repo}: ${(err as Error).message}. Check that 'repo' is in owner/repo form and your token has 'repo' scope.` }],
        };
      }
    }
  );
}
```

## Pagination Helper

```ts
export const PaginationInput = z.object({
  cursor: z.string().optional().describe("Opaque cursor from a previous response's next_cursor"),
  limit: z.number().int().min(1).max(100).default(25).describe("Max items to return (1-100, default 25)"),
});
```

## Quality Checklist

- [ ] Every tool name is prefixed with the service name
- [ ] Every input field has a `.describe()` with an example
- [ ] Every mutating tool sets `destructiveHint`/`idempotentHint` correctly
- [ ] List tools accept `cursor`/`limit` and return `next_cursor`
- [ ] Errors are caught and returned as `isError: true` with actionable text, never thrown raw
- [ ] `structuredContent` is set whenever `outputSchema` is defined
- [ ] `npm run build` compiles with no type errors
- [ ] Verified in MCP Inspector (`npx @modelcontextprotocol/inspector node dist/index.js`)
- [ ] No secrets appear in logs or error messages
