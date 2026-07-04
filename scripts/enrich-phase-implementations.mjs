#!/usr/bin/env node
/**
 * Enrich IMPLEMENTATION.md with phase-specific deliverables and file maps.
 * Run: node scripts/enrich-phase-implementations.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');

const FOOTER =
  '\n---\n\n*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*\n';

/** @type {Array<Record<string, unknown>>} */
const PHASES = [
  {
    dir: '01-foundation',
    title: 'Phase 1 — Foundation',
    gateDate: '2026-06-28',
    classic: true,
    deliverables: [
      ['Core schema', '`memories`, `identities`, `clients`, `audit_logs`, `settings` via `MIGRATION_SQL`', '✅'],
      ['Repository port', '`IMemoryRepository` + `MemoryRepository` (D1 adapter)', '✅'],
      ['Domain service', '`MemoryService` — CRUD orchestration for MCP + REST', '✅'],
      ['REST transport', 'Fastify server — `/api/v1/memory`, health, context endpoints', '✅'],
      ['MCP transport', 'stdio MCP server — memory tools catalog', '✅'],
      ['Migrations', '`runMigrations()` forward-only runner', '✅'],
      ['Test harness', 'MockD1 + baseline Vitest suite', '✅'],
    ],
    fileMap: `src/
  repositories/memory.repository.ts    IMemoryRepository + D1 SQL
  services/memory.service.ts           CRUD orchestration
  services/create-memory-service.ts    Composition factory
  db/migrations.ts                     Canonical MIGRATION_SQL
  db/d1-client.ts                      D1 adapter
  server.ts / transport/rest/          REST entry (strangler to transport/)
  mcp/server.ts / transport/mcp/       MCP entry
  controllers/                         REST handlers
  routes/v1/                           Route registration
tests/helpers/mock-d1.ts               Test double`,
    env: null,
    invariants: [
      'Single `MemoryService` for MCP and REST — no duplicate business logic',
      'Repository port isolates D1 — no SQL in transport layer',
      'Forward-only migrations; canonical snapshot in `schema.sql`',
    ],
    rollback: 'Revert release; DDL forward-fix only in production',
  },
  {
    dir: '02.5-stabilization',
    title: 'Phase 2.5 — Stabilization',
    gateDate: '2026-06-29',
    classic: true,
    deliverables: [
      ['MockD1 harness', 'Deterministic fixtures; no live D1 in unit tests', '✅'],
      ['CI quality gate', 'lint + typecheck + format mandatory in CI', '✅'],
      ['Phase doc schema', '`.ai/phases/` folder structure + governance templates', '✅'],
      ['Flaky test fixes', 'Isolation and stable baseline test count', '✅'],
      ['Roadmap sync', 'Phase 1–2 evidence indexed', '✅'],
    ],
    fileMap: `tests/helpers/mock-d1.ts
.github/workflows/ci.yml              lint, typecheck, test jobs
.ai/phases/PHASE-DOCUMENT-SCHEMA.md   governance authority`,
    env: null,
    invariants: ['No new domain features — quality and documentation only', 'Baseline suite must stay green after each fix'],
    rollback: 'N/A — no persistence or API changes',
  },
  {
    dir: '02.6-knowledge',
    title: 'Phase 2.6 — Knowledge Foundation',
    gateDate: '2026-06-30',
    classic: true,
    adr: 'ADR-002',
    deliverables: [
      ['Knowledge columns', 'codename, slug, keywords, category, memory_type, importance, language, notes', '✅'],
      ['Generators', 'Codename + slug generators with uniqueness tests', '✅'],
      ['Summary', 'Rule-based `SummaryGenerator` on memory create/update', '✅'],
      ['Keywords', '`KeywordNormalizer` pipeline', '✅'],
      ['Relations table', '`memory_relations` — graph edge store (Phase 8 reuses)', '✅'],
      ['Migration', '`migrateKnowledgeFoundationPhase1/3`', '✅'],
      ['Backfill', '`scripts/backfill-knowledge.ts` — dry-run default', '✅'],
    ],
    fileMap: `src/knowledge/
  codename.generator.ts
  slug.generator.ts
  summary.generator.ts
  keyword.normalizer.ts
  metadata.validator.ts
  knowledge.service.ts
src/controllers/knowledge.controller.ts
src/routes/v1/knowledge.routes.ts
src/db/migrations.ts                 migrateKnowledgeFoundationPhase1/3
scripts/backfill-knowledge.ts
tests/knowledge/`,
    env: null,
    invariants: ['Additive columns only — existing CRUD paths preserved', 'Unique indexes applied after backfill (M3)'],
    rollback: 'Forward-fix only; nullable columns remain safe',
  },
  {
    dir: '03-authorization',
    title: 'Phase 3 — Authorization',
    gateDate: '2026-06-30',
    classic: true,
    deliverables: [
      ['Auth service', '`AuthService` — provider chain + identity resolution', '✅'],
      ['API key provider', '`resolveApiKey` — hash/compare via `identities` table', '✅'],
      ['Middleware', '`auth.middleware.ts` — Fastify preHandler hook', '✅'],
      ['Identity repository', '`IdentityRepository` — last_used tracking', '✅'],
      ['REST routes', '`/api/v1/auth/*` — key management endpoints', '✅'],
      ['401/403 E2E', 'Unauthorized routes rejected in regression suite', '✅'],
      ['MCP owner anchor', '`MCP_OWNER_ID` documented for production MCP', '✅'],
    ],
    fileMap: `src/auth/
  auth.service.ts
  auth.middleware.ts
  auth.types.ts
  identity.repository.ts
  providers/api-key.provider.ts
  events.ts                            auth audit events
src/controllers/auth.controller.ts
src/routes/v1/auth.routes.ts
tests/auth/`,
    env: [
      ['`AUTH_SECRET`', 'required', 'Session/signing secret (min 32 chars)'],
      ['`MCP_OWNER_ID`', 'optional', 'MCP process owner binding in prod'],
    ],
    invariants: [
      'Never log raw API keys — hash/compare only',
      'Owner bound on identity — no header override spoofing',
      'Reuses Phase 1 `identities` schema — no new DDL',
    ],
    rollback: 'Disable auth plugin registration; schema unchanged',
  },
  {
    dir: '04-memory-intelligence',
    title: 'Phase 4 — Memory Intelligence',
    gateDate: '2026-07-01',
    classic: true,
    deliverables: [
      ['Intelligence columns', 'project_id, level, last_accessed, access_count, embedding_id, object_key, semantic_hash', '✅'],
      ['Importance scoring', 'Rule-based scorer on write path', '✅'],
      ['recordAccessBatch', 'Single UPDATE batch — replaces N× recordAccess', '✅'],
      ['MEMORY_SELECT', 'Explicit retrieval projection — no full body in search', '✅'],
      ['Consolidator', '`MemoryConsolidator` — dedupe/archive hook (extended in 5.5)', '✅'],
      ['Retrieval indexes', '`migrateMemoryIntelligencePhase3` composite index', '✅'],
      ['Backfill', '`scripts/backfill-memory-intelligence.ts` — dry-run default', '✅'],
    ],
    fileMap: `src/memory/consolidator.ts
src/repositories/memory.repository.ts   recordAccessBatch, MEMORY_SELECT
src/services/memory.service.ts          importance on create/update
src/db/migrations.ts                    migrateMemoryIntelligencePhase1/3
scripts/backfill-memory-intelligence.ts
scripts/consolidate-memories.ts
tests/memory/`,
    env: null,
    invariants: [
      '`Retriever` and `ContextService` signatures unchanged at Phase 4 close',
      'Importance backfill idempotent with dry-run default',
      'Retrieval uses explicit column list — O-04-2 compliance',
    ],
    rollback: 'Forward-fix DDL only; consolidator via `scripts/consolidate-memories.ts` CLI only',
  },
  {
    dir: '05-embedding',
    title: 'Phase 5 — Embedding',
    gateDate: '2026-07-01',
    classic: true,
    adr: 'ADR-003',
    deliverables: [
      ['Vector store port', '`IEmbeddingStore` — vector SQL isolated from MemoryRepository', '✅'],
      ['D1 adapter', '`D1EmbeddingStore` + `memory_embeddings` table', '✅'],
      ['Async runner', '`EmbeddingJobRunner` — no sync embed on CRUD hot path', '✅'],
      ['Providers', '`noop` default + `openai` opt-in adapter', '✅'],
      ['Migration', '`migrateEmbeddingPhase1`', '✅'],
      ['Backfill CLI', '`npm run db:backfill-embeddings` — dry-run default', '✅'],
      ['Hybrid prep', 'Vector source ready for Phase 6 composite retrieval', '✅'],
    ],
    fileMap: `src/embedding/
  embedding.store.interface.ts
  d1-embedding.store.ts
  embedding-job.runner.ts
  create-embedding-provider.ts
  noop-embedding.provider.ts
  openai-embedding.provider.ts
  cosine-similarity.ts
src/db/migrations.ts                   migrateEmbeddingPhase1
scripts/backfill-embeddings.ts
tests/db/embedding-migration.test.ts
tests/embedding/`,
    env: [
      ['`EMBEDDING_PROVIDER`', 'noop', 'Embedding API provider'],
      ['`OPENAI_API_KEY`', '—', 'Required when provider=openai'],
      ['`EMBEDDING_MODEL`', 'text-embedding-3-small', 'OpenAI model id'],
    ],
    invariants: [
      'No vector SQL in `MemoryRepository` — ADR-003 port boundary',
      'CRUD hot path never awaits embed job completion',
      'content_hash skip on backfill for idempotency',
    ],
    rollback: '`EMBEDDING_PROVIDER=noop` — tables remain; vector leg inactive',
  },
  {
    dir: '06-hybrid-retrieval',
    title: 'Phase 6 — Hybrid Retrieval',
    gateDate: '2026-07-03',
    adr: 'ADR-001',
    deliverables: [
      ['Composite source', '`CompositeRetrievalCandidateSource` — SQL + vector fusion', '✅'],
      ['Vector leg', '`VectorRetrievalCandidateSource` — embedding similarity candidates', '✅'],
      ['SQL leg', 'Existing `SqlRetrievalCandidateSource` unchanged', '✅'],
      ['Fusion weights', '`src/search/ranking.config.ts` — configurable RRF weights', '✅'],
      ['Env flag', '`HYBRID_RETRIEVAL=false` default — SQL-only when OFF', '✅'],
      ['Composition', '`create-context-service.ts` wires composite or SQL-only', '✅'],
      ['Owner isolation', '20 cross-owner-leak regression tests', '✅'],
    ],
    fileMap: `src/memory/
  composite-retrieval-candidate-source.ts
  vector-retrieval-candidate-source.ts
  sql-retrieval-candidate-source.ts
  retrieval-candidate-source.interface.ts
  create-context-service.ts              HYBRID_RETRIEVAL wiring
  retriever.ts                           single IRetrievalCandidateSource inject
src/search/ranking.config.ts             fusion weights
src/config/env.ts                        HYBRID_RETRIEVAL flag
tests/memory/composite-retrieval*.test.ts
tests/security/cross-owner-leak.test.ts`,
    env: [
      ['`HYBRID_RETRIEVAL`', 'false', 'Enable SQL + vector composite retrieval'],
      ['`EMBEDDING_PROVIDER`', 'noop', 'Vector leg requires non-noop embed store'],
    ],
    invariants: [
      'Single `IRetrievalCandidateSource` injected into `Retriever` at composition root',
      '`Retriever`, `ContextService`, `MemoryRepository` unchanged',
      'Default env = pre-Phase-6 SQL-only behavior',
    ],
    rollback: '`HYBRID_RETRIEVAL=false` — instant; no DDL to reverse',
  },
];

