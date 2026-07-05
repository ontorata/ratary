<p align="center">
  <img src="docs/assets/ratary-logo.svg" alt="Ratary" width="96" />
</p>

<h1 align="center">Ratary</h1>

<p align="center">
  <strong>Build AI that remembers.</strong>
</p>

<p align="center">
  Ratary is the open-source <strong>AI Brain Platform</strong> — persistent memory,<br/>
  structured knowledge, and intelligent retrieval for every model and agent you run.
</p>

<p align="center">
  <a href="#quick-start"><strong>Get started →</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/ontorata/ratary">Star on GitHub</a>
  &nbsp;·&nbsp;
  <a href="https://ontorata.com">Website</a>
  &nbsp;·&nbsp;
  <a href="docs/PANDUAN.md">Docs</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"/>
  <img src="https://img.shields.io/badge/MCP-native-indigo" alt="MCP native"/>
  <img src="https://img.shields.io/badge/self--host-ready-brightgreen" alt="Self-host"/>
  <img src="https://img.shields.io/badge/node-24.x-green" alt="Node 24"/>
</p>

<p align="center"><sub><em>Ratary is where AI remembers.</em> · Built by <a href="https://ontorata.com">Ontorata</a></sub></p>

---

## The problem

Every AI session starts from zero.

Your model forgets yesterday's architecture decisions. Your agent drops customer context between runs. Your coding assistant can't recall why you chose Postgres over DynamoDB. Teams paste the same background into Cursor, Claude, ChatGPT, and custom bots — and knowledge still drifts.

Vector databases store chunks. RAG pipelines retrieve documents. Agent frameworks orchestrate tools.

**None of them give AI a durable brain.**

---

## Why Ratary exists

AI models are getting cheaper. Context windows are getting larger. Agents are getting capable.

**But AI still forgets.**

The bottleneck is no longer reasoning. It's **memory** — durable, structured, retrievable, and owned by you.

Every serious application eventually needed a database. Every serious AI system will need a **brain layer**: persistent intelligence that sits between your models and your storage — independent of any single vendor, IDE, or agent framework.

> **AI should remember.**  
> **Developers should own that memory.**

Ratary exists to be that layer. Applications bring models. **Ratary brings the brain.**

---

## What Ratary is

Ratary is an **AI Brain Platform** — infrastructure that gives AI:

- **Persistent memory** — durable, owner-scoped, versioned
- **Structured knowledge** — metadata, relations, graph traversal
- **Intelligent retrieval** — hybrid search + bounded context assembly
- **Protocol access** — MCP, REST, optional gRPC

It sits **between** AI clients and storage. One brain, many surfaces — Cursor, Claude Code, custom agents, enterprise APIs, and remote MCP hosts.

**Bring your model. Ratary brings the memory.**

---

## What Ratary is not

| | Vector DB | Memory API | RAG | Agent framework | **Ratary** |
|---|:---:|:---:|:---:|:---:|:---:|
| **Primary job** | Similarity search | Key-value recall | Document Q&A | Tool orchestration | **Durable AI memory** |
| **Structured knowledge & graph** | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| **MCP-native IDE integration** | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| **Token-efficient context assembly** | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| **Self-host & data sovereignty** | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| **Clear agent boundary** | N/A | ⚠️ | N/A | ❌ bundled | ✅ substrate only |

Ratary **complements** your stack — it does not replace pgvector, LangGraph, or your agent of choice.

<details>
<summary><strong>Why not just pgvector, Mem0, Letta, LangGraph, or RAG?</strong></summary>

| If you only use… | You get… | What you miss |
|------------------|----------|---------------|
| **pgvector** | Embedding similarity | Structured memory, graph, MCP, context packing |
| **Mem0** | Fast hosted memory API | Full self-host, hybrid retrieval, enterprise adapters |
| **Letta** | Agent + memory bundled | Your agent stays yours — Ratary is substrate, not runtime |
| **LangGraph** | Workflow & tool routing | Shared durable memory across sessions and clients |
| **RAG** | Document chunks | Evolving memory — decisions, handoffs, relations |

