#!/usr/bin/env node
/**
 * Enrich RISKS.md with phase-specific risk registers.
 * Run: node scripts/enrich-phase-risks.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');

/** @type {Array<{dir:string,title:string,gateDate:string,risks:Array<[string,string,string,string,string]>,deferred?:Array<[string,string,string]>}>} */
const PHASES = [
  {
    dir: '01-foundation',
    title: 'Phase 1 — Foundation',
    gateDate: '2026-06-28',
    risks: [
      ['D1 vendor coupling', 'Medium', 'High', 'Repository port abstraction; migration scripts; Postgres path Phase 10', 'Mitigated'],
      ['No authentication on REST', 'High', 'Critical', 'Phase 3 authorization scope', 'Transferred — Phase 3'],
      ['MCP/REST semantic drift', 'Medium', 'High', 'Shared MemoryService; single repository', 'Mitigated'],
      ['Schema migration on live data', 'Medium', 'High', 'Forward-only migrations; idempotent runner', 'Mitigated'],
    ],
  },
  {
    dir: '02.5-stabilization',
    title: 'Phase 2.5 — Stabilization',
    gateDate: '2026-06-29',
    risks: [
      ['Flaky test harness', 'Medium', 'High', 'MockD1 isolation; deterministic fixtures', 'Mitigated'],
      ['Lint/type drift', 'Medium', 'Medium', 'CI gate: lint + typecheck mandatory', 'Mitigated'],
      ['Documentation rot', 'Low', 'Medium', 'Phase folder schema; roadmap sync', 'Mitigated'],
    ],
  },
  {
    dir: '02.6-knowledge',
    title: 'Phase 2.6 — Knowledge Foundation',
    gateDate: '2026-06-30',
    risks: [
      ['Slug/codename collision', 'Medium', 'Medium', 'Unique constraints; generator unit tests', 'Mitigated'],
      ['Summary quality variance', 'Medium', 'Low', 'Rule-based on CRUD; async LLM via COMPRESSION_POLICY=llm + enrich:summaries', 'Mitigated'],
      ['Keyword normalization false positives', 'Low', 'Low', 'Normalizer tests; manual review path', 'Mitigated'],
    ],
  },
  {
    dir: '03-authorization',
    title: 'Phase 3 — Authorization',
    gateDate: '2026-06-30',
    risks: [
      ['API key leak in logs', 'Medium', 'Critical', 'Never log raw keys; hash/compare only', 'Mitigated'],
      ['Missing auth on new routes', 'Medium', 'Critical', 'Fastify auth plugin; E2E 401 tests', 'Mitigated'],
      ['Owner ID spoofing', 'Low', 'Critical', 'Key binds owner; no header override', 'Mitigated'],
      ['MCP env owner misconfiguration', 'Medium', 'High', 'Document MCP_OWNER_ID required in prod', 'Mitigated'],
    ],
  },
  {
    dir: '04-memory-intelligence',
    title: 'Phase 4 — Memory Intelligence',
    gateDate: '2026-07-01',
    risks: [
      ['N× recordAccess on context build', 'Medium', 'Medium', 'recordAccessBatch — single UPDATE', 'Resolved'],
      ['Full body in retrieval projection', 'Medium', 'High', 'Explicit MEMORY_SELECT; regression test', 'Resolved'],
      ['Backfill corrupts importance', 'Low', 'High', 'Dry-run default; idempotent script', 'Mitigated'],
      ['Index migration lock on D1', 'Low', 'Medium', 'Online DDL; staged deploy', 'Mitigated'],
    ],
  },
  {
    dir: '05-embedding',
    title: 'Phase 5 — Embedding',
    gateDate: '2026-07-01',
    risks: [
      ['Sync embed blocks CRUD hot path', 'Medium', 'Critical', 'Async job runner only; ADR-003', 'Mitigated'],
      ['Vector SQL in MemoryRepository', 'Medium', 'High', 'IEmbeddingStore port boundary', 'Mitigated'],
      ['OpenAI cost runaway', 'Medium', 'Medium', 'noop default; backfill dry-run', 'Mitigated'],
      ['D1 vector scale ceiling', 'High', 'Medium', 'MVP limit documented; scale path VECTOR_PROVIDER=pgvector (ADR-011, Phase 10)', 'Transferred — Phase 10 (ADR-011)'],
    ],
  },
  {
    dir: '04.7-memory-stewardship',
    title: 'Phase 04.7 — Memory Stewardship',
    gateDate: '2026-07-04',
    risks: [
      ['Stewardship mutates prod without dry-run', 'Medium', 'Critical', 'dryRun default true; CLI --execute opt-in', 'Mitigated'],
      ['Run history lost on restart', 'High', 'Low', 'SqlStewardshipRunStore when MEMORY_STEWARDSHIP_RUN_STORE_PROVIDER=sql', 'Mitigated'],
      ['Task error aborts whole run', 'Medium', 'Medium', 'Per-task error isolation in orchestrator', 'Mitigated'],
      ['Scope creep into agent planning', 'Low', 'Critical', 'Batch tasks only; no agent loop', 'Mitigated'],
    ],
    deferred: [],
  },
  {
    dir: '05.5-semantic-compression',
    title: 'Phase 5.5 — Semantic Compression',
    gateDate: '2026-07-04',
    risks: [
      ['Irreversible archive of wrong cluster', 'Medium', 'High', 'dry-run default; rule-based policy tests', 'Mitigated'],
      ['LLM summarizer on hot path', 'Low', 'Critical', 'No sync summarizer; async adapter deferred', 'Mitigated'],
      ['Compression enabled by default', 'Low', 'High', 'COMPRESSION_ENABLED=false', 'Mitigated'],
      ['Consolidator breaks Phase 4 paths', 'Medium', 'High', 'Extended consolidator; regression suite', 'Mitigated'],
    ],
    deferred: [['D55-01', 'ICompressionSummarizer LLM adapter', 'Async job queue ADR follow-up']],
  },
  {
    dir: '06.5-progressive-retrieval',
    title: 'Phase 6.5 — Progressive Retrieval',
    gateDate: '2026-07-04',
    risks: [
      ['Policy breaks summary-only default', 'Medium', 'High', 'DefaultRetrievalPolicy matches pre-6.5 behavior', 'Mitigated'],
      ['Client ignores retrievalPlan', 'Low', 'Low', 'Additive response field; optional', 'Accepted'],
      ['Token budget miscalculation', 'Medium', 'Medium', 'token-benchmark.test.ts in CI; SC-65-06 CLI evidence', 'Mitigated'],
      ['Relations stage incomplete', 'Medium', 'Medium', 'relations stage + expandWithRelationNeighbors; deep BFS via MCP', 'Mitigated'],
    ],
  },
  {
    dir: '07.5-runtime-compatibility',
    title: 'Phase 7.5 — Runtime Compatibility',
    gateDate: '2026-07-04',
    risks: [
      ['Manifest stale vs live flags', 'Medium', 'High', 'Builder reads env at request time', 'Mitigated'],
      ['MCP/REST manifest drift', 'Medium', 'High', 'Shared handler + contract tests', 'Mitigated'],
      ['Tool count mismatch', 'Medium', 'High', 'MCP_TOOL_NAMES SSOT + tools.test.ts', 'Mitigated'],
      ['Public capabilities info leak', 'Low', 'Medium', 'No secrets in manifest; flags only', 'Mitigated'],
    ],
  },
  {
    dir: '08.5-observation-reflection-learning',
    title: 'Phase 8.5 — Quality Signals',
    gateDate: '2026-07-04',
    risks: [
      ['Agent learning loop in repo', 'Low', 'Critical', 'Ingest only; constitution §55', 'Mitigated'],
      ['Importance score manipulation', 'Medium', 'Medium', 'Bounded deltas; auth on REST ingest', 'Mitigated'],
      ['Signal store PII growth', 'Medium', 'Medium', 'Typed signals; no raw chat dump', 'Mitigated'],
      ['Ranking auto-mutation', 'Medium', 'High', 'RANKING_ADAPTATION_ENABLED=false default', 'Mitigated'],
    ],
    deferred: [['D85-01', 'MCP submit_signal', 'Phase 13.1 remote path']],
  },
  {
    dir: '08.6-learning-intelligence',
    title: 'Phase 8.6 — Learning Intelligence',
    gateDate: '2026-07-04',
    risks: [
      ['Ranking snapshot wrong owner', 'Medium', 'Critical', 'Scope on snapshot loader; context tests', 'Mitigated'],
      ['Stub engines side effects', 'Low', 'High', 'No-op stubs L23–L30 when disabled', 'Mitigated'],
      ['Batch learning stale data', 'Medium', 'Medium', 'Manual learning:run; no cron yet', 'Accepted'],
      ['Requires signal ingest ON', 'Medium', 'Medium', 'Document dependency on Phase 8.5', 'Mitigated'],
    ],
  },
  {
    dir: '08.7-graph-relation-inference',
    title: 'Phase 8.7 — Graph Relation Inference',
    gateDate: '2026-07-04',
    risks: [
      ['Inferred edge overwrites manual', 'Low', 'Critical', 'upsertInferred skips manual edges', 'Mitigated'],
      ['Inference runaway O(n²)', 'Medium', 'Medium', 'Batch CLI only; caps in orchestrator', 'Mitigated'],
      ['False positive relations', 'Medium', 'Medium', 'Rule-based sources; evidence store audit', 'Accepted'],
      ['Stale inferred edges when OFF', 'Medium', 'Low', 'No auto cleanup when flag disabled', 'Accepted'],
    ],
  },
  {
    dir: '09.5-platform-architecture',
    title: 'Phase 9.5 — Platform Architecture',
    gateDate: '2026-07-03',
    risks: [
      ['Ports without adapters — dead code feel', 'Medium', 'Low', 'Phase 10 implements adapters', 'Transferred — Phase 10'],
      ['Duplicate port definitions', 'Medium', 'High', 'Re-export existing ports; platform-ports.test.ts', 'Mitigated'],
      ['Premature adapter in domain layer', 'Low', 'Critical', 'No implementations in 9.5', 'Mitigated'],
    ],
  },
  {
    dir: '09.7-memory-evolution',
    title: 'Phase 09.7 — Memory Evolution',
    gateDate: '2026-07-04',
    risks: [
      ['Version table growth unbounded', 'Medium', 'Medium', 'Archive on update; retention policy TBD', 'Accepted'],
      ['Merge policy data loss', 'Medium', 'High', 'DefaultMemoryMergePolicy stub; merge deferred', 'Deferred'],
      ['Coordinator hooks break writes', 'Low', 'Critical', 'Flag off = no-op; MemoryService tests', 'Mitigated'],
    ],
    deferred: [['D97-01', 'Restore-to-version', 'POST-MVP endpoint']],
  },
  {
    dir: '09.8-multi-client-sync',
    title: 'Phase 09.8 — Multi-Client Sync',
    gateDate: '2026-07-04',
    risks: [
      ['Last-write-wins silent data loss', 'Medium', 'High', 'Document LWW; manual_queue strategy', 'Mitigated'],
      ['Cross-workspace sync leak', 'Low', 'Critical', 'Scope on pull/push; isolation tests', 'Mitigated'],
      ['Stale write not rejected', 'Medium', 'Medium', 'SyncStaleDetector + reconcileWrite reject', 'Mitigated'],
      ['No MCP sync surface', 'Medium', 'Low', 'REST only MVP', 'Deferred'],
    ],
  },
  {
    dir: '10.5-transport-connectivity',
    title: 'Phase 10.5 — Transport & Connectivity',
    gateDate: '2026-07-04',
    risks: [
      ['REST/MCP handler drift', 'Medium', 'Critical', 'Shared handlers + handler-parity.test.ts', 'Mitigated'],
      ['gRPC on Vercel serverless', 'High', 'High', 'GRPC_ENABLED=false default; PANDUAN warning', 'Mitigated'],
      ['Transport imports in services/', 'Medium', 'Critical', 'layer-boundaries.test.ts', 'Mitigated'],
      ['Breaking stdio MCP spawn', 'Medium', 'Critical', 'Strangler re-exports; mcp/server.ts unchanged path', 'Mitigated'],
    ],
    deferred: [['D105-01', 'Full gRPC E2E client test', 'Post-gate']],
  },
  {
    dir: '11-production-ops',
    title: 'Phase 11 — Production Ops',
    gateDate: '2026-07-04',
    risks: [
      ['Postgres cutover data loss', 'Medium', 'Critical', 'S0–S4 runbook; parity scripts; rollback', 'Mitigated'],
      ['Default D1 deploy broken', 'Low', 'Critical', 'SQL_PROVIDER=d1 unchanged default', 'Mitigated'],
      ['Staging harness false positive', 'Medium', 'High', 'postgres-staging.integration.test.ts (skipped CI)', 'Mitigated'],
      ['Repository split scope creep', 'Medium', 'Medium', '11C deferred optional ADR-019', 'Deferred'],
    ],
  },
  {
    dir: '12-event-pipeline',
    title: 'Phase 12 — Event Pipeline',
    gateDate: '2026-07-04',
    risks: [
      ['Event publish blocks CRUD', 'Medium', 'Critical', 'Fire-and-forget; error isolation', 'Mitigated'],
      ['Redis required at default', 'Medium', 'High', 'EVENT_CONSUMERS_ENABLED=false default', 'Mitigated'],
      ['Duplicate analytics rows', 'Medium', 'Medium', 'Idempotent consumer correlationId', 'Mitigated'],
      ['Silent noop with consumers ON but no redis', 'Medium', 'High', 'Env validation fails fast', 'Mitigated'],
    ],
    deferred: [['D12-01', '12C identity/IP on audit', 'Transport audit context']],
  },
  {
    dir: '13-protocol-layer',
    title: 'Phase 13 — Protocol Layer',
    gateDate: '2026-07-04',
    risks: [
      ['Streaming duplicates ranking logic', 'Medium', 'High', 'Reuse chunksFromBuildContextResult', 'Mitigated'],
      ['WebSocket auth bypass', 'Medium', 'Critical', 'Same auth middleware as REST', 'Mitigated'],
      ['SSE connection exhaustion', 'Medium', 'Medium', 'Rate limits; ops guidance', 'Identified'],
      ['All protocols default ON', 'Low', 'Critical', 'SSE/WS flags false default', 'Mitigated'],
    ],
  },
  {
    dir: '13.1-remote-mcp-clients',
    title: 'Phase 13.1 — Remote MCP Clients',
    gateDate: '2026-07-04',
    risks: [
      ['Public /mcp without auth', 'Low', 'Critical', 'API key or OAuth required when ON', 'Mitigated'],
      ['Session fixation / hijack', 'Medium', 'High', 'Session binding; CORS allowlist', 'Mitigated'],
      ['Vercel serverless SSE break', 'High', 'High', 'Document long-running Node requirement', 'Mitigated'],
      ['OAuth misconfiguration exposes owner', 'Medium', 'Critical', 'OIDC_MCP_OWNER_ID required when OAuth ON', 'Mitigated'],
    ],
    deferred: [['D131-01', 'ChatGPT CI smoke', 'Staging manual record']],
  },
  {
    dir: '14-federation',
    title: 'Phase 14 — Federation',
    gateDate: '2026-07-04',
    risks: [
      ['MemoryService rewrite pressure', 'Low', 'Critical', 'IKnowledgeExchangeService only — ADR-029', 'Mitigated'],
      ['Cross-org data leak', 'Low', 'Critical', 'Fail-closed policy; trust store', 'Mitigated'],
      ['Bundle PII over federation wire', 'Medium', 'Critical', 'Policy filterExportable; content limits', 'Mitigated'],
      ['In-process transport only', 'High', 'Medium', 'MVP same-node; remote transport deferred', 'Accepted'],
      ['Conflict storms multi-node', 'Medium', 'Medium', 'LWW default; cursor metadata store', 'Mitigated'],
    ],
  },
  {
    dir: '15-autonomous-agent-ecosystem',
    title: 'Phase 15 — Agent Ecosystem',
    gateDate: '2026-07-04',
    risks: [
      ['Agent runtime in repo', 'Low', 'Critical', 'Catalog metadata only; grep gate', 'Mitigated'],
      ['False client compatibility claims', 'Medium', 'High', 'Filter profiles by live env flags', 'Mitigated'],
      ['Confusion with Phase 7 boundary', 'Medium', 'Low', 'Docs: Phase 15 extends catalog not execution', 'Mitigated'],
    ],
  },
  {
    dir: '16-developer-platform',
    title: 'Phase 16 — Developer Platform',
    gateDate: '2026-07-04',
    risks: [
      ['SDK bypasses auth conventions', 'Medium', 'High', 'SDK enforces headers; client tests', 'Mitigated'],
      ['CLI duplicates business logic', 'Medium', 'High', 'CLI → SDK only lint test', 'Mitigated'],
      ['OpenAPI drift from live routes', 'Medium', 'High', 'snapshot:openapi CI check', 'Mitigated'],
      ['Package version skew with server', 'Medium', 'Medium', 'Monorepo packages/ in same repo', 'Mitigated'],
    ],
  },
  {
    dir: '17-enterprise-security',
    title: 'Phase 17 — Enterprise Security',
    gateDate: '2026-07-04',
    risks: [
      ['Policy engine bypass', 'Low', 'Critical', 'Middleware order; fail closed 403', 'Mitigated'],
      ['Quota false positives block writes', 'Medium', 'Medium', 'Memory quota enforcer; tunable limits', 'Mitigated'],
      ['IdP stub in production', 'High', 'Critical', 'Document stub vs prod IdP wiring', 'Accepted'],
      ['SSO redirect open redirect', 'Medium', 'High', 'Allowlist redirectUri validation', 'Mitigated'],
    ],
  },
  {
    dir: '18-cloud-platform',
    title: 'Phase 18 — Cloud Platform',
    gateDate: '2026-07-04',
    risks: [
      ['Control plane mutates memories', 'Low', 'Critical', 'Metadata only; no CRUD in control plane', 'Mitigated'],
      ['Usage meter memory growth', 'Medium', 'Medium', 'In-memory default; SQL store option', 'Accepted'],
      ['DR restore partial write', 'Medium', 'High', 'Restore count-only MVP; manual import', 'Accepted'],
      ['Tenant topology stale', 'Medium', 'Low', 'Manual refresh; federation integration', 'Identified'],
    ],
  },
  {
    dir: '19-observability-platform',
    title: 'Phase 19 — Observability Platform',
    gateDate: '2026-07-04',
    risks: [
      ['Memory content in metric labels', 'Low', 'Critical', 'Route sanitization; no body in labels', 'Mitigated'],
      ['Observability on business event hot path', 'Medium', 'High', 'Separate from Phase 12 consumers', 'Mitigated'],
      ['Cost dashboard empty gauges', 'Medium', 'Low', 'Phase 18 usage integration deferred', 'Deferred'],
      ['PII in trace spans', 'Medium', 'High', 'OTEL attribute allowlist', 'Mitigated'],
    ],
  },
  {
    dir: '20-ai-infrastructure',
    title: 'Phase 20 — AI Infrastructure',
    gateDate: '2026-07-04',
    risks: [
      ['Unsigned plugin manifest', 'High', 'Critical', 'Schema check only MVP; ed25519 deferred', 'Deferred'],
      ['Plugin enable hot-swap race', 'Medium', 'High', 'Restart required on enable', 'Accepted'],
      ['Third-party plugin vendor lock', 'Medium', 'Medium', 'Port mapping to ADR-008 adapters', 'Mitigated'],
      ['Marketplace default ON', 'Low', 'Critical', 'PLUGIN_MARKETPLACE_ENABLED=false', 'Mitigated'],
    ],
  },
  {
    dir: '21-search-graph-prod',
    title: 'Phase 21 — Search & Graph Prod',
    gateDate: '2026-07-04',
    risks: [
      ['Index drift from D1 SSOT', 'Medium', 'High', 'Watermark sync; admin-triggered jobs', 'Mitigated'],
      ['Meilisearch exposes wrong owner docs', 'Low', 'Critical', 'Owner filter on backfill/sync', 'Mitigated'],
      ['Neo4j relation leak', 'Low', 'Critical', 'Owner-scoped backfill; cross-owner tests', 'Mitigated'],
      ['Default search/graph provider changed', 'Low', 'Critical', 'SEARCH/GRAPH provider defaults unchanged', 'Mitigated'],
    ],
  },
  {
    dir: '22-content-scale',
    title: 'Phase 22 — Content Scale',
    gateDate: '2026-07-04',
    risks: [
      ['R2 offload orphan inline content', 'Medium', 'Medium', 'CONTENT_OFFLOAD_CLEAR_INLINE opt-in', 'Accepted'],
      ['pgvector sync partial failure', 'Medium', 'High', 'Watermark + dry-run backfill scripts', 'Mitigated'],
      ['Embedding job overload', 'Medium', 'Medium', 'Batch jobs; rate limits', 'Identified'],
      ['Object storage credentials exposure', 'Low', 'Critical', 'Env-only secrets; never in manifest', 'Mitigated'],
    ],
  },
  {
    dir: '23-enterprise-knowledge-fabric',
    title: 'Phase 23 — Knowledge Fabric',
    gateDate: '2026-07-04',
    risks: [
      ['Unvetted external content ingest', 'Medium', 'High', 'RuleBasedFabricPolicy; provenance tags', 'Mitigated'],
      ['Connector token in logs', 'Medium', 'Critical', 'Never log tokens; presence check only in MVP', 'Mitigated'],
      ['Fabric vs federation confusion', 'Medium', 'Low', 'Separate modules and ADRs', 'Mitigated'],
      ['Live vendor API not tested', 'High', 'Medium', 'MVP catalog JSON path only', 'Accepted'],
    ],
  },
  {
    dir: '24-ai-brain-platform',
    title: 'Phase 24 — AI-Brain Platform',
    gateDate: '2026-07-04',
    risks: [
      ['Webhook SSRF', 'Medium', 'Critical', 'URL validation; HMAC signing', 'Mitigated'],
      ['Webhook delivery without Redis bus', 'Medium', 'High', 'Document EVENT_CONSUMERS + redis requirement', 'Mitigated'],
      ['Platform manifest lies about child flags', 'Low', 'High', 'Reads live env in builder tests', 'Mitigated'],
      ['In-repo workflow engine creep', 'Low', 'Critical', 'Explicitly external', 'Mitigated'],
    ],
  },
  {
    dir: '25-global-ai-intelligence',
    title: 'Phase 25 — Global AI Intelligence',
    gateDate: '2026-07-04',
    risks: [
      ['Telemetry captures user content', 'Medium', 'Critical', 'Redactor; TELEMETRY_CONTENT_SAMPLING=false', 'Mitigated'],
      ['Analytics writes memories', 'Low', 'Critical', 'Read-only KPI service; tests assert no writes', 'Mitigated'],
      ['Global sync without remote transport', 'High', 'Medium', 'Delegates Phase 14; in-process MVP', 'Accepted'],
      ['Cost KPI misleading', 'Medium', 'Medium', 'Estimate until Phase 18 meter integrated', 'Deferred'],
      ['Default platform ON overhead', 'Low', 'High', 'GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false', 'Mitigated'],
    ],
  },
];

