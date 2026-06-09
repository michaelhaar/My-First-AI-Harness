# My First AI Coding Harness

A lightweight, local AI coding assistant that runs entirely on your machine. It connects to any OpenAI-compatible LLM API and gives the model the ability to read files, write files, edit files, and execute bash commands — turning a chat model into an interactive coding agent.

Designed for **educational purposes** to understand how AI coding tools (like Cursor, GitHub Copilot Workspace, or Claude Code) work under the hood.

![Screenshot](screenshot.png)

## Features

- **Local-first** — Runs on your own machine, no cloud dependency
- **Model-agnostic** — Works with any OpenAI-compatible API endpoint
- **Tool calling** — The LLM can read, write, edit, and execute code
- **Streaming responses** — Real-time token-by-token output
- **Reasoning display** — Optional visibility into the model's chain-of-thought
- **Terminal UI** — Clean, colored output with tool execution feedback

## Tools Available

| Tool | Description |
|------|-------------|
| `read` | Read file contents (first 2000 lines by default, supports offset/limit) |
| `write` | Create or overwrite files (auto-creates parent directories) |
| `edit_file` | Surgical text replacement in existing files |
| `execute_bash` | Run shell commands with optional timeout |
| `get_time` | Return the current time in ISO format |

## Quick Start

```bash
# Install dependencies
npm install

# Run the harness
npm run dev
```

## Configuration

The LLM endpoint, API key, and model are configured via **environment variables** (with sensible defaults):

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_BASE_URL` | `http://127.0.0.1:8000/v1` | OpenAI-compatible API base URL |
| `LLM_API_KEY` | `12345` | API key for authentication |
| `LLM_MODEL` | `Qwen3.6-35B-A3B-oQ4-fp16-mtp` | Model identifier |

UI settings are also configurable:

| Variable | Default | Description |
|----------|---------|-------------|
| `NO_COLOR` | (unset) | Set to any value to disable colored output |
| `SHOW_REASONING` | `false` | Set to `1` to display the model's reasoning |
| `DEBUG_TOOLS` | `false` | Set to `1` for verbose tool argument logging |
| `MAX_TOOL_PREVIEW_CHARS` | `300` | Max characters shown in tool summaries |

## Commands

| Command | Description |
|---------|-------------|
| `/help` | List available commands |
| `/clear` | Clear conversation history |
| `/model` | Show current model |
| `/exit`, `/quit` | Exit the harness |

## How It Works

```
┌──────────┐     user input      ┌──────────┐
│  Agent   │ ──────────────────► │   LLM    │
│  (REPL)  │ ◄────────────────── │  (API)   │
└──────────┘   tool results      └──────────┘
     │                    ▲
     │  tool calls        │
     ▼                    │
┌──────────┐              │
│  Tools   │ ─────────────┘
│ (read,   │   execution results
│ write,   │
│ edit,    │
│ bash,    │
│ time)    │
└──────────┘
```

1. You type a request in the REPL
2. The conversation (including system message + history) is sent to the LLM via streaming
3. If the LLM requests a tool call, the harness executes it locally
4. Tool results are fed back into the conversation as messages
5. This loop continues until the LLM returns a final text response

## Project Structure

```
├── agent.ts        # Main REPL loop & conversation manager
├── llm.ts          # LLM streaming & tool execution logic
├── config.ts       # Configuration & system prompt
├── ui.ts           # Terminal UI helpers
├── tools/          # LLM tool definitions & handlers
│   ├── base.ts
│   ├── read-file.ts
│   ├── write-file.ts
│   ├── edit-file.ts
│   ├── execute-bash.ts
│   └── get_time.ts
├── package.json
└── tsconfig.json
```

## Tech Stack

- **TypeScript 6** with strict mode
- **Node.js** (native modules only — no bundler needed)
- **[openai](https://www.npmjs.com/package/openai)** npm package for API communication
- Any **OpenAI-compatible** backend (Ollama, vLLM, LM Studio, etc.)

## License

MIT
