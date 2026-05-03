# 01 — Claude Ecosystem (2026)

## 1.1 Current Claude models — IDs, context, pricing

| Model | Primary API ID | Aliases / Snapshots | Context | Max Output | Input $/MTok | Output $/MTok | 5m Cache Write | 1h Cache Write | Cache Read |
|---|---|---|---|---|---|---|---|---|---|
| Claude Opus 4.7 | `claude-opus-4-7` | dated snapshot tbd | 1M | 128k | $5 | $25 | $6.25 | $10 | $0.50 |
| Claude Opus 4.6 | `claude-opus-4-6` | — | 1M | 128k | $5 | $25 | $6.25 | $10 | $0.50 |
| Claude Opus 4.5 | `claude-opus-4-5` | — | 200k | 64k | $5 | $25 | $6.25 | $10 | $0.50 |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | — | 1M | 64k | $3 | $15 | $3.75 | $6 | $0.30 |
| Claude Sonnet 4.5 | `claude-sonnet-4-5` | `claude-sonnet-4-5-20250929` | 1M (beta) | 64k | $3 | $15 | $3.75 | $6 | $0.30 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | `claude-haiku-4-5-20251001` | 200k | 64k | $1 | $5 | $1.25 | $2 | $0.10 |

**Cache pricing rule**: 5m write = 1.25× base input; 1h write = 2.0× base input; cache read = 0.1× base input.
**Batch API**: 50% discount on input and output (stacks with caching).
**1M context beta header**: `context-1m-2025-08-07` on Sonnet 4.5. Opus 4.7/4.6 and Sonnet 4.6 are 1M natively.

## 1.2 Model capabilities and best-fit tasks

| Model | Best for | Notes |
|---|---|---|
| Opus 4.7 | Frontier reasoning, long-horizon agents, research, complex code | New tokenizer (+up to 35% tokens vs 4.6); extended thinking `budget_tokens` deprecated — adaptive only |
| Opus 4.6 | Same class as 4.7, slightly older knowledge | Supports adaptive thinking, `effort` levels |
| Sonnet 4.6 | Default workhorse, agents, code, computer use | Best balance; free code execution with web search/fetch |
| Sonnet 4.5 | Long-context (1M), stable workhorse | Extended thinking `budget_tokens` still works |
| Haiku 4.5 | Fast, cheap, high volume, realtime UX | 200k context, supports extended thinking with `budget_tokens` |

**Thinking parameter modes**:
- Legacy (Sonnet 4.5, Haiku 4.5): `thinking={"type":"enabled","budget_tokens":N}` (min 1024).
- Adaptive (Opus 4.6/4.7, Sonnet 4.6): `thinking={"type":"adaptive"}` + `output_config={"effort": "low|medium|high|xhigh|max"}`. `budget_tokens` returns 400.
- Interleaved thinking (Claude 4+): beta header `interleaved-thinking-2025-05-14` (thinking between tool calls).

**Vision**: Opus 4.7 = 2576px / 3.75MP max; earlier models = 1568px / 1.15MP.
**Knowledge cutoff**: Opus 4.7 reliable Jan 2026; Sonnet 4.6 reliable Aug 2025, training Jan 2026.

## 1.3 Claude.ai consumer features

| Feature | Description |
|---|---|
| Artifacts | Standalone side-panel renders for HTML, React, SVG, Mermaid, Markdown, PDF, code. Publishable, shareable, connectable to MCP on paid plans. |
| Projects | Persistent workspaces: uploaded files, custom instructions, 200k+ context, per-project chat history. |
| Memory | User-controlled cross-conversation recall (workspace-scoped, explicit retrieval, no automatic profiling). |
| Styles | Preset (Formal, Concise, Explanatory) or custom tone via the "+" menu. |
| Computer Use | Screenshot + mouse/keyboard tool for agents (tool name `computer_20250124` or newer). Sonnet 4.6 most accurate. |
| File Creation | Generates .docx, .xlsx, .pptx, .pdf via code-execution sandbox using official Skills. |
| Skills | Packaged capability folders (Oct 16, 2025 launch). Progressive disclosure. Pro/Max/Team/Enterprise. |
| Web Search | Built-in tool with citations. API price $10 / 1000 searches. |
| Deep Research / Extended Research | Multi-source agentic flow synthesizing web + connectors + files into structured report. |
| Past chats | Searchable history; Memory can reference explicitly on request. |

## 1.4 Claude API features with runnable examples

### Tool use

```python
import anthropic
client = anthropic.Anthropic()
r = client.messages.create(
    model="claude-sonnet-4-6", max_tokens=1024,
    tools=[{
        "name":"get_weather",
        "description":"Get weather for a location.",
        "input_schema":{"type":"object","properties":{"location":{"type":"string"}},"required":["location"]}
    }],
    messages=[{"role":"user","content":"Weather in SF?"}]
)
```

`tool_choice`: `"auto" | "none" | "any" | {"type":"tool","name":"..."}`.

### Prompt caching (`cache_control`, 5m / 1h)

```python
client.messages.create(
    model="claude-sonnet-4-6", max_tokens=1024,
    system=[
        {"type":"text","text":"You are a helpful assistant."},
        {"type":"text","text": BIG_DOC, "cache_control":{"type":"ephemeral","ttl":"1h"}}
    ],
    messages=[{"role":"user","content":"Summarize."}]
)
# usage: cache_creation_input_tokens, cache_read_input_tokens, input_tokens
```

Rules: up to **4 cache breakpoints** per request. Min cacheable block: **1024 tokens** (Sonnet/Opus), **2048** (Haiku 3.5). Processing order `tools → system → messages`; higher-level change invalidates lower. 1h segments must precede 5m segments when mixed.