const SKIP = new Set([
  '07-agent-runtime',
  '08-knowledge-graph',
  '09-multi-ai',
  '09.5-platform-architecture',
  '10-enterprise',
  '10.5-transport-connectivity',
  '11-production-ops',
]);

function isPlaceholder(content) {
  return content.includes('_To be populated from phase completion evidence');
}

function isDraft(content) {
  return content.includes('Implementation plan (draft)') || content.includes('*Activate when ADR-001 is Approved.*');
}

function isRich(content) {
  return (
    (content.includes('## Deliverables') && !isPlaceholder(content)) ||
    (content.includes('## Summary') && content.split('\n').length > 35) ||
    (content.includes('## Modules') && content.split('\n').length > 40) ||
    content.includes('## Implementation summary')
  );
}

function renderEnv(rows) {
  if (!rows?.length) return '';
  return `## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
${rows.map(([e, d, p]) => `| ${e} | ${d} | ${p} |`).join('\n')}

---

`;
}

const ADR_LINKS = {
  'ADR-001': '[ADR-001 Implemented](../../../.ai/adr/001-multi-source-retrieval.md)',
  'ADR-002': '[ADR-002 Implemented](../../../.ai/adr/002-workspace-identity-model.md)',
  'ADR-003': '[ADR-003 Implemented](../../../.ai/adr/003-embedding-storage-mvp.md)',
};

