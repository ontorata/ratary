# 03 — Naming Convention

**Status:** Permanent project standard.  
**Audience:** AI assistants operating on this repository.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md), [01-05-WORKFLOW.md](01-05-WORKFLOW.md), and [02-CODING.md](../../core/standards/02-CODING.md).

---

# Purpose

Define a single, unambiguous naming system for all artifacts in this repository.

Ensure AI assistants and maintainers produce consistent identifiers across files, types, APIs, storage, configuration, and tests without reinterpretation.

Reduce integration errors caused by vocabulary drift between layers, modules, and documentation.

---

# Scope

## Covered

- Source files and folders
- Classes, interfaces, services, repositories
- DTOs, schemas, and Zod definitions
- Constants and environment variables
- REST API endpoints
- Database tables, columns, indexes
- Migration functions and scripts
- Test files and test descriptions

## Not Covered

- Architectural layer law → [01-05-WORKFLOW.md](01-05-WORKFLOW.md)
- Code formatting and function size → [02-CODING.md](../../core/standards/02-CODING.md)
- MCP tool names and protocol schemas → [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md), `src/mcp/`
- User-facing documentation titles → [../PANDUAN.md](../../docs/PANDUAN.md)
- ADR file numbering → [../adr/POLICY.md](../../../docs/adr/POLICY.md)

---

# Principles

1. **One concept, one name** — The same entity uses the same term from database column to TypeScript property to API field, modulo layer-appropriate casing.

2. **Case signals layer** — `snake_case` for SQL, `SCREAMING_SNAKE_CASE` for env and module constants, `camelCase` for TypeScript values, `PascalCase` for types and classes, `kebab-case` for files and URL segments.

3. **Suffix encodes role** — File and class suffixes declare responsibility (`Service`, `Repository`, `Controller`, `Schema`).

4. **No abbreviations** — Except established domain terms: `id`, `url`, `api`, `jwt`, `mcp`, `env`, `db`, `sql`.

5. **Explicit over short** — `ownerId` not `oid`. `embeddingId` not `eid`.

6. **Plural for collections** — Tables, list endpoints, and array variables use plural nouns where they hold multiple records.

7. **Boolean prefix** — `is`, `has`, `can`, `should` prefix boolean names.

8. **No Hungarian notation** — Type is not embedded in variable names (`strTitle` forbidden).

9. **Stable public names** — API paths and JSON fields are additive; renames require owner approval.

10. **English only** — All identifiers, endpoints, and schema fields use English.

---

# Standards

## Files

| Artifact | Pattern | Example |
|----------|---------|---------|
| Service | `{domain}.service.ts` | `memory.service.ts` |
| Repository | `{domain}.repository.ts` | `memory.repository.ts` |
| Repository interface | `{domain}.repository.interface.ts` | `memory.repository.interface.ts` |
| Controller | `{domain}.controller.ts` | `auth.controller.ts` |
| Route module | `{domain}.routes.ts` | `context.routes.ts` |
| Port interface | `{concern}.{role}.interface.ts` | `embedding.provider.interface.ts` |
| Adapter / store | `{engine}-{concern}.{role}.ts` | `d1-embedding.store.ts` |
| Provider | `{vendor}-{concern}.provider.ts` | `openai-embedding.provider.ts` |
| Pure engine | `{concern}.engine.ts` | `ranking.engine.ts` |
| Generator | `{concern}.generator.ts` | `codename.generator.ts` |
| Config | `{concern}.config.ts` | `context.config.ts` |
| Domain type module | `{domain}.ts` in `types/` | `memory.ts`, `knowledge.ts` |
| Mapper | `{domain}-mapper.ts` or `{domain}.mapper.ts` | `memory-mapper.ts` |
| Factory | `create-{concern}.ts` | `create-embedding-provider.ts` |
| Job runner | `{concern}-job.runner.ts` | `embedding-job.runner.ts` |
| Plugin | `{concern}.ts` in `plugins/` | `error-handler.ts` |
| Script CLI | `{verb}-{noun}.ts` in `scripts/` | `backfill-embeddings.ts` |
| Script lib | `{noun}.ts` in `scripts/lib/` | `embedding-backfill.ts` |
| Test | `{subject}.test.ts` | `memory.repository.test.ts` |
| E2E test | `{area}.test.ts` in `tests/api/` | `knowledge.test.ts` |
| Barrel export | `index.ts` | `repositories/index.ts` |

