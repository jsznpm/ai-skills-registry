---
name: mcp-builder
description: Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).
license: Complete terms in LICENSE.txt
---

# MCP Server Development Guide

## Overview

Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks.

---

# Process

## High-Level Workflow

Creating a high-quality MCP server involves four main phases:

### Phase 1: Deep Research and Planning

#### 1.1 Understand Modern MCP Design

**API Coverage vs. Workflow Tools:**
Balance comprehensive API endpoint coverage with specialized workflow tools. Workflow tools can be more convenient for specific tasks, while comprehensive coverage gives agents flexibility to compose operations. Performance varies by client — some clients benefit from code execution that combines basic tools, while others work better with higher-level workflows. When uncertain, prioritize comprehensive API coverage.

**Tool Naming and Discoverability:**
Clear, descriptive tool names help agents find the right tools quickly. Use consistent prefixes (e.g., `github_create_issue`, `github_list_repos`) and action-oriented naming.

**Context Management:**
Agents benefit from concise tool descriptions and the ability to filter/paginate results. Design tools that return focused, relevant data. Some clients support code execution which can help agents filter and process data efficiently.

**Actionable Error Messages:**
Error messages should guide agents toward solutions with specific suggestions and next steps.

#### 1.2 Study MCP Protocol Documentation

Navigate the MCP specification: start with the sitemap at `https://modelcontextprotocol.io/sitemap.xml`, then fetch specific pages with `.md` suffix for markdown format (e.g., `https://modelcontextprotocol.io/specification/draft.md`).

Key pages to review:
- Specification overview and architecture
- Transport mechanisms (streamable HTTP, stdio)
- Tool, resource, and prompt definitions

#### 1.3 Study Framework Documentation

**Recommended stack:**
- **Language**: TypeScript (high-quality SDK support, good compatibility across execution environments like MCPB, and AI models are good at generating well-typed TypeScript)
- **Transport**: Streamable HTTP for remote servers using stateless JSON (simpler to scale/maintain than stateful sessions); stdio for local servers

Load framework documentation:
- **MCP Best Practices**: [reference/mcp_best_practices.md](./reference/mcp_best_practices.md) — core guidelines
- **TypeScript SDK**: fetch `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`; see [reference/node_mcp_server.md](./reference/node_mcp_server.md)
- **Python SDK**: fetch `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`; see [reference/python_mcp_server.md](./reference/python_mcp_server.md)

#### 1.4 Plan Your Implementation

Review the target service's API docs to identify key endpoints, auth requirements, and data models (web search / fetch as needed). List endpoints to implement, prioritizing comprehensive coverage starting with the most common operations.

---

### Phase 2: Implementation

#### 2.1 Set Up Project Structure

See language-specific guides for project setup:
- [reference/node_mcp_server.md](./reference/node_mcp_server.md) — project structure, package.json, tsconfig.json
- [reference/python_mcp_server.md](./reference/python_mcp_server.md) — module organization, dependencies

#### 2.2 Implement Core Infrastructure

Create shared utilities: API client with authentication, error handling helpers, response formatting (JSON/Markdown), pagination support.

#### 2.3 Implement Tools

For each tool:

**Input Schema** — use Zod (TypeScript) or Pydantic (Python); include constraints, clear descriptions, and examples in field descriptions.

**Output Schema** — define `outputSchema` where possible; use `structuredContent` in tool responses (TypeScript SDK) so clients can process structured output.

**Tool Description** — concise summary, parameter descriptions, return type schema.

**Implementation** — async/await for I/O, actionable error handling, pagination support where applicable, return both text content and structured data when using modern SDKs.

**Annotations** — set `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`.

---

### Phase 3: Review and Test

#### 3.1 Code Quality

Review for: no duplicated code (DRY), consistent error handling, full type coverage, clear tool descriptions.

#### 3.2 Build and Test

**TypeScript**: `npm run build` to verify compilation; test with MCP Inspector (`npx @modelcontextprotocol/inspector`).

**Python**: `python -m py_compile your_server.py`; test with MCP Inspector.

See language-specific guides for detailed testing approaches and quality checklists.

---

### Phase 4: Create Evaluations

After implementing your MCP server, create comprehensive evaluations to test its effectiveness. Load [reference/evaluation.md](./reference/evaluation.md) for complete guidelines.

#### 4.1 Understand Evaluation Purpose

Use evaluations to test whether LLMs can effectively use your MCP server to answer realistic, complex questions.

#### 4.2 Create 10 Evaluation Questions

1. **Tool Inspection** — list available tools and understand their capabilities
2. **Content Exploration** — use READ-ONLY operations to explore available data
3. **Question Generation** — create 10 complex, realistic questions
4. **Answer Verification** — solve each question yourself to verify answers

#### 4.3 Evaluation Requirements

Each question must be:
- **Independent** — not dependent on other questions
- **Read-only** — only non-destructive operations required
- **Complex** — requiring multiple tool calls and deep exploration
- **Realistic** — based on real use cases humans would care about
- **Verifiable** — single, clear answer verifiable by string comparison
- **Stable** — answer won't change over time

#### 4.4 Output Format

```xml
<evaluation>
  <qa_pair>
    <question>Find discussions about AI model launches with animal codenames. One model needed a specific safety designation that uses the format ASL-X. What number X was being determined for the model named after a spotted wild cat?</question>
    <answer>3</answer>
  </qa_pair>
  <!-- More qa_pairs... -->
</evaluation>
```

---

# Reference Files

Load these as needed during development:

- [reference/mcp_best_practices.md](./reference/mcp_best_practices.md) — server/tool naming, response format (JSON vs Markdown), pagination, transport selection, security and error handling standards
- [reference/node_mcp_server.md](./reference/node_mcp_server.md) — TypeScript implementation guide: project structure, Zod schema patterns, `server.registerTool`, complete working examples, quality checklist
- [reference/python_mcp_server.md](./reference/python_mcp_server.md) — Python implementation guide: server init patterns, Pydantic models, `@mcp.tool`, complete working examples, quality checklist
- [reference/evaluation.md](./reference/evaluation.md) — evaluation creation guide: question guidelines, answer verification, XML format, examples, running evaluations

Also fetch live SDK docs when implementing:
- MCP spec sitemap: `https://modelcontextprotocol.io/sitemap.xml` (fetch pages with `.md` suffix)
- TypeScript SDK README: `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- Python SDK README: `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
