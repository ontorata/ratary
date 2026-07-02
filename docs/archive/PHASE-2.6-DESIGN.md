# Phase 2.6 — Knowledge Foundation (Design Approved)

**Status:** ✅ Implemented (69 tests)  
**Review:** Principal Architect Go/No-Go — APPROVED WITH CHANGES (resolved)  
**Prasyarat:** Phase 2.5 complete (`f188dc2`)  
**Implementasi:** Bertahap per commit (lihat §16)

---

## Tujuan

Membangun fondasi Knowledge Management agar AI memahami struktur knowledge **sebelum**:

- Phase 3 — Authorization
- Phase 4 — Memory Sync
- Phase 5 — Embedding
- Phase 6 — Vector Search / RAG
- Phase 7+ — Agent, Knowledge Graph, Multi-AI, Enterprise

**Bukan** semantic search. **Bukan** embedding. Metadata + relasi + ranking dasar.

---

## Prinsip Desain (Wajib)

| Prinsip | Aturan |
|---------|--------|
| Clean Architecture | routes → controllers → services → repositories |
| Repository | Hanya SQL — tidak ada business logic |
| Service | Tidak tahu HTTP |
| Controller | Tipis — delegasi saja |
| Single source of truth | Metadata di `memories` — **tidak ada** `memory_index` |
| Backward compatible | Additive schema & API response |
| Multi-tenant | Semua query **scoped** `owner_id` |
| No premature columns | **Tidak ada** `search_score`, **tidak ada** `status` (pakai `archived`) |

---

## Perubahan Wajib dari Design Review (W1–W12)

| ID | Keputusan |
|----|-----------|
| **W1** | `KnowledgeService` = orchestrator; generators = pure modules |
| **W2** | **Hapus** `search_score` dari scope — ranking runtime `relevanceScore` saja |
| **W3** | **Hapus** `status` — tetap `archived` existing |
| **W4** | `memory_relations` extensible: weight, confidence, created_by, source_type, metadata |
| **W5** | Migration 3-phase: columns → backfill → UNIQUE indexes |
| **W6** | UNIQUE per `(owner_id, codename)` dan `(owner_id, slug)` |
| **W7** | `allocateCodename()` atomic + retry on UNIQUE conflict |
| **W8** | `RankingEngine` pure module terpisah dari `SearchService` |
| **W9** | Multi-tenant query checklist + ≥6 leak tests |
| **W10** | Integration test D1 FOREIGN KEY di staging |
| **W11** | `summary` sudah ada — tidak ADD COLUMN |
| **W12** | Target test ≥75 |

---

## Arsitektur Module

```
src/
  knowledge/                         # W1 — domain pure modules
    codename.generator.ts
    slug.generator.ts
    summary.generator.ts
    keyword.normalizer.ts
    metadata.validator.ts
    knowledge.service.ts             # orchestrator only
  search/
    ranking.config.ts                # weights — extensible Phase 5
    ranking.engine.ts                # W8 — pure scoreMemory()
    search.service.ts                # repo → rank → paginate
  repositories/
    memory.repository.ts             # + allocateCodename(), findSearchCandidates()
    memory-relation.repository.ts
  services/
    memory.service.ts                # orkestrasi create/update/search
    memory-relation.service.ts
  controllers/
    knowledge.controller.ts          # categories, memory-types
    index.ts                         # + relation handlers
```

### Dependency Direction

```
RankingEngine (pure) ← SearchService ← MemoryService
Generators (pure)    ← KnowledgeService ← MemoryService
MemoryRepository     ← KnowledgeService (allocateCodename only)
MemoryRepository     ← SearchService
```

**Larangan:** `RankingEngine` tidak import repository. `CodenameGenerator` tidak import repository.

---

## Schema

### W11 — `summary` sudah ada

Kolom `summary TEXT NOT NULL DEFAULT ''` sudah di production. Phase 2.6 hanya:
- Validasi input baru: max **300** karakter
- Auto-generate via `SummaryGenerator` jika kosong
- Data existing >300: **grandfather** sampai user edit

### Kolom baru pada `memories`

| Kolom | Tipe | Default | Catatan |
|-------|------|---------|---------|
| `codename` | TEXT | NULL → backfill | **Immutable** setelah set |
| `slug` | TEXT | NULL → backfill | URL-safe, mutable jika title berubah |
| `keywords` | TEXT | `'[]'` | JSON array |
| `category` | TEXT | `''` | Enum disarankan di app |
| `memory_type` | TEXT | `'note'` | Enum — lihat §Enum |
| `importance` | INTEGER | `50` | 0–100 |
| `language` | TEXT | `'id'` | ISO 639-1 |
| `notes` | TEXT | `''` | Internal notes |