- All source file names: **kebab-case**.
- One primary export per file unless barrel `index.ts`.
- File name must reflect the primary type or function exported.

## Folders

| Folder | Contents |
|--------|----------|
| `src/routes/` | HTTP route registration |
| `src/routes/v1/` | Versioned route modules |
| `src/controllers/` | HTTP controllers |
| `src/services/` | Application services |
| `src/repositories/` | Persistence adapters |
| `src/{domain}/` | Domain modules (`memory/`, `search/`, `knowledge/`, `embedding/`, `auth/`) |
| `src/types/` | Shared types and Zod schemas |
| `src/config/` | Environment and app configuration |
| `src/db/` | Database client and migrations |
| `src/mcp/` | Protocol server |
| `src/plugins/` | Framework plugins |
| `src/utils/` | Mappers and formatters only |
| `tests/` | Mirrors `src/` structure where practical |
| `tests/helpers/` | Shared test utilities |
| `tests/api/` | HTTP integration tests |
| `scripts/` | CLI entrypoints |
| `scripts/lib/` | Script helpers non-executable as main |

- Folder names: **kebab-case**, singular domain noun (`memory` not `memories`).
- Do not create `managers/`, `handlers/`, `utils/business/` folders.
- New bounded context → new top-level folder under `src/`, not nested god-folder.

## Classes

| Role | Pattern | Example |
|------|---------|---------|
| Service | `{Domain}Service` | `MemoryService` |
| Repository | `{Domain}Repository` | `MemoryRepository` |
| Controller | `{Domain}Controller` | `HealthController` |
| Store adapter | `{Engine}{Concern}Store` | `D1EmbeddingStore` |
| Provider adapter | `{Vendor}{Concern}Provider` | `OpenAIEmbeddingProvider` |
| Job runner | `{Concern}JobRunner` | `EmbeddingJobRunner` |
| Typed error | `{Condition}Error` | `NotFoundError` |
| Auth provider | `{Mechanism}Provider` | `JwtProvider` |

- **PascalCase** for all class names.
- No `Manager`, `Helper`, `Util`, `Data`, or `Impl` suffixes.
- No version suffixes (`V2`, `New`, `Legacy`).

## Interfaces

| Role | Pattern | Example |
|------|---------|---------|
| Port | `I{Capability}` | `IMemoryRepository` |
| Segregated port | `I{Domain}{Reader\|Writer}` | `IMemoryReader` |
| Provider port | `I{Concern}Provider` | `IEmbeddingProvider` |
| Store port | `I{Concern}Store` | `IEmbeddingStore` |
| Candidate source | `I{Mechanism}RetrievalCandidateSource` | `IRetrievalCandidateSource` |
| Identity | `I{Role}` | `IdentityProvider` (no `I` when existing convention uses abstract name) |

- Port interfaces: **`I` prefix + PascalCase**.
- Interface name is noun or noun phrase — not verb (`IMemoryGetting`).
- One interface per file when exported publicly.

## Services

- Class: `{BoundedContext}Service`.
- File: `{bounded-context}.service.ts`.
- Public methods: **verb + noun**, camelCase — `createMemory`, `deleteMemory`, `listProjects`, `searchMemory`.
- First parameter: scope object `{ ownerId }` or `MemoryScope` on every owner-scoped method.
- No `get` prefix when `find` conveys lookup semantics; use `get` when absence throws, `find` when absence returns null.

| Semantics | Prefix | Example |
|-----------|--------|---------|
| Return or throw | `get` | `getMemoryById` |
| Return null | `find` | `findByMemoryId` |
| Create | `create` | `createMemory` |
| Update | `update` | `updateMemory` |
| Delete | `delete` | `deleteMemory` |
| List collection | `list` | `listMemories` |
| Search / query | `search` | `searchMemory` |
| Toggle state | `toggle` | `toggleFavorite` |
| Import/export | `import` / `export` | `exportBackup` |
| Replace wholesale | `replace` | `replaceBackup` |

## Repositories

