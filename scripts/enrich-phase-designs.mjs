#!/usr/bin/env node
/**
 * Enrich DESIGN.md with phase-specific design intent (boundaries, ports, non-goals).
 * Run: node scripts/enrich-phase-designs.mjs
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
    archive: null,
    goal: 'Establish the minimal AI Memory Cloud: D1-backed persistence, repository port, unified `MemoryService`, and dual transport (REST + MCP stdio) with semantic parity.',
    architecture: `\
\`\`\`
Transport (REST / MCP)
       │
       ▼
MemoryService (CRUD orchestration)
       │
       ▼
IMemoryRepository → D1MemoryRepository
       │
       ▼
Cloudflare D1 (memories, identities, clients, audit_logs, settings)
\`\`\``,
    ports: [
      ['`IMemoryRepository`', 'All SQL isolated; services never touch D1 APIs directly'],
      ['`MemoryService`', 'Single orchestrator for create/read/update/delete/search'],
      ['`D1Client`', 'Infrastructure adapter for D1 query/execute'],
    ],
    boundaries: [
      'Controllers/MCP tools delegate to services — no business logic in transport',
      'Repositories contain SQL only — no HTTP or ranking rules',
      'Forward-only migrations via `runMigrations()`; canonical `schema.sql` snapshot',
    ],
    nonGoals: [
      'API key authentication (Phase 3)',
      'Knowledge metadata columns (Phase 2.6)',
      'Retrieval/ranking pipeline (Phase 4)',
      'Embeddings and vector search (Phases 5–6)',
      'Multi-workspace / multi-agent scope (Phase 9)',
    ],
  },
  {
    dir: '02.5-stabilization',
    title: 'Phase 2.5 — Stabilization',
    gateDate: '2026-06-29',
    classic: true,
    archive: null,
    goal: 'Stabilize the Phase 1 baseline: deterministic test harness, mandatory CI quality gates, and phase governance folder schema — without adding domain features.',
    architecture: 'No new runtime modules. Changes limited to `tests/`, CI workflows, and `.ai/phases/` documentation structure.',
    ports: [],
    boundaries: [
      'MockD1 replaces live D1 in unit tests — reproducible fixtures',
      'lint + typecheck + format required before merge',
      'Phase document schema defines ten governance files per phase folder',
    ],
    nonGoals: [
      'New REST/MCP endpoints',
      'Schema migrations',
      'Retrieval or embedding features',
    ],
  },
  {
    dir: '02.6-knowledge',
    title: 'Phase 2.6 — Knowledge Foundation',
    gateDate: '2026-06-30',
    classic: true,
    archive: '[PHASE-2.6-DESIGN.md](../../../.ai/archive/PHASE-2.6-DESIGN.md)',
    goal: 'Add structured knowledge metadata (codename, slug, keywords, category, importance) and `memory_relations` graph edges on the existing `memories` table — metadata foundation before authorization, retrieval, and embedding.',
    architecture: `\
\`\`\`
KnowledgeService (orchestrator)
  ├── CodenameGenerator / SlugGenerator (pure)
  ├── SummaryGenerator / KeywordNormalizer (pure)
  └── MemoryRepository.allocateCodename()

SearchService → RankingEngine (pure) → paginated candidates
MemoryRelationService → memory_relations table
\`\`\``,
    ports: [
      ['`KnowledgeService`', 'Orchestrates generators; no SQL'],
      ['`RankingEngine`', 'Pure scoring — no repository imports'],
      ['`MemoryRelationService`', 'Relation CRUD scoped by owner_id'],
    ],
    boundaries: [
      'Single SSOT: metadata lives on `memories` — no separate `memory_index` table',
      'Additive schema only; `summary` column reused (no duplicate column)',
      'UNIQUE indexes on `(owner_id, codename)` and `(owner_id, slug)` after backfill',
      'All queries scoped by `owner_id` — cross-owner leak tests mandatory',
    ],
    nonGoals: [
      'Semantic / vector search (Phases 5–6)',
      'Embeddings',
      'Agent runtime',
      '`search_score` column — runtime relevance only',
      '`status` column — use existing `archived` flag',
    ],
  },
  {
    dir: '03-authorization',
    title: 'Phase 3 — Authorization',
    gateDate: '2026-06-30',
    classic: true,
    archive: null,
    goal: 'Secure REST API with API-key authentication bound to owner identity. Fail closed on missing/invalid credentials. MCP process anchored via `MCP_OWNER_ID`.',
    architecture: `\
\`\`\`
HTTP Request
    │
    ▼
auth.middleware (Fastify preHandler)
    │
    ▼
AuthService → IdentityProvider chain → IdentityRepository
    │
    ▼
AuthUser { ownerId, identityId, clientId } → handlers
\`\`\``,
    ports: [
      ['`AuthService`', 'Provider chain; updates last_used on success'],
      ['`IdentityProvider`', 'Pluggable auth (API key MVP)'],
      ['`IdentityRepository`', 'CRUD on Phase 1 `identities` table'],
    ],
    boundaries: [
      'Reuses Phase 1 `identities` schema — no new DDL',
      'Never log raw API keys — hash/compare only via `secret_hash`',
      'Owner bound on identity — no header override for owner_id spoofing',
      '401 on missing auth; 403 on insufficient scope (future RBAC hooks)',
    ],
    nonGoals: [
      'OAuth / OIDC / SSO (Phases 17, 13.1)',
      'Workspace-scoped RBAC (Phase 9–10)',
      'OPA policy engine (Phase 17)',
    ],
  },
  {
    dir: '04-memory-intelligence',
    title: 'Phase 4 — Memory Intelligence',
    gateDate: '2026-07-01',
    classic: true,
    archive: '[PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md](../../../.ai/archive/PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md)',
    adr: 'ADR-004',
    goal: 'Intelligent retrieval pipeline: bounded candidate retrieval, ranking, token-budget context assembly, and background consolidation — without loading full corpus into LLM context.',
    architecture: `\
\`\`\`
REST /api/v1/context  ·  MCP get_context / build_prompt
       │
       ▼
ContextService.buildContext
       │
  Retriever → IRetrievalCandidateSource → IMemoryRepository (SQL projection)
       │
  Ranker → RankingEngine (pure)
       │
  ContextBuilder (token budget) → PromptBuilder
       │
MemoryConsolidator (batch CLI — dedupe, archive, stale promotion)
\`\`\``,
    ports: [
      ['`IRetrievalCandidateSource`', 'Candidate discovery contract (SQL leg in Phase 4)'],
      ['`Retriever`', 'Orchestrates source + filters + cap'],
      ['`Ranker`', 'Wraps pure RankingEngine'],
      ['`ContextBuilder` / `PromptBuilder`', 'Token-efficient assembly'],
      ['`MemoryConsolidator`', 'Batch hygiene — no HTTP'],
    ],
    boundaries: [
      '`MEMORY_SELECT` explicit projection — no full body in retrieval hot path (O-04-2)',
      '`recordAccessBatch` — single UPDATE for access tracking',
      'Importance scoring on write path; backfill script dry-run default',
      'Reserved columns (`embedding_id`, `object_key`) for Phases 5+ — no behavior yet',
    ],
    nonGoals: [
      'Embeddings and vector retrieval (Phase 5–6)',
      'PostgreSQL / R2 / pgvector adapters (Phase 10+)',
      'Semantic compression (Phase 5.5)',
      'Hard delete — archive only',
    ],
  },
  {
    dir: '05-embedding',
    title: 'Phase 5 — Embedding',
    gateDate: '2026-07-01',
    classic: true,
    archive: '[PHASE-5-EMBEDDING-DESIGN.md](../../../.ai/archive/PHASE-5-EMBEDDING-DESIGN.md)',
    adr: 'ADR-003',
    goal: 'Async embedding pipeline: generate and store vectors behind ports without blocking CRUD. Prepare Phase 6 hybrid retrieval via `IEmbeddingStore.searchSimilar`.',
    architecture: `\
\`\`\`
MemoryService (create/update) — no sync embed
       │
       ▼ (async)
EmbeddingJobRunner → IEmbeddingProvider.embed(batch)
       │
       ▼
IEmbeddingStore.upsert(memoryId, vector, modelId)
       │
       ▼
IMemoryRepository.setEmbeddingId (pointer on memories row)
\`\`\``,
    ports: [
      ['`IEmbeddingProvider`', 'Vendor-neutral embed API (noop default, openai opt-in)'],
      ['`IEmbeddingStore`', 'Vector persistence — no vector SQL in MemoryRepository'],
      ['`EmbeddingJobRunner`', 'Async batch processor'],
    ],
    boundaries: [
      'Constitution rule: never call `embed()` inside synchronous insert/update',
      'Vectors in `memory_embeddings` table — lightweight `embedding_id` pointer on memories',
      'Idempotent backfill with content_hash skip',
      'Default `EMBEDDING_PROVIDER=noop` — zero external API cost',
    ],
    nonGoals: [
      'Hybrid SQL+vector fusion ranking (Phase 6)',
      'Content offload to R2 (`object_key` wiring deferred)',
      'Real-time embed-on-every-read',
      'New MCP tools (contract unchanged at Phase 5 close)',
    ],
  },
  {
    dir: '06-hybrid-retrieval',
    title: 'Phase 6 — Hybrid Retrieval',
    gateDate: '2026-07-03',
    patch: true,
  },
  {
    dir: '21-search-graph-prod',
    title: 'Phase 21 — Search & Graph Production',
    gateDate: '2026-07-04',
    enrich: 'sections',
    adr: 'ADR-022',
    env: [['`SEARCH_GRAPH_PLATFORM_ENABLED`', 'false', 'Master gate for sync orchestrator REST']],
    extraNonGoals: ['Replacing Phase 10 runtime `SEARCH_PROVIDER` / `GRAPH_PROVIDER` selection'],
  },
  {
    dir: '22-content-scale',
    title: 'Phase 22 — Content & Vector Scale',
    gateDate: '2026-07-04',
    enrich: 'sections',
    adr: 'ADR-021',
    env: [['`CONTENT_SCALE_PLATFORM_ENABLED`', 'false', 'Master gate for content/vector sync REST']],
    extraNonGoals: ['Changing MemoryService write signatures or inline-first default behavior'],
  },
];

const ADR_LINKS = {
  'ADR-003': '[ADR-003 Embedding Storage MVP](../../../.ai/adr/003-embedding-storage-mvp.md)',
  'ADR-004': '[ADR-004 Repository Port Types](../../../.ai/adr/004-repository-port-types.md)',
};

function adrLine(adr) {
  if (!adr) return '';
  const link = ADR_LINKS[adr] ?? adr;
  return `  \n**ADR:** ${link}`;
}

function fixLegacyDesignHeader(content) {
  return content.replace(
    /(\*\*Phase status:\*\*) Closed[ \t]*\r?\n\*\*Gate:\*\* PASS ([^\r\n]+)\s*\r?\n/g,
    '$1 ✅ Closed — gate PASS ($2)  \n',
  );
}

function renderClassic(p) {
  const portRows = p.ports.length
    ? `\n## Ports & modules\n\n| Port / module | Responsibility |\n|---------------|----------------|\n${p.ports.map(([a, b]) => `| ${a} | ${b} |`).join('\n')}\n`
    : '';
  const archiveBlock = p.archive
    ? `\n\n**Design archive:** ${p.archive} (full narrative)\n`
    : '';

  return `# ${p.title} — DESIGN

**Phase status:** ✅ Closed — gate PASS (${p.gateDate})  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)${adrLine(p.adr)}${archiveBlock}

---

## Purpose

${p.goal}

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | Design phase begins — before implementation commits |
| **Updated by** | AI assistant drafts; owner approves; ADR author if structural |
| **Read-only when** | Phase gate PASS — frozen as historical design record |
| **Roadmap relation** | Captures scope and architecture evolution row |

---

## Architecture

${p.architecture}

---

## Boundaries

${p.boundaries.map((b) => `- ${b}`).join('\n')}
${portRows}
---

## Non-goals

${p.nonGoals.map((n) => `- ${n}`).join('\n')}

${FOOTER}`;
}

function patchPhase6(content) {
  return content
    .replace(
      '**ADR:** [ADR-001 Multi-Source Retrieval](../../../.ai/adr/001-multi-source-retrieval.md) — **Proposed** (must be **Approved** before code).',
      '**ADR:** [ADR-001 Multi-Source Retrieval](../../../.ai/adr/001-multi-source-retrieval.md) — **Approved** · Implemented',
    )
    .replace(
      '\n*Blocked until ADR-001 status is Approved. Do not contradict [09-ROADMAP.md](../../../roadmap/09-ROADMAP.md).*',
      FOOTER.trim(),
    );
}

function appendSections(content, p) {
  const blocks = [];
  if (p.env?.length && !content.includes('## Env flags')) {
    blocks.push(`## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
${p.env.map(([e, d, purpose]) => `| ${e} | ${d} | ${purpose} |`).join('\n')}`);
  }
  if (p.extraNonGoals?.length && !content.includes('## Non-goals')) {
    blocks.push(`## Non-goals

${p.extraNonGoals.map((n) => `- ${n}`).join('\n')}`);
  }
  if (blocks.length === 0) return content;
  const suffix = `\n\n---\n\n${blocks.join('\n\n---\n\n')}\n\n${FOOTER.trim()}`;
  if (content.includes(FOOTER.trim())) {
    return content.replace(FOOTER.trim(), `${blocks.join('\n\n---\n\n')}\n\n${FOOTER.trim()}`);
  }
  return content.trimEnd() + suffix;
}

function isScaffold(content) {
  return (
    content.includes('Summarize approved boundaries, ports, and non-goals here') ||
    content.includes('Full narrative remains in archive.') ||
    (content.includes('Record approved design intent: boundaries, ports, ADR links, and non-goals') &&
      !content.includes('## Architecture') &&
      !content.includes('## Boundaries'))
  );
}

function isStalePhase6(content) {
  return content.includes('**Proposed** (must be **Approved** before code)');
}

let updated = 0;
let skipped = 0;

if (process.argv.includes('--fix-headers')) {
  const dirs = fs
    .readdirSync(PHASES_DIR)
    .filter((d) => {
      const p = path.join(PHASES_DIR, d);
      return fs.statSync(p).isDirectory() && !['roadmap', 'audits'].includes(d);
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (const dir of dirs) {
    const file = path.join(PHASES_DIR, dir, 'DESIGN.md');
    if (!fs.existsSync(file)) continue;
    const existing = fs.readFileSync(file, 'utf8');
    if (!existing.includes('**Gate:** PASS')) continue;
    const next = fixLegacyDesignHeader(existing);
    if (next === existing) continue;
    fs.writeFileSync(file, next);
    updated++;
    console.log('header fixed', dir);
  }
  console.log(`\nFixed ${updated} DESIGN.md headers.`);
  process.exit(0);
}

for (const p of PHASES) {
  const file = path.join(PHASES_DIR, p.dir, 'DESIGN.md');
  if (!fs.existsSync(file)) {
    console.log('missing', p.dir);
    continue;
  }
  const existing = fs.readFileSync(file, 'utf8');

  if (p.patch) {
    if (!isStalePhase6(existing)) {
      console.log('skip (phase 6 already current)', p.dir);
      skipped++;
      continue;
    }
    fs.writeFileSync(file, patchPhase6(existing));
    updated++;
    console.log('patched', p.dir);
    continue;
  }

  if (p.enrich === 'sections') {
    const next = appendSections(existing, p);
    if (next === existing) {
      console.log('skip (sections present)', p.dir);
      skipped++;
      continue;
    }
    fs.writeFileSync(file, next);
    updated++;
    console.log('patched-sections', p.dir);
    continue;
  }

  if (!isScaffold(existing)) {
    console.log('skip (rich content)', p.dir);
    skipped++;
    continue;
  }

  fs.writeFileSync(file, renderClassic(p));
  updated++;
  console.log('updated', p.dir);
}

console.log(`\nUpdated ${updated} DESIGN.md files; skipped ${skipped}.`);