### Extended / adaptive thinking

```python
# Sonnet 4.5 / Haiku 4.5 (legacy)
r = client.messages.create(model="claude-sonnet-4-5", max_tokens=16000,
    thinking={"type":"enabled","budget_tokens":10000},
    messages=[{"role":"user","content":"..."}])

# Opus 4.7/4.6, Sonnet 4.6 (adaptive)
r = client.messages.create(model="claude-opus-4-7", max_tokens=128000,
    thinking={"type":"adaptive"},
    output_config={"effort":"high"},
    messages=[{"role":"user","content":"..."}])
```

### Vision / PDF input

```python
{"type":"image","source":{"type":"base64","media_type":"image/jpeg","data": B64}}
```

PDF input uses the same shape with `"type":"document"`, `media_type:"application/pdf"`.

### Message Batches API (50% off)

```python
batch = client.messages.batches.create(requests=[
    {"custom_id":"r1","params":{"model":"claude-sonnet-4-6","max_tokens":1024,
        "messages":[{"role":"user","content":"Hello"}]}},
])
# poll:
client.messages.batches.retrieve(batch.id)
client.messages.batches.results(batch.id)  # JSONL
```

### Streaming (SSE)

```python
with client.messages.stream(model="claude-sonnet-4-6", max_tokens=1024,
    messages=[{"role":"user","content":"Hi"}]) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Required when `max_tokens > 21333` with extended thinking.

## 1.5 Claude Code (CLI)

Install:

```bash
npm install -g @anthropic-ai/claude-code          # Node 18+, v22 LTS recommended. No sudo.
curl -fsSL https://claude.ai/install.sh | bash    # Native (no Node)
brew install --cask claude-code                   # macOS
irm https://claude.ai/install.ps1 | iex           # Windows
```

Package: `@anthropic-ai/claude-code` (~2.1.x, May 2026). Platforms: darwin/linux/win32, arm64/x64.

Common commands:

```
claude              # interactive session in cwd
claude --version
claude update
claude doctor
claude mcp list
claude mcp add github -- npx -y @modelcontextprotocol/server-github
claude mcp add --transport http myserv https://example.com/mcp
```

In-session slash commands: `/model`, `/skills`, `/bug`, `/compact`, `/debug`, `/help`, `/loop`, `/batch`, `/claude-api`.

Config files (hierarchical):
- `~/.claude/settings.json` — user
- `.claude/settings.json` — project (committed)
- `.claude/settings.local.json` — gitignored overrides
- `.mcp.json` — MCP servers, project root
- `CLAUDE.md` — project context loaded at startup (hierarchical in monorepos)

Model aliases: `opus`, `sonnet`, `haiku`, `opusplan` (Opus plans → Sonnet executes).
IDE integrations: VS Code extension, JetBrains plugin (beta), Desktop app (Mac/Windows).
Plan: requires Pro/Max/Team/Enterprise or API credits.

## 1.6 Other Claude products

| Product | What it is |
|---|---|
| Claude for Chrome | Browser extension/connector. Claude navigates tabs, extracts info, fills forms. Max plan + all Pro users via connector. |
| Claude in Excel | Excel side-panel add-in. Reads multi-tab workbooks with cell-level citations, traces `#REF!`/`#DIV/0!`, builds pivots/charts, runs Skills. Shortcut Ctrl+Opt+C (Mac) / Ctrl+Alt+C (Win). Sibling products: Word, PowerPoint, Slack. |
| Claude Cowork | Agentic desktop knowledge-work app. Multi-step end-to-end tasks (research → Excel/PPT). Scheduled/recurring tasks. Approval-plan before acting. Research preview for Pro/Max. |

## 1.7 Model Context Protocol (MCP)

Open JSON-RPC 2.0 standard connecting LLMs to external tools/data. Spec: **modelcontextprotocol.io**.

**SDKs**: Python (`pip install mcp`, FastMCP style), TypeScript (`@modelcontextprotocol/sdk`), plus Kotlin, Java, C#, Swift, Rust.

**Transports**:
- `stdio` — subprocess, newline-delimited JSON-RPC. Local default.
- **Streamable HTTP** (current spec, 2025-03-26) — single endpoint, POST + optional SSE responses. Replaces legacy HTTP+SSE.
- `SSE` (legacy, deprecated) — separate SSE stream + POST endpoint.

**Official reference servers** (`github.com/modelcontextprotocol/servers`): Everything, Fetch, Filesystem (`@modelcontextprotocol/server-filesystem`), Git (`uvx mcp-server-git`), Memory (`@modelcontextprotocol/server-memory`), Sequential Thinking, Time.

**Archived reference servers** (maintained now by the companies themselves): GitHub, GitLab, Google Drive, Google Maps, Slack, Postgres, Puppeteer, Redis, Sentry, Brave Search, EverArt, AWS KB Retrieval.

**Connectors in Claude.ai**: Google Drive, Gmail, Calendar, Slack, GitHub, Asana, Atlassian/Jira, Notion, Linear, Canva (hosted by Anthropic). Desktop app supports local extensions + Claude for Chrome as a connector.

Example `.mcp.json`:

```json
{"mcpServers":{
  "filesystem":{"command":"npx","args":["-y","@modelcontextprotocol/server-filesystem","/Users/u/Docs"]},
  "git":{"command":"uvx","args":["mcp-server-git","--repository","/path/to/repo"]},
  "github":{"command":"npx","args":["-y","@modelcontextprotocol/server-github"],
            "env":{"GITHUB_PERSONAL_ACCESS_TOKEN":"<TOKEN>"}},
  "postgres":{"command":"npx","args":["-y","@modelcontextprotocol/server-postgres","postgresql://localhost/mydb"]}
}}
```
