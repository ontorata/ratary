<p align="center">
  <img src="docs/assets/ratary-logo.svg" alt="Ratary" width="96" />
</p>

<h1 align="center">Ratary</h1>

<p align="center">
  <strong>The AI Brain Platform</strong><br/>
  Persistent memory, structured knowledge, and intelligent retrieval — for every AI you build.
</p>

<p align="center">
  <a href="https://ontorata.com">Website</a> ·
  <a href="https://github.com/ontorata/ratary">GitHub</a> ·
  <a href="docs/PANDUAN.md">Docs</a> ·
  <a href="https://ontorata.com/docs">API</a>
</p>

<p align="center">
  <a href="https://github.com/ontorata/ratary"><img src="https://img.shields.io/github/stars/ontorata/ratary?style=social" alt="GitHub stars"/></a>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"/>
  <img src="https://img.shields.io/badge/node-24.x-green" alt="Node 24"/>
  <img src="https://img.shields.io/badge/MCP-native-indigo" alt="MCP native"/>
  <img src="https://img.shields.io/badge/self--host-ready-brightgreen" alt="Self-host"/>
</p>

---

**Ratary is an AI Brain Platform that gives AI persistent memory, structured knowledge, intelligent retrieval, and continuous learning — without turning your stack into yet another agent framework.**