- Class: `{Domain}Repository` implements `I{Domain}Repository`.
- File: `{domain}.repository.ts`.
- Methods name **data operations**, not use cases: `insert`, `update`, `delete`, `findById`, `findSearchCandidates`, `applyEmbeddingBackfill`.
- Parameters: identifiers before filters — `(id, ownerId)`, `(ownerId, filters)`.
- Return types: domain entity, array, count, or boolean — not HTTP shapes.

| Operation | Method pattern | Example |
|-----------|----------------|---------|
| Insert row | `insert(data)` | `insert(InsertMemoryData)` |
| Update row | `update(id, ownerId, data)` | |
| Delete row | `delete(id, ownerId)` | |
| Delete by scope | `deleteAllByOwner(ownerId)` | |
| Single fetch | `findById(id, ownerId)` | |
| Collection fetch | `find{Predicate}` | `findWithoutEmbedding` |
| Count | `count{Predicate}` | |
| Backfill patch | `apply{Concern}Backfill` | `applyEmbeddingBackfill` |

## DTO

| Layer | Naming | Casing |
|-------|--------|--------|
| Insert payload | `Insert{Entity}Data` | camelCase properties |
| Update payload | `Update{Entity}Data` | camelCase; all fields optional |
| List filters | `ListFilters` or `List{Entity}Filters` | camelCase |
| Search filters | `SearchFilters` | camelCase |
| Scope | `{Entity}Scope` | `ownerId` required |
| Persistence row | `{Entity}Row` | `snake_case` properties matching DB |
| API response (typed) | Same as domain entity or `*Response` when edge-only | camelCase JSON |
| Backup / import | `{Action}{Entity}Input` | `BackupImportInput` |

- DTO interfaces live in `src/types/` — not beside repository SQL.
- Domain properties: **camelCase** (`ownerId`, `createdAt`, `memoryType`).
- Database row types: **snake_case** (`owner_id`, `created_at`, `memory_type`).
- Mapping functions: `mapRowTo{Entity}`, `map{Entity}ToRow` in mapper modules.

## Schemas

- Zod schema variable: **camelCase** + `Schema` suffix.
- Inferred type: **PascalCase**, same stem without `Schema`.

| Schema variable | Inferred type |
|-----------------|---------------|
| `createMemorySchema` | `CreateMemoryInput` (via `z.infer`) |
| `updateMemorySchema` | `UpdateMemoryInput` |
| `listMemoriesQuerySchema` | query type via infer |
| `envSchema` | `Env` |
| `idParamSchema` | inline or inferred |

- Request body schemas: `{action}{Entity}Schema` or `{action}{Entity}BodySchema`.
- Query schemas: `{action}{Entity}QuerySchema`.
- Param schemas: `{name}ParamSchema`.
- Enum schemas: `{enumName}Schema` tied to `as const` source — `memoryTypeSchema`, `categorySchema`.

## Zod

- Define enums from `as const` arrays or tuples; derive schema with `z.enum(VALUES)`.
- Schema and const share stem: `MEMORY_TYPES` → `memoryTypeSchema`.
- Coercion: `z.coerce.number()` for query and env numeric fields.
- Defaults: `.default()` on env and optional query fields.
- Custom validation: `.superRefine()` for cross-field rules (e.g., API key required when provider is openai).
- Export schema and inferred type from same module.
- Route validation uses shared schema from `types/` — no duplicate inline schemas in routes.

## Constants

| Kind | Convention | Example |
|------|------------|---------|
| Module config cap | `UPPER_SNAKE_CASE` | `SEARCH_CANDIDATE_CAP` |
| Enum values source | `UPPER_SNAKE_CASE` plural | `MEMORY_TYPES`, `CATEGORIES` |
| Model / provider id | `UPPER_SNAKE_CASE` | `NOOP_EMBEDDING_MODEL_ID` |
| Permission string | `dot.notation` lowercase | `memory.read`, `memory.write` |
| Error code | `UPPER_SNAKE_CASE` | `NOT_FOUND`, `VALIDATION_ERROR` |
| HTTP header | standard name | `x-request-id` lowercase in code |

- Config constants: file `{concern}.config.ts`, exports only constants.
- Do not prefix const with `const` or `k` (`kMaxRetries` forbidden).

## Environment variables