const SKIP = new Set([
  '06-hybrid-retrieval',
  '07-agent-runtime',
  '08-knowledge-graph',
  '09-multi-ai',
  '10-enterprise',
]);

function isGenericTemplate(content) {
  return content.includes('Scope creep into agent runtime | Low | Critical | Constitution §7');
}

function isBoilerplate(content) {
  return content.includes('_see roadmap_') || content.includes('_record_');
}

function render(p) {
  const rows = p.risks
    .map(([risk, l, i, m, s]) => `| ${risk} | ${l} | ${i} | ${m} | ${s} |`)
    .join('\n');
  const deferred =
    p.deferred?.length ?
      `\n## Deferred risks (carried forward)\n\n| ID | Risk | Mitigation path |\n|----|------|-----------------|\n${p.deferred.map(([id, r, m]) => `| ${id} | ${r} | ${m} |`).join('\n')}\n`
    : '';

  return `# ${p.title} — RISKS

**Phase status:** Closed  
**Gate:** PASS ${p.gateDate}  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
${rows}
${deferred}
---

*Gate PASS ${p.gateDate} — realized risks locked; deferred items tracked above or in CHECKLIST.*
`;
}

let updated = 0;
for (const p of PHASES) {
  const file = path.join(PHASES_DIR, p.dir, 'RISKS.md');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (SKIP.has(p.dir) && !isGenericTemplate(existing) && !isBoilerplate(existing)) {
    console.log('skip (rich content)', p.dir);
    continue;
  }
  fs.writeFileSync(file, render(p));
  updated++;
  console.log('updated', p.dir);
}

// Patch 14 if it was skipped - 14 is in PHASES so should be updated
// Handle 12-event-pipeline - in PHASES list? I need to add 12 - yes it's there

console.log(`\nUpdated ${updated} RISKS.md files.`);