Built by [Ontorata](https://ontorata.com). Open source. Self-hostable. Designed for developers who ship production AI systems.

---

## The problem

Every AI session starts from zero.

Your model forgets yesterday's architecture decisions. Your agent loses customer context between runs. Your coding assistant can't remember why you chose Postgres over DynamoDB. Teams paste the same context into Cursor, Claude, ChatGPT, and custom bots — and still watch knowledge drift.

Vector databases store chunks. RAG pipelines retrieve documents. Agent frameworks orchestrate tools. **None of them give AI a durable brain.**

That's the gap Ratary closes.

---

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────────────┐
│                     Your AI Clients                             │
│   Cursor · Claude Code · Custom Agents · REST · ChatGPT Actions  │
└────────────────────────────┬────────────────────────────────────┘
                             │ MCP · REST · gRPC (opt-in)
┌────────────────────────────▼────────────────────────────────────┐
│                        Ratary Platform                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────────┐ │
│  │  Memory  │  │ Knowledge │  │ Retrieval│  │ Agent Runtime │ │
│  │  Layer   │  │   Graph   │  │  Engine  │  │   Boundary    │ │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └───────┬───────┘ │
│       └──────────────┴─────────────┴────────────────┘         │
│                         Shared Services                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              Storage & Infrastructure (pluggable)               │
│         D1 · PostgreSQL · pgvector · R2/S3 · Redis · Neo4j      │
└─────────────────────────────────────────────────────────────────┘
```

Ratary sits **between** your AI clients and your data — one brain, many surfaces.

---

## What is Ratary?

Ratary is **not**:

| | |
|---|---|
| ❌ A vector database | Vectors are one retrieval signal, not the product |
| ❌ A RAG framework | Ratary stores and retrieves *memory*, not just documents |
| ❌ An agent framework | Reasoning and planning stay in your agent — Ratary is the substrate |

Ratary **is** the **brain beneath** them.

A memory foundation that persists what AI learns, structures it as knowledge, retrieves it intelligently, and exposes it through protocols your stack already speaks — **MCP**, **REST**, and optional **gRPC**.

Use Ratary with LangChain, LangGraph, custom agents, IDE assistants, or enterprise search. **Bring your model. Ratary brings the memory.**

---

## Core capabilities

Organized by what you get — not how we built it.

### Memory
Durable, owner-scoped memories with summaries, codenames, favorites, archives, and handoffs. Built for long-running AI work — not ephemeral chat logs.

### Knowledge
Structured metadata, semantic enrichment, relation linking, and graph traversal. Memory becomes navigable knowledge — not a flat pile of notes.

### Reasoning support
Context assembly tuned for LLMs: progressive retrieval, token budgets, and summary-first defaults that cut context cost by **~85%** vs naive full dumps.

### Retrieval
Hybrid search across SQL, vectors, lexical index, and graph — ranked, bounded, and predictable. Separate browse (search) from inject (retrieval).

### Learning
Quality signals, reflection, consolidation, and evolution pipelines — optional, env-gated. Your brain gets smarter over time without retraining the model.

### Agent runtime boundary
Capability manifests, workspace/agent scoping, and 20 MCP tools — so external agents discover what the brain can do without embedding runtime inside Ratary.

### Platform
Pluggable adapters: Postgres, pgvector, R2/S3, Meilisearch, Neo4j, Redis, DuckDB. Start on Cloudflare D1. Scale to enterprise storage without rewriting app logic.

### Security
API keys, RBAC workspaces, audit trails, rate limits, and enterprise SSO/OPA (opt-in). Your data stays under your control.

### Cloud
Self-host locally, deploy to Vercel, or run a control plane with metering and federation (opt-in). No vendor lock-in on the memory layer.

### Observability
OpenTelemetry, Prometheus metrics, SLO dashboards, and usage analytics — know what your brain is doing in production.

### Developer experience
OpenAPI, TypeScript SDK (`@ratary/sdk`), CLI (`@ratary/cli`), standalone MCP package (`@ratary/mcp-server`), and one-command IDE setup (`npm run setup`).

---

## How Ratary works

```
  Write                    Enrich                   Retrieve
┌─────────┐              ┌─────────┐              ┌─────────────┐
│ AI saves│─────────────▶│ Summary │─────────────▶│ Rank & pack │
│ memory  │   async      │ embed   │   on demand  │ context for │
│ via MCP │              │ relate  │              │ your prompt │
│ or REST │              │ graph   │              │             │
└─────────┘              └─────────┘              └─────────────┘
      │                        │                         │
      └────────────────────────┴─────────────────────────┘
                    One brain · many AI clients
```

1. **Capture** — AI (or your app) saves memory through MCP or REST.
2. **Enrich** — Ratary summarizes, embeds, and links knowledge asynchronously.
3. **Retrieve** — When context is needed, Ratary assembles the smallest useful slice — not everything you ever stored.
4. **Reuse** — The same memory powers Cursor, Claude Code, custom bots, and enterprise APIs.

---

## Quick start

### Prerequisites

- **Node.js 24.x**
- A [Cloudflare](https://dash.cloudflare.com) account (D1 database)

### Install

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary
npm install
cp .env.example .env
# Fill CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID, D1_API_TOKEN, AUTH_SECRET
npm run db:migrate
npm run setup    # wires MCP for Cursor, Claude Code, and more
npm run dev
```

API: `http://localhost:3000` · Swagger: `http://localhost:3000/docs`

Full setup guide: **[docs/PANDUAN.md](docs/PANDUAN.md)**

### Docker

Ratary ships as a Node.js service. Container images are on the roadmap — today, run via `npm run dev` or deploy to [Vercel](https://vercel.com). For Postgres-backed enterprise stacks, set `SQL_PROVIDER=postgres` and configure adapters in `.env.example`.

### REST example

```bash
# Bootstrap once (empty database)
curl -X POST http://localhost:3000/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"name":"dev","client":{"name":"dev","type":"api"}}'

# Save memory
curl -X POST http://localhost:3000/api/v1/memory \
  -H "Authorization: Bearer aic_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Architecture decision","project":"my-app","content":"We chose event sourcing for audit trail.","tags":["architecture"]}'

# Search
curl "http://localhost:3000/api/v1/search?q=architecture" \
  -H "Authorization: Bearer aic_YOUR_KEY"
```

### SDK example

```typescript
import { RataryClient } from '@ratary/sdk';

const ratary = new RataryClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'aic_YOUR_KEY',
});

const caps = await ratary.capabilities.get();
console.log(caps.data.features);

const results = await ratary.memory.search({ q: 'architecture', limit: 5 });
console.log(results.data);
```

### MCP (IDE assistants)

After `npm run setup`, reload your editor. Ratary exposes **20 MCP tools** — `save_memory`, `search_memory`, `get_context`, `traverse_relations`, and more — shared across Cursor, Claude Code, Roo Code, Cline, Gemini CLI, and VS Code.

---

## Example use cases

| Use case | What Ratary gives you |
|----------|----------------------|
| **Coding assistant** | Persistent project memory across sessions, IDEs, and handoffs |
| **Customer support bot** | Durable customer context without re-prompting every ticket |
| **Enterprise search** | Hybrid retrieval over structured knowledge, not just file chunks |
| **Personal AI** | A private second brain you own — self-hosted, exportable |
| **Multi-agent systems** | One shared memory layer with workspace and agent scoping |
| **Knowledge management** | Graph-linked memories with codenames, relations, and summaries |
| **CI / automation** | REST API for bots that remember build decisions and incident postmortems |

---

## Capability matrix

| Capability | Ratary | Typical vector DB | Memory SaaS | Generic RAG |
|------------|:------:|:-----------------:|:-----------:|:-----------:|
| Persistent structured memory | ✅ | ❌ | ✅ | ⚠️ |
| MCP-native (IDE integration) | ✅ | ❌ | ⚠️ | ❌ |
| REST + OpenAPI + SDK | ✅ | ⚠️ | ✅ | ⚠️ |
| Hybrid retrieval (SQL + vector + graph) | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Knowledge graph & relations | ✅ | ❌ | ⚠️ | ❌ |
| Token-efficient context assembly | ✅ | ❌ | ⚠️ | ❌ |
| Multi-AI / workspace isolation | ✅ | ❌ | ⚠️ | ⚠️ |
| Self-host & data sovereignty | ✅ | ✅ | ❌ | ⚠️ |
| Agent runtime boundary (bring your agent) | ✅ | N/A | ⚠️ | N/A |
| Enterprise adapters (Postgres, Neo4j, R2…) | ✅ | ✅ | ⚠️ | ⚠️ |

---

## Architecture

Ratary follows a **ports-and-adapters** architecture. REST and MCP share the same application services — no duplicated business logic.

```
src/
  routes/           HTTP routing
  controllers/      Request/response mapping
  services/         MemoryService, retrieval, context assembly
  repositories/     Scoped data access
  ports/            Vendor-neutral contracts (ISqlDatabase, IVectorStore, …)
  infrastructure/   D1, Postgres, pgvector, R2, Redis, Neo4j adapters
  transport/mcp/    MCP server (20 tools)
  composition/      Wiring at server startup

packages/
  sdk/              @ratary/sdk — TypeScript client
  cli/              @ratary/cli — operator commands
  mcp-server/       @ratary/mcp-server — standalone MCP package
```

**Key boundaries:**

| Pipeline | Purpose |
|----------|---------|
| **Search** | Paginated browse for humans and APIs |
| **Retrieval** | Bounded, ranked candidates for LLM context |
| **Embedding** | Async enrichment — never blocks CRUD |

Deep dive: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

---

## Why Ratary?

| | Vector DB | Memory libraries | Traditional RAG | Agent frameworks |
|---|-----------|------------------|-------------------|------------------|
| **Primary job** | Similarity search | Key-value recall | Document Q&A | Tool orchestration |
| **Structured memory** | ❌ | ⚠️ | ❌ | ⚠️ |
| **Graph & relations** | ❌ | ❌ | ❌ | ⚠️ |
| **MCP for IDEs** | ❌ | ⚠️ | ❌ | ⚠️ |
| **Context token economics** | ❌ | ⚠️ | ❌ | ⚠️ |
| **Self-host sovereignty** | ✅ | ⚠️ | ⚠️ | ⚠️ |
| **Clear agent boundary** | N/A | N/A | N/A | ❌ (bundled) |

**Ratary doesn't replace your stack. It completes it.**

Point your vector DB at documents. Point your agent at tools. Point Ratary at **everything your AI needs to remember.**

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/PANDUAN.md](docs/PANDUAN.md) | Setup, daily usage, MCP configuration |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System structure and boundaries |
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/adr/](docs/adr/) | Architecture decision records |
| [.env.example](.env.example) | Full environment reference |
| `GET /docs` | Live OpenAPI (when server is running) |

