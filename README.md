# ⚡ AI Frontend Generator (Multi-Agent)

> Transform natural language into production-ready Vue 3 / Uniapp components using a multi-agent AI pipeline.

## Overview

This project is an AI-driven frontend page generator built on a **Multi-Agent architecture**. Describe the page you want in plain English, and the system orchestrates five specialized AI agents to analyze, design, plan, generate, and validate complete Vue 3 or Uniapp code.

## Features

- 🗣️ **Natural language → Page structure** — Describe what you need, get working code
- 🤖 **Multi-agent collaboration** — Five specialized agents work in sequence
- 💚 **Vue 3 / Uniapp code generation** — Complete Single File Components (.vue)
- ✅ **Self-validation and optimization** — Automatic quality check and refinement
- ⚡ **Real-time streaming** — Watch each agent work via Server-Sent Events
- 🌙 **Dark / light theme** — Modern UI with theme toggle
- 🔌 **MiMo API integration** — Plug in any OpenAI-compatible LLM

## Architecture

```
User Input
    │
    ▼
┌─────────────────────┐
│  Requirement Agent  │  Parses intent, extracts features, target platform
└──────────┬──────────┘
           │
    ▼
┌─────────────────────┐
│  Structure Agent    │  Designs layout, sections, navigation
└──────────┬──────────┘
           │
    ▼
┌─────────────────────┐
│  Component Agent    │  Plans Vue component hierarchy
└──────────┬──────────┘
           │
    ▼
┌─────────────────────┐
│    Code Agent       │  Generates Vue 3 SFCs / Uniapp pages
└──────────┬──────────┘
           │
    ▼
┌─────────────────────┐
│  Validation Agent   │  Validates, scores, and optimizes output
└──────────┬──────────┘
           │
    ▼
  Output (files: .vue)
```

## Project Structure

```
ai-frontend-generator/
├── backend/                        # Node.js + Express API
│   ├── src/
│   │   ├── agents/
│   │   │   ├── requirementAgent.js # Analyzes user intent
│   │   │   ├── structureAgent.js   # Designs page layout
│   │   │   ├── componentAgent.js   # Plans component tree
│   │   │   ├── codeAgent.js        # Generates Vue code
│   │   │   └── validationAgent.js  # Validates output
│   │   ├── mimoClient.js           # MiMo / OpenAI-compatible LLM client
│   │   ├── orchestrator.js         # Pipeline coordinator
│   │   └── server.js               # Express server (SSE endpoint)
│   ├── .env.example
│   └── package.json
│
└── frontend/                       # Vue 3 + Vite app
    ├── src/
    │   ├── components/
    │   │   ├── InputPanel.vue      # User input & platform selector
    │   │   ├── AgentPipeline.vue   # Live pipeline progress display
    │   │   └── CodeOutput.vue      # File browser + syntax-highlighted viewer
    │   ├── stores/
    │   │   └── generator.js        # Pinia store (SSE consumer)
    │   ├── App.vue                 # Root layout + theme toggle
    │   └── main.js
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### 1. Start the Backend

```bash
cd backend
npm install

# Optional: configure a real LLM API
cp .env.example .env
# Edit .env and set MIMO_API_KEY (works without it via built-in mock)

npm start
# → http://localhost:3000
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. Open in Browser

Navigate to **http://localhost:5173**, type a description of your page, choose Vue 3 or Uniapp, and click **Generate Code**.

## API Reference

### `POST /api/generate`

Streams generation progress via Server-Sent Events.

**Request body:**
```json
{
  "prompt": "A todo app with categories and filters",
  "platform": "vue"
}
```

**SSE event types:**

| `type`     | Description |
|------------|-------------|
| `progress` | An agent changed state — includes `agent`, `status`, `message`, `progress` (0-100) |
| `complete` | Pipeline finished — includes `result.files[]` |
| `error`    | Pipeline failed — includes `message` |

### `GET /api/health`

Returns server health and active configuration.

## LLM / MiMo API Integration

The backend uses an OpenAI-compatible API client (`mimoClient.js`). To connect a real model:

1. Copy `.env.example` to `.env`
2. Set the variables:

```env
MIMO_API_KEY=your_key_here
MIMO_API_BASE_URL=https://api.mimo.ai/v1   # or any OpenAI-compatible endpoint
MIMO_MODEL=mimo-7b
```

Without an API key the system runs a **built-in mock** that generates realistic, working Vue 3 component templates — great for development and demos.

## Roadmap

- [x] Basic prompt → page demo
- [x] Multi-agent orchestration
- [x] MiMo API integration
- [ ] Download generated files as ZIP
- [ ] Live preview in iframe
- [ ] More component templates (forms, tables, charts)
- [ ] Uniapp-specific page generation
- [ ] History / saved generations

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | Vue 3, Vite, Pinia |
| Backend  | Node.js, Express |
| Streaming | Server-Sent Events |
| AI API   | MiMo / OpenAI-compatible |

## License

MIT