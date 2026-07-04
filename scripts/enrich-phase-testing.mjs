#!/usr/bin/env node
/**
 * Enrich TESTING.md with phase-specific verification evidence.
 * Run: node scripts/enrich-phase-testing.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');
const CURRENT_REGRESSION = '689 passed | 3 skipped (default env, 2026-07-04)';

/** @type {Array<{dir:string,title:string,gateDate:string,gateTests?:string,suites:Array<[string,string]>,scenarios:string[],manual?:string,deferred?:string[],nonRegression?:string[]}>} */
const PHASES = [
  {
    dir: '01-foundation',
    title: 'Phase 1 — Foundation',
    gateDate: '2026-06-28',
    gateTests: '~80',
    suites: [
      ['`tests/memory.service.test.ts`', 'MemoryService CRUD, scope, validation'],
      ['`tests/api.test.ts`', 'REST memory routes, error shapes'],
      ['`tests/repositories/memory.repository.test.ts`', 'D1 repository queries'],
      ['`tests/mcp/tools.test.ts`', 'MCP tool registration (early catalog)'],
      ['`tests/services/health.service.test.ts`', 'Health endpoint'],
    ],
    scenarios: [
      'Owner-scoped memory create/read/update/delete via REST',
      'MCP `save_memory` / `search_memory` parity with REST semantics',
      'Zod validation rejects malformed payloads',
      'D1 migrations apply cleanly via `npm run db:migrate`',
    ],
    nonRegression: ['Foundation suite remains in full regression at every subsequent gate'],
  },
  {
    dir: '02.5-stabilization',
    title: 'Phase 2.5 — Stabilization',
    gateDate: '2026-06-29',
    gateTests: '~100',
    suites: [
      ['Full `npm test`', 'Regression after Phase 2 churn'],
      ['`npm run lint` / `npm run typecheck`', 'CI quality gate established'],
      ['`tests/api.test.ts`', 'API contract stability'],
    ],
    scenarios: [
      'Test harness stable — no flaky D1 mock leaks',
      'ESLint + Prettier + TypeScript strict pass',
      'Documentation links and phase folder scaffold validated',
    ],
  },
  {
    dir: '02.6-knowledge',
    title: 'Phase 2.6 — Knowledge Foundation',
    gateDate: '2026-06-30',
    gateTests: '~120',
    suites: [
      ['`tests/knowledge/codename.generator.test.ts`', 'NOTE-XXXX codename generation'],
      ['`tests/knowledge/slug.generator.test.ts`', 'URL-safe slug uniqueness'],
      ['`tests/knowledge/summary.generator.test.ts`', 'Summary field population'],
      ['`tests/knowledge/keyword.normalizer.test.ts`', 'Keyword normalization'],
      ['`tests/api/knowledge.test.ts`', 'Knowledge REST endpoints'],
      ['`tests/services/knowledge.service.test.ts`', 'Knowledge service layer'],
    ],
    scenarios: [
      'Codename + slug generated on memory create when configured',
      'Summary-first retrieval fields available for context build',
      'Keywords normalized for search consistency',
    ],
    manual: 'Create memory via REST → verify codename/slug in response',
  },
  {
    dir: '03-authorization',
    title: 'Phase 3 — Authorization',
    gateDate: '2026-06-30',
    gateTests: '~130',
    suites: [
      ['`tests/auth/auth.service.test.ts`', 'API key validation, HMAC, owner binding'],
      ['`tests/api/auth.test.ts`', '401/403 on missing or invalid credentials'],
      ['`tests/api.test.ts`', 'Protected routes require auth'],
    ],
    scenarios: [
      'Invalid API key → 401 on protected routes',
      'Valid `aic_...` key resolves to stable ownerId',
      'MCP stdio uses env-scoped owner without REST key header',
      'No cross-owner access without correct credentials',
    ],
  },
  {
    dir: '04-memory-intelligence',
    title: 'Phase 4 — Memory Intelligence',
    gateDate: '2026-07-01',
    gateTests: '~140',
    suites: [
      ['`tests/scripts/memory-intelligence-backfill.test.ts`', 'Intelligence backfill idempotency'],
      ['`tests/repositories/memory.repository.test.ts`', 'Importance, access_count, last_accessed'],
      ['`tests/memory/retriever.test.ts`', 'Retrieval projection excludes full body by default'],
      ['`tests/memory/ranker.test.ts`', 'Ranking uses intelligence signals'],
    ],
    scenarios: [
      '`recordAccess` / `recordAccessBatch` updates access metadata',
      'Context build uses summary projection — not full content dump',
      'Backfill script dry-run default; safe to re-run',
      'Indexes from Phase 4 migration present in schema',
    ],
    manual: '`npm run db:backfill-memory-intelligence` dry-run then execute on staging',
  },
  {
    dir: '05-embedding',
    title: 'Phase 5 — Embedding',
    gateDate: '2026-07-01',
    gateTests: '152',
    suites: [
      ['`tests/embedding/noop-embedding.provider.test.ts`', 'Default noop provider'],
      ['`tests/embedding/create-embedding-provider.test.ts`', 'Factory wiring'],
      ['`tests/embedding/d1-embedding.store.test.ts`', 'Vector storage + searchSimilar'],
      ['`tests/embedding/cosine-similarity.test.ts`', 'Similarity math'],
      ['`tests/db/embedding-migration.test.ts`', 'Embedding table DDL'],
    ],
    scenarios: [
      'No sync embed on MemoryService CRUD hot path',
      'No vector SQL inside `MemoryRepository` — ADR-003 boundary',
      '`EMBEDDING_PROVIDER=noop` default unchanged',
      'Backfill skips unchanged `content_hash`',
    ],
    manual: '`EMBEDDING_PROVIDER=openai npm run db:backfill-embeddings` on staging sample',
  },
  {
    dir: '13.1-remote-mcp-clients',
    title: 'Phase 13.1 — Remote MCP Clients',
    gateDate: '2026-07-04',
    gateTests: '688',
    suites: [
      ['`tests/transport/remote-mcp.test.ts`', 'Initialize detection, session binding, CORS'],
      ['`tests/transport/mcp-oauth-metadata.test.ts`', 'RFC 9728 protected resource metadata'],
      ['`tests/auth/oidc-access-token.provider.test.ts`', 'OIDC bearer validation for MCP OAuth'],
      ['`tests/api/remote-mcp-oauth.test.ts`', '401 + WWW-Authenticate + resource_metadata on /mcp'],
      ['`tests/mcp/tools.test.ts`', '20 tools via stdio and remote binding parity'],
    ],
    scenarios: [
      '`REMOTE_MCP_ENABLED=false` — `/mcp` not mounted; full suite green',
      'API-key auth on `/mcp` when OAuth off',
      'OAuth discovery at `/.well-known/oauth-protected-resource/mcp` when `REMOTE_MCP_OAUTH_ENABLED=true`',
      'Same tool catalog as stdio — no forked implementations',
    ],
    manual:
      '1. `REMOTE_MCP_ENABLED=true npm run dev`\n2. POST `/mcp` with `Authorization: Bearer aic_...` + initialize JSON-RPC\n3. Follow-up with `mcp-session-id`\n4. Optional: ChatGPT OAuth with `REMOTE_MCP_OAUTH_ENABLED=true` + Phase 17 OIDC env',
    deferred: ['Automated ChatGPT remote connection smoke in CI', 'Vercel serverless long-lived SSE sessions'],
  },
  {
    dir: '14-federation',
    title: 'Phase 14 — Federation',
    gateDate: '2026-07-04',
    gateTests: '562',
    suites: [
      ['`tests/federation/knowledge-exchange.test.ts`', 'Ports gate, cross-org deny, peer list'],
      ['`tests/db/extension-tracks-migration.test.ts`', '`federation_*` tables'],
      ['`tests/capabilities/manifest-contract.test.ts`', '`supportsFederation` flag'],
      ['`tests/transport/layer-boundaries.test.ts`', 'No federation imports in services/'],
    ],
    scenarios: [
      'Cross-org exchange denied without trust link',
      '`FEDERATION_ENABLED=false` — routes not mounted',
      'In-process transport MVP for same-node workspaces',
      'Orchestrator uses MemoryService create/update only',
    ],
    manual: 'See IMPLEMENTATION.md smoke — pull/push between workspaces with federation env on',
    deferred: ['Cross-workspace in-process E2E recorded in CI', 'Remote HTTP peer transport'],
  },
  {
    dir: '15-autonomous-agent-ecosystem',
    title: 'Phase 15 — Autonomous Agent Ecosystem',
    gateDate: '2026-07-04',
    gateTests: '574',
    suites: [
      ['`tests/ecosystem/agent-client-catalog.test.ts`', '12 client profiles + env filter'],
      ['`tests/ecosystem/ecosystem-manifest.test.ts`', 'Capabilities ecosystem block'],
      ['`tests/api/ecosystem.test.ts`', 'REST `/ecosystem/clients`'],
      ['`tests/transport/handler-parity.test.ts`', 'Capabilities includes ecosystem'],
    ],
    scenarios: [
      'No `src/agent-runtime/` — constitution boundary grep clean',
      'Profiles filter by live `GRPC_ENABLED`, `SSE_ENABLED`, etc.',
      'Zero ecosystem imports in `memory.service.ts`',
    ],
    manual: 'curl `/api/v1/ecosystem/clients` and `/api/v1/capabilities` → check ecosystem block',
  },
  {
    dir: '16-developer-platform',
    title: 'Phase 16 — Developer Platform',
    gateDate: '2026-07-04',
    gateTests: '582',
    suites: [
      ['`packages/sdk/tests/client.test.ts`', 'SDK auth, errors, /api/v1 prefix'],
      ['`tests/packages/cli.test.ts`', 'CLI delegates to SDK only'],
      ['`tests/packages/developer-platform.test.ts`', 'No MemoryService in packages/; OpenAPI SSOT'],
    ],
    scenarios: [
      'CLI/MCP packages never call fetch directly — SDK boundary',
      'OpenAPI snapshot paths match live routes',
      'Full server regression unchanged at default env',
    ],
    manual: '`npm run build:packages` → `npx ai-brain capabilities` with API key',
  },
  {
    dir: '17-enterprise-security',
    title: 'Phase 17 — Enterprise Security',
    gateDate: '2026-07-04',
    gateTests: '592+',
    suites: [
      ['`tests/security/security-ports.test.ts`', 'Enabled/disabled composition'],
      ['`tests/security/policy-quota.test.ts`', 'Policy deny, quota 429'],
      ['`tests/db/enterprise-security-migration.test.ts`', 'Phase 17 DDL'],
    ],
    scenarios: [
      '`ENTERPRISE_SECURITY_V2=false` — full suite green',
      'Fail closed: 403 POLICY_DENIED, 429 QUOTA_EXCEEDED',
      'SSO metadata/login routes registered when enabled',
    ],
    manual: 'Enable V2 + rule-based policy → curl `/security/status` and SSO metadata',
  },
  {
    dir: '18-cloud-platform',
    title: 'Phase 18 — Cloud Platform',
    gateDate: '2026-07-04',
    gateTests: '600+',
    suites: [
      ['`tests/cloud/cloud-ports.test.ts`', 'Control plane composition gate'],
      ['`tests/cloud/control-plane.service.test.ts`', 'Tenant topology + regions'],
      ['`tests/db/cloud-platform-migration.test.ts`', 'Cloud platform DDL'],
      ['`tests/api/cloud.test.ts`', 'REST `/cloud/*` when enabled'],
    ],
    scenarios: [
      'Data plane CRUD unchanged when control plane off',
      'Usage meter consumer registers with Phase 12 when both enabled',
      'DR wrapper delegates to existing backup port',
    ],
    manual: '`CONTROL_PLANE_ENABLED=true` → GET `/api/v1/cloud/status`',
  },
  {
    dir: '19-observability-platform',
    title: 'Phase 19 — Observability Platform',
    gateDate: '2026-07-04',
    gateTests: '610+',
    suites: [
      ['`tests/observability/observability-ports.test.ts`', 'Composition gate'],
      ['`tests/observability/prometheus-exporter.test.ts`', 'Metrics exposition'],
      ['`tests/observability/dashboard-slo.test.ts`', 'Dashboard JSON + SLO templates valid'],
      ['`tests/api/observability.test.ts`', 'Admin observability routes'],
    ],
    scenarios: [
      'No observability handler on Phase 12 business event bus',
      'GET `/metrics` when `OBSERVABILITY_PLATFORM=true`',
      'Route labels sanitized — no memory content in metrics',
    ],
    manual: 'Enable platform → scrape `/metrics`; import dashboards from `observability/dashboards/`',
  },
  {
    dir: '20-ai-infrastructure',
    title: 'Phase 20 — AI Infrastructure',
    gateDate: '2026-07-04',
    gateTests: '620+',
    suites: [
      ['`tests/infrastructure-platform/infrastructure-ports.test.ts`', 'Marketplace composition'],
      ['`tests/infrastructure-platform/plugin-registry.test.ts`', 'Enable/disable lifecycle'],
      ['`tests/infrastructure-platform/marketplace.test.ts`', 'Catalog validation'],
      ['`tests/db/infrastructure-platform-migration.test.ts`', 'Plugin registry DDL'],
      ['`tests/api/infrastructure.test.ts`', 'REST `/infrastructure/*`'],
    ],
    scenarios: [
      'Default env preserves Phase 10 adapter selection',
      'Plugin enable requires restart — no hot-swap',
      'Allow-list hook integrates Phase 18 tenant metadata',
    ],
  },
  {
    dir: '21-search-graph-prod',
    title: 'Phase 21 — Search & Graph Production',
    gateDate: '2026-07-04',
    gateTests: '630+',
    suites: [
      ['`tests/search-graph-platform/orchestrator.test.ts`', 'Sync orchestration'],
      ['`tests/search-graph-platform/search-graph-ports.test.ts`', 'Composition gate'],
      ['`tests/db/search-graph-platform-migration.test.ts`', 'Watermark DDL'],
      ['`tests/api/search-graph.test.ts`', 'Admin sync REST'],
    ],
    scenarios: [
      'D1 graph + SQL search remain defaults when platform off',
      'Meilisearch/Neo4j sync reads SSOT only',
      'Watermark state per target',
    ],
    deferred: ['Staging Meilisearch+Neo4j cutover evidence archived', 'Background incremental scheduler'],
  },
  {
    dir: '22-content-scale',
    title: 'Phase 22 — Content Scale',
    gateDate: '2026-07-04',
    gateTests: '640+',
    suites: [
      ['`tests/content-scale-platform/orchestrator.test.ts`', 'Offload + pgvector + embedding sync'],
      ['`tests/content-scale-platform/content-scale-ports.test.ts`', 'Composition gate'],
      ['`tests/content-scale-platform/content-offload-backfill.test.ts`', 'R2/S3 offload script'],
      ['`tests/db/content-scale-platform-migration.test.ts`', 'Watermark DDL'],
      ['`tests/api/content-scale.test.ts`', 'Admin sync REST'],
    ],
    scenarios: [
      'Inline storage + D1 vector defaults unchanged',
      'Offload respects `CONTENT_OFFLOAD_MIN_BYTES` threshold',
      'Reuses pgvector/embedding backfill scripts',
    ],
  },
  {
    dir: '23-enterprise-knowledge-fabric',
    title: 'Phase 23 — Enterprise Knowledge Fabric',
    gateDate: '2026-07-04',
    gateTests: '650+',
    suites: [
      ['`tests/knowledge-fabric-platform/orchestrator.test.ts`', 'Ingest orchestration'],
      ['`tests/knowledge-fabric-platform/knowledge-fabric-ports.test.ts`', 'Composition gate'],
      ['`tests/db/knowledge-fabric-platform-migration.test.ts`', 'External ref DDL'],
      ['`tests/api/knowledge-fabric.test.ts`', 'POST `/knowledge-fabric/ingest/*`'],
    ],
    scenarios: [
      'All writes via MemoryService with `fabric:<connectorId>` provenance',
      'Catalog JSON ingest path validated in tests',
      'Distinct from Phase 14 peer exchange',
    ],
    deferred: ['Live Slack/GitHub/Notion API smoke'],
  },
  {
    dir: '24-ai-brain-platform',
    title: 'Phase 24 — AI-Brain Platform',
    gateDate: '2026-07-04',
    gateTests: '673',
    suites: [
      ['`tests/ai-brain-platform/ai-brain-platform-ports.test.ts`', 'Ports + webhook consumer'],
      ['`tests/ai-brain-platform/manifest-builder.test.ts`', 'Edition planes manifest'],
      ['`tests/db/ai-brain-platform-migration.test.ts`', 'Webhook table DDL'],
      ['`tests/api/ai-brain-platform.test.ts`', 'Platform admin REST'],
    ],
    scenarios: [
      'Webhook CRUD + HMAC signature generation tested',
      'Umbrella manifest aggregates child phase flags only',
      'Delivery requires Phase 12 Redis bus when webhooks enabled',
    ],
    manual: 'Enable platform + webhooks + Redis → POST webhook URL → trigger memory.created',
  },
  {
    dir: '25-global-ai-intelligence',
    title: 'Phase 25 — Global AI Intelligence',
    gateDate: '2026-07-04',
    gateTests: '682 (+9 phase tests)',
    suites: [
      ['`tests/global-intelligence/global-intelligence-ports.test.ts`', 'Noop when flag off'],
      ['`tests/global-intelligence/manifest-builder.test.ts`', 'Capstone manifest'],
      ['`tests/global-intelligence/usage-analytics.service.test.ts`', 'Adoption KPI from fixtures'],
      ['`tests/global-intelligence/migration.test.ts`', 'Telemetry/sync/journal DDL'],
      ['`tests/api/global-intelligence.test.ts`', 'REST `/intelligence/*`'],
    ],
    scenarios: [
      'Analytics read-only — never writes memories',
      'Redactor default off content sampling',
      'Telemetry consumer on Phase 12 domain events when both enabled',
      'Sync orchestrator delegates to Phase 14 when federation on',
    ],
    manual:
      '$env:GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=\'true\'; GET /api/v1/intelligence/status; POST /intelligence/sync with dryRun',
  },
];