**Tidak ditambahkan:** `search_score` (W2), `status` (W3).

### Tabel baru `memory_relations` (W4)

```sql
CREATE TABLE IF NOT EXISTS memory_relations (
  id TEXT PRIMARY KEY,
  source_memory_id TEXT NOT NULL,
  target_memory_id TEXT NOT NULL,
  relation TEXT NOT NULL,
  owner_id TEXT NOT NULL DEFAULT '',
  weight REAL NOT NULL DEFAULT 1.0,
  confidence REAL NOT NULL DEFAULT 1.0,
  created_by TEXT,
  source_type TEXT NOT NULL DEFAULT 'manual',
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (source_memory_id) REFERENCES memories(id) ON DELETE CASCADE,
  FOREIGN KEY (target_memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_relations_unique
  ON memory_relations(source_memory_id, target_memory_id, relation);

CREATE INDEX IF NOT EXISTS idx_relations_source ON memory_relations(source_memory_id);
CREATE INDEX IF NOT EXISTS idx_relations_target ON memory_relations(target_memory_id);
CREATE INDEX IF NOT EXISTS idx_relations_owner ON memory_relations(owner_id);
```

`source_type`: `manual` | `inferred` | `import` | `api` | `mcp`

### Index `memories` (W6)

```sql
-- Phase M1a: non-unique indexes
CREATE INDEX IF NOT EXISTS idx_memories_owner_category ON memories(owner_id, category);
CREATE INDEX IF NOT EXISTS idx_memories_memory_type ON memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance);

-- Phase M3: setelah backfill
CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_codename
  ON memories(owner_id, codename) WHERE codename IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memories_owner_slug
  ON memories(owner_id, slug) WHERE slug IS NOT NULL;
```

---

## Migration Plan (W5)

### Phase M1a — Columns only

`migrateKnowledgeFoundationPhase1()` di `src/db/migrations.ts`:

- `ALTER TABLE` idempotent via `tableHasColumn()` untuk setiap kolom baru
- `CREATE TABLE memory_relations`
- Non-unique indexes
- **Tidak** CREATE UNIQUE INDEX codename/slug

### Phase M1b — Deploy code

- Create auto-generates codename/slug
- Tolerate NULL codename/slug pada row lama
- `npm run db:migrate` di staging → production

### Phase M2 — Backfill

`scripts/backfill-knowledge.ts` — idempotent, batched (100/batch):

| Field | Rule |
|-------|------|
| `codename` | `allocateCodename()` per owner |
| `slug` | `slugify(title)-{shortId}` |
| `summary` | Generate jika kosong; jangan truncate existing >300 |
| `keywords` | Normalize dari `tags` |
| `memory_type` | Default `note` |
| `category` | `''` |

### Phase M3 — Unique indexes

`migrateKnowledgeFoundationPhase3()`:

- `CREATE UNIQUE INDEX` owner+codename, owner+slug
- Hanya setelah backfill selesai

### Phase M4 — Hardening

- Assert codename present on create
- W10: verify FK CASCADE di D1 staging

### Urutan deploy

```
M1a migrate → M1b deploy code → M2 backfill → M3 migrate → M4 verify
```

**Zero downtime** jika diikuti urutan ini.

---

## Enum (Application Level)

### `memory_type`

`note` | `prompt` | `code` | `architecture` | `task` | `meeting` | `research` | `documentation` | `api` | `config`

### `category` (suggested)

`Architecture` | `Development` | `Research` | `Meeting` | `Prompt` | `Task` | `API` | `''`

### `relation`

`related` | `depends_on` | `parent` | `child` | `duplicate` | `reference`

---

## Field Rules

### Codename (immutable)

- Format: `PREFIX-0001` (pad 4 digit, extend ke 5 jika >9999)
- Prefix dari: `memory_type` map → `category` → `project` → `MEM`
- Allocation: `MemoryRepository.allocateCodename(ownerId, prefix)` — **atomic** (W7)
- On UNIQUE conflict: retry dengan sequence berikutnya (max 3 retries)

### Slug

- lowercase, hyphen-separated, max 80 char
- Collision: append `-2`, `-3`, ...
- UNIQUE per `(owner_id, slug)` (W6)

### Summary

- Max 300 char pada input baru
- `SummaryGenerator`: strip markdown, truncate

