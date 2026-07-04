#!/usr/bin/env node
/**
 * Enrich COMPLETION.md with phase-specific success criteria and gate metrics.
 * Run: node scripts/enrich-phase-completions.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');

const REGRESSION = '689 passed | 3 skipped (default env, master flags OFF)';

const FOOTER = (date) => `\n---\n\n*Gate closed ${date}. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*\n`;

/** @type {Array<{dir:string,title:string,gateDate:string,tests?:string,flag?:string,adr?:string,criteria:Array<[string,string,string]>}>} */
const PHASES = [
  {
    dir: '01-foundation',
    title: 'Phase 1 — Foundation',
    gateDate: '2026-06-28',
    tests: 'baseline suite green at gate',
    criteria: [
      ['SC-01', 'D1 schema + migration runner', '✅ `MIGRATION_SQL`, `runMigrations()` idempotent'],
      ['SC-02', 'Repository port abstraction', '✅ `IMemoryRepository` — no SQL in services'],
      ['SC-03', 'MemoryService CRUD', '✅ Shared orchestration for MCP + REST'],
      ['SC-04', 'REST + MCP parity', '✅ Same business rules; dual transport'],
      ['SC-05', 'MockD1 test harness', '✅ Deterministic unit tests without live D1'],
    ],
  },
  {
    dir: '02.5-stabilization',
    title: 'Phase 2.5 — Stabilization',
    gateDate: '2026-06-29',
    criteria: [
      ['SC-01', 'CI quality gate mandatory', '✅ lint + typecheck + format in CI'],
      ['SC-02', 'Flaky tests remediated', '✅ Stable baseline count'],
      ['SC-03', 'Phase governance schema', '✅ `.ai/phases/` folder structure'],
      ['SC-04', 'No domain feature creep', '✅ Tests/docs only'],
    ],
  },
  {
    dir: '02.6-knowledge',
    title: 'Phase 2.6 — Knowledge Foundation',
    gateDate: '2026-06-30',
    tests: '69+ passing at gate (per design archive)',
    criteria: [
      ['SC-01', 'Knowledge columns on memories', '✅ codename, slug, keywords, category, importance'],
      ['SC-02', 'memory_relations table', '✅ Graph edge store for Phase 8'],
      ['SC-03', 'Generators pure + KnowledgeService orchestrator', '✅ W1 design review compliance'],
      ['SC-04', 'UNIQUE indexes after backfill', '✅ migrateKnowledgeFoundationPhase3'],
      ['SC-05', 'Owner isolation tests', '✅ ≥6 cross-owner-leak cases'],
      ['SC-06', 'Design archive', '✅ [PHASE-2.6-DESIGN.md](../../../.ai/archive/PHASE-2.6-DESIGN.md)'],
    ],
  },
  {
    dir: '03-authorization',
    title: 'Phase 3 — Authorization',
    gateDate: '2026-06-30',
    criteria: [
      ['SC-01', 'API key auth on REST', '✅ Fastify auth middleware; 401 on missing key'],
      ['SC-02', 'Owner binding', '✅ Identity binds owner_id — no header spoof'],
      ['SC-03', 'No raw secrets in logs', '✅ hash/compare via secret_hash only'],
      ['SC-04', 'Reuses Phase 1 identities schema', '✅ No new DDL'],
      ['SC-05', 'MCP_OWNER_ID documented', '✅ Production MCP anchor path'],
    ],
  },
  {
    dir: '04-memory-intelligence',
    title: 'Phase 4 — Memory Intelligence',
    gateDate: '2026-07-01',
    criteria: [
      ['SC-01', 'Retriever + Ranker + ContextBuilder pipeline', '✅ Bounded candidate retrieval'],
      ['SC-02', 'recordAccessBatch', '✅ Single UPDATE — N× write resolved'],
      ['SC-03', 'MEMORY_SELECT projection', '✅ No full body in retrieval hot path'],
      ['SC-04', 'MemoryConsolidator batch path', '✅ `scripts/consolidate-memories.ts`'],
      ['SC-05', 'Importance scoring + backfill', '✅ dry-run default backfill script'],
      ['SC-06', 'Design archive', '✅ [PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md](../../../.ai/archive/PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md)'],
    ],
  },
  {
    dir: '04.7-memory-stewardship',
    title: 'Phase 04.7 — Memory Stewardship',
    gateDate: '2026-07-04',
    flag: 'MEMORY_STEWARDSHIP_ENABLED=false',
    adr: 'ADR-045',
    tests: REGRESSION,
    criteria: [
      ['SC-04.7-01', 'Orchestrator + four default tasks', '✅ MetadataAudit, Consolidation, EmbeddingAudit, RetrievalOptimization'],
      ['SC-04.7-02', 'dryRun default true', '✅ CLI `--execute` opt-in only'],
      ['SC-04.7-03', 'MemoryService signatures unchanged', '✅ Composition root wiring only'],
      ['SC-04.7-04', 'CLI steward:memories', '✅ Operator entry point'],
      ['SC-04.7-05', 'Default flag OFF regression', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '05.5-semantic-compression',
    title: 'Phase 5.5 — Semantic Compression',
    gateDate: '2026-07-04',
    flag: 'COMPRESSION_ENABLED=false',
    adr: 'ADR-023',
    tests: REGRESSION,
    criteria: [
      ['SC-55-01', 'RuleBasedCompressionPolicy + extended consolidator', '✅ No LLM on hot path'],
      ['SC-55-02', 'Compression columns migration', '✅ migrateExtensionTracksPhase1 portion'],
      ['SC-55-03', 'CLI compress:memories dry-run default', '✅ Operator safety'],
      ['SC-55-04', 'Manifest supportsSemanticCompression', '✅ Capability discovery'],
      ['SC-55-05', 'Default flag OFF regression', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '06.5-progressive-retrieval',
    title: 'Phase 6.5 — Progressive Retrieval',
    gateDate: '2026-07-04',
    adr: 'ADR-024',
    tests: REGRESSION,
    criteria: [
      ['SC-65-01', 'DefaultRetrievalPolicy backward compatible', '✅ Matches pre-6.5 summary-only behavior'],
      ['SC-65-02', 'Additive retrievalPlan field', '✅ MCP/REST schemas unchanged'],
      ['SC-65-03', 'Body hydration gated', '✅ plan.hydrateBody + findByIdsWithContent'],
      ['SC-65-04', 'Always-on default adapter', '✅ Zero deploy change — no master flag'],
      ['SC-65-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '07.5-runtime-compatibility',
    title: 'Phase 7.5 — Runtime Compatibility',
    gateDate: '2026-07-04',
    adr: 'ADR-025',
    tests: REGRESSION,
    criteria: [
      ['SC-75-01', 'CapabilityManifestBuilder', '✅ Reads live env flags'],
      ['SC-75-02', 'REST + MCP manifest parity', '✅ Identical JSON'],
      ['SC-75-03', 'MCP_TOOL_NAMES SSOT', '✅ 20 tools; contract tests'],
      ['SC-75-04', 'Closes Phase 7 debt D7-01', '✅ Discovery without new env vars'],
      ['SC-75-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '08.5-observation-reflection-learning',
    title: 'Phase 8.5 — Quality Signals',
    gateDate: '2026-07-04',
    flag: 'SIGNAL_INGEST_ENABLED=false',
    adr: 'ADR-026',
    tests: REGRESSION,
    criteria: [
      ['SC-85-01', 'MemorySignalIngestor + four signal types', '✅ Bounded importance deltas'],
      ['SC-85-02', 'memory_signals migration', '✅ migrateExtensionTracksPhase1 portion'],
      ['SC-85-03', 'Constitution — ingest only', '✅ No agent reflection loops'],
      ['SC-85-04', 'REST /signals gated', '✅ Default OFF'],
      ['SC-85-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '08.6-learning-intelligence',
    title: 'Phase 8.6 — Learning Intelligence',
    gateDate: '2026-07-04',
    flag: 'LEARNING_ENGINE_ENABLED=false',
    adr: 'ADR-057',
    tests: REGRESSION,
    criteria: [
      ['SC-86-01', 'LearningOrchestrator + L21/L22/L26', '✅ W1 ranking snapshot hook'],
      ['SC-86-02', 'SQL event/artifact stores', '✅ migrateExtensionTracksPhase2'],
      ['SC-86-03', 'L23–L30 no-op stubs', '✅ Zero side effects when OFF'],
      ['SC-86-04', 'CLI learning:run', '✅ Batch path only'],
      ['SC-86-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '08.7-graph-relation-inference',
    title: 'Phase 8.7 — Graph Relation Inference',
    gateDate: '2026-07-04',
    flag: 'RELATION_INFERENCE_ENABLED=false',
    adr: 'ADR-041',
    tests: REGRESSION,
    criteria: [
      ['SC-87-01', 'Three deterministic inference sources', '✅ project, shared_tag, temporal'],
      ['SC-87-02', 'upsertInferred manual-safe', '✅ Only source_type=inferred edges'],
      ['SC-87-03', 'Evidence audit store', '✅ migrateExtensionTracksPhase3'],
      ['SC-87-04', 'CLI infer:relations batch only', '✅ No hot-path inference'],
      ['SC-87-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '09.7-memory-evolution',
    title: 'Phase 09.7 — Memory Evolution',
    gateDate: '2026-07-04',
    flag: 'MEMORY_EVOLUTION_ENABLED=false',
    adr: 'ADR-040',
    tests: REGRESSION,
    criteria: [
      ['SC-97-01', 'Append-only memory_versions + memory_heads', '✅ migrateExtensionTracksPhase4'],
      ['SC-97-02', 'Coordinator archives on update', '✅ createMemoryService hooks'],
      ['SC-97-03', 'REST diff + CLI evolution:history', '✅ Read-only history API'],
      ['SC-97-04', 'Flag off rollback safe', '✅ Versions preserved when OFF'],
      ['SC-97-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '09.8-multi-client-sync',
    title: 'Phase 09.8 — Multi-Client Sync',
    gateDate: '2026-07-04',
    flag: 'MULTI_CLIENT_SYNC_ENABLED=false',
    adr: 'ADR-042',
    tests: REGRESSION,
    criteria: [
      ['SC-98-01', 'ConflictAwareSyncManager resolvers', '✅ LWW, field-merge, manual-queue'],
      ['SC-98-02', 'sync_cursors + sync_conflicts tables', '✅ migrateExtensionTracksPhase5'],
      ['SC-98-03', 'Stale write rejection when configured', '✅ MemoryService enforce path'],
      ['SC-98-04', 'REST pull/push/status', '✅ Gated behind flag'],
      ['SC-98-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '13-protocol-layer',
    title: 'Phase 13 — Protocol Layer',
    gateDate: '2026-07-04',
    adr: 'ADR-028',
    tests: REGRESSION,
    criteria: [
      ['SC-13-01', 'SSE + WebSocket + gRPC stream shared module', '✅ transport/shared/streaming/'],
      ['SC-13-02', 'All streaming default OFF', '✅ REST unary unchanged'],
      ['SC-13-03', 'Benchmark CLI present', '✅ Local latency tooling'],
      ['SC-13-04', 'Layer boundaries preserved', '✅ No service logic in adapters'],
      ['SC-13-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '13.1-remote-mcp-clients',
    title: 'Phase 13.1 — Remote MCP Clients',
    gateDate: '2026-07-04',
    flag: 'REMOTE_MCP_ENABLED=false',
    adr: 'ADR-048',
    tests: REGRESSION,
    criteria: [
      ['SC-131-01', 'Streamable HTTP /mcp', '✅ Same 20 tools — no fork'],
      ['SC-131-02', 'OAuth RFC 9728 + API key', '✅ Reuses Phase 17 OIDC'],
      ['SC-131-03', 'McpContextBinding stdio vs remote', '✅ AsyncLocalStorage session'],
      ['SC-131-04', 'Default flag OFF regression', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '14-federation',
    title: 'Phase 14 — Federation',
    gateDate: '2026-07-04',
    flag: 'FEDERATION_ENABLED=false',
    adr: 'ADR-029',
    tests: REGRESSION,
    criteria: [
      ['SC-14-01', 'KnowledgeExchangeService', '✅ createMemory/updateMemory only'],
      ['SC-14-02', 'federation_* metadata tables', '✅ migrateExtensionTracksPhase6'],
      ['SC-14-03', 'Cross-org fail closed without trust', '✅ Policy tests'],
      ['SC-14-04', 'In-process transport MVP', '✅ FEDERATION_PEERS_JSON'],
      ['SC-14-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '15-autonomous-agent-ecosystem',
    title: 'Phase 15 — Autonomous Agent Ecosystem',
    gateDate: '2026-07-04',
    adr: 'ADR-030',
    tests: REGRESSION,
    criteria: [
      ['SC-15-01', '12 AgentClientType profiles SSOT', '✅ Protocol filtering by env flags'],
      ['SC-15-02', 'REST /ecosystem/* catalog', '✅ Metadata only'],
      ['SC-15-03', 'Constitution §7 verified', '✅ No planner/executor in src/'],
      ['SC-15-04', 'Manifest ecosystem block', '✅ Additive capabilities'],
      ['SC-15-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '16-developer-platform',
    title: 'Phase 16 — Developer Platform',
    gateDate: '2026-07-04',
    adr: 'ADR-031',
    tests: REGRESSION,
    criteria: [
      ['SC-16-01', '@ai-brain/sdk + CLI + MCP server packages', '✅ OpenAPI SSOT pipeline'],
      ['SC-16-02', 'snapshot:openapi + build:packages', '✅ CI wired'],
      ['SC-16-03', '7-language thin wrappers', '✅ Manifest transport.sdk'],
      ['SC-16-04', 'MemoryService unchanged', '✅ Client packages only'],
      ['SC-16-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '17-enterprise-security',
    title: 'Phase 17 — Enterprise Security',
    gateDate: '2026-07-04',
    flag: 'ENTERPRISE_SECURITY_V2=false',
    adr: 'ADR-032',
    tests: REGRESSION,
    criteria: [
      ['SC-17-01', 'Auth → RBAC → policy → quota pipeline', '✅ Fail closed 403/429'],
      ['SC-17-02', 'migrateEnterprisePhase2 DDL', '✅ departments, policy_bindings'],
      ['SC-17-03', 'SSO/OIDC admin routes', '✅ Bridges Phase 13.1 MCP OAuth'],
      ['SC-17-04', 'MemoryService unchanged', '✅ Middleware + admin only'],
      ['SC-17-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '18-cloud-platform',
    title: 'Phase 18 — Cloud Platform',
    gateDate: '2026-07-04',
    adr: 'ADR-033',
    tests: REGRESSION,
    criteria: [
      ['SC-18-01', 'Control plane metadata REST', '✅ /cloud/* admin only'],
      ['SC-18-02', 'migrateCloudPlatformPhase1', '✅ tenant metadata + usage records'],
      ['SC-18-03', 'Three independent flags default OFF', '✅ CONTROL_PLANE, USAGE_METER, DR'],
      ['SC-18-04', 'Data plane CRUD unchanged', '✅ MemoryService untouched'],
      ['SC-18-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '19-observability-platform',
    title: 'Phase 19 — Observability Platform',
    gateDate: '2026-07-04',
    flag: 'OBSERVABILITY_PLATFORM=false',
    adr: 'ADR-034',
    tests: REGRESSION,
    criteria: [
      ['SC-19-01', '6 Grafana dashboard packs', '✅ observability/dashboards/'],
      ['SC-19-02', 'Separated from Phase 12 business bus', '✅ No OTLP on memory events'],
      ['SC-19-03', 'REST middleware instrumentation', '✅ Integrates OTEL_ENABLED'],
      ['SC-19-04', 'Default flag OFF regression', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '20-ai-infrastructure',
    title: 'Phase 20 — AI Infrastructure',
    gateDate: '2026-07-04',
    flag: 'PLUGIN_MARKETPLACE_ENABLED=false',
    adr: 'ADR-035',
    tests: REGRESSION,
    criteria: [
      ['SC-20-01', 'Plugin registry + allow-list', '✅ migrateInfrastructurePlatformPhase1'],
      ['SC-20-02', '9 curated plugins mapped to ports', '✅ ADR-008 alignment'],
      ['SC-20-03', 'Phase 18 allow-list governs enable', '✅ Cross-module guard'],
      ['SC-20-04', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '21-search-graph-prod',
    title: 'Phase 21 — Search & Graph Production',
    gateDate: '2026-07-04',
    flag: 'SEARCH_GRAPH_PLATFORM_ENABLED=false',
    adr: 'ADR-022',
    tests: REGRESSION,
    criteria: [
      ['SC-21-01', 'SearchGraphOrchestrator + syncers', '✅ Meilisearch + Neo4j targets'],
      ['SC-21-02', 'Watermark per target', '✅ migrateSearchGraphPlatformPhase1'],
      ['SC-21-03', 'Reads SSOT only', '✅ MemoryService unchanged'],
      ['SC-21-04', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '22-content-scale',
    title: 'Phase 22 — Content Scale',
    gateDate: '2026-07-04',
    flag: 'CONTENT_SCALE_PLATFORM_ENABLED=false',
    adr: 'ADR-021',
    tests: REGRESSION,
    criteria: [
      ['SC-22-01', 'Three-target sync orchestrator', '✅ content, pgvector, embedding watermarks'],
      ['SC-22-02', 'Reuses backfill scripts', '✅ No duplicate ETL'],
      ['SC-22-03', 'Inline + D1 vector remain defaults', '✅ Flag OFF unchanged'],
      ['SC-22-04', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '23-enterprise-knowledge-fabric',
    title: 'Phase 23 — Enterprise Knowledge Fabric',
    gateDate: '2026-07-04',
    flag: 'KNOWLEDGE_FABRIC_ENABLED=false',
    adr: 'ADR-047',
    tests: REGRESSION,
    criteria: [
      ['SC-23-01', '10 connector types + orchestrator', '✅ All writes via MemoryService'],
      ['SC-23-02', 'External ref store + ingest runs', '✅ migrateKnowledgeFabricPlatformPhase1'],
      ['SC-23-03', 'Distinct from Phase 14 federation', '✅ Separate module + ADR'],
      ['SC-23-04', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '24-ai-brain-platform',
    title: 'Phase 24 — AI-Brain Platform',
    gateDate: '2026-07-04',
    flag: 'AI_BRAIN_PLATFORM_ENABLED=false',
    adr: 'ADR-044',
    tests: REGRESSION,
    criteria: [
      ['SC-24-01', 'Umbrella manifest aggregates child flags', '✅ No false capability claims'],
      ['SC-24-02', 'HMAC webhook CRUD + delivery consumer', '✅ platform_webhook_subscriptions'],
      ['SC-24-03', 'Edition planes in manifest', '✅ Read-only aggregation'],
      ['SC-24-04', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
  {
    dir: '25-global-ai-intelligence',
    title: 'Phase 25 — Global AI Intelligence',
    gateDate: '2026-07-04',
    flag: 'GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false',
    adr: 'ADR-036/037/038/043',
    tests: REGRESSION,
    criteria: [
      ['SC-25-01', 'Telemetry + read-only analytics KPIs', '✅ No memory writes from analytics'],
      ['SC-25-02', 'IntelligenceTelemetryConsumer on Phase 12', '✅ Event bus integration'],
      ['SC-25-03', '5-tier sync over Phase 14', '✅ In-process federation MVP'],
      ['SC-25-04', 'migrateGlobalIntelligencePhase1', '✅ telemetry + sync + journal tables'],
      ['SC-25-05', 'Regression suite', `✅ ${REGRESSION}`],
    ],
  },
];

const SKIP = new Set([
  '05-embedding',
  '06-hybrid-retrieval',
  '07-agent-runtime',
  '08-knowledge-graph',
  '09-multi-ai',
  '09.5-platform-architecture',
  '10-enterprise',
  '10.5-transport-connectivity',
  '11-production-ops',
  '12-event-pipeline',
]);

function isGeneric(content) {
  return (
    content.includes('Map each roadmap success criterion to test output, metrics, or ADR Implemented status') ||
    (content.includes('All checklist items in [CHECKLIST.md](CHECKLIST.md) marked complete at gate') &&
      !content.includes('| SC-'))
  );
}

function isRich(content) {
  return (
    (content.includes('| SC-') || content.includes('| Criterion |')) &&
    content.split('\n').length > 28 &&
    !isGeneric(content)
  );
}

function render(p) {
  const rows = p.criteria.map(([id, crit, ev]) => `| ${id} | ${crit} | ${ev} |`).join('\n');
  const flagBlock = p.flag
    ? `\n**Master flag:** \`${p.flag}\` (default OFF — zero behavior change without opt-in)\n`
    : '';
  const adrBlock = p.adr ? `  \n**ADR:** ${p.adr}` : '';
  const metrics = p.tests
    ? `\n## Metrics at gate\n\n- **Tests:** ${p.tests}\n- **Completed:** ${p.gateDate}${p.adr ? `\n- **ADR:** ${p.adr}` : ''}\n`
    : '';

  return `# ${p.title} — COMPLETION

**Phase status:** ✅ Closed — gate PASS (${p.gateDate})  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)${adrBlock}${flagBlock}

---

## Purpose

Map roadmap success criteria to durable evidence.

---

## Evidence index

| Artifact | Link |
|----------|------|
| Design | [DESIGN.md](DESIGN.md) |
| Implementation | [IMPLEMENTATION.md](IMPLEMENTATION.md) |
| Verification | [TESTING.md](TESTING.md) |
| Gate checklist | [CHECKLIST.md](CHECKLIST.md) |
| Review verdict | [REVIEW.md](REVIEW.md) |
| Migration | [MIGRATION.md](MIGRATION.md) |

---

## Success criteria

| ID | Criterion | Evidence |
|----|-----------|----------|
${rows}

**Result:** ${p.criteria.length}/${p.criteria.length} PASS. Phase gate closed ${p.gateDate}.
${metrics}
---

## Rollback

${p.flag ? `Set \`${p.flag}\`. See [MIGRATION.md](MIGRATION.md) and [IMPLEMENTATION.md](IMPLEMENTATION.md).` : 'Forward-fix only; see phase MIGRATION.md for persistence notes.'}

${FOOTER(p.gateDate)}`;
}

const SCHEMA_LINE = '**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)';

function extractGateDate(content) {
  const patterns = [
    /✅ Closed — gate PASS \((\d{4}-\d{2}-\d{2})\)/,
    /✅ Gate PASS \((\d{4}-\d{2}-\d{2})\)/,
    /\*\*Date:\*\* (\d{4}-\d{2}-\d{2})/,
    /Complete \(gate PASS (\d{4}-\d{2}-\d{2})\)/i,
    /Complete \((\d{4}-\d{2}-\d{2})\)/,
    /Implemented \((\d{4}-\d{2}-\d{2})\)/,
    /gate closed (\d{4}-\d{2}-\d{2})/i,
    /\*\*Completed:\*\* (\d{4}-\d{2}-\d{2})/,
    /\*\*Gate:\*\* PASS (\d{4}-\d{2}-\d{2})/,
    /Phase \d+ gate closed (\d{4}-\d{2}-\d{2})/i,
  ];
  for (const pattern of patterns) {
    const m = content.match(pattern);
    if (m?.[1]) return m[1];
  }
  return null;
}

function isStandardCompletionHeader(content) {
  return /^\*\*Phase status:\*\* ✅ Closed — gate PASS \(\d{4}-\d{2}-\d{2}\)/m.test(content);
}

/** Normalize COMPLETION title + header without rewriting body content. */
function normalizeCompletionHeader(content) {
  let next = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;

  next = next.replace(
    /^# Phase (\d+(?:\.\d+)?): (.+?) — COMPLETED\s*\r?\n/m,
    '# Phase $1 — $2 — COMPLETION\n',
  );
  next = next.replace(/^# (.+?) — COMPLETED\s*\r?\n/m, '# $1 — COMPLETION\n');

  const date = extractGateDate(next);
  if (!date) return next;

  const statusLine = `**Phase status:** ✅ Closed — gate PASS (${date})  `;

  if (isStandardCompletionHeader(next) && next.includes(SCHEMA_LINE) && !/^# .+ — COMPLETED/m.test(content)) {
    return next;
  }

  // Legacy two-line Closed + Gate
  next = next.replace(
    /\*\*Phase status:\*\* Closed\s*\n\*\*Gate:\*\* PASS \d{4}-\d{2}-\d{2}\s*\n/,
    `${statusLine}\n`,
  );

  // Status + Date block (06, 08, 09, 09.5)
  next = next.replace(
    /\*\*Status:\*\* ✅ COMPLETED\s*\n\*\*Date:\*\* \d{4}-\d{2}-\d{2}\s*\n/,
    `${statusLine}\n`,
  );

  // Implemented status (12)
  next = next.replace(
    /\*\*Status:\*\* ✅ Implemented \(\d{4}-\d{2}-\d{2}\)\s*\n/,
    `${statusLine}\n`,
  );

  // Phase status variants
  next = next.replace(/\*\*Phase status:\*\* ✅ Gate PASS \(\d{4}-\d{2}-\d{2}\)/, statusLine.trim());
  next = next.replace(
    /\*\*Phase status:\*\* Complete \(gate PASS \d{4}-\d{2}-\d{2}\)/,
    statusLine.trim(),
  );
  next = next.replace(/\*\*Phase status:\*\* Complete \(\d{4}-\d{2}-\d{2}\)/, statusLine.trim());
  next = next.replace(/\*\*Phase status:\*\* Closed(?=\s*\n)/, statusLine.trim());

  // Remove redundant Document line (standard uses title H1 only)
  next = next.replace(/\*\*Document:\*\* COMPLETION\s*\n/, '');

  // Ensure Schema after status block (first 12 lines)
  const head = next.split('\n').slice(0, 12).join('\n');
  if (!head.includes(SCHEMA_LINE)) {
    next = next.replace(
      /(\*\*Phase status:\*\* ✅ Closed — gate PASS \(\d{4}-\d{2}-\d{2}\)\s*\n)/,
      `$1${SCHEMA_LINE}  \n`,
    );
  }

  return next;
}

const fixHeaders = process.argv.includes('--fix-headers');

let updated = 0;
let skipped = 0;

if (fixHeaders) {
  const dirs = fs
    .readdirSync(PHASES_DIR)
    .filter((d) => {
      const p = path.join(PHASES_DIR, d);
      return fs.statSync(p).isDirectory() && !['roadmap', 'audits'].includes(d);
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (const dir of dirs) {
    const file = path.join(PHASES_DIR, dir, 'COMPLETION.md');
    if (!fs.existsSync(file)) continue;
    const existing = fs.readFileSync(file, 'utf8');
    const next = normalizeCompletionHeader(existing);
    if (next === existing) {
      console.log('skip (already standard)', dir);
      skipped++;
      continue;
    }
    fs.writeFileSync(file, next);
    updated++;
    console.log('header fixed', dir);
  }
  console.log(`\nFixed ${updated} COMPLETION.md headers; skipped ${skipped}.`);
  process.exit(0);
}

for (const p of PHASES) {
  const file = path.join(PHASES_DIR, p.dir, 'COMPLETION.md');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (SKIP.has(p.dir) && isRich(existing)) {
    console.log('skip (rich content)', p.dir);
    skipped++;
    continue;
  }
  if (!isGeneric(existing) && isRich(existing)) {
    console.log('skip (already enriched)', p.dir);
    skipped++;
    continue;
  }
  fs.writeFileSync(file, render(p));
  updated++;
  console.log('updated', p.dir);
}

console.log(`\nUpdated ${updated} COMPLETION.md files; skipped ${skipped}.`);