function adrHeader(adr) {
  if (!adr) return '';
  const link = ADR_LINKS[adr] ?? adr;
  return `  \n**ADR:** ${link}`;
}

function renderClassic(p) {
  const rows = p.deliverables.map(([a, b, s]) => `| ${a} | ${b} | ${s} |`).join('\n');
  return `# ${p.title} — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS ${p.gateDate}  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)${adrHeader(p.adr)}

---

## Purpose

Record what was built: modules, composition wiring, feature flags, and commit sequence.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Implementation planning starts (TASK_PROMPT active) |
| **Updated by** | Implementing AI assistant; maintainer on handoff |
| **Read-only when** | Phase gate PASS |
| **Roadmap relation** | Tracks milestone checkboxes in roadmap |

---

## Deliverables

| Area | Module / artifact | Status |
|------|-------------------|--------|
${rows}

---

## File map

\`\`\`
${p.fileMap}
\`\`\`

---

${renderEnv(p.env)}## Invariants

${p.invariants.map((i) => `- ${i}`).join('\n')}

---

## Rollback

${p.rollback}

${FOOTER}`;
}

function renderStandard(p) {
  const rows = p.deliverables.map(([a, b, s]) => `| ${a} | ${b} | ${s} |`).join('\n');
  return `# ${p.title} — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS ${p.gateDate}  
${adrHeader(p.adr)}

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
${rows}

---

## File map

\`\`\`
${p.fileMap}
\`\`\`

---

${renderEnv(p.env)}## Invariants

${p.invariants.map((i) => `- ${i}`).join('\n')}

---

## Rollback

${p.rollback}

${FOOTER}`;
}

function render(p) {
  return p.classic ? renderClassic(p) : renderStandard(p);
}

let updated = 0;
let skipped = 0;
for (const p of PHASES) {
  const file = path.join(PHASES_DIR, p.dir, 'IMPLEMENTATION.md');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (SKIP.has(p.dir) && isRich(existing)) {
    console.log('skip (rich content)', p.dir);
    skipped++;
    continue;
  }
  if (!isPlaceholder(existing) && !isDraft(existing) && isRich(existing)) {
    console.log('skip (already enriched)', p.dir);
    skipped++;
    continue;
  }
  fs.writeFileSync(file, render(p));
  updated++;
  console.log('updated', p.dir);
}

console.log(`\nUpdated ${updated} IMPLEMENTATION.md files; skipped ${skipped}.`);
