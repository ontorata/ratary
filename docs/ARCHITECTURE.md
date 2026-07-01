# Arsitektur AI Memory Cloud

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
controllers/     Tipis — parse request, panggil service, format response
    │
    ▼
services/        Business logic (tidak tahu HTTP)
    │
    ▼
repositories/    SQL ke Cloudflare D1
    │
    ▼
Cloudflare D1    memories, identities, clients, audit_logs, settings
```

## Alur MCP (stdio)

```
AI Client (Cursor, Claude Code, …)
    │
    ▼
src/mcp/stdio.ts ──► MemoryService ──► MemoryRepository ──► D1
    │
    └── Scope: MCP_OWNER_ID env (default '' = legacy pool)
```

MCP **tidak** melalui REST auth — credential D1 di env MCP config.

## Struktur folder

```
src/
  auth/           Identity layer (Phase 2)
    providers/    ApiKeyProvider (+ JWT/OAuth stubs Phase 3)
    *.repository  Akses tabel auth
    *.service     Bootstrap, identities, clients, audit
  config/         env.ts (Zod validation)
  controllers/    HTTP handlers
  db/             D1 client, migrations
  mcp/            MCP stdio server
  plugins/        error-handler, swagger, observability, rate-limit
  repositories/   MemoryRepository
  routes/         Route definitions + validasi
  services/       MemoryService, HealthService
  types/          Zod schemas, errors
  utils/          Mappers

tests/            Vitest (unit + API E2E)
scripts/          migrate, integration, backup sync
api/              Vercel serverless entry
docs/             Panduan (MCP, Phase 2.5/2.6, arsitektur)
```

**Roadmap berikutnya:** [PHASE-2.6-DESIGN.md](PHASE-2.6-DESIGN.md) — Knowledge Foundation (metadata, relasi, ranking).

## Layer rules

| Layer | Boleh | Tidak boleh |
|-------|-------|-------------|
| `routes/` | Validasi input, rate limit config | Business logic, SQL |
| `controllers/` | Panggil service, map HTTP status | SQL, auth logic |
| `services/` | Orkestrasi, rules | `request`/`reply`, SQL langsung |
| `repositories/` | SQL D1 | HTTP, auth decisions |
| `auth.middleware` | Panggil AuthService | Akses DB langsung |

## Auth & audit

- API key disimpan sebagai **HMAC hash** (`AUTH_SECRET`), prefix `aic_`
- Plaintext hanya dikembalikan saat **bootstrap / create / rotate**
- `AuditService` subscribe event bus — `identity.*`, `auth.failed`, `client.*`
- Memory di-scope per `owner_id` (REST dari `request.user`, MCP dari `MCP_OWNER_ID`)

## Dual mount API (legacy)

| Canonical | Legacy (deprecated) |
|-----------|---------------------|
| `/api/v1/memory` | `/memory` |
| `/api/v1/search` | `/search` |
| `/api/v1/health` | `/health` |

Gunakan **`/api/v1/*`** untuk integrasi baru. Legacy akan dihapus di versi major berikutnya.

## Deployment

- **Lokal:** `npm run dev` → `dev-server.ts` (migrate + graceful shutdown)
- **Vercel:** `api/index.ts` → `buildApp({ skipSwagger: true })`
- **Health:** `GET /health` dan `GET /api/v1/health` — ping D1, `503` jika DB down