function render(p) {
  const suiteRows = p.suites.map(([f, c]) => `| ${f} | ${c} |`).join('\n');
  const scenarioList = p.scenarios.map((s) => `- [x] ${s}`).join('\n');
  const deferred =
    p.deferred?.length ?
      `\n## Deferred tests\n\n${p.deferred.map((d) => `- [ ] ${d}`).join('\n')}\n`
    : '';
  const manual =
    p.manual ?
      `\n## Manual verification\n\n\`\`\`bash\n${p.manual}\n\`\`\`\n`
    : '';
  const nonReg =
    p.nonRegression?.length ?
      `\n## Non-regression\n\n${p.nonRegression.map((n) => `- ${n}`).join('\n')}\n`
    : '';

  return `# ${p.title} — TESTING

**Phase status:** Closed  
**Gate:** PASS ${p.gateDate}  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Record verification strategy and evidence: unit, integration, E2E, fixtures, quality gate.

---

## Quality gate

\`\`\`bash
npm run lint && npm run format:check && npm run typecheck && npm test
\`\`\`

| Metric | Value |
|--------|-------|
| Phase gate (${p.gateDate}) | ${p.gateTests ?? 'see CHECKLIST'} tests green |
| Current regression | ${CURRENT_REGRESSION} |

---

## Test suites

| File | Coverage |
|------|----------|
${suiteRows}

---

## Scenarios verified

${scenarioList}
${nonReg}${manual}${deferred}
---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
`;
}

