# Arsitektur AI Memory Cloud

**Status:** Phase 3 ✅ · Phase 4 (Memory Intelligence) ✅

## Alur request REST API

```
Client (Cursor / curl / MCP tidak lewat sini)
    │
    ▼
Fastify (server.ts)
    ├── CORS
    ├── observability (request ID, response time log)
    ├── error-handler (global)
    ├── auth middleware (onRequest) ──► AuthService ──► IdentityProvider chain
    │
    ▼
routes/          Validasi Zod, rate limit (auth)
    │
    ▼
controllers/     Tipis — parse request, panggil service, format response (+ WIB)
    │
    ▼
services/        Business logic (tidak tahu HTTP)
    ├── MemoryService      CRUD, backup, orkestrasi knowledge
    ├── SearchService      Ranking + pagination
    └── MemoryRelationService
    │
    ▼
memory/          Phase 4 — Retriever, Ranker, ContextBuilder, PromptBuilder,
                 ContextService, MemoryConsolidator, semantic-hash
knowledge/       Pure modules + KnowledgeService (codename, slug, metadata)
search/          RankingEngine (pure) + SearchService
    │
    ▼
repositories/    SQL ke Cloudflare D1 (IMemoryRepository port)
    │
    ▼
Cloudflare D1    memories, memory_relations, identities, clients, audit_logs, settings
```

## Alur MCP (stdio)

```
AI Client (Cursor, Claude Code, …)
    │
    ▼
src/mcp/stdio.ts ──► MemoryService + ContextService ──► MemoryRepository ──► D1
    │
    └── Scope: MCP_OWNER_ID env (default '' = legacy pool)
```

MCP **tidak** melalui REST auth — credential D1 di env MCP config.  
Onboarding: `npm run setup` → `.mcp.json` + `.cursor/mcp.json`.

## Struktur folder

```
src/
  auth/           Identity layer (Phase 3: JWT, OAuth, permissions)
    providers/    ApiKeyProvider, OAuthProvider, JwtProvider
    *.repository  Akses tabel auth
    *.service     Bootstrap, identities, clients, audit
  config/         env.ts (Zod validation, load .env dari repo root)
  controllers/    HTTP handlers (+ memory-response WIB fields)
  db/             D1 client, migrations
  knowledge/      Codename, slug, summary, keywords, KnowledgeService
  memory/         Phase 4 intelligence pipeline
  mcp/            MCP stdio server (14 tools)
  plugins/        error-handler, swagger, observability, rate-limit
  repositories/   MemoryRepository (IMemoryRepository), MemoryRelationRepository
  routes/         Route definitions + validasi
  search/         RankingEngine, SearchService
  services/       MemoryService, HealthService, MemoryRelationService
  types/          Zod schemas, errors, context
  utils/          Mappers, formatWIB, memory-response

tests/            Vitest (unit + API E2E) — 100+ tests
scripts/          migrate, backfill, consolidate, setup-mcp, import/sync backups
api/              Vercel serverless entry
docs/             Panduan (MULAI-DISINI, MCP, Phase 2.5/2.6/3/4, arsitektur)
```

**Roadmap:**

| Phase | Status | Dokumen |
|-------|--------|---------|
| 2.5 Stabilization | ✅ | [PHASE-2.5.md](PHASE-2.5.md) |
| 2.6 Knowledge Foundation | ✅ | [PHASE-2.6-DESIGN.md](PHASE-2.6-DESIGN.md) |
| 3 Authorization | ✅ | [PHASE-3.md](PHASE-3.md) |
| **4 Memory Intelligence** | ✅ | [PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md](PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md) |

## Layer rules

| Layer | Boleh | Tidak boleh |
|-------|-------|-------------|
| `routes/` | Validasi input, rate limit config | Business logic, SQL |
| `controllers/` | Panggil service, map HTTP status, WIB display | SQL, auth logic |
| `services/` | Orkestrasi, rules | `request`/`reply`, SQL langsung |
| `repositories/` | SQL D1 | HTTP, auth decisions |
| `auth.middleware` | Panggil AuthService | Akses DB langsung |
| `knowledge/` | Pure generators + orchestrator | HTTP, SQL |
| `memory/` | Retrieval, context, consolidation logic | SQL langsung |

## Knowledge Foundation (Phase 2.6)

- Metadata di kolom `memories`: `codename`, `slug`, `keywords`, `category`, `memory_type`, `importance`, `language`, `notes`
- Relasi: tabel `memory_relations` (weight, confidence, source_type)
- Search: `RankingEngine` → `relevanceScore` runtime (bukan kolom DB)
- Backfill legacy: `npm run db:backfill-knowledge`
- UNIQUE per `(owner_id, codename)` dan `(owner_id, slug)`

## Memory Intelligence (Phase 4)

- Kolom baru: `project_id`, `level`, `last_accessed`, `access_count`, `embedding_id`, `object_key`, `semantic_hash`
- Pipeline: `Retriever` → `Ranker` → `ContextBuilder` → `PromptBuilder` via `ContextService`
- Budget default: **12.000 karakter** konteks (~3k token)
- Consolidator: `npm run consolidate:memories` (dry-run default), `npm run consolidate:memories:execute`
- Backfill M4b: `npm run db:backfill-memory-intelligence`
- Level defaults: MCP `save_memory` → `note`; import/sync backup → `raw`
- MCP tools baru: `get_context`, `build_prompt` (additive; `search_memory` tidak berubah)

## Timestamp

| Layer | Format |
|-------|--------|
| D1 / domain (`createdAt`, `updatedAt`) | ISO-8601 **UTC** (`nowISO()`) |
| REST API response | + `createdAtWib`, `updatedAtWib` via `formatWIB()` (Asia/Jakarta) |
| MCP | UTC saja (tanpa field WIB) |

## Auth & audit

- API key (`aic_*`) dan OAuth token (`oac_*`) disimpan sebagai **HMAC hash**
- JWT short-lived via `POST /api/v1/auth/token` (HS256, `AUTH_SECRET`)
- Permissions: `memory.read`, `memory.write` — enforced setelah auth middleware
- `POST /api/v1/context` memerlukan `memory.read` (bukan `memory.write`)
- Plaintext hanya dikembalikan saat **bootstrap / create / rotate**
- `AuditService` subscribe event bus — `identity.*`, `auth.failed`, `client.*`
- Memory di-scope per `owner_id` (REST dari `request.user`, MCP dari `MCP_OWNER_ID`)

## Dual mount API

Legacy routes (`/memory`, `/search`, `/backup`) **dihapus di Phase 3**. Gunakan **`/api/v1/*`**.

| Canonical | Catatan |
|-----------|---------|
| `/api/v1/memory` | CRUD + relations |
| `/api/v1/search` | Ranked search |
| `/api/v1/context` | Build context + LLM prompt (Phase 4) |
| `/api/v1/health` | Health + D1 ping |
| `/health` | Root alias (monitoring) |

## Deployment

- **Lokal:** `npm run dev` → `dev-server.ts` (migrate + graceful shutdown)
- **Vercel:** `api/index.ts` → `buildApp({ skipSwagger: true })`
- **Health:** `GET /health` dan `GET /api/v1/health` — ping D1, `503` jika DB down
- **Setup MCP:** `npm run setup` (baca `.env`, tulis config Cursor/Claude)
- **Production migrate:** `npm run db:migrate` lalu `npm run db:backfill-memory-intelligence`
