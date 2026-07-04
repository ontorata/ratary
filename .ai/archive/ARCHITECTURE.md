# Arsitektur — AI Memory Cloud

**Status:** Phase 4 ✅ production · Phase 5 ✅ complete  
**Rules:** [AI_BRAIN_CONSTITUTION.md](AI_BRAIN_CONSTITUTION.md) (immutable)  
**Next phase:** Phase 6 Hybrid Retrieval — [adr/001-multi-source-retrieval.md](adr/001-multi-source-retrieval.md)

---

## 1. Target stack

```
Memory Layer          ← this repo: CRUD, retrieval, context, consolidation
Knowledge Layer       ← metadata, relations, codenames, levels
Embedding Layer       ← Phase 5 ✅ (async backfill, D1 MVP)
Vector Layer          ← Phase 6+ hybrid retrieval
Graph Layer           ← Phase 8+ (IGraphProvider per ADR-002)
Reasoning → Multi-Agent ← outside repo; MCP/REST boundary only
```

---

## 2. Implemented phases

| Phase | Status | Notes |
|-------|--------|-------|
| 1 Foundation | ✅ | CRUD, MCP, D1 |
| 2.5 Stabilization | ✅ | [archive/PHASE-2.5.md](archive/PHASE-2.5.md) |
| 2.6 Knowledge | ✅ | Codename, slug, relations, ranking |
| 3 Authorization | ✅ | JWT, OAuth, API keys, permissions |
| 4 Memory Intelligence | ✅ | Retriever, context, consolidator |
| 5 Embedding | ✅ | Provider/store ports, backfill job, OpenAI optional |
| 6–10 | 🔲 | ADRs in [adr/](adr/) |

**Tests:** 152 · **MCP tools:** 14 · **Deploy REST:** Vercel · **Storage:** Cloudflare D1 (HTTP API)

---

## 3. Project structure

```
src/
  routes/           HTTP routing, Zod validation, rate limits
  controllers/      Thin handlers, WIB display fields
  services/         MemoryService, HealthService, MemoryRelationService
  memory/           Retriever, Ranker, ContextBuilder, PromptBuilder,
                    ContextService, Consolidator, semantic-hash
  knowledge/        Pure generators + KnowledgeService
  search/           RankingEngine (pure) + SearchService
  auth/             Identity, JWT, OAuth, audit, permissions
  repositories/     MemoryRepository, MemoryRelationRepository
  embedding/        IEmbeddingProvider, IEmbeddingStore, job runner
  mcp/              stdio server + tool definitions
  db/               D1 client, migrations
  config/           env.ts (Zod)
  types/            Domain types + Zod schemas
  utils/            Mappers, formatWIB (no business logic)
  plugins/          Fastify plugins

api/                Vercel serverless entry
scripts/            migrate, backfill, consolidate, setup-mcp, sync
tests/              Vitest unit + API E2E
docs/               Constitution, architecture, task prompt, ADRs
```

---

## 4. Dependency graph

### REST

```
Client
  → Fastify (server.ts)
      → auth middleware → AuthService
      → routes/ (validation)
      → controllers/
      → services/ | memory/ | knowledge/ | search/
      → repositories/
      → Cloudflare D1
```

### MCP

```
AI Client (stdio)
  → mcp/stdio.ts → mcp/server.ts
      → MemoryService, ContextService, SearchService, …
      → repositories/ → D1
      → scope: MCP_OWNER_ID (required in production)
```

MCP does **not** use REST auth — D1 credentials in env. Same business logic as REST.

---

## 5. Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| `routes/` | Input validation, mount paths, rate limit hooks |
| `controllers/` | HTTP status, map service results to JSON (+ WIB) |
| `services/` | CRUD orchestration, backup, delegate to knowledge/search |
| `memory/` | LLM retrieval pipeline, context budget, consolidation logic |
| `knowledge/` | Enrichment: codename, slug, summary, keywords |
| `search/` | Candidate fetch + `rankMemories` for REST search |
| `repositories/` | All SQL; owner-scoped queries |
| `auth/` | Identity chain, permissions, audit bus |

---

## 6. Extension points (ports)

| Concern | Interface | Implementation today | Future adapters |
|---------|-----------|----------------------|-----------------|
| Memory metadata SQL | `IMemoryReader` / `IMemoryWriter` | `MemoryRepository` (D1) | Postgres |
| Combined port | `IMemoryRepository` | same class | same |
| Retrieval candidates | `IRetrievalCandidateSource` | `SqlRetrievalCandidateSource` | Vector, graph, composite |
| LLM retrieval | `Retriever` | uses port above | unchanged |
| Ranking | `ranking.engine.ts` | pure functions | fusion weights (Phase 6) |
| Relations SQL | `MemoryRelationRepository` (concrete) | D1 | + `IMemoryRelationRepository` |
| Embedding inference | `IEmbeddingProvider` | `NoopEmbeddingProvider`, `OpenAIEmbeddingProvider` | Workers AI |
| Vector storage | `IEmbeddingStore` | `D1EmbeddingStore` (MVP ~5–10k vectors/owner) | Vectorize, pgvector |
| Object blobs | `IContentStore` | 🔲 ADR-005 | R2, S3, MinIO |
| Graph traversal | `IGraphProvider` | 🔲 ADR-002 Phase 8 | D1 CTE, graph DB |
| Workspace scope | `MemoryScope` (+ ADR-002 fields) | `ownerId` only | workspace, agent, org |
| Auth | `IdentityProvider` chain | API key, JWT, OAuth | — |

