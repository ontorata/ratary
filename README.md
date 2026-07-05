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
  <a href="docs/GUIDE.md">Docs</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"/>
  <img src="https://img.shields.io/badge/MCP-native-indigo" alt="MCP native"/>
  <img src="https://img.shields.io/badge/self--host-ready-brightgreen" alt="Self-host"/>
  <img src="https://img.shields.io/badge/node-24.x-green" alt="Node 24"/>
  <a href="https://www.npmjs.com/org/ratary"><img src="https://img.shields.io/npm/v/@ratary/sdk?label=%40ratary%2Fsdk&color=cb3837" alt="@ratary/sdk on npm"/></a>
</p>

<p align="center"><sub><em>Ratary is where AI remembers.</em> · Built by <a href="https://ontorata.com">Ontorata</a></sub></p>

<p align="center"><sub>
<a href="#quick-start">Quick start</a> ·
<a href="#ecosystem">Ecosystem</a> ·
<a href="#visual-architecture">Architecture</a> ·
<a href="#how-ratary-works">How it works</a> ·
<a href="#core-capabilities">Capabilities</a> ·
<a href="#documentation">Docs</a>
</sub></p>

---

## The problem

*Why does AI forget between sessions?*

Every AI session starts from zero.

Your model forgets yesterday's architecture decisions. Your agent drops customer context between runs. Your coding assistant can't recall why you chose Postgres over DynamoDB. Teams paste the same background into Cursor, Claude, ChatGPT, and custom bots — and knowledge still drifts.

Vector databases store chunks. RAG pipelines retrieve documents. Agent frameworks orchestrate tools.

**None of them give AI a durable brain.**

---

## Why Ratary exists

*Why build a brain layer now?*

AI models are getting cheaper. Context windows are getting larger. Agents are getting capable.

**But AI still forgets.**

The bottleneck is no longer reasoning. It's **memory** — durable, structured, retrievable, and owned by you.

Every serious application eventually needed a database. Every serious AI system will need a **brain layer**: persistent intelligence that sits between your models and your storage — independent of any single vendor, IDE, or agent framework.

> **AI should remember.**  
> **Developers should own that memory.**

Ratary exists to be that layer. Applications bring models. **Ratary brings the brain.**

---

## What Ratary is

*What is Ratary?*

Ratary is an **AI Brain Platform** — infrastructure that gives AI:

- **Persistent memory** — durable, owner-scoped, versioned
- **Structured knowledge** — metadata, relations, graph traversal
- **Intelligent retrieval** — hybrid search + bounded context assembly
- **Protocol access** — Ratary MCP, REST, optional gRPC

It sits **between** AI clients and storage. One brain, many surfaces — Cursor, Claude Code, custom agents, enterprise APIs, and remote MCP hosts.