</details>

---

## Visual architecture

```
        ┌─────────────────────────────────────────┐
        │           Your AI applications           │
        │  Cursor · Claude · Agents · REST · MCP   │
        └────────────────────┬────────────────────┘
                             │
                    MCP · REST · gRPC
                             │
        ┌────────────────────▼────────────────────┐
        │              RATARY PLATFORM             │
        │  ┌─────────┐ ┌──────────┐ ┌───────────┐ │
        │  │ Memory  │ │Knowledge │ │ Retrieval │ │
        │  └────┬────┘ └────┬─────┘ └─────┬─────┘ │
        │       └───────────┴─────────────┘       │
        │         Context · Learning · Protocols   │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │     Pluggable storage (your choice)      │
        │   D1 · Postgres · pgvector · Neo4j · R2   │
        └─────────────────────────────────────────┘
```

**Search** browses. **Retrieval** injects context. **Embedding** enriches asynchronously — never on the CRUD hot path.

Details: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

---

## Core capabilities

### Memory intelligence
Durable memories with summaries, codenames, favorites, archives, and handoffs. Version history with restore and merge — built for long-running work, not chat logs.

### Knowledge
Semantic enrichment, relation linking, and graph traversal. Memory becomes navigable knowledge — not a flat pile of notes.

### Retrieval
Hybrid search across SQL, vectors, lexical index, and graph. Separate **browse** from **inject**. Optional precision modes (hybrid, semantic, fulltext, title) when you need more control.

### Reasoning support
Progressive retrieval, token budgets, and summary-first context assembly — typically **~85% fewer tokens** than dumping full memory bodies into prompts.

### Learning
Quality signals, consolidation, and compression — optional pipelines that improve the brain over time without retraining your model.

### Agent runtime
Capability manifests, workspace scoping, and **28 MCP tools**. External agents discover what the brain can do; Ratary never embeds agent reasoning.

### Platform
Pluggable adapters: Postgres, pgvector, R2/S3, Meilisearch, Neo4j, Redis, DuckDB. Start on Cloudflare D1. Scale without rewriting application logic.

### Cloud & enterprise
Self-host, deploy to Vercel, or run a control plane with metering and federation. RBAC workspaces, audit trails, SSO, and policy hooks — opt-in when you need them.

### Observability
OpenTelemetry, Prometheus metrics, SLO dashboards, and cost visibility for production brains.

### Developer experience
OpenAPI, `@ratary/sdk`, `@ratary/cli`, `@ratary/mcp-server`, and one-command IDE setup (`npm run setup`).

---

## How Ratary works

```
   Write          Enrich         Retrieve        Learn          Reuse
     │               │               │              │              │
     ▼               ▼               ▼              ▼              ▼
  Save via       Summarize,      Rank & pack    Signals,       Same memory
  MCP/REST       embed, link     context for    consolidate,   powers every
                 relations       your prompt    evolve         client
```

1. **Write** — Persist memory through MCP or REST.
2. **Enrich** — Summarize, embed, and relate — asynchronously.
3. **Retrieve** — Assemble the smallest useful context slice.
4. **Learn** — Optional signals and consolidation improve recall over time.
5. **Reuse** — One brain across IDEs, agents, and APIs.

---

## Ecosystem

Ratary is a platform — not a single binary.

```
┌─────────────────────────────────────────────────────────────┐
│                      Ratary Cloud (opt-in)                   │
│              hosted brain · metering · federation              │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Ratary Server          ← this repo · memory · REST · MCP     │
└──────────────────────────────┬──────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   @ratary/sdk    @ratary/cli   @ratary/mcp-server   Ontorata Studio *
         │              │              │              (future)
         └──────────────┴──────────────┴──────────────┘
                               │
                               ▼
                          Ontory
              consumer AI assistant · built on Ratary
```

**Ratary Server** is the source of truth. Everything else connects to it. **Ontorata Studio** is the operator console (Ontorata ecosystem); MCP stays **`ratary`**.