**Composition root:** `server.ts`, `mcp/server.ts`, `create-memory-service.ts`, `scripts/*` — only place for `new MemoryRepository(db)` and `new D1EmbeddingStore(db)`.

---

## 7. Memory intelligence pipeline (Phase 4)

```
ContextService
  → Retriever → IRetrievalCandidateSource
  → Ranker → ranking.engine + retrieval boosts
  → ContextBuilder (token budget)
  → PromptBuilder
  → IMemoryWriter.recordAccess (per ranked memory)
```

**Search (separate path):**

```
SearchService → IMemoryReader.findSearchCandidates → rankMemories → paginate
```

Caps: `search/ranking.config.ts`, `memory/context.config.ts`.

---

## 8. Data model (memories)

| Area | Fields / tables |
|------|-----------------|
| Core | title, content, summary, project, tags, owner_id |
| Knowledge (2.6) | codename, slug, keywords, category, memory_type, importance |
| Intelligence (4) | project_id, level, last_accessed, access_count, semantic_hash |
| Reserved (5+) | embedding_id, object_key |
| Embeddings (5) | memory_embeddings (vector_json, content_hash, model_id) |
| Relations | memory_relations (flat edges) |
| Auth | identities, clients, audit_logs, settings |

UNIQUE: `(owner_id, codename)`, `(owner_id, slug)`.

---

## 9. API surface

Canonical prefix: `/api/v1/*` (legacy `/memory` routes removed Phase 3).

| Endpoint | Permission |
|----------|------------|
| `/api/v1/memory` | CRUD + relations |
| `/api/v1/search` | memory.read |
| `/api/v1/context` | memory.read |
| `/api/v1/auth/*` | auth flows |
| `/api/v1/health`, `/health` | public |

---

## 10. Auth & scope

- REST: `ownerId` from `request.user` (JWT / API key / OAuth).
- MCP: `ownerId` from `MCP_OWNER_ID` env (`assertMcpOwnerConfigured` in production).
- Cross-owner memory access → **404** (no enumeration).
- Audit today: auth events only (`identity.*`, `auth.failed`, `client.*`).

Future scope contract: [adr/002-workspace-identity-model.md](adr/002-workspace-identity-model.md) (Approved).

---

## 11. Deployment & ops

| Environment | Entry |
|-------------|--------|
| Local | `npm run dev` → `dev-server.ts` |
| Production REST | `api/index.ts` → Vercel |
| MCP | `npm run mcp` / `npm run setup` |
| Migrate | `npm run db:migrate` |
| Backfill M4b | `npm run db:backfill-memory-intelligence` |
| Backfill embeddings | `npm run db:backfill-embeddings` (dry-run default) |
| Consolidate | `npm run consolidate:memories` (dry-run default) |

User onboarding: [PANDUAN.md](PANDUAN.md).

---

## 12. Structural decisions

| Document | Role |
|----------|------|
| [ADR-POLICY.md](ADR-POLICY.md) | When ADR required |
| [adr/README.md](adr/README.md) | Index — ADR-002 Approved (workspace model) |
| [archive/](archive/) | Phase 2.5–5 design history |

---

## 13. Embedding layer (Phase 5)

Async only — **no** `embed()` on `insert()` / `update()`.

```
scripts/backfill-embeddings.ts
  → EmbeddingJobRunner
      → IMemoryReader.findWithoutEmbedding
      → IEmbeddingProvider.embed (noop | openai)
      → IEmbeddingStore.upsert + IMemoryWriter.applyEmbeddingBackfill
```

- Vectors live in `memory_embeddings`; `memories.embedding_id` is the link.
- `content_hash` skips unchanged text; delete/replace-backup cleans vectors via `MemoryService`.
- `searchSimilar` is owner-scoped in-memory cosine (MVP scale ~5–10k vectors per owner).
- Env: `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL`, `EMBEDDING_API_KEY`, `EMBEDDING_BATCH_SIZE`.

Phase 6 will add `VectorRetrievalCandidateSource` without changing REST/MCP contracts.

---

## 14. Known technical debt (documented)

| Item | Mitigation path |
|------|-----------------|
| `MemoryRepository` ~729 lines | Additive methods only; split when Postgres adapter lands |
| `MemoryRelationRepository` no interface | `IMemoryRelationRepository` before Phase 8 |
| Search uses `SELECT *` | Projection refactor (perf, not blocking Phase 6) |
| N× `recordAccess` on context build | Batch update (perf) |
| D1 vector search in-process | Vectorize/pgvector when scale exceeds MVP ceiling |

---

*Phase 5 completion report: [TASK_PROMPT.md](TASK_PROMPT.md). Next: Phase 6 after ADR-001 Approved.*