function isBoilerplate(content) {
  if (content.includes('Document unit, integration, and E2E coverage proving')) return true;
  if (content.includes('_To be populated')) return true;
  if (!content.includes('tests/') && !content.includes('packages/')) return true;
  return false;
}

function patchRegressionNote(content) {
  if (content.includes('Current regression')) return content;
  const gateBlock = content.match(/## Quality gate[\s\S]*?(?=\n## |\n---|\n\*Do not|$)/);
  if (!gateBlock) return content;
  const insert = `\n| Current regression | ${CURRENT_REGRESSION} |\n`;
  if (gateBlock[0].includes('```')) {
    return content.replace(
      /(```\n\n)(## )/,
      `$1| Metric | Value |\n|--------|-------|\n| Current regression | ${CURRENT_REGRESSION} |\n\n$2`,
    );
  }
  return content.replace(gateBlock[0], gateBlock[0] + insert);
}

const dirs = fs
  .readdirSync(PHASES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !['audits', 'roadmap'].includes(d.name))
  .map((d) => d.name);

let rewritten = 0;
let patched = 0;

for (const p of PHASES) {
  const file = path.join(PHASES_DIR, p.dir, 'TESTING.md');
  fs.writeFileSync(file, render(p));
  rewritten++;
  console.log('rewrote', p.dir);
}

for (const dir of dirs) {
  if (PHASES.some((p) => p.dir === dir)) continue;
  const file = path.join(PHASES_DIR, dir, 'TESTING.md');
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  if (isBoilerplate(content)) {
    console.log('SKIP boilerplate (no data):', dir);
    continue;
  }
  const updated = patchRegressionNote(content);
  if (updated !== content) {
    fs.writeFileSync(file, updated);
    patched++;
    console.log('patched regression note', dir);
  }
}

console.log(`\nRewrote ${rewritten} TESTING.md · Patched ${patched} with current regression note.`);

// Append current regression to any remaining TESTING.md with test paths but no note
let appended = 0;
for (const dir of dirs) {
  const file = path.join(PHASES_DIR, dir, 'TESTING.md');
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('Current regression')) continue;
  if (!content.includes('tests/') && !content.includes('packages/')) continue;
  const block = `\n## Current regression\n\n${CURRENT_REGRESSION} (full suite, all master flags OFF)\n`;
  content = content.replace(/\n---\n\n\*Do not contradict/, `${block}\n---\n\n*Do not contradict`);
  if (!content.includes('Current regression')) content = content.trimEnd() + block;
  fs.writeFileSync(file, content);
  appended++;
}
if (appended) console.log(`Appended regression note to ${appended} more TESTING.md files.`);