---

## Use cases

| | What you build | What Ratary provides |
|---|----------------|---------------------|
| **Developer AI** | Coding assistants across IDEs and sessions | Persistent project memory, MCP tools, handoffs |
| **Enterprise search** | Internal knowledge discovery | Hybrid retrieval over structured memory, not just files |
| **Customer support** | AI that handles tickets | Durable customer context without re-prompting every thread |
| **Knowledge management** | Team second brain | Graph-linked memories, codenames, relations, summaries |
| **Autonomous agents** | Multi-agent systems | Shared memory layer with workspace and agent scoping |
| **Personal AI** | Private assistant you own | Self-hosted, exportable, sovereign data |

---

## Capability matrix

| Capability | Ratary | Vector DB | Memory API | RAG | Agent framework |
|------------|:------:|:---------:|:----------:|:---:|:---------------:|
| Persistent structured memory | ✅ | ❌ | ⚠️ | ❌ | ⚠️ |
| MCP-native | ✅ | ❌ | ⚠️ | ❌ | ⚠️ |
| Hybrid SQL + vector + graph | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Token-efficient context assembly | ✅ | ❌ | ⚠️ | ❌ | ⚠️ |
| Knowledge graph & relations | ✅ | ❌ | ⚠️ | ❌ | ⚠️ |
| Self-host sovereignty | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Agent boundary (bring your agent) | ✅ | N/A | ⚠️ | N/A | ❌ |
| Enterprise storage adapters | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |

---

## Quick start

**Prerequisites:** Node.js 24 · [Cloudflare](https://dash.cloudflare.com) account (D1)

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary && npm install
cp .env.example .env   # fill D1 + AUTH_SECRET
npm run db:migrate
npm run setup          # wire MCP for Cursor, Claude Code, …
npm run dev
```

→ API `http://localhost:3000` · Swagger `/docs`

```bash
# Save your first memory
curl -X POST http://localhost:3000/api/v1/memory \
  -H "Authorization: Bearer aic_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello brain","project":"demo","content":"Ratary remembers this."}'
```

Full guide: **[docs/PANDUAN.md](docs/PANDUAN.md)** · SDK & MCP examples in [docs/examples/](docs/examples/)

---

## Documentation

| | |
|---|---|
| [docs/PANDUAN.md](docs/PANDUAN.md) | Setup, daily usage, MCP configuration |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and boundaries |
| [docs/examples/](docs/examples/) | MCP configs, IDE templates, SDK patterns |
| [MCP/README.md](MCP/README.md) | MCP server listing & ChatGPT remote setup |
| [.env.example](.env.example) | Full environment reference |

---

## Roadmap

Organized by direction — not sprints.

| | Themes |
|---|--------|
| **Today** | MCP + REST brain, hybrid retrieval, self-host on D1/Postgres, remote MCP for ChatGPT |
| **Next** | Ontorata Studio, deeper connectors, expanded SDK surface, container images |
| **Future** | Universal memory fabric, cross-node intelligence, plugin marketplace |

Enterprise modules ship **opt-in via environment flags** — defaults stay lean.

---

## Vision

Today every application has a database.

Tomorrow every AI will have a brain.

**Ratary is building that layer** — open, portable, self-hostable, and protocol-native. Not another chat wrapper. Not another vector dump. Infrastructure for persistent intelligence.

Knowledge should **accumulate**. Boundaries should be **respected**. Agents should stay **coherent across time**.

If you're building AI that lasts longer than a single prompt — **build on Ratary**.

<p align="center"><br/>
<strong>Bring your model. Bring your agent. Ratary brings the brain.</strong><br/><br/>
<sub>Ratary · where AI remembers · <a href="https://ontorata.com">Ontorata</a> · MIT License</sub>
</p>

---

## Contributing

Contributions welcome. Fork → branch → `npm run lint && npm run build` → PR.

Full test suite and governance docs: [development mirror](https://github.com/lutfi04/ai-brain).

Questions: [hello@ontorata.com](mailto:hello@ontorata.com)