### Keywords

- JSON array, lowercase, dedupe, max 30
- Merge explicit keywords + normalized tags

---

## Knowledge Layer (W1)

### Pure generators

| Module | Input → Output |
|--------|----------------|
| `CodenameGenerator.format(prefix, seq)` | `AUTH-0001` |
| `CodenameGenerator.resolvePrefix(input)` | Prefix string |
| `SlugGenerator.generate(title, suffix?)` | url-safe slug |
| `SummaryGenerator.generate(content)` | ≤300 char |
| `KeywordNormalizer.normalize(tags, keywords?)` | string[] |

### KnowledgeService (orchestrator)

```typescript
enrichCreateInput(scope, input): EnrichedMemoryData
enrichUpdateInput(existing, input): EnrichedMemoryData  // strips codename
validateMetadata(input): void
```

Tidak ada SQL. Tidak ada HTTP. Sequence via `repository.allocateCodename()`.

---

## Search Architecture (W8)

### Flow

```
GET /search?q=...
    → SearchService.search(scope, query)
        → MemoryRepository.findSearchCandidates(filters)   // SQL LIKE + filters
        → RankingEngine.scoreEach(candidates, query)       // pure
        → sort by relevanceScore DESC
        → tie-break: updatedAt DESC
        → paginate(limit, offset)
    → { memories: ScoredMemory[], total }
```

### Ranking weights (`ranking.config.ts`)

| Signal | Exact | Contains |
|--------|-------|----------|
| codename | 100 | 80 |
| title | 90 | 70 |
| keywords[] | 60 | — |
| tags[] | 55 | — |
| summary | — | 50 |
| project | 40 | 25 |
| content | — | 20 |
| favorite | +10 bonus | |
| importance | multiplier `0.5 + importance/100` | |

`SEARCH_CANDIDATE_CAP` = 500 (config, bukan magic number).

### Response (additive)

```json
{
  "memories": [{ "...memoryFields", "relevanceScore": 187 }],
  "total": 12
}
```

**Tidak ada** `search_score` di DB atau response permanen.

---

## Multi-Tenant Security (W9)

### Query checklist — setiap method wajib `owner_id`

| Repository method | Scope |
|-------------------|-------|
| `findById` | ✅ existing |
| `findByCodename` | `WHERE owner_id = ? AND codename = ?` |
| `findBySlug` | `WHERE owner_id = ? AND slug = ?` |
| `allocateCodename` | per owner_id |
| `findSearchCandidates` | `WHERE owner_id = ?` |
| `listDistinctCategories` | `WHERE owner_id = ?` |
| Relation `insert` | verify source & target same owner |
| Relation `delete` | `WHERE id = ? AND owner_id = ?` |
| Relation `findByMemoryId` | `WHERE owner_id = ? AND (source OR target)` |

### Cross-owner access

Selalu **404 NotFound** — bukan 403 (hindari leak UUID).

### Tests wajib (≥6)

1. POST relation target cross-owner → 404
2. GET relations memory cross-owner → 404
3. DELETE relation cross-owner → 404
4. Search tidak return memory owner lain
5. GET by codename cross-owner → 404
6. Categories hanya dari owner sendiri

---

## API

### Endpoint baru (canonical `/api/v1` only)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/categories` | ✅ |
| GET | `/api/v1/memory-types` | ✅ |
| GET | `/api/v1/memory/by-codename/:codename` | ✅ |
| GET | `/api/v1/memory/by-slug/:slug` | ✅ |
| GET | `/api/v1/memory/:id/relations` | ✅ |
| POST | `/api/v1/memory/:id/relations` | ✅ |
| DELETE | `/api/v1/memory/:id/relations/:relationId` | ✅ |

Legacy mount (`/memory`, dll.) **tidak** mendapat endpoint knowledge baru.

### Perluasan existing (additive)

**POST/PUT `/memory`** — optional: `keywords`, `category`, `memoryType`, `importance`, `language`, `notes`  
**Tidak boleh:** `codename` pada update body

**GET `/search`** — optional query: `category`, `memory_type`, `importance_min`

### Memory response (additive fields)