The runnable deployment is **[Ratary Server](#quick-start)** — this repository. **Ratary** is the product; **Ratary Server** is what you clone and run.

**Bring your model. Ratary brings the memory.**

---

## Quick start

*How do I run Ratary Server locally?*

**Ratary** is the product. **Ratary Server** is the open-source deployment you run — [ontorata/ratary](https://github.com/ontorata/ratary) (this repository). [`@ratary/sdk`](#ecosystem), [`@ratary/cli`](#ecosystem), and [**Ratary MCP**](#ecosystem) connect to it; sibling [Ontorata products](#ecosystem) use the same source of truth.

**Prerequisites:** Node.js 24 · **SQL metadata store** (D1, Postgres, MariaDB, … — [pick one](docs/CONFIGURATION.md#sql-metadata-store-choose-one))

### Path A — Cloudflare D1

```bash
git clone https://github.com/ontorata/ratary.git
cd ratary && npm install
cp .env.example .env   # set SQL_PROVIDER=d1, fill D1_* + AUTH_SECRET
npm run db:migrate
npm run setup          # wire Ratary MCP for Cursor, Claude Code, …
npm run dev
```

### Path B — PostgreSQL (Docker)

```bash
git clone https://github.com/ontorata/ratary.git && cd ratary
export AUTH_SECRET="$(openssl rand -hex 32)"
docker compose --profile postgres up --build
```

Details: **[docs/DOCKER.md](docs/DOCKER.md)** · **[docs/GUIDE.md](docs/GUIDE.md#choose-your-sql-stack)**

→ API `http://localhost:3000` · Swagger `/docs`

```bash
# Save your first memory
curl -X POST http://localhost:3000/api/v1/memory \
  -H "Authorization: Bearer aic_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello brain","project":"demo","content":"Ratary remembers this."}'
```

Full guide: **[docs/GUIDE.md](docs/GUIDE.md)** · SDK & MCP examples in [docs/examples/](docs/examples/)

### npm packages (`@ratary`)

Client libraries ship on npm under the **`@ratary`** scope — product name, published by [Ontorata](https://ontorata.com). No server clone required for SDK, CLI, or hosted MCP.

```bash
npm install @ratary/sdk
npx @ratary/mcp-server          # remote REST → stdio MCP
npm install -g @ratary/cli      # operator CLI
```

| Package | Install | Role |
|---------|---------|------|
| [`@ratary/sdk`](https://www.npmjs.com/package/@ratary/sdk) | `npm install @ratary/sdk` | Typed REST client |
| [`@ratary/cli`](https://www.npmjs.com/package/@ratary/cli) | `npm install -g @ratary/cli` | Operator commands |
| [`@ratary/mcp-server`](https://www.npmjs.com/package/@ratary/mcp-server) | `npx @ratary/mcp-server` | IDE MCP → hosted API |

Set `RATARY_BASE_URL` and `RATARY_API_KEY` (`aic_...`). Details: **[packages/README.md](packages/README.md)** · [remote MCP install](docs/install/remote.md).

---

## Ecosystem

*Which repository owns what?*

The [Visual architecture](#visual-architecture) diagram shows **logical layers inside Ratary Server**. **This diagram** shows **repository and product relationships** — what ships in this repo, what connects to it, and what lives in sibling Ontorata repositories. Both views describe the same platform from different angles.

Throughout this README, **Ratary MCP** means the official memory MCP implementation (stdio in this repo · npm `@ratary/mcp-server` for hosted REST). It is not the same as **Ontorata MCP** (ecosystem gateway — separate repo).

```text
┌─────────────────────────────────────────────────────────────┐
│                      Ratary Cloud (opt-in)                  │
│         optional hosted deployment · not this repo          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Ratary Server          ← ontorata/ratary (this repo)       │
└──────────────────────────────┬──────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
   @ratary/sdk    @ratary/cli   @ratary/mcp-server
   (SDK)          (CLI)         (Ratary MCP · npm)
         │              │              │
         └──────────────┴──────────────┘
                               │
         ┌─────────────────────┴─────────────────────┐
         ▼                     ▼                     ▼
   Ontorata MCP         Ontorata Studio          Ontory
   ontorata/ontorata-mcp ontorata/Ontorata-Studio  (future · separate)
   ecosystem product     ecosystem product         ecosystem product
```

**Infrastructure** (ships from `ontorata/ratary` — server plus client packages):

| Component | Repository | Role |
|-----------|------------|------|
| **Ratary Server** | [ontorata/ratary](https://github.com/ontorata/ratary) | Memory engine — REST, persistence, Ratary MCP stdio. **You run this.** |
| **Ratary SDK** | [npm `@ratary/sdk`](https://www.npmjs.com/package/@ratary/sdk) · `packages/sdk` | Typed REST client for Ratary Server. |
| **Ratary CLI** | [npm `@ratary/cli`](https://www.npmjs.com/package/@ratary/cli) · `packages/cli` | Operator commands; delegates to Ratary SDK. |
| **Ratary MCP** | [npm `@ratary/mcp-server`](https://www.npmjs.com/package/@ratary/mcp-server) · stdio in repo | Memory MCP — full stdio in clone · npm proxy for hosted REST. |

**Ecosystem products** (separate repositories — connect to Ratary Server; not bundled here):

| Product | Repository | Role |
|---------|------------|------|
| **Ontorata MCP** | [ontorata/ontorata-mcp](https://github.com/ontorata/ontorata-mcp) | Ecosystem MCP gateway — Ratary MCP plus additional Ontorata tools. |
| **Ontorata Studio** | [ontorata/Ontorata-Studio](https://github.com/ontorata/Ontorata-Studio) | Operator UI — uses `@ratary/sdk` only. |
| **Ontory** | Separate repo (future) | End-user AI assistant built on Ratary. |

Ratary Server **does not depend** on ecosystem product repositories.

### Ratary MCP vs Ontorata MCP

*Which MCP should I install?*

| | **Ratary MCP** | **Ontorata MCP** |
|---|----------------|------------------|
| **Layer** | Ratary infrastructure | Ontorata ecosystem product |
| **What it is** | Official memory protocol for Ratary Server | Ecosystem gateway for Ontorata products |
| **Scope** | Memory — CRUD, search, context, graph | Ratary memory plus additional Ontorata tools |
| **Repository** | [ontorata/ratary](https://github.com/ontorata/ratary) · npm `@ratary/mcp-server` | [ontorata/ontorata-mcp](https://github.com/ontorata/ontorata-mcp) |
| **Typical `mcp.json` key** | `ratary` | `ontorata` |

Use **Ratary MCP** for direct memory access. Use **Ontorata MCP** for one MCP entry point across the Ontorata stack. Both use **Ratary Server** as source of truth.

---

## What Ratary is not

*How is Ratary different from alternatives?*

| | Vector DB | Memory API | RAG | Agent framework | **Ratary** |
|---|:---:|:---:|:---:|:---:|:---:|
| **Primary job** | Similarity search | Key-value recall | Document Q&A | Tool orchestration | **Durable AI memory** |
| **Structured knowledge & graph** | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| **MCP-native IDE integration** | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| **Token-efficient context assembly** | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| **Self-host & data sovereignty** | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| **Clear agent boundary** | N/A | ⚠️ | N/A | ❌ bundled | ✅ substrate only |

Ratary **complements** your stack — it does not replace pgvector, LangGraph, or your agent of choice. See the **[Capability matrix](#capability-matrix)** for a feature-level comparison.

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

*How is Ratary Server structured internally?*

This diagram shows the **logical internal architecture** of Ratary — how memory, knowledge, retrieval, and storage layers compose inside the platform. It is **not** a repository or product map.

```
        ┌─────────────────────────────────────────┐
        │           Your AI applications           │
        │  Cursor · Claude · Agents · REST · MCP   │
        └────────────────────┬────────────────────┘
                             │
                    MCP · REST · gRPC
                             │
        ┌────────────────────▼────────────────────┐
        │     Ratary Server (logical layers)       │
        │  ┌─────────┐ ┌──────────┐ ┌───────────┐ │
        │  │ Memory  │ │Knowledge │ │ Retrieval │ │
        │  └────┬────┘ └────┬─────┘ └─────┬─────┘ │
        │       └───────────┴─────────────┘       │
        │         Context · Learning · Protocols   │
        └────────────────────┬────────────────────┘
                             │
        ┌────────────────────▼────────────────────┐
        │     Pluggable storage (your choice)      │
        │  Postgres · Supabase · MariaDB · D1 · pgvector · Neo4j · │
        │  R2/S3/MinIO · OpenSearch · ClickHouse · …        │
        └─────────────────────────────────────────┘
```

**Search** browses. **Retrieval** injects context. **Embedding** enriches asynchronously — never on the CRUD hot path.

Details: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

For **repository and product relationships** (SDK, CLI, Ratary MCP, Ontorata ecosystem repos), see **[Ecosystem](#ecosystem)** — a separate diagram, same platform, different perspective.

---

## How Ratary works

*What happens to a memory after you save it?*

```
   Write          Enrich         Retrieve        Learn          Reuse
     │               │               │              │              │
     ▼               ▼               ▼              ▼              ▼
  Save via       Summarize,      Rank & pack    Signals,       Same memory
  Ratary MCP/REST embed, link     context for    consolidate,   powers every
                 relations       your prompt    evolve         client
```

1. **Write** — Persist memory through Ratary MCP or REST.
2. **Enrich** — Summarize, embed, and relate — asynchronously.
3. **Retrieve** — Assemble the smallest useful context slice.
4. **Learn** — Optional signals and consolidation improve recall over time.
5. **Reuse** — One brain across IDEs, agents, and APIs.

---

## Core capabilities

*What can Ratary Server do today?*

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

### External agent support
Capability manifests, workspace scoping, and **28 Ratary MCP tools**. External agents discover what the brain can do; Ratary never embeds agent reasoning — see [What Ratary is not](#what-ratary-is-not).

### Platform
Pluggable adapters: choose **SQL metadata** (Postgres, Supabase, MariaDB/MySQL, D1, TiDB/Cockroach) plus optional pgvector, R2/S3/MinIO, Azure Blob, GCS, Meilisearch, OpenSearch, Neo4j, Redis, DuckDB, ClickHouse. Same application code for every backend.

**Self-host stacks:** [docs/DOCKER.md](docs/DOCKER.md) — `postgres` or `enterprise` (MariaDB + MinIO + Redis) profiles.

### Cloud & enterprise
Self-host, deploy to Vercel, or run a control plane with metering and federation. RBAC workspaces, audit trails, SSO, and policy hooks — opt-in when you need them.

### Observability
OpenTelemetry, Prometheus metrics, SLO dashboards, and cost visibility for production brains.

### Developer experience
OpenAPI, `@ratary/sdk`, `@ratary/cli`, **Ratary MCP** (`@ratary/mcp-server`), and one-command IDE setup (`npm run setup`).

---

## Use cases

*Who is Ratary for?*

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

*How does Ratary compare feature-by-feature?*

For category positioning, see **[What Ratary is not](#what-ratary-is-not)**.

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

## Documentation

*Where do I read next?*

**Ratary Server** (`ontorata/ratary` — this repository):

| | |
|---|---|
| [docs/GUIDE.md](docs/GUIDE.md) | Setup, daily usage, Ratary MCP configuration |
| [docs/install/README.md](docs/install/README.md) | Per-harness MCP / plugin installation |
| [docs/DOCKER.md](docs/DOCKER.md) | Container & Compose self-host |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | Environment variables — what each flag does |
| [docs/examples/](docs/examples/) | MCP and IDE config templates |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and boundaries |
| [MCP/README.md](MCP/README.md) | Ratary MCP — stdio and `@ratary/mcp-server` |
| [packages/README.md](packages/README.md) | npm packages — install, env, publish |
| [.env.example](.env.example) | Env template — meanings in [docs/CONFIGURATION.md](docs/CONFIGURATION.md) |
| [docs/policies/](docs/policies/) | Authorization policy samples (OPA/Rego, enterprise) |

**Ontorata ecosystem** (separate repositories — not in this tree):

| | |
|---|---|
| [ontorata/ontorata-mcp](https://github.com/ontorata/ontorata-mcp) | Ontorata MCP — ecosystem gateway |
| [ontorata/Ontorata-Studio](https://github.com/ontorata/Ontorata-Studio) | Ontorata Studio — operator UI ([setup](docs/GUIDE.md#ontorata-studio-web-console)) |

---

## Roadmap

*What is shipping when?*

Organized by direction — not sprints. **Repository scope** noted where work leaves `ontorata/ratary`.

| | Themes | Primary repository |
|---|--------|-------------------|
| **Today** | Ratary MCP + REST, hybrid retrieval, peer SQL (Postgres/Supabase/D1/MariaDB), Docker OCI + compose, enterprise storage adapters, npm [`@ratary/*`](https://www.npmjs.com/org/ratary), [Ontorata Studio](https://github.com/ontorata/Ontorata-Studio), remote Ratary MCP | `ontorata/ratary` · [Ontorata-Studio](https://github.com/ontorata/Ontorata-Studio) |
| **Next** | SDK surface expansion, live knowledge connectors (Notion/Confluence), additional language SDKs | `ontorata/ratary` |
| **Future** | Universal memory fabric, cross-node intelligence, plugin marketplace | `ontorata/ratary` (platform) |

Enterprise modules ship **opt-in via environment flags** on Ratary Server — defaults stay lean.

---

## Vision

*What is Ratary building toward?*

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

*How do I contribute?*

**Ratary Server** (this repo): fork [ontorata/ratary](https://github.com/ontorata/ratary) → branch → `npm run lint && npm run build` → PR to `ontorata/ratary`.

**Full test suite and governance** (`.ai/` phases, ADRs, Vitest): use the [development mirror](https://github.com/lutfi04/ai-brain) — same codebase boundary, separate remote for internal docs and QA.

**Ontorata MCP** and **Ontorata Studio** accept contributions in their own repositories — not via this repo.

Questions: [hello@ontorata.com](mailto:hello@ontorata.com)
