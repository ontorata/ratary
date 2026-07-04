#!/usr/bin/env node
/**
 * Enrich MIGRATION.md with phase-specific schema, data, and runbook records.
 * Run: node scripts/enrich-phase-migrations.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');

const FOOTER =
  '\n---\n\n*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*\n';

const LIFECYCLE = `## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | First schema or data migration identified for phase |
| **Updated by** | Implementing assistant; owner for production deploy |
| **Read-only when** | Phase gate PASS; post-close hotfixes append addenda only |
| **Roadmap relation** | Documents persistence changes required by phase dependencies |

---

`;

function header(title, status, gateDate) {
  return `# ${title} — MIGRATION

**Phase status:** ${status}${gateDate ? `  \n**Gate:** PASS ${gateDate}` : ''}  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

`;
}

function propsTable(rollback, extra = []) {
  const rows = [
    ['Rollback', rollback],
    ['Idempotency', 'Migration runner applies forward-only steps; `CREATE IF NOT EXISTS` / column guards'],
    ['Production', 'Opt-in where flagged; default deploy unchanged'],
    ...extra,
  ];
  return `| Property | Value |
|----------|-------|
${rows.map(([k, v]) => `| ${k} | ${v} |`).join('\n')}`;
}

function renderSchema(p) {
  const tables = p.tables.map((t) => `- ${t}`).join('\n');
  const rollout = p.rollout?.length
    ? `\n## Rollout steps\n\n| Step | Action | Production impact |\n|------|--------|-------------------|\n${p.rollout.map(([s, a, i]) => `| ${s} | ${a} | ${i} |`).join('\n')}\n\n---\n\n`
    : '';
  const backfill = p.backfill
    ? `\n## Data backfill\n\n${p.backfill}\n\n---\n\n`
    : '';
  return (
    header(p.title, p.status ?? 'Closed', p.gateDate) +
    (p.classic ? LIFECYCLE : '') +
    `## Schema changes (additive)

Applied via \`${p.migrateFn}\` in \`src/db/migrations.ts\`${p.adr ? ` (${p.adr})` : p.adrs ? ` (${p.adrs.join(', ')})` : ''}.

### Objects

${tables}

---

## Verification

[\`${p.testFile}\`](../../../${p.testFile})

${propsTable(p.rollback, p.extraProps)}
${rollout}${backfill}Gate evidence: migration test green at gate ${p.gateDate}.

${FOOTER}`
  );
}

function renderNa(p) {
  return (
    header(p.title, p.status ?? 'Closed (N/A — no migrations)', p.gateDate) +
    (p.classic ? LIFECYCLE : '') +
    `## Migrations

**N/A — ${p.reason}**

${propsTable(p.rollback)}

Gate evidence: [REVIEW.md](REVIEW.md) — Migration **PASS** (N/A${p.gateNote ? `, ${p.gateNote}` : ''}).

${FOOTER}`
  );
}

function renderRunbook(p) {
  return (
    header(p.title, 'Closed', p.gateDate) +
    `## Scope

${p.scope}

**No new application DDL in this phase.** Phase 11 delivers **operational proof** of the Postgres metadata path per [ADR-018](../../../docs/adr/018-production-postgres-cutover.md): schema bootstrap, staging harness, backfill/parity scripts, and owner-run cutover runbook.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Postgres migration runner | \`src/db/postgres-migrations.ts\` → \`runPostgresMigrations()\` |
| Schema bootstrap CLI | \`scripts/apply-postgres-schema.ts\` — \`npm run db:apply-postgres-schema\` |
| D1 → Postgres backfill | \`scripts/backfill-d1-to-postgres.ts\` — dry-run default |
| Parity verification | \`scripts/verify-postgres-parity.ts\` — exit 0/1 on count mismatch |
| Staging CI | \`.github/workflows/postgres-staging.yml\` — Postgres 16 service |
| Runbook detail | [IMPLEMENTATION.md](IMPLEMENTATION.md) |

---

## Cutover stages (owner-run)

| Stage | Action | Rollback |
|-------|--------|----------|
| **S0** | Deploy code; \`SQL_PROVIDER\` unset (D1 default) | N/A |
| **S1** | \`npm run db:apply-postgres-schema\` on target Postgres | Drop test DB only in staging |
| **S2** | \`npm run db:backfill-d1-to-postgres\` (dry-run) → review | N/A |
| **S3** | \`npm run db:backfill-d1-to-postgres -- --execute\` | Re-run from D1 source; idempotent upsert |
| **S4** | \`npm run db:verify-postgres-parity\` → flip \`SQL_PROVIDER=postgres\` | Set \`SQL_PROVIDER=d1\`; Postgres remains warm standby |

**Backfill order (FK-safe):** organizations → workspaces → clients → identities → memories → memory_embeddings → memory_relations → audit_logs → downstream platform tables.

---

## Verification

- [\`tests/db/postgres-migrations.test.ts\`](../../../tests/db/postgres-migrations.test.ts) — idempotency
- [\`tests/scripts/d1-to-postgres-backfill.test.ts\`](../../../tests/scripts/d1-to-postgres-backfill.test.ts)
- CI: \`postgres-staging.yml\` green at gate ${p.gateDate}

Gate evidence: [REVIEW.md](REVIEW.md) — Migration **PASS** (data/ops runbook).

${FOOTER}`
  );
}

/** @type {Array<Record<string, unknown>>} */
const PHASES = [
  {
    kind: 'schema',
    dir: '01-foundation',
    title: 'Phase 1 — Foundation',
    gateDate: '2026-06-28',
    classic: true,
    migrateFn: 'runMigrations() / MIGRATION_SQL',
    tables: [
      '`memories` — core CRUD table + indexes',
      '`identities` — API key / identity store (`secret_hash` unique partial index)',
      '`clients` — registered client metadata',
      '`audit_logs` — security audit trail',
      '`settings` — key/value config',
    ],
    testFile: 'tests/db/postgres-migrations.test.ts',
    rollback: 'Revert release; forward-fix only — no column drops in production',
    rollout: [
      ['1', 'Deploy application', 'Runs `runMigrations()` on startup'],
      ['2', 'Verify schema', 'Canonical snapshot: `schema.sql` at repo root'],
    ],
  },
  {
    kind: 'na',
    dir: '02.5-stabilization',
    title: 'Phase 2.5 — Stabilization',
    gateDate: '2026-06-29',
    classic: true,
    reason: 'no schema or data migration — quality gate and test harness stabilization only',
    rollback: 'N/A — no persistence changes',
    gateNote: 'no DDL',
  },
  {
    kind: 'schema',
    dir: '02.6-knowledge',
    title: 'Phase 2.6 — Knowledge Foundation',
    gateDate: '2026-06-30',
    classic: true,
    migrateFn: 'migrateKnowledgeFoundationPhase1() + migrateKnowledgeFoundationPhase3()',
    adr: 'ADR-002 knowledge columns',
    tables: [
      '`memories` columns: codename, slug, keywords, category, memory_type, importance, language, notes',
      '`memory_relations` — graph edge store (used by Phase 8)',
      'Indexes: idx_memories_owner_category, idx_memories_memory_type, idx_memories_importance',
      'Unique partial indexes: idx_memories_owner_codename, idx_memories_owner_slug (Phase 3 backfill)',
    ],
    testFile: 'tests/db/postgres-migrations.test.ts',
    rollback: 'Forward-fix only; nullable/additive columns',
    backfill: 'Slug/codename uniqueness requires backfill before unique indexes (M3). Scripts in Phase 2.6 IMPLEMENTATION.',
  },
  {
    kind: 'na',
    dir: '03-authorization',
    title: 'Phase 3 — Authorization',
    gateDate: '2026-06-30',
    classic: true,
    reason:
      'no new DDL — authorization reuses Phase 1 `identities` table (`secret_hash`, `owner_id`, `active`). Fastify auth plugin validates API keys against existing schema',
    rollback: 'Disable auth middleware config; schema unchanged',
    gateNote: 'no DDL',
  },
  {
    kind: 'schema',
    dir: '04-memory-intelligence',
    title: 'Phase 4 — Memory Intelligence',
    gateDate: '2026-07-01',
    classic: true,
    migrateFn: 'migrateMemoryIntelligencePhase1() + migrateMemoryIntelligencePhase3()',
    tables: [
      '`memories` columns: project_id, level, last_accessed, access_count, embedding_id, object_key, semantic_hash',
      'Retrieval indexes: idx_memories_project_id, idx_memories_level, idx_memories_last_accessed, idx_memories_retrieval',
    ],
    testFile: 'tests/db/postgres-migrations.test.ts',
    rollback: 'Forward-fix only; importance backfill via CLI dry-run default',
    backfill: '`scripts/backfill-importance.ts` — dry-run default; idempotent importance scoring.',
  },
  {
    kind: 'schema',
    dir: '05-embedding',
    title: 'Phase 5 — Embedding',
    gateDate: '2026-07-01',
    classic: true,
    migrateFn: 'migrateEmbeddingPhase1()',
    adr: 'ADR-003',
    tables: [
      '`memory_embeddings` — vector storage table (dimensions, model, owner_id)',
      'Indexes on memory_embeddings for owner + memory lookup',
    ],
    testFile: 'tests/db/embedding-migration.test.ts',
    rollback: '`EMBEDDING_PROVIDER=noop` — tables remain; no hot-path dependency when disabled',
    backfill: '`scripts/backfill-embeddings.ts` — async job; dry-run default.',
  },
  {
    kind: 'na',
    dir: '04.7-memory-stewardship',
    title: 'Phase 04.7 — Memory Stewardship',
    gateDate: '2026-07-04',
    reason:
      'no DDL — stewardship uses `InMemoryStewardshipRunStore` MVP. Batch tasks mutate existing memories via `MemoryService` only',
    rollback: '`MEMORY_STEWARDSHIP_ENABLED=false`',
    gateNote: 'no DDL',
  },
  {
    kind: 'schema',
    dir: '05.5-semantic-compression',
    title: 'Phase 5.5 — Semantic Compression',
    gateDate: '2026-07-04',
    migrateFn: 'migrateExtensionTracksPhase1() (compression columns portion)',
    adr: 'ADR-023',
    tables: [
      '`memories` columns: compression_meta, compression_version, lifecycle_state',
      'Note: same migration step also creates `memory_signals` (Phase 8.5 scope)',
    ],
    testFile: 'tests/db/extension-tracks-migration.test.ts',
    rollback: '`COMPRESSION_ENABLED=false` — columns remain; no hot-path reads when OFF',
  },
  {
    kind: 'na',
    dir: '06.5-progressive-retrieval',
    title: 'Phase 6.5 — Progressive Retrieval',
    gateDate: '2026-07-04',
    reason:
      'no DDL — `DefaultRetrievalPolicy` adds optional `retrievalPlan` response field only; always-on adapter with zero schema change',
    rollback: 'N/A — behavior compatible with pre-6.5 defaults',
    gateNote: 'no DDL',
  },
  {
    kind: 'na',
    dir: '07.5-runtime-compatibility',
    title: 'Phase 7.5 — Runtime Compatibility',
    gateDate: '2026-07-04',
    reason: 'no DDL — capability manifest reads existing env flags; `MCP_TOOL_NAMES` SSOT only',
    rollback: 'N/A — discovery endpoints only',
    gateNote: 'no DDL',
  },
  {
    kind: 'schema',
    dir: '08.5-observation-reflection-learning',
    title: 'Phase 8.5 — Quality Signals',
    gateDate: '2026-07-04',
    migrateFn: 'migrateExtensionTracksPhase1() (signals portion)',
    adr: 'ADR-026',
    tables: [
      '`memory_signals` — quality signal ingest store',
      'Index: idx_memory_signals_owner',
      'Note: same migration step also adds compression columns (Phase 5.5 scope)',
    ],
    testFile: 'tests/db/extension-tracks-migration.test.ts',
    rollback: '`SIGNAL_INGEST_ENABLED=false` — table remains; no hot-path writes when OFF',
  },
  {
    kind: 'schema',
    dir: '08.6-learning-intelligence',
    title: 'Phase 8.6 — Learning Intelligence',
    gateDate: '2026-07-04',
    migrateFn: 'migrateExtensionTracksPhase2()',
    adr: 'ADR-057',
    tables: ['`learning_events` — behavior event log', '`learning_policy_snapshots` — ranking multiplier snapshots'],
    testFile: 'tests/db/extension-tracks-migration.test.ts',
    rollback: '`LEARNING_ENGINE_ENABLED=false` — tables remain; ranking loader no-op when OFF',
  },
  {
    kind: 'schema',
    dir: '08.7-graph-relation-inference',
    title: 'Phase 8.7 — Graph Relation Inference',
    gateDate: '2026-07-04',
    migrateFn: 'migrateExtensionTracksPhase3()',
    adr: 'ADR-041',
    tables: ['`relation_inference_evidence` — audit trail for inferred edges'],
    testFile: 'tests/db/extension-tracks-migration.test.ts',
    rollback: '`RELATION_INFERENCE_ENABLED=false` — inferred edges persist; no hot-path inference when OFF',
  },
  {
    kind: 'schema',
    dir: '09.7-memory-evolution',
    title: 'Phase 09.7 — Memory Evolution',
    gateDate: '2026-07-04',
    migrateFn: 'migrateExtensionTracksPhase4()',
    adr: 'ADR-040',
    tables: ['`memory_versions` — append-only version snapshots', '`memory_heads` — current head pointer per memory'],
    testFile: 'tests/db/extension-tracks-migration.test.ts',
    rollback: '`MEMORY_EVOLUTION_ENABLED=false` — version history preserved; hooks no-op when OFF',
  },
  {
    kind: 'schema',
    dir: '09.8-multi-client-sync',
    title: 'Phase 09.8 — Multi-Client Sync',
    gateDate: '2026-07-04',
    migrateFn: 'migrateExtensionTracksPhase5()',
    adr: 'ADR-042',
    tables: ['`sync_cursors` — per-client pull cursor', '`sync_conflicts` — manual resolution queue'],
    testFile: 'tests/db/extension-tracks-migration.test.ts',
    rollback: '`MULTI_CLIENT_SYNC_ENABLED=false` — cursors remain; sync REST disabled when OFF',
  },
  {
    kind: 'na',
    dir: '12-event-pipeline',
    title: 'Phase 12 — Event Pipeline',
    gateDate: '2026-07-04',
    reason:
      'no DDL — in-process `IEventBus` with consumer registry. Business events are ephemeral; persistence deferred to downstream phases (8.6, 19, 24)',
    rollback: '`EVENT_BUS_PROVIDER=none` or `EVENT_CONSUMERS_ENABLED=false`',
    gateNote: 'no DDL',
  },
  {
    kind: 'na',
    dir: '13-protocol-layer',
    title: 'Phase 13 — Protocol Layer',
    gateDate: '2026-07-04',
    reason: 'no DDL — SSE, WebSocket, and gRPC streaming adapters only; REST/MCP unary unchanged',
    rollback: '`SSE_ENABLED=false`, `WEBSOCKET_ENABLED=false`, `GRPC_ENABLED=false`',
    gateNote: 'no DDL',
  },
  {
    kind: 'na',
    dir: '13.1-remote-mcp-clients',
    title: 'Phase 13.1 — Remote MCP Clients',
    gateDate: '2026-07-04',
    reason: 'no DDL — Streamable HTTP transport binding; reuses Phase 1 identities and Phase 17 OIDC',
    rollback: '`REMOTE_MCP_ENABLED=false`',
    gateNote: 'no DDL',
  },
  {
    kind: 'schema',
    dir: '14-federation',
    title: 'Phase 14 — Federation',
    gateDate: '2026-07-04',
    migrateFn: 'migrateExtensionTracksPhase6()',
    adr: 'ADR-029',
    tables: [
      '`federation_peers` — peer registry metadata',
      '`federation_sync_cursors` — per-peer sync watermark',
      '`federation_exchange_log` — exchange audit log',
    ],
    testFile: 'tests/db/extension-tracks-migration.test.ts',
    rollback: '`FEDERATION_ENABLED=false` — metadata tables remain; exchange API disabled when OFF',
  },
  {
    kind: 'na',
    dir: '15-autonomous-agent-ecosystem',
    title: 'Phase 15 — Autonomous Agent Ecosystem',
    gateDate: '2026-07-04',
    reason: 'no DDL — static `AgentClientType` catalog and REST metadata; no agent runtime persistence',
    rollback: 'N/A — catalog is code-defined',
    gateNote: 'no DDL',
  },
  {
    kind: 'na',
    dir: '16-developer-platform',
    title: 'Phase 16 — Developer Platform',
    gateDate: '2026-07-04',
    reason: 'no DDL — `@ai-brain/sdk`, CLI, MCP server packages; OpenAPI snapshot only',
    rollback: 'Remove packages; no database impact',
    gateNote: 'no DDL',
  },
  {
    kind: 'schema',
    dir: '17-enterprise-security',
    title: 'Phase 17 — Enterprise Security',
    gateDate: '2026-07-04',
    migrateFn: 'migrateEnterprisePhase2()',
    adr: 'ADR-032',
    tables: [
      '`departments`, `tenant_projects` — org hierarchy',
      '`workspace_hierarchy_bindings` — workspace → dept/project links',
      '`policy_bindings` — OPA policy attachment metadata',
    ],
    testFile: 'tests/db/enterprise-security-migration.test.ts',
    rollback: '`ENTERPRISE_SECURITY_V2=false` — tables remain; security pipeline bypassed when OFF',
  },
  {
    kind: 'schema',
    dir: '18-cloud-platform',
    title: 'Phase 18 — Cloud Platform',
    gateDate: '2026-07-04',
    migrateFn: 'migrateCloudPlatformPhase1()',
    adr: 'ADR-033',
    tables: [
      '`cloud_regions`, `cloud_tenant_metadata`, `cloud_workspace_regions`',
      '`cloud_usage_records` — usage meter events',
      '`cloud_dr_schedules` — DR schedule metadata',
    ],
    testFile: 'tests/db/cloud-platform-migration.test.ts',
    rollback: 'Disable `CONTROL_PLANE_ENABLED`, `USAGE_METER_ENABLED`, `DR_PLATFORM_ENABLED` independently',
  },
  {
    kind: 'na',
    dir: '19-observability-platform',
    title: 'Phase 19 — Observability Platform',
    gateDate: '2026-07-04',
    reason:
      'no DDL — Prometheus/OTel exporters and Grafana dashboard packs; metrics are ephemeral. Separated from Phase 12 business event bus',
    rollback: '`OBSERVABILITY_PLATFORM=false`',
    gateNote: 'no DDL',
  },
  {
    kind: 'schema',
    dir: '20-ai-infrastructure',
    title: 'Phase 20 — AI Infrastructure',
    gateDate: '2026-07-04',
    migrateFn: 'migrateInfrastructurePlatformPhase1()',
    adr: 'ADR-035',
    tables: ['`plugin_registry` — installed plugin manifests', '`plugin_allow_list` — org-level enable gate'],
    testFile: 'tests/db/infrastructure-platform-migration.test.ts',
    rollback: '`PLUGIN_MARKETPLACE_ENABLED=false`',
  },
  {
    kind: 'schema',
    dir: '21-search-graph-prod',
    title: 'Phase 21 — Search & Graph Production',
    gateDate: '2026-07-04',
    migrateFn: 'migrateSearchGraphPlatformPhase1()',
    adr: 'ADR-022',
    tables: ['`search_graph_sync_runs` — sync job history', '`search_graph_sync_state` — watermark per target (Meilisearch/Neo4j)'],
    testFile: 'tests/db/search-graph-platform-migration.test.ts',
    rollback: '`SEARCH_GRAPH_PLATFORM_ENABLED=false` — D1/SQL remain SSOT',
  },
  {
    kind: 'schema',
    dir: '22-content-scale',
    title: 'Phase 22 — Content Scale',
    gateDate: '2026-07-04',
    migrateFn: 'migrateContentScalePlatformPhase1()',
    adr: 'ADR-021',
    tables: [
      '`content_scale_sync_runs` — offload/sync job history',
      '`content_scale_sync_state` — watermark per target (content, pgvector, embedding)',
    ],
    testFile: 'tests/db/content-scale-platform-migration.test.ts',
    rollback: '`CONTENT_SCALE_PLATFORM_ENABLED=false` — inline content + D1 vector remain defaults',
  },
  {
    kind: 'schema',
    dir: '23-enterprise-knowledge-fabric',
    title: 'Phase 23 — Enterprise Knowledge Fabric',
    gateDate: '2026-07-04',
    migrateFn: 'migrateKnowledgeFabricPlatformPhase1()',
    adr: 'ADR-047',
    tables: [
      '`knowledge_fabric_ingest_runs` — connector ingest job history',
      '`knowledge_fabric_connector_state` — cursor per connector/owner',
      '`knowledge_fabric_external_refs` — external ID → memory_id mapping',
    ],
    testFile: 'tests/db/knowledge-fabric-platform-migration.test.ts',
    rollback: '`KNOWLEDGE_FABRIC_ENABLED=false`',
  },
  {
    kind: 'schema',
    dir: '24-ai-brain-platform',
    title: 'Phase 24 — AI-Brain Platform',
    gateDate: '2026-07-04',
    migrateFn: 'migrateAiBrainPlatformPhase1()',
    adr: 'ADR-044',
    tables: ['`platform_webhook_subscriptions` — HMAC webhook CRUD store'],
    testFile: 'tests/db/ai-brain-platform-migration.test.ts',
    rollback: '`AI_BRAIN_PLATFORM_ENABLED=false` — subscriptions persist; delivery consumer off when flag OFF',
    extraProps: [['Delivery dependency', '`EVENT_CONSUMERS_ENABLED=true` + Redis event bus for live delivery']],
  },
  {
    kind: 'schema',
    dir: '25-global-ai-intelligence',
    title: 'Phase 25 — Global AI Intelligence',
    gateDate: '2026-07-04',
    migrateFn: 'migrateGlobalIntelligencePhase1()',
    adrs: ['ADR-036', 'ADR-037', 'ADR-038', 'ADR-043'],
    tables: [
      '`intelligence_telemetry_events` — redacted telemetry envelope store',
      '`intelligence_sync_state` — 5-tier sync cursor metadata',
      '`intelligence_offline_journal` — offline replay journal',
    ],
    testFile: 'tests/global-intelligence/migration.test.ts',
    rollback: '`GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false` — analytics read-only; no memory writes',
  },
  {
    kind: 'runbook',
    dir: '11-production-ops',
    title: 'Phase 11 — Production Operations',
    gateDate: '2026-07-04',
    scope:
      'Phase 10 introduced Postgres adapter (`PostgresSqlDatabaseAdapter`, ADR-009). Phase 11 adds **data migration tooling** and **cutover runbook** — not new domain DDL.',
  },
];