```json
{
  "id": "...",
  "codename": "FASTIFY-0001",
  "slug": "fastify-auth",
  "title": "...",
  "summary": "...",
  "keywords": ["fastify", "auth"],
  "category": "Development",
  "memoryType": "architecture",
  "importance": 75,
  "language": "id",
  "notes": "",
  "tags": [],
  "project": "",
  "content": "...",
  "favorite": false,
  "archived": false,
  "ownerId": "",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## MCP

### Tools diupdate

| Tool | Perubahan |
|------|-----------|
| `save_memory` | + optional `metadata: { category, memoryType, keywords, importance, language, notes }` |
| `update_memory` | + metadata (no codename) |
| `search_memory` | + filters; response `relevanceScore` |
| `get_memory` | extended response |

### Tools baru

| Tool | Fungsi |
|------|--------|
| `get_memory_by_codename` | Lookup `AUTH-0001` |
| `link_memories` | Create relation (by id or codename) |
| `list_relations` | Relations for memory |

---

## Testing (W12)

| File | Cakupan |
|------|---------|
| `tests/knowledge/codename.generator.test.ts` | Format, prefix |
| `tests/knowledge/slug.generator.test.ts` | Unicode, collision suffix |
| `tests/knowledge/summary.generator.test.ts` | Markdown strip, 300 cap |
| `tests/knowledge/keyword.normalizer.test.ts` | Dedupe, merge tags |
| `tests/services/knowledge.service.test.ts` | Orchestration |
| `tests/search/ranking.engine.test.ts` | Weights, tie-break |
| `tests/services/search.service.test.ts` | Pagination after rank |
| `tests/repositories/memory-relation.repository.test.ts` | CRUD, unique |
| `tests/api/knowledge.test.ts` | E2E categories, relations, leak |
| `tests/api/search-ranking.test.ts` | Order correctness |

**Target:** ≥75 tests total (dari 40).

---

## Breaking Changes

| Aspek | Breaking? |
|-------|-----------|
| URL existing | ❌ |
| Request body existing | ❌ semua baru optional |
| Response | ❌ additive |
| `summary` max 300 on new input | ⚠️ soft — client kirim >300 → 400 |
| Search sort order | ⚠️ behavioral — lebih relevan |

---

## Future Compatibility

| Phase | Ready? | Catatan |
|-------|--------|---------|
| 3 Authorization | ✅ | `memory_type` bisa jadi permission scope |
| 4 Memory Sync | ✅ | `codename` = sync key per owner |
| 5 Embedding | ✅ | Tabel `memory_embeddings` terpisah (bukan di memories) |
| 6 Vector Search | ✅ | `RankingEngine` + embedding weight |
| 7 AI Agent | ✅ | Relations dengan weight/confidence |
| 8 Knowledge Graph | ✅ | `memory_relations` extensible (W4) |
| 9 Multi-AI | ✅ | owner_id scoped |
| 10 Enterprise | ⚠️ | May need `tenant_id` later — not blocking |

---

## Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Codename race | W7: allocate + UNIQUE + retry |
| UNIQUE index fail | W5: backfill before M3 |
| FK not enforced D1 | W10: staging test + app cascade |
| Search slow at scale | Candidate cap; FTS Phase 6 |
| MockD1 drift | Staging integration test |

---

## Checklist Implementasi (Commits)

### Commit 1 — Types & migration M1a
- [ ] `src/types/knowledge.ts`
- [ ] Extend `memory.ts` schemas
- [ ] `migrateKnowledgeFoundationPhase1()`
- [ ] Sync `schema.sql`

### Commit 2 — Knowledge pure modules + tests
- [ ] `src/knowledge/*.ts`
- [ ] Generator unit tests

### Commit 3 — Repository
- [ ] Extend `MemoryRepository`
- [ ] `MemoryRelationRepository`
- [ ] `memory-mapper.ts`
- [ ] `MockD1Client` update

### Commit 4 — Search layer
- [ ] `ranking.config.ts`, `ranking.engine.ts`, `search.service.ts`
- [ ] Ranking tests

### Commit 5 — Service integration
- [ ] `MemoryService`, `MemoryRelationService`
- [ ] `server.ts`, `mcp/server.ts` wiring

### Commit 6 — API
- [ ] Controllers, routes, Swagger
- [ ] E2E + leak tests

### Commit 7 — MCP tools
- [ ] Updated + new tools

### Commit 8 — Backfill & migration M3
- [ ] `scripts/backfill-knowledge.ts`
- [ ] `migrateKnowledgeFoundationPhase3()`

### Commit 9 — Docs & gate
- [ ] README, ARCHITECTURE.md
- [ ] `lint` + `format:check` + `typecheck` + `test` ≥75

---

## Referensi

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [PHASE-2.5.md](PHASE-2.5.md)
- [../PANDUAN.md](../PANDUAN.md)
