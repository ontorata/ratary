#!/usr/bin/env node
/**
 * Replace template RETROSPECTIVE.md with phase-specific lessons learned.
 * Run: node scripts/enrich-phase-retrospectives.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');

const PHASES = [
  {
    dir: '01-foundation',
    title: 'Phase 1 — Foundation',
    gateDate: '2026-06-28',
    summary:
      'Established D1-backed persistence, `IMemoryRepository` port, unified `MemoryService`, and dual transport (REST + MCP stdio) with semantic parity. Gate PASS 2026-06-28.',
    workedWell: [
      'Repository port (`IMemoryRepository`) isolated SQL from services — enabled MockD1 tests and later Postgres cutover (Phase 11)',
      'Single `MemoryService` for MCP and REST — no duplicate business rules',
      'Forward-only `runMigrations()` + canonical `MIGRATION_SQL` — idempotent deploys',
      'MockD1 harness — deterministic unit tests without live Cloudflare D1',
    ],
    harderOrDeferred: [
      'No authentication on REST at close — explicitly deferred to Phase 3',
      'Transport layer still monolithic (`server.ts`) — strangler to `transport/` completed later',
      'D1 vendor coupling accepted until Phase 10 abstraction work',
    ],
    acceptedDebt: [
      'Unauthenticated REST endpoints — mitigated in Phase 3',
      'Single D1 adapter — no Postgres path yet',
    ],
    recommendations: [
      'Phase 2.5: stabilize CI and test harness before adding auth complexity',
      'Phase 3: bind owner via identity table — do not trust client-supplied owner headers',
    ],
  },
  {
    dir: '02.5-stabilization',
    title: 'Phase 2.5 — Stabilization',
    gateDate: '2026-06-29',
    summary:
      'Quality-only phase: CI gate (lint + typecheck + format), flaky test fixes, and `.ai/phases/` governance schema. No new domain features. Gate PASS 2026-06-29; deferrals closed 2026-07-04.',
    workedWell: [
      'Mandatory CI quality gate before merge — caught regressions early',
      'MockD1 harness hardened — stable baseline without live D1',
      '`.ai/phases/PHASE-DOCUMENT-SCHEMA.md` — single responsibility per governance doc',
      'Zero feature creep — tests and docs only',
    ],
    harderOrDeferred: [
      'Some CHECKLIST deferrals (PANDUAN ecosystem, staging smoke) closed after original gate date',
      'Phase folder backfill for closed phases happened later (2026-07 governance sprint)',
    ],
    acceptedDebt: ['Governance docs scaffolded before per-phase enrichment scripts existed'],
    recommendations: [
      'Run enrichment scripts after each gate — avoid empty RETROSPECTIVE/COMPLETION templates',
      'Keep stabilization phases feature-free — quality debt pays compound interest',
    ],
  },
  {
    dir: '02.6-knowledge',
    title: 'Phase 2.6 — Knowledge Foundation',
    gateDate: '2026-06-30',
    summary:
      'Delivered knowledge metadata columns, pure generators, `KnowledgeService` orchestrator, and `memory_relations` graph edge store. ADR-002 Implemented. Gate PASS 2026-06-30.',
    workedWell: [
      'Pure generators (codename, slug, summary, keywords) — testable without DB',
      '`memory_relations` table — reused by Phase 8 graph without schema rewrite',
      'Backfill scripts dry-run default — safe operator path',
      '≥6 cross-owner isolation tests — leak prevention before intelligence layer',
    ],
    harderOrDeferred: [
      'UNIQUE indexes required backfill before migration — `migrateKnowledgeFoundationPhase3` ordering',
      'Design archive in `docs/archive/` — phase folder DESIGN is summary + pointer',
    ],
    acceptedDebt: ['Rule-based summary/keywords only — no LLM enrichment path yet'],
    recommendations: [
      'Phase 4: add retrieval projection (`MEMORY_SELECT`) before scaling candidate sets',
      'Phase 8: reuse `memory_relations` — do not introduce parallel edge store',
    ],
  },
  {
    dir: '03-authorization',
    title: 'Phase 3 — Authorization',
    gateDate: '2026-06-30',
    summary:
      'Delivered API key auth on REST via `AuthService` provider chain, identity binding to `owner_id`, and documented MCP owner anchor. Reused Phase 1 identities schema — no new DDL. Gate PASS 2026-06-30.',
    workedWell: [
      'Provider chain pattern — extensible without rewriting middleware',
      'Hash/compare via `secret_hash` only — no raw secrets in logs',
      'Reused Phase 1 `identities` table — zero migration risk',
      '`MCP_OWNER_ID` documented — production MCP anchor without REST key on stdio',
    ],
    harderOrDeferred: [
      'OAuth/JWT scope deferred — API keys sufficient for v1',
      'RBAC and quota layers deferred to Phase 17',
    ],
    acceptedDebt: ['API key only — no OAuth, no fine-grained RBAC at this gate'],
    recommendations: [
      'Phase 4+: always test cross-owner isolation after auth changes',
      'Phase 17: add RBAC pipeline without changing `MemoryService` signatures',
    ],
  },
  {
    dir: '04-memory-intelligence',
    title: 'Phase 4 — Memory Intelligence',
    gateDate: '2026-07-01',
    summary:
      'Delivered Retriever + Ranker + ContextBuilder pipeline, `recordAccessBatch`, `MEMORY_SELECT` projection, importance scoring, and `MemoryConsolidator`. Gate PASS 2026-07-01.',
    workedWell: [
      '`recordAccessBatch` — single UPDATE replaced N× write amplification',
      '`MEMORY_SELECT` — no full body in retrieval hot path',
      'Bounded candidate retrieval — predictable latency before hybrid/vector phases',
      'Consolidator batch path — foundation for Phase 5.5 compression',
    ],
    harderOrDeferred: [
      'Intelligence column backfill required dry-run operator discipline',
      'Graph-aware retrieval deferred to Phase 8',
    ],
    acceptedDebt: [
      'Rule-based importance only — no learning loop until Phase 8.6',
      'Consolidator rule-based — LLM compression deferred to Phase 5.5',
    ],
    recommendations: [
      'Phase 5: isolate vector SQL in dedicated store — keep `MemoryRepository` clean',
      'Phase 5.5: extend consolidator rather than fork compression logic',
    ],
  },
  {
    dir: '05-embedding',
    title: 'Phase 5 — Embedding',
    gateDate: '2026-07-01',
    summary:
      'Delivered async `EmbeddingJobRunner`, `D1EmbeddingStore` (vector SQL isolated from `MemoryRepository`), idempotent backfill with `content_hash` skip. ADR-003/004 Implemented. 152 tests at gate.',
    workedWell: [
      'No sync embed on CRUD — async job runner keeps write path fast',
      'Vector SQL in `D1EmbeddingStore` — ADR-003 boundary enforced',
      'Idempotent backfill with content_hash skip — safe re-runs',
      'REST/MCP contracts unchanged — zero client breakage',
    ],
    harderOrDeferred: [
      'Provider abstraction for multiple embed models deferred',
      'Large corpus backfill timing not benchmarked at gate',
    ],
    acceptedDebt: [
      'Single embed provider path — no model routing yet',
      'D1 vector store — Postgres/pgvector deferred to Phase 11/22',
    ],
    recommendations: [
      'Phase 6: composite retrieval sources — do not rewrite Retriever',
      'Phase 11: cutover vector store to Postgres without touching MemoryService',
    ],
  },
  {
    dir: '04.7-memory-stewardship',
    title: 'Phase 04.7 — Self-Managing Memory Stewardship',
    gateDate: '2026-07-04',
    summary:
      'Delivered `MemoryStewardshipOrchestrator` with four default tasks, in-memory run store, and CLI `steward:memories`. Gated by `MEMORY_STEWARDSHIP_ENABLED=false`.',
    workedWell: [
      'Orchestrator isolates per-task errors and persists `StewardshipRunReport` via `IStewardshipRunStore`',
      'ConsolidationTask reuses Phase 4 `MemoryConsolidator` + Phase 5.5 compression when enabled',
      '`create-memory-stewardship-ports.ts` wires tasks without changing `MemoryService` signatures',
      '493 tests green with flag off; ADR-045 Accepted',
    ],
    harderOrDeferred: [
      'Graph repair deferred to Phase 08.7; index repair to Phase 14',
      'SQL run store, MCP `run_stewardship`, and scheduled job not built',
      'Reserved stages `graph-repair`, `index-repair`, `ranking-refresh` registered but not implemented',
    ],
    acceptedDebt: [
      'Run history only in `InMemoryStewardshipRunStore` — lost on restart',
      'CLI-only — no MCP or REST surface',
    ],
    recommendations: [
      'Promote run store to SQL before enabling cron stewardship in production',
      'Wire Phase 08.7 `infer:relations` into a `graph-repair` stewardship task',
    ],
  },
  {
    dir: '05.5-semantic-compression',
    title: 'Phase 5.5 — Semantic Compression',
    gateDate: '2026-07-04',
    summary:
      'Delivered `RuleBasedCompressionPolicy`, extended consolidator, `CompressionJobRunner`, and CLI `compress:memories`. Schema adds compression columns; gated by `COMPRESSION_ENABLED=false`.',
    workedWell: [
      '`create-compression-ports.ts` composes policy, runner, and optional scheduler',
      'Append-only migration; rollback is flag-off without schema reversal',
      'Phase 04.7 stewardship reuses same consolidator + policy path',
      'Manifest `supportsSemanticCompression`; ADR-023 Accepted',
    ],
    harderOrDeferred: [
      '`ICompressionSummarizer` LLM adapter not built',
      'Admin REST `/admin/compress` and MCP status tool deferred',
      'Token benchmark evidence not archived in COMPLETION.md',
    ],
    acceptedDebt: ['Rule-based policy only — no LLM summarization', 'Compression path CLI-only'],
    recommendations: [
      'Add LLM summarizer adapter behind async queue before large-corpus prod use',
      'Archive token-reduction benchmarks in COMPLETION.md',
    ],
  },
  {
    dir: '06.5-progressive-retrieval',
    title: 'Phase 6.5 — Progressive Retrieval',
    gateDate: '2026-07-04',
    summary:
      'Delivered `DefaultRetrievalPolicy` hook in `ContextService.buildContext` producing additive `retrievalPlan`. Always-on default adapter; no master env flag.',
    workedWell: [
      'Default adapter matches pre-6.5 summary-only behavior — backward compatible',
      'Body hydration gated via `plan.hydrateBody` + `findByIdsWithContent`',
      'Manifest exposes `supportsProgressiveRetrieval` and policy version',
      'MCP/REST schemas unchanged; clients may ignore optional `retrievalPlan`',
    ],
    harderOrDeferred: [
      '`RETRIEVAL_POLICY=legacy` alternate adapter not built',
      'Relations stage auto-expansion deferred',
      'ML adaptive policy and token benchmarks deferred',
    ],
    acceptedDebt: ['Single default policy — no legacy/ML adapters', 'Relations stage not auto-expanded'],
    recommendations: [
      'Implement relations-stage expansion before high-graph deployments',
      'Add token benchmark evidence to COMPLETION.md',
    ],
  },
  {
    dir: '07.5-runtime-compatibility',
    title: 'Phase 7.5 — Runtime Compatibility',
    gateDate: '2026-07-04',
    summary:
      'Closed Phase 7 capability discovery gap: `CapabilityManifestBuilder`, `GET /api/v1/capabilities`, MCP `get_capabilities`, `MCP_TOOL_NAMES` SSOT (20 tools).',
    workedWell: [
      'Shared handler — REST and MCP return identical manifest JSON',
      '`MCP_TOOL_NAMES` enforces parity via contract tests',
      'No new env vars — reads existing deployment flags',
      'ADR-025 Accepted; closes Phase 7 discovery debt D7-01',
    ],
    harderOrDeferred: [
      'Condensed manifest in MCP `initialize` metadata not built',
      'Remote capability negotiation handshake deferred',
    ],
    acceptedDebt: ['Full manifest requires explicit capabilities call', 'No runtime negotiation protocol'],
    recommendations: [
      'Embed condensed snapshot in MCP `initialize` serverInfo',
      'Wire Phase 16 `@ai-brain/sdk` `getCapabilities()` to consume manifest',
    ],
  },
  {
    dir: '08.5-observation-reflection-learning',
    title: 'Phase 8.5 — Quality Signals',
    gateDate: '2026-07-04',
    summary:
      'Signal ingest pipeline: normalizer, importance policy, `MemorySignalIngestor`, SQL store, REST `/signals` when `SIGNAL_INGEST_ENABLED=true`. No agent reflection loops.',
    workedWell: [
      '`create-signal-ingest-ports.ts` gates routes behind flag default off',
      'Four signal types with bounded importance deltas',
      'Idempotent scope-safe ingestor; manifest `supportsQualitySignals`',
      'Constitution boundary preserved — ingest only, not agent learning',
    ],
    harderOrDeferred: [
      'MCP `submit_signal` not built',
      'Phase 12 `memory.signal.received` publish deferred',
      'Ranking adaptation is advisory stub only',
    ],
    acceptedDebt: ['REST-only ingest when enabled', 'No automated ranker mutation'],
    recommendations: [
      'Publish `memory.signal.received` on Phase 12 bus for Phase 8.6 feed',
      'Add MCP `submit_signal` for remote MCP clients',
    ],
  },
  {
    dir: '08.6-learning-intelligence',
    title: 'Phase 8.6 — Learning Intelligence',
    gateDate: '2026-07-04',
    summary:
      'W1 + L26 ranking: `LearningOrchestrator`, behavior analytics, ranking snapshot hook on Ranker, CLI `learning:run`. Gated by `LEARNING_ENGINE_ENABLED=false`.',
    workedWell: [
      'SQL event/artifact stores with migration',
      '`rankingSnapshotLoader` in `create-context-service.ts` applies multipliers at build time',
      'Hot path: signals → ingest → `LearningEventRecorder` when 8.5+8.6 on',
      'No-op stubs for L23–L30 — zero side effects when disabled',
    ],
    harderOrDeferred: ['L24 recommendation engine deferred', 'L28–L30 dataset/ML/eval deferred'],
    acceptedDebt: ['Only L21/L22/L26 implemented — rest are stubs', 'Batch `learning:run` only — no scheduler'],
    recommendations: [
      'Implement L24 before client-facing learning suggestions',
      'Add cron for `learning:run` after staging validation',
    ],
  },
  {
    dir: '08.7-graph-relation-inference',
    title: 'Phase 8.7 — Graph Relation Inference',
    gateDate: '2026-07-04',
    summary:
      'Batch relation inference: three deterministic sources, `upsertInferred`, evidence store, CLI `infer:relations`. Gated by `RELATION_INFERENCE_ENABLED=false`.',
    workedWell: [
      '`upsertInferred` manual-safe — only touches `source_type=inferred` edges',
      'Evidence audit trail with SQL migration',
      'No LLM; no hot-path inference on CRUD',
      'Manifest `supportsRelationInference`',
    ],
    harderOrDeferred: [
      'Semantic similarity source not built',
      'Phase 04.7 graph-repair task not wired',
      'Conversation/dependency sources deferred',
    ],
    acceptedDebt: ['Rule-based sources only', 'Inferred edges persist when flag off'],
    recommendations: [
      'Register graph-repair task in 04.7 orchestrator',
      'Add embedding-based similarity source for scale',
    ],
  },
  {
    dir: '09.5-platform-architecture',
    title: 'Phase 9.5 — Platform Architecture',
    gateDate: '2026-07-03',
    summary:
      'Canonical port registry at `src/ports/` — `ISqlDatabase`, `IVectorStore`, `IGraphStore`, `IObjectStorage`, `ICache`, `IEventBus`, `IAnalyticsStore`. Zero runtime change.',
    workedWell: [
      'Barrel export SSOT per ADR-008',
      'No provider implementations — pure structural phase',
      '310 tests green; explicit adapter placement under `src/infrastructure/`',
      'Re-exports preserve existing repository port locations',
    ],
    harderOrDeferred: ['No adapters in this phase — Phase 10 scope', 'Composition roots still inject concrete repos'],
    acceptedDebt: ['Ports declared but runtime uses legacy paths until Phase 10 wiring'],
    recommendations: [
      'Implement first adapters in Phase 10 enterprise track incrementally',
      'Migrate composition roots one port at a time',
    ],
  },
  {
    dir: '09.7-memory-evolution',
    title: 'Phase 09.7 — Memory Evolution',
    gateDate: '2026-07-04',
    summary:
      'Version control: `memory_versions`/`memory_heads`, coordinator archives on update, diff REST, CLI `evolution:history`. Gated by `MEMORY_EVOLUTION_ENABLED=false`.',
    workedWell: [
      'Hooks in `createMemoryService` — init head on create, snapshot on update',
      'Append-only versions — flag-off rollback safe',
      'Manifest `supportsMemoryEvolution`',
      'ADR-040 Implemented',
    ],
    harderOrDeferred: ['Branch merge execute not implemented', 'Restore-to-version not implemented'],
    acceptedDebt: ['Merge policy is stub', 'Version history read-only'],
    recommendations: [
      'Implement restore endpoint before multi-client sync prod',
      'Wire branch merge into Phase 09.8 field_merge resolver',
    ],
  },
  {
    dir: '09.8-multi-client-sync',
    title: 'Phase 09.8 — Multi-Client Sync',
    gateDate: '2026-07-04',
    summary:
      '`ConflictAwareSyncManager`, pull/push/status REST, SQL cursors/conflicts, CLI `sync:status`. Gated by `MULTI_CLIENT_SYNC_ENABLED=false`.',
    workedWell: [
      'LWW/field-merge/manual-queue resolvers',
      '`MemoryService` rejects stale writes when configured',
      'Wired via `createMultiClientSyncPorts` → REST',
      'ADR-042 Accepted',
    ],
    harderOrDeferred: ['REST E2E sync test not built', 'MCP pull/push deferred', '09.7 branch merge integration deferred'],
    acceptedDebt: ['REST-only sync surface', 'Field merge ignores evolution branches'],
    recommendations: [
      'Add REST E2E two-client sync test before staging enable',
      'Expose MCP sync tools for Cursor remote workflow',
    ],
  },
  {
    dir: '13-protocol-layer',
    title: 'Phase 13 — Protocol Layer',
    gateDate: '2026-07-04',
    summary:
      'Streaming: SSE `/context/stream`, WebSocket `/api/v1/ws`, gRPC stream reuse, benchmark CLI. Gated by `SSE_ENABLED` / `WEBSOCKET_ENABLED` default off.',
    workedWell: [
      'Shared streaming in `transport/shared/streaming/` — no logic in adapters',
      'gRPC reuses `chunksFromBuildContextResult`',
      'All protocols default OFF; REST unary unchanged',
      'ADR-028 Implemented',
    ],
    harderOrDeferred: ['Formal REVIEW gate pending in checklist', 'Phase 12 event subscribe stub partial'],
    acceptedDebt: ['No archived production latency benchmarks', 'No single default streaming protocol'],
    recommendations: [
      'Record staging SSE/WebSocket latency benchmarks',
      'Document client guide: SSE vs WebSocket vs gRPC',
    ],
  },
  {
    dir: '13.1-remote-mcp-clients',
    title: 'Phase 13.1 — Remote MCP Clients',
    gateDate: '2026-07-04',
    summary:
      'Streamable HTTP MCP at `/mcp`, API-key auth, OAuth RFC 9728 + OIDC bearer (13.1D). Same 20 tools; gated by `REMOTE_MCP_ENABLED=false`.',
    workedWell: [
      '`McpContextBinding` — stdio vs remote without forking tools',
      'OAuth discovery bridge reuses Phase 17 OIDC provider',
      'CORS + session via AsyncLocalStorage',
      'ADR-048 Implemented; enables ChatGPT Server URL',
    ],
    harderOrDeferred: ['ChatGPT staging smoke not in CI', 'Requires long-running Node not Vercel serverless'],
    acceptedDebt: ['OAuth cross-depends on Phase 17 OIDC env', 'No automated remote client smoke in CI'],
    recommendations: [
      'Record ChatGPT remote MCP smoke against staging',
      'CI test for `/.well-known/oauth-protected-resource/*`',
    ],
  },
  {
    dir: '14-federation',
    title: 'Phase 14 — Federation',
    gateDate: '2026-07-04',
    summary:
      'Federation layer: `KnowledgeExchangeService`, in-process transport, REST exchange API, `federation_*` tables. Gated by `FEDERATION_ENABLED=false`.',
    workedWell: [
      'Orchestrator calls `createMemory`/`updateMemory` only — `MemoryService` unchanged',
      'Cross-org denied without trust (fail closed)',
      'Peer config via `FEDERATION_PEERS_JSON`',
      'ADR-029 Implemented; foundation for Phase 25 sync',
    ],
    harderOrDeferred: ['Cross-workspace E2E smoke manual only', 'Only in-process transport MVP'],
    acceptedDebt: ['No remote HTTP/gRPC peer transport', 'Trust store not persisted in SQL'],
    recommendations: [
      'Record cross-workspace in-process E2E before multi-tenant staging',
      'HTTP transport adapter for Phase 25 multi-region sync',
    ],
  },
  {
    dir: '15-autonomous-agent-ecosystem',
    title: 'Phase 15 — Autonomous Agent Ecosystem',
    gateDate: '2026-07-04',
    summary:
      'Metadata catalog: 12 `AgentClientType` profiles, compatibility filtering by live env flags, REST `/ecosystem/*`. Zero agent runtime in repo.',
    workedWell: [
      '12 SSOT client profiles with protocol filtering',
      'Extended capabilities manifest with `ecosystem` block',
      'Constitution verified — no planner/executor in `src/`',
      'ADR-030 Implemented',
    ],
    harderOrDeferred: ['PANDUAN § ecosystem docs deferred', 'Catalog only — no runtime orchestration'],
    acceptedDebt: ['External agent loops remain outside repo by design'],
    recommendations: [
      'Complete PANDUAN per-client setup with `/mcp` URL',
      'CI test: new env flag must update client profile filters',
    ],
  },
  {
    dir: '16-developer-platform',
    title: 'Phase 16 — Developer Platform',
    gateDate: '2026-07-04',
    summary:
      '`@ai-brain/sdk`, `@ai-brain/cli`, `@ai-brain/mcp-server`, OpenAPI SSOT, thin multi-language wrappers. ADR-031 Implemented.',
    workedWell: [
      '`snapshot:openapi` + `build:packages` pipeline',
      'CLI/MCP boundary: SDK only, no direct fetch',
      'Examples and Cursor/Node templates',
      'Manifest `transport.sdk` — 7 languages',
    ],
    harderOrDeferred: ['Dashboard SPA deferred', 'SDK admin methods for Phase 20/24 deferred'],
    acceptedDebt: ['6 language wrappers are thin OpenAPI stubs'],
    recommendations: [
      'Add SDK methods for infrastructure and platform admin APIs',
      'Dashboard or Grafana pack for developer onboarding',
    ],
  },
  {
    dir: '17-enterprise-security',
    title: 'Phase 17 — Enterprise Security',
    gateDate: '2026-07-04',
    summary:
      'SSO/OIDC, OPA policy engine, quota enforcer, compliance auditor, edge middleware. Gated by `ENTERPRISE_SECURITY_V2=false`.',
    workedWell: [
      'Pipeline: Auth → RBAC → policy → quota → handlers',
      'Fail closed: 403/429; `MemoryService` unchanged',
      'SSO routes + security admin REST',
      'Bridges Phase 13.1 MCP OAuth',
    ],
    harderOrDeferred: ['IdP connectors are stubs without live vendor tests', 'OPA policy examples not bundled'],
    acceptedDebt: ['Registry stubs only for Azure/Okta/Keycloak/Google'],
    recommendations: [
      'Complete REVIEW before enabling in any tenant',
      'Document OIDC runbook for ChatGPT MCP OAuth',
    ],
  },
  {
    dir: '18-cloud-platform',
    title: 'Phase 18 — Cloud Platform',
    gateDate: '2026-07-04',
    summary:
      'Control plane, tenant metadata, usage meter consumer, DR wrapper, REST `/cloud/*`. Flags: `CONTROL_PLANE_ENABLED`, `USAGE_METER_ENABLED`, `DR_PLATFORM_ENABLED`.',
    workedWell: [
      'Admin metadata only — data plane CRUD unchanged',
      'Federation topology in tenant manifest',
      'DR wraps existing backup port',
      'ADR-033 Implemented',
    ],
    harderOrDeferred: ['gRPC admin deferred', 'K8s/Terraform adapters docs-only', 'Full restore write-path deferred'],
    acceptedDebt: ['Usage meter defaults to in-memory store', 'DR restore count-only'],
    recommendations: [
      'SQL-backed usage meter before billing export',
      'Integrate usage into Phase 25 cost analytics',
    ],
  },
  {
    dir: '19-observability-platform',
    title: 'Phase 19 — Observability Platform',
    gateDate: '2026-07-04',
    summary:
      'Prometheus metrics, OTel traces, log shipper, 6 Grafana dashboard packs, SLO templates. Gated by `OBSERVABILITY_PLATFORM=false`.',
    workedWell: [
      'Separated from Phase 12 business event bus',
      'Dashboard packs: overview, memory, embedding, graph, federation, cost',
      'REST middleware instrumentation; integrates `OTEL_ENABLED`',
      'ADR-034 Implemented',
    ],
    harderOrDeferred: ['gRPC/MCP dedicated hooks deferred', 'No bundled docker-compose stack', 'Cost gauges TBD'],
    acceptedDebt: ['External Prometheus/Grafana deployment only', 'Cost dashboard values not populated'],
    recommendations: [
      'Wire Phase 18 usage export into cost metrics',
      'Add gRPC/MCP instrumentation before combined prod enable',
    ],
  },
  {
    dir: '20-ai-infrastructure',
    title: 'Phase 20 — AI Infrastructure',
    gateDate: '2026-07-04',
    summary:
      'Plugin marketplace: registry, local catalog (9 plugins), validator, REST `/infrastructure/*`. Gated by `PLUGIN_MARKETPLACE_ENABLED=false`.',
    workedWell: [
      'Curated catalog maps to ADR-008 ports',
      'Enable/disable lifecycle with Phase 19 metrics',
      'Phase 18 allow-list governs enable',
      'ADR-035 Implemented',
    ],
    harderOrDeferred: ['ed25519 verification deferred', 'Hot-swap deferred — restart required'],
    acceptedDebt: ['Signature check is schema-only', 'Enable requires process restart'],
    recommendations: [
      'Cryptographic signature verification before third-party plugins',
      'CLI `infrastructure plugins` subcommands',
    ],
  },
  {
    dir: '21-search-graph-prod',
    title: 'Phase 21 — Search & Graph Production',
    gateDate: '2026-07-04',
    summary:
      '`SearchGraphOrchestrator`, Meilisearch/Neo4j syncers, watermarks, REST sync API. Gated by `SEARCH_GRAPH_PLATFORM_ENABLED=false`.',
    workedWell: [
      'Sync reads SSOT — `MemoryService` unchanged',
      'Reuses backfill scripts; D1/SQL remain defaults',
      'Watermark tracking per target',
      'ADR-022 Implemented',
    ],
    harderOrDeferred: ['Staging cutover evidence manual', 'Graph vector seeds (21C) reserved not built'],
    acceptedDebt: ['Admin POST-triggered sync only — no scheduler'],
    recommendations: [
      'Record Meilisearch + Neo4j staging cutover evidence',
      'Phase 12 consumer for incremental sync',
    ],
  },
  {
    dir: '22-content-scale',
    title: 'Phase 22 — Content Scale',
    gateDate: '2026-07-04',
    summary:
      'Content offload + pgvector + embedding sync orchestrator, REST `/content-scale/*`. Gated by `CONTENT_SCALE_PLATFORM_ENABLED=false`.',
    workedWell: [
      'Reuses pgvector/embedding/content backfill scripts',
      'Inline storage + D1 vector remain defaults',
      'Watermark per target: content, pgvector, embedding',
      'ADR-021 Implemented',
    ],
    harderOrDeferred: ['No background scheduler', '`CONTENT_OFFLOAD_CLEAR_INLINE=false` default'],
    acceptedDebt: ['Admin-triggered sync only', 'Inline content retained after offload by default'],
    recommendations: [
      'Enable clear-inline in staging after R2 latency validation',
      'Event-driven incremental sync via Phase 12',
    ],
  },
  {
    dir: '23-enterprise-knowledge-fabric',
    title: 'Phase 23 — Enterprise Knowledge Fabric',
    gateDate: '2026-07-04',
    summary:
      'External connector ingest: orchestrator, 10 connector types, normalizer, REST `/knowledge-fabric/ingest/*`. Gated by `KNOWLEDGE_FABRIC_ENABLED=false`.',
    workedWell: [
      'All writes via `MemoryService` with provenance tags',
      'Distinct from Phase 14 peer exchange',
      'Catalog JSON + token presence validation in tests',
      'ADR-047 Implemented',
    ],
    harderOrDeferred: ['Live Slack/GitHub/Notion API smoke deferred', 'No webhook-triggered ingest'],
    acceptedDebt: ['Connectors validate tokens but do not call live APIs in MVP'],
    recommendations: [
      'Integrate vendor SDKs and record live API smoke',
      'Webhook ingest via Phase 12 consumer',
    ],
  },
  {
    dir: '24-ai-brain-platform',
    title: 'Phase 24 — AI-Brain Platform',
    gateDate: '2026-07-04',
    summary:
      'Umbrella manifest (edition planes), HMAC webhooks, Phase 12 delivery consumer, REST `/platform/*`. Gated by `AI_BRAIN_PLATFORM_ENABLED=false`.',
    workedWell: [
      'Manifest aggregates child phase flags only',
      'Webhook CRUD + HMAC-signed delivery tested',
      'Edition tiers in manifest; workflow engine external',
      'ADR-044 Implemented',
    ],
    harderOrDeferred: ['Live webhook smoke needs receiver URL', 'Requires Redis event bus for delivery'],
    acceptedDebt: ['Webhooks need `EVENT_CONSUMERS_ENABLED` + Redis', 'Read-only aggregation — no orchestration'],
    recommendations: [
      'Live webhook smoke with Redis bus before prod enable',
      'SDK platform client for webhook CRUD',
    ],
  },
  {
    dir: '25-global-ai-intelligence',
    title: 'Phase 25 — Global AI Intelligence',
    gateDate: '2026-07-04',
    summary:
      'Capstone: telemetry recorder, read-only analytics KPIs, offline journal, 5-tier sync orchestrator over Phase 14. Gated by `GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false`.',
    workedWell: [
      'Analytics never writes memories; redactor default off content sampling',
      '`IntelligenceTelemetryConsumer` on Phase 12 events',
      'Sync delegates to Phase 14 when federation enabled',
      'ADR-036/037/038/043 Implemented; 689 tests green flag off',
    ],
    harderOrDeferred: ['No remote peer sync smoke', 'Cost KPI without Phase 18 billing integration'],
    acceptedDebt: ['Global sync limited to in-process federation transport', 'Cost KPI estimate-only'],
    recommendations: [
      'Integrate Phase 18 usage meter into `/intelligence/analytics/cost`',
      'Remote federation transport before multi-region 5-tier sync',
    ],
  },
];

function bullets(items) {
  return items.map((i) => `- ${i}`).join('\n');
}

const SCHEMA_LINE = '**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)';

function extractGateDate(content) {
  const patterns = [
    /\*\*Recorded:\*\* (\d{4}-\d{2}-\d{2})/,
    /✅ Closed — gate PASS \((\d{4}-\d{2}-\d{2})\)/,
    /✅ Gate PASS \((\d{4}-\d{2}-\d{2})\)/,
    /\*\*Date:\*\* (\d{4}-\d{2}-\d{2})/,
    /Recorded (\d{4}-\d{2}-\d{2}) after gate PASS/i,
    /Recorded at gate (\d{4}-\d{2}-\d{2})/i,
    /Gate closed (\d{4}-\d{2}-\d{2})/i,
    /gate PASS (\d{4}-\d{2}-\d{2})/i,
  ];
  for (const pattern of patterns) {
    const m = content.match(pattern);
    if (m?.[1]) return m[1];
  }
  return null;
}

function isStandardRetroHeader(content) {
  return /^\*\*Phase status:\*\* ✅ Closed — gate PASS \(\d{4}-\d{2}-\d{2}\)/m.test(content);
}

/** Normalize RETROSPECTIVE header without rewriting body sections. */
function normalizeRetrospectiveHeader(content) {
  let next = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
  const date = extractGateDate(next);
  if (!date) return content;

  const statusLine = `**Phase status:** ✅ Closed — gate PASS (${date})  `;
  const head = () => next.split('\n').slice(0, 14).join('\n');

  if (isStandardRetroHeader(next) && head().includes(SCHEMA_LINE) && !head().includes('**Recorded:**')) {
    return content.charCodeAt(0) === 0xfeff ? `\uFEFF${next}` : next;
  }

  next = next.replace(/\*\*Document:\*\* RETROSPECTIVE\s*\r?\n/, '');

  next = next.replace(
    /\*\*Phase status:\*\* Closed\s*\r?\n\*\*Recorded:\*\* \d{4}-\d{2}-\d{2}\s*\r?\n/,
    `${statusLine}\n`,
  );

  next = next.replace(/\*\*Phase status:\*\* Complete\s*\r?\n/, `${statusLine}\n`);
  next = next.replace(/\*\*Phase status:\*\* ✅ Gate PASS \(\d{4}-\d{2}-\d{2}\)/, statusLine.trim());

  next = next.replace(
    /\*\*Date:\*\* \d{4}-\d{2}-\d{2}\s*\r?\n\*\*Gate:\*\* PASS\s*\r?\n/,
    `${statusLine}\n`,
  );

  next = next.replace(/\*\*Date:\*\* \d{4}-\d{2}-\d{2}\s*\r?\n(?=---)/, `${statusLine}\n`);

  next = next.replace(/\*\*Recorded:\*\* \d{4}-\d{2}-\d{2}\s*\r?\n/, '');

  if (!head().includes(SCHEMA_LINE)) {
    next = next.replace(
      /(\*\*Phase status:\*\* ✅ Closed — gate PASS \(\d{4}-\d{2}-\d{2}\)\s*\r?\n)/,
      `$1${SCHEMA_LINE}  \n`,
    );
  }

  return next;
}