const SKIP = new Set([
  '06-hybrid-retrieval',
  '07-agent-runtime',
  '08-knowledge-graph',
  '09-multi-ai',
  '09.5-platform-architecture',
  '10-enterprise',
  '10.5-transport-connectivity',
]);

function isGeneric(content) {
  return (
    content.includes('Document forward migrations, rollback notes, and idempotency guarantees') ||
    (content.includes('N/A — no schema or data migration required**, or migrations are covered by an earlier phase') &&
      content.includes('Opt-in platform modules default OFF'))
  );
}

function isRich(content) {
  return (
    content.includes('## Schema changes') ||
    content.includes('## Cutover stages') ||
    content.includes('Hybrid retrieval composes') ||
    content.includes('Graph retrieval reuses') ||
    content.includes('import-path only') ||
    content.includes('## Adoption strategy') ||
    content.includes('Phase 7 documents') ||
    (content.includes('### New tables') && !isGeneric(content))
  );
}

function render(p) {
  if (p.kind === 'runbook') return renderRunbook(p);
  if (p.kind === 'na') return renderNa(p);
  return renderSchema(p);
}

let updated = 0;
let skipped = 0;
for (const p of PHASES) {
  const file = path.join(PHASES_DIR, p.dir, 'MIGRATION.md');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (SKIP.has(p.dir) && isRich(existing)) {
    console.log('skip (rich content)', p.dir);
    skipped++;
    continue;
  }
  if (!isGeneric(existing) && isRich(existing) && !SKIP.has(p.dir)) {
    console.log('skip (already enriched)', p.dir);
    skipped++;
    continue;
  }
  fs.writeFileSync(file, render(p));
  updated++;
  console.log('updated', p.dir);
}

console.log(`\nUpdated ${updated} MIGRATION.md files; skipped ${skipped}.`);