- Pattern: **`UPPER_SNAKE_CASE`**, words separated by underscore.
- Group by concern with comment blocks in `.env.example`.
- Names are explicit: `D1_DATABASE_ID` not `DB_ID`.
- Boolean env: use string enum in schema (`'true'/'false'`) or presence check — not `ENABLE_X=1`.
- Secrets: suffix or full name identifies purpose — `AUTH_SECRET`, `EMBEDDING_API_KEY`, `D1_API_TOKEN`.
- Schema field name matches env key exactly.
- Defaults documented in schema `.default()`, mirrored in `.env.example` as comment.

| Category | Prefix / examples |
|----------|-------------------|
| Server | `NODE_ENV`, `PORT`, `LOG_LEVEL` |
| Storage | `CLOUDFLARE_ACCOUNT_ID`, `D1_DATABASE_ID`, `D1_API_TOKEN` |
| Auth | `AUTH_SECRET`, `MCP_OWNER_ID` |
| Feature provider | `EMBEDDING_PROVIDER`, `EMBEDDING_MODEL`, `EMBEDDING_API_KEY` |
| Ops / scripts | `BACKUP_ROOT`, `BACKUP_SYNC_DEBOUNCE_MS` |

## API endpoints

- Base prefix: **`/api/v1`**.
- Path segments: **kebab-case**, lowercase, plural nouns for collections.
- Path parameters: **camelCase in code** (`:ownerId` rare; prefer auth context), **singular** resource name (`:id`, `:codename`, `:slug`, `:relationId`).
- No trailing slash.
- No verbs in path except when REST sub-resource is action-oriented and established (`/auth/bootstrap`).

| Pattern | Example |
|---------|---------|
| Collection | `GET /memory` |
| Resource | `GET /memory/:id` |
| Sub-resource | `GET /memory/:id/relations` |
| Lookup by alternate key | `GET /memory/by-codename/:codename` |
| Search | `GET /search` |
| Action via POST body | `POST /context` |
| Auth namespace | `/auth/{action}` |
| Health | `GET /health`, `GET /api/v1/health` |
| Backup | `/backup/export`, `/backup/import` |

- JSON request/response fields: **camelCase** (`createdAt`, `memoryType`, `ownerId`).
- Display-only fields may add suffix: `createdAtWIB`.
- Query parameters: **camelCase** matching schema (`limit`, `offset`, `archived`).

## Database tables

- Pattern: **`snake_case`**, plural noun.
- Examples: `memories`, `memory_relations`, `memory_embeddings`, `audit_logs`, `identities`, `clients`, `settings`.
- Junction / relation tables: `{entity1}_{entity2}` or `{parent}_{child}` — `memory_relations`.
- Column names: **snake_case**.
- Primary key: `id` (UUID string).
- Foreign scope: `owner_id` on all tenant-scoped tables.
- Foreign keys: `{referenced_table_singular}_id` — `memory_id`, `identity_id`, `client_id`.
- Timestamps: `created_at`, `updated_at` (ISO 8601 UTC strings).
- Boolean columns: `is_` prefix optional; prefer bare adjective when clear (`favorite`, `archived`, `active`).
- Reserved link columns: `embedding_id`, `object_key` — singular entity reference.

## Indexes

- Pattern: **`idx_{table_or_abbrev}_{column(s)}`**.
- Unique index: **`idx_{table}_{columns}`** with `UNIQUE INDEX` — or `idx_{table}_{purpose}` when semantic (`idx_relations_unique`).
- Composite index: columns joined by underscore — `idx_memories_owner_id_codename`.
- Partial indexes: document predicate in migration comment.

| Example | Purpose |
|---------|---------|
| `idx_memories_project` | Filter by project |
| `idx_memories_owner_id` | Scope queries |
| `idx_memories_owner_id_codename` | Unique constraint support |
| `idx_relations_unique` | Uniqueness on edge |
| `idx_audit_logs_created_at` | Time-range queries |

## Migration files