function render(p) {
  return `# ${p.title} — RETROSPECTIVE

**Phase status:** ✅ Closed — gate PASS (${p.gateDate})  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Summary

${p.summary}

Evidence: [IMPLEMENTATION.md](IMPLEMENTATION.md) · [TESTING.md](TESTING.md) · [CHECKLIST.md](CHECKLIST.md).

---

## What worked well

${bullets(p.workedWell)}

---

## What was harder than expected

${bullets(p.harderOrDeferred)}

---

## Accepted debt

${bullets(p.acceptedDebt)}

---

## Recommendations

${bullets(p.recommendations)}

---

*Recorded at gate ${p.gateDate}. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
`;
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
    const file = path.join(PHASES_DIR, dir, 'RETROSPECTIVE.md');
    if (!fs.existsSync(file)) continue;
    const existing = fs.readFileSync(file, 'utf8');
    const next = normalizeRetrospectiveHeader(existing);
    if (next === existing) {
      console.log('skip (already standard)', dir);
      skipped++;
      continue;
    }
    fs.writeFileSync(file, next);
    updated++;
    console.log('header fixed', dir);
  }
  console.log(`\nFixed ${updated} RETROSPECTIVE.md headers; skipped ${skipped}.`);
  process.exit(0);
}

for (const p of PHASES) {
  const file = path.join(PHASES_DIR, p.dir, 'RETROSPECTIVE.md');
  fs.writeFileSync(file, render(p));
  updated++;
  console.log('updated', p.dir);
}
console.log(`\nUpdated ${updated} RETROSPECTIVE.md files.`);