---

## Roadmap

Themes we're building toward — not a sprint backlog.

| Theme | Direction |
|-------|-----------|
| **Universal memory** | One brain across every AI client and protocol |
| **Intelligent retrieval** | Smarter ranking, compression, and context packing |
| **Enterprise scale** | Postgres cutover, federation, SSO, quotas |
| **Knowledge fabric** | Connectors to external systems of record |
| **Global intelligence** | Telemetry, analytics, and cross-node sync |
| **Developer platform** | SDKs, CLI, remote MCP, plugin marketplace |
| **Production ops** | Observability, SLOs, and cost visibility |

Ratary ships stable runtime on [github.com/ontorata/ratary](https://github.com/ontorata/ratary). Enterprise modules are **opt-in via environment flags** — defaults stay lean.

---

## Contributing

We welcome contributions from AI engineers, platform builders, and open source developers.

1. Fork the repository
2. Create a feature branch
3. Run `npm run lint` and `npm run build`
4. Open a pull request with a clear description

For local development with the full test suite and governance docs, clone the [development mirror](https://github.com/lutfi04/ai-brain) which includes additional tooling not shipped in the production repo.

Questions: [hello@ontorata.com](mailto:hello@ontorata.com)

---

## Vision

> **AI should remember. Developers should own that memory.**

Ratary exists because the next generation of AI systems won't be judged by how clever a single prompt is — but by how well they **accumulate knowledge**, **respect boundaries**, and **stay coherent across time**.

We're building the brain layer the industry is missing: open, portable, self-hostable, and protocol-native. Not another chat wrapper. Not another vector dump. A **real memory platform** for the age of agents.

**Bring your model. Bring your agent. Ratary brings the brain.**

---

<p align="center">
  <sub>
    Ratary · by <a href="https://ontorata.com">Ontorata</a> ·
    <a href="https://www.linkedin.com/in/lutfiramadhan/">Lutfi Ramadhan</a> ·
    MIT License
  </sub>
</p>