- Migrations live in `src/db/migrations.ts` as named async functions — not loose SQL files unless ADR adopts flyway-style.
- Function pattern: **`migrate{PhaseOrFeature}{PhaseNumber}`** — `migrateEmbeddingPhase1`, `migrateMemoryIntelligencePhase3`.
- SQL constants: **`SCREAMING_SNAKE_CASE`** + `_DDL` suffix — `MEMORY_EMBEDDINGS_DDL`.
- Idempotent DDL: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE` only when guarded.
- Migration runner: `scripts/migrate.ts` calls functions in dependency order.
- Test file for schema: `tests/db/{concern}-migration.test.ts`.

## Test files

| Test target | File path pattern |
|-------------|-------------------|
| Unit next to domain | `tests/{domain}/{file}.test.ts` |
| Service | `tests/services/{service}.test.ts` |
| Repository | `tests/repositories/{repository}.test.ts` |
| API E2E | `tests/api/{area}.test.ts` or `tests/api.test.ts` |
| Auth E2E | `tests/auth/{area}.test.ts` |
| Script | `tests/scripts/{script-name}.test.ts` |
| Helper | `tests/helpers/{name}.ts` (no `.test` — not a test file) |

- Test file name mirrors source file: `memory.service.ts` → `memory.service.test.ts`.
- `describe` block: subject name — `MemoryService`, `D1EmbeddingStore`.
- `it` block: **should** + expected behavior — `should delete embedding when memory is deleted`.
- Test fixtures: `{entity}Fixture` or factory `createTest{Entity}`.
- Mock classes: `Mock{Engine}{Concern}` — `MockD1Client`.
- Test owner constant: `ownerId = 'test-owner'` or descriptive UUID string.

---

# Required

1. Apply correct case per layer when naming the same concept.
2. Use mandated suffixes for files, classes, interfaces, and schemas.
3. Name REST paths under `/api/v1` with kebab-case segments.
4. Name database tables and columns in snake_case.
5. Name TypeScript domain properties in camelCase.
6. Name environment variables in UPPER_SNAKE_CASE matching env schema.
7. Colocate Zod schema and inferred type with consistent stems.
8. Mirror `src/` structure in `tests/` for new modules.
9. Use `ownerId` / `owner_id` as canonical scope identifier until ADR expands scope model.
10. Export one primary concept per file with matching file name.

---

# Forbidden

1. Mixed vocabulary for same concept (`userId` in one layer, `ownerId` in another).
2. File names in camelCase, PascalCase, or snake_case.
3. Class names without role suffix when suffix convention exists.
4. Interface names without `I` prefix for ports (except established exceptions like `IdentityProvider`).
5. `*Manager`, `*Util`, `*Helper`, `*V2`, `*Impl` class or file names.
6. Verb-based table names (`get_memories`, `fetch_logs`).
7. API paths with snake_case, camelCase, or version in resource name (`/api/v1/getMemory`).
8. JSON fields in snake_case in public REST responses.
9. Abbreviated env vars (`D1_ID`, `SEC`).
10. Duplicate schema definitions for the same payload in multiple files.
11. Test files named `test-*.ts` or `*.spec.ts` (use `*.test.ts` only).
12. Index names without `idx_` prefix.
13. Migration functions named `runMigration`, `up`, `down` without phase identity.
14. Hungarian notation in any identifier.

---

# Decision Rules

## Same concept, different layers

| Concept | TypeScript | JSON API | SQL column | Env |
|---------|------------|----------|------------|-----|
| Owner scope | `ownerId` | `ownerId` | `owner_id` | `MCP_OWNER_ID` |
| Created time | `createdAt` | `createdAt` | `created_at` | — |
| Memory type | `memoryType` | `memoryType` | `memory_type` | — |
| Embedding link | `embeddingId` | `embeddingId` | `embedding_id` | — |
| Content hash | `contentHash` | — | `content_hash` | — |

## File suffix selection

| Contains | Suffix |
|----------|--------|
| Orchestration + business rules | `.service.ts` |
| SQL / storage | `.repository.ts` or `.store.ts` |
| HTTP mapping | `.controller.ts` |
| Route registration | `.routes.ts` |
| Zod + types only | `types/{name}.ts` |
| Pure functions | `.engine.ts`, `.generator.ts`, or domain folder |
| Port interface | `.interface.ts` |

## Service vs repository method

| Question | Name in |
|----------|---------|
| Business rule or workflow step? | Service — `archiveMemory` |
| Single table read/write? | Repository — `update` |
| Cross-port orchestration? | Service — `deleteMemory` + store cleanup |
| SQL-specific batch query? | Repository — `findWithoutEmbedding` |

## Schema naming

| Payload | Schema name |
|---------|-------------|
| POST body create | `create{Entity}Schema` |
| PUT/PATCH body | `update{Entity}Schema` |
| GET query | `list{Entity}QuerySchema` or `searchQuerySchema` |
| URL params | `{name}ParamSchema` |
| Environment | `envSchema` |

## API path shape

| Resource type | Path |
|---------------|------|
| Standard CRUD | `/{plural}` and `/{plural}/:id` |
| Alternate natural key | `/{plural}/by-{key}/:{key}` |
| Nested owned resource | `/{parent}/:id/{children}` |
| Non-CRUD action | `POST /{resource}` with verb in body or `POST /{resource}/{action}` only if established |

## When to create new folder

| Condition | Action |
|-----------|--------|
| New bounded context (embedding, auth) | `src/{context}/` |
| Versioned routes | `src/routes/v1/` |
| ≥ 3 files same subdomain | Subfolder under domain |
| Single file | Stay in parent folder |

---

# Examples

## Good

| Artifact | Name |
|----------|------|
| File | `src/embedding/d1-embedding.store.ts` |
| Class | `D1EmbeddingStore implements IEmbeddingStore` |
| Method | `findWithoutEmbedding(ownerId, limit)` |
| DTO | `InsertMemoryData` with `ownerId`, `memoryType` |
| Row type | `MemoryRow` with `owner_id`, `memory_type` |
| Schema | `createMemorySchema` → `z.infer<typeof createMemorySchema>` |
| Constant | `RETRIEVAL_MAX_RANKED` in `ranking.config.ts` |
| Env | `EMBEDDING_BATCH_SIZE` |
| Endpoint | `GET /api/v1/memory/by-slug/:slug` |
| Table | `memory_embeddings` column `content_hash` |
| Index | `idx_memory_embeddings_owner_id` |
| Migration | `migrateEmbeddingPhase1` |
| Test | `tests/embedding/d1-embedding.store.test.ts` |

## Bad

| Artifact | Name | Why |
|----------|------|-----|
| File | `MemoryService.ts` | PascalCase file |
| File | `memory_svc.ts` | Abbreviation |
| Class | `MemoryManager` | Forbidden suffix |
| Interface | `MemoryRepository` | Missing `I` on port |
| Method | `getMemoriesForUser` | Wrong vocabulary (`user`) |
| DTO | `memory_data` | snake_case in TS |
| Schema | `memorySchema` | Ambiguous action |
| Env | `embed_key` | Lowercase |
| Endpoint | `/api/v1/GetMemory` | camelCase path |
| Table | `Memory` | Singular PascalCase |
| Column | `ownerId` | camelCase in SQL |
| Index | `memory_owner_index` | Missing `idx_` prefix |
| Migration | `addEmbedding` | No phase identity |
| Test | `memory.spec.ts` | Wrong suffix |

---

# Checklist

## New module

- [ ] File name kebab-case with correct suffix
- [ ] Folder matches bounded context
- [ ] Class/interface name PascalCase with role suffix
- [ ] Port interface has `I` prefix
- [ ] Methods follow verb-noun and layer naming rules

## New API surface

- [ ] Path under `/api/v1`, kebab-case
- [ ] JSON fields camelCase
- [ ] Zod schema named `{action}{Entity}Schema`
- [ ] Permission string uses `resource.action` pattern if applicable

## New persistence

- [ ] Table name plural snake_case
- [ ] Columns snake_case; `owner_id` present on scoped tables
- [ ] Index names prefixed `idx_`
- [ ] Migration function `migrate{Feature}{Phase}`
- [ ] Row type and mapper named `{Entity}Row`, `mapRowTo{Entity}`

## New config

- [ ] Env var UPPER_SNAKE_CASE in schema and `.env.example`
- [ ] Operational caps in `*.config.ts` as UPPER_SNAKE_CASE

## New tests

- [ ] File `*.test.ts` mirroring source path
- [ ] `describe` = subject; `it` = `should …`
- [ ] Fixtures use `test-owner` or explicit test UUID

---

*Inherits from [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md), [01-05-WORKFLOW.md](01-05-WORKFLOW.md), and [02-CODING.md](../../core/standards/02-CODING.md). Amend only with project owner approval.*
