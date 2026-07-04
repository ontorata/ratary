# Phase 25 — Global AI Intelligence Platform — DESIGN

**Document:** DESIGN
**Status:** Architecture Review draft (2026-07-04) — **awaiting owner approval**
**Authority:** [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) → [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) → ADR-036 / 037 / 038 / 043
**Prerequisites:** Phase 12 ✅ · 13 ✅ · 14 (federation) · 18 (cloud) · 19 (observability) · 20 (AI infrastructure)

> **Design-only.** No code until the four ADRs are **Approved**. `MemoryService` signatures are **frozen**.

---

## 0. Position & non-duplication

Phase 25 is a **capstone composition**, not a new silo. It reuses ports that earlier phases already define and adds only the genuinely new surface.

| Requested capability | New in Phase 25 | Reuses (no duplication) |
|----------------------|-----------------|--------------------------|
| AI Telemetry Platform | Semantic **telemetry event model** + OTLP mapping | Phase 19 `IMetricsExporter` / `ITraceExporter` / `ILogShipper` |
| Usage Analytics Engine | `IUsageAnalyticsService` + metric derivations | ADR-013 analytics store, Phase 19 metric catalog |
| Cloud Connected Ecosystem | Multi-device session + offline sync + conflict resolution | Phase 18 control plane, Phase 14 transport |
| Federation Architecture | 5-tier topology + `IGlobalSyncOrchestrator` | Phase 14 federation ports (registry/trust/policy/scope/conflict) |

**Rule:** Phase 25 never re-declares a Phase 14/18/19 port. It orchestrates them.

---

## 1. Why this phase, why now

To become the world's leading Collaborative Memory Intelligence Platform, AI-Brain must **learn from its own usage** and **be present everywhere the team works** — while honoring Vision Principle #1 (knowledge independence) and #2 (team ownership).

Two capabilities are missing today:

1. **Feedback loop** — the platform emits raw metrics (Phase 19) but has no *semantic* telemetry model (`SearchExecuted`, `ContextBuilt`) and no analytics deriving *quality/adoption/cost*.
2. **Global presence** — Phase 14 exchanges bundles peer-to-peer and Phase 18 runs a control plane, but there is no unified **Workspace → Org → Cloud → Edge → Developer** synchronization topology with offline + conflict handling.

Phase 25 supplies both — as adapters, default OFF, zero content collection by default.

---

## 2. Architecture

### 2.1 Layer stack

```
┌──────────────────────────────────────────────────────────────────────────┐
│  OUTER ADAPTERS (Phase 25) — src/intelligence/adapters/                    │
│  OtlpTelemetrySink · PrometheusSink · JaegerTraceSink                      │
│  SqlAnalyticsSink (ADR-013 store) · DuckDbAnalyticsSink                     │
│  CloudSyncTransport · EdgeSyncTransport · OfflineJournalStore              │
│  FORBIDDEN inward: MemoryService logic · direct MemoryRepository           │
└───────────────────────────────┬────────────────────────────────────────┘
                                │  Phase 25 ports (below)
┌───────────────────────────────▼────────────────────────────────────────┐
│  INTELLIGENCE APPLICATION (Phase 25) — thin orchestrators                  │
│  ITelemetryRecorder → ITelemetrySink                                       │
│  IUsageAnalyticsService (read-only derivations)                            │
│  IGlobalSyncOrchestrator (composes federation + cloud ports)               │
└───────────────────────────────┬────────────────────────────────────────┘
                                │  reuse existing ports (no re-declare)
┌───────────────────────────────▼────────────────────────────────────────┐
│  Phase 14 federation ports · Phase 18 control plane · Phase 19 exporters  │
└───────────────────────────────┬────────────────────────────────────────┘
                                │  library calls (public API only)
┌───────────────────────────────▼────────────────────────────────────────┐
│  APPLICATION SERVICES — UNCHANGED                                          │
│  MemoryService · SearchService · KnowledgeService · ContextService         │
└───────────────────────────────┬────────────────────────────────────────┘
                                │  repository ports
┌───────────────────────────────▼────────────────────────────────────────┐
│  REPOSITORIES — UNCHANGED · no telemetry/analytics/sync awareness          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dependency rules

| Layer | May depend on | Must NOT |
|-------|---------------|----------|
| Telemetry adapter | Phase 25 ports, OTel/vendor SDK (adapter only) | MemoryService internals, business state mutation |
| Analytics service | Analytics store port, telemetry read port | Writing to `memories`, calling MemoryService.create |
| Sync orchestrator | Phase 14 + Phase 18 ports, MemoryService **public API** | Repository direct access, `switch(cloud)` |
| MemoryService | Domain, repositories | Any Phase 25 port |

### 2.3 Module structure

```
src/
  intelligence/
    telemetry/
      ports/
        itelemetry-recorder.port.ts
        itelemetry-sink.port.ts
        itelemetry-redactor.port.ts
      types/
        telemetry-event.ts            # discriminated union of the 10 events
        telemetry-envelope.ts
      recorder/
        telemetry-recorder.ts         # implements ITelemetryRecorder
      adapters/
        otlp-telemetry-sink.adapter.ts
        prometheus-telemetry-sink.adapter.ts
        jaeger-trace-sink.adapter.ts
        noop-telemetry-sink.adapter.ts
    analytics/
      ports/
        iusage-analytics.port.ts
        ianalytics-query.port.ts
      services/
        usage-analytics.service.ts    # read-only metric derivations
      adapters/
        sql-analytics-sink.adapter.ts   # ADR-013 store
        duckdb-analytics-sink.adapter.ts
    sync/
      ports/
        iglobal-sync-orchestrator.port.ts
        isync-session.port.ts
        ioffline-journal.port.ts
        isync-conflict-policy.port.ts
      types/
        sync-tier.ts                    # Workspace|Org|Cloud|Edge|Developer
        sync-envelope.ts
      services/
        global-sync-orchestrator.ts     # composes Phase 14 + Phase 18
      adapters/
        cloud-sync-transport.adapter.ts   # wraps Phase 14 IFederationTransport
        edge-sync-transport.adapter.ts
        sql-offline-journal.adapter.ts
    index.ts                            # composition-root port registry
  services/
    memory.service.ts                   # UNCHANGED
```

---

## 3. AI Telemetry Platform

### 3.1 Design goals

- Emit **semantic** events (domain-meaningful), not just counters.
- **No user content by default** — payloads carry identifiers, scopes, sizes, durations, and outcomes; never memory bodies, prompts, or search text unless an explicit `content_sampling` policy is enabled with owner approval.
- Map cleanly to **OpenTelemetry / OTLP** so operators reuse Prometheus, Grafana, Jaeger, Tempo.

### 3.2 Event model

Ten first-class telemetry events, modeled as a discriminated union on `type`:

| Event | Emitted when | Content-free payload |
|-------|--------------|----------------------|
| `MemoryAccessed` | Read/retrieval of a memory | `memoryId`, `scope`, `accessPath` (get/search/context), `latencyMs`, `cacheHit` |
| `MemoryCreated` | New memory persisted | `memoryId`, `scope`, `bytes`, `hasEmbedding`, `sourceProtocol` |
| `MemoryUpdated` | Existing memory changed | `memoryId`, `scope`, `changedFields` (names only), `versionFrom`, `versionTo` |
| `SearchExecuted` | Search/retrieval run | `scope`, `mode` (vector/keyword/hybrid), `resultCount`, `topScore`, `latencyMs` |
| `ContextBuilt` | Context assembled | `scope`, `tokenBudget`, `tokensUsed`, `memoryCount`, `truncated` |
| `PromptGenerated` | Prompt template rendered | `scope`, `template`, `tokenCount`, `sectionCount` |
| `AgentConnected` | AI client/agent session opens | `agentId`, `scope`, `clientKind`, `protocol` |
| `SDKConnected` | SDK handshake | `sdkVersion`, `capabilities[]`, `protocol` |
| `ModelInvoked` | Embedding/model provider call | `providerLabel`, `operation`, `tokensIn`, `tokensOut`, `latencyMs`, `costEstimate` |
| `SyncCompleted` | Federation/cloud sync finishes | `peerId`, `tier`, `applied`, `conflicts`, `bytes`, `lagMs` |

### 3.3 Telemetry envelope

```typescript
interface TelemetryEnvelope<E extends TelemetryEvent = TelemetryEvent> {
  readonly eventId: string;            // UUID
  readonly type: E['type'];
  readonly occurredAt: string;         // ISO-8601
  readonly scope: TelemetryScopeRef;   // workspace/org/agent — never raw content
  readonly nodeId: string;             // originating AI-Brain node
  readonly traceId?: string;           // W3C trace context (Phase 19)
  readonly spanId?: string;
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
  readonly redaction: 'none' | 'hashed' | 'aggregated';
  readonly payload: E;
}

interface TelemetryScopeRef {
  readonly workspaceId?: string;
  readonly organizationId?: string;
  readonly agentId?: string;           // attribution only
  readonly region?: string;
}
```

### 3.4 Ports

```typescript
/** Thin, hot-path-safe recorder invoked at middleware boundary. */
interface ITelemetryRecorder {
  record<E extends TelemetryEvent>(event: E, scope: TelemetryScopeRef): void; // fire-and-forget
  flush(): Promise<void>;
}

/** Backend exporter. */
interface ITelemetrySink {
  emit(batch: readonly TelemetryEnvelope[]): Promise<void>;
  readonly kind: 'otlp' | 'prometheus' | 'jaeger' | 'noop';
}

/** Enforces privacy before an envelope leaves the process. */
interface ITelemetryRedactor {
  redact(envelope: TelemetryEnvelope): TelemetryEnvelope; // strips/hashes per policy
}
```

### 3.5 OpenTelemetry / OTLP mapping

| AI-Brain concept | OTel construct |
|------------------|----------------|
| `TelemetryEnvelope` | Span (for latency events) + Log record (for state events) |
| `attributes` | OTel attributes (typed, bounded cardinality) |
| `ModelInvoked.costEstimate` | Metric — `ai_brain_model_cost` (gauge/counter) |
| `SearchExecuted.latencyMs` | Histogram — `ai_brain_search_latency_ms` |
| `traceId` / `spanId` | W3C trace context propagated from Phase 13 middleware |
| Export transport | OTLP/gRPC + OTLP/HTTP; Prometheus scrape; Jaeger/Tempo |

**Cardinality guard:** `memoryId`/`agentId` are **not** metric labels (high cardinality) — they live on spans/logs only. Metric labels are bounded dimensions (`scope tier`, `protocol`, `mode`, `providerLabel`).

---

## 4. Usage Analytics Engine

### 4.1 Principle

Analytics is a **read-only derivation** over telemetry + existing quality signals (ADR-026). It **never mutates SSOT** (Vision Principle #3). It answers "how well is knowledge working" — not "what is the knowledge".

### 4.2 Analytics model

| Metric | Definition | Source signals |
|--------|------------|----------------|
| **Memory Quality** | Composite of freshness, reuse, supersedence rate | ADR-026 signals + `MemoryAccessed` |
| **Knowledge Quality** | Graph connectedness, orphan ratio, duplication rate | Phase 8 graph + `MemoryCreated` |
| **Search Precision** | Click/accept-through on results (feedback-gated) | `SearchExecuted` + optional accept event |
| **Retrieval Success** | Non-empty, in-budget retrieval ratio | `SearchExecuted`, `ContextBuilt` |
| **Context Effectiveness** | `tokensUsed / tokenBudget`, truncation rate, reuse of built context | `ContextBuilt` |
| **AI Adoption** | Active agents/SDKs per workspace over time | `AgentConnected`, `SDKConnected` |
| **Workspace Health** | Blend of adoption + quality + sync freshness | all above + `SyncCompleted` |
| **Cost Optimization** | Cost per useful retrieval, cache-hit savings | `ModelInvoked`, `MemoryAccessed.cacheHit` |
| **Token Consumption** | Tokens in/out by provider, workspace, period | `ModelInvoked`, `PromptGenerated`, `ContextBuilt` |
| **Latency** | p50/p95/p99 by operation and protocol | all latency-bearing events |

### 4.3 Ports

```typescript
interface IUsageAnalyticsService {
  memoryQuality(scope: MemoryScope, window: TimeWindow): Promise<QualityReport>;
  searchPrecision(scope: MemoryScope, window: TimeWindow): Promise<PrecisionReport>;
  contextEffectiveness(scope: MemoryScope, window: TimeWindow): Promise<ContextReport>;
  adoption(scope: MemoryScope, window: TimeWindow): Promise<AdoptionReport>;
  cost(scope: MemoryScope, window: TimeWindow): Promise<CostReport>;
  workspaceHealth(scope: MemoryScope, window: TimeWindow): Promise<HealthScore>;
}

/** Storage-agnostic analytics query surface (ADR-013 store or DuckDB/ClickHouse adapter). */
interface IAnalyticsQueryPort {
  aggregate(query: AnalyticsAggregateSpec): Promise<AnalyticsResultSet>;
  timeseries(query: AnalyticsTimeseriesSpec): Promise<AnalyticsSeries>;
}
```

### 4.4 Analytics pipeline (async, off hot path)

```
Telemetry envelopes ──► ITelemetrySink (analytics adapter) ──► analytics store (ADR-013)
                                                                     │
IUsageAnalyticsService ◄── IAnalyticsQueryPort ◄─────────────────────┘
        │
        ▼
REST /api/v1/analytics/*  ·  MCP report tools  ·  Grafana panels
```

Analytics writes are **append-only aggregates**; no path leads back into `memories`.

---

## 5. Cloud Connected Ecosystem

### 5.1 Dimensions

| Dimension | Model element | Handled by |
|-----------|---------------|------------|
| Multi Device | `SyncSession.deviceId` | `ISyncSession` |
| Multi IDE | `SyncSession.clientKind` | Phase 18 control plane |
| Multi Repository | `scope.repositoryRef` (provenance) | existing scope fields |
| Multi Workspace | `MemoryScope.workspaceId` | Phase 14 scope mapper |
| Multi Organization | `scope.organizationId` + trust | Phase 14 policy/trust |
| Offline Sync | `IOfflineJournal` | Phase 25 new |
| Conflict Resolution | `ISyncConflictPolicy` | extends Phase 14 resolver |
| Event Replication | Phase 12 bus fan-out | Phase 12 + Phase 14 transport |
| Federation | tiered `IGlobalSyncOrchestrator` | Phase 25 new |

### 5.2 Offline sync + conflict

```typescript
interface IOfflineJournal {
  append(entry: SyncJournalEntry): Promise<void>;     // local, durable, scoped
  pending(scope: MemoryScope): Promise<SyncJournalEntry[]>;
  markApplied(entryId: string, remoteVersion: string): Promise<void>;
}

interface ISyncConflictPolicy {
  /** Reuses Phase 14 IFederationConflictResolver semantics; adds vector-clock awareness. */
  resolve(local: SyncRecord, remote: SyncRecord, clocks: VectorClock): Promise<'local' | 'remote' | 'merge'>;
}
```

Strategy default: **last-writer-wins by version + vector clock tiebreak**; `merge` reserved for stewardship (Phase 04.7) — never silent content merge without policy.

### 5.3 Event replication

Local write → `ISyncManager.reconcileWrite` (unchanged) → Phase 12 bus event → `IFederatedSyncPort` fan-out (Phase 14) → peer/edge/cloud nodes apply via their own `MemoryService`. **No shared primary database.**

---

## 6. Federation Architecture — 5-tier topology

### 6.1 Synchronization tiers

```
Workspace  ──►  Organization  ──►  Cloud  ──►  Edge  ──►  Developer
   (team)         (tenant)       (region hub)  (LAN/on-prem)  (device)
```

```typescript
type SyncTier = 'workspace' | 'organization' | 'cloud' | 'edge' | 'developer';
```

### 6.2 Rule — one business logic, many tiers

Each tier is a **descriptor + policy filter**, never a code branch. The **same** `IGlobalSyncOrchestrator` drives every tier; tiers differ only by:

- which `IFederationRegistry` peers are visible,
- which `IFederationPolicy` rules apply,
- which `IFederationTransport` adapter carries the bundle (in-process, LAN, gRPC, cloud hub).

```typescript
interface IGlobalSyncOrchestrator {
  /** Direction- and tier-aware sync; delegates to Phase 14 exchange service. */
  sync(request: GlobalSyncRequest): Promise<GlobalSyncResult>;
  status(scope: MemoryScope): Promise<GlobalSyncStatus>;   // cursors/lag per tier
}

interface GlobalSyncRequest {
  readonly scope: MemoryScope;
  readonly tier: SyncTier;
  readonly direction: 'pull' | 'push' | 'bidirectional';
  readonly since?: string;               // cursor
}
```

**No duplication:** `IGlobalSyncOrchestrator` calls Phase 14 `IKnowledgeExchangeService.pullAndApply` / `pushToPeer`; it adds tier routing + offline journal reconciliation only.

### 6.3 Federation ↔ Cloud responsibility split

| Concern | Owner |
|---------|-------|
| Trust, scope map, conflict, bundle wire format | **Phase 14** ports (reused) |
| Region hub, provisioning, metering, DR | **Phase 18** control plane (reused) |
| Tier routing, offline journal, device sessions, sync analytics | **Phase 25** (new) |

---

## 7. Event flow (end-to-end)

```
① Request (REST/gRPC/MCP)  ─ Phase 13 middleware attaches trace context
        │
        ▼
② Auth (Phase 17) → Handlers → MemoryService (UNCHANGED)
        │
        ├─► emits domain outcome
        ▼
③ ITelemetryRecorder.record(SearchExecuted{...})   ← non-blocking, middleware boundary
        │
        ▼
④ ITelemetryRedactor.redact() → batch → ITelemetrySink.emit()
        │                                   │
        │                                   ├─► OTLP → Jaeger/Tempo/Prometheus/Grafana
        │                                   └─► analytics adapter → ADR-013 store
        ▼
⑤ Async: MemoryWriteEvent (Phase 12 bus)
        │
        ▼
⑥ IGlobalSyncOrchestrator → IFederatedSyncPort fan-out → tiers
        │
        ▼
⑦ Peer nodes apply via own MemoryService → emit SyncCompleted telemetry
        │
        ▼
⑧ IUsageAnalyticsService derives quality/adoption/cost (read-only) → dashboards
```

**Hot-path guarantee:** ①–② are unchanged; ③ is fire-and-forget; ④–⑧ are async/out-of-band. `GLOBAL_INTELLIGENCE_PLATFORM=false` ⇒ recorder = noop, orchestrator = noop.

---

## 8. Telemetry Model (summary contract)

| Aspect | Decision |
|--------|----------|
| Shape | Discriminated union of 10 events under `TelemetryEnvelope` |
| Transport | OTLP/gRPC + OTLP/HTTP; Prometheus scrape; Jaeger/Tempo spans |
| Content | Identifiers/scopes/sizes/durations/outcomes only; no bodies by default |
| Cardinality | High-cardinality ids on spans/logs, never metric labels |
| Sampling | Configurable; default 0% export when flag OFF |
| Ownership | Emitted at middleware boundary — not inside MemoryService |

## 9. Analytics Model (summary contract)

| Aspect | Decision |
|--------|----------|
| Nature | Read-only derivations; append-only aggregate store |
| SSOT impact | None — never writes `memories` |
| Store | ADR-013 analytics store; swappable (DuckDB/ClickHouse adapters) |
| Surfaces | REST `/api/v1/analytics/*`, MCP report tools, Grafana packs |
| Metrics | 10 KPIs (§4.2), all scope-bound |

## 10. Sync Model (summary contract)

| Aspect | Decision |
|--------|----------|
| Topology | 5-tier Workspace→Org→Cloud→Edge→Developer |
| Engine | Single `IGlobalSyncOrchestrator` over Phase 14 exchange |
| Offline | `IOfflineJournal` durable local queue + reconcile |
| Conflict | Version + vector-clock; `merge` only via stewardship policy |
| Replication | Phase 12 bus → Phase 14 fan-out; no shared primary DB |
| Business logic | Not duplicated — tiers are policy/descriptor filters |

---

## 11. Security Model

| Control | Mechanism |
|---------|-----------|
| Scope enforcement | Every telemetry envelope, analytics query, sync record carries `MemoryScope`; cross-scope = not-found (Constitution §26–27) |
| Peer trust | Phase 14 `IFederationTrustStore` (mTLS/JWT/SPIFFE); bundles signed + verified |
| Transport security | TLS for cloud/edge; OTLP endpoints authenticated; no plaintext export |
| Authorization | Phase 17 enterprise security (SSO/ABAC/OPA) gates analytics + sync APIs |
| Tamper evidence | `contentHash` + signature on sync bundles; append-only telemetry & analytics |
| Secrets | Backend URLs/keys read only at composition root from env; never inward |
| Fail-closed | Unknown peer / failed policy → deny + no existence leak |
| Audit | Sync + analytics access exportable via Phase 17 audit → Phase 19 log shipper |

## 12. Privacy Model

| Principle | Enforcement |
|-----------|-------------|
| **Minimal collection** | Default telemetry payloads exclude memory bodies, prompts, search text |
| **Redaction port** | `ITelemetryRedactor` strips/hashes before egress; `redaction` field records mode |
| **Aggregation-first** | Analytics stores aggregates, not per-user raw event trails, unless owner enables retention |
| **Opt-in content sampling** | `TELEMETRY_CONTENT_SAMPLING=false` default; enabling requires ADR + owner approval |
| **Data residency** | `region` on scope/telemetry; policy can pin export to in-region sinks (GDPR) |
| **Right to erasure** | Telemetry/analytics keyed by scope; scope purge cascades to derived aggregates |
| **Retention** | Configurable TTL per sink; default bounded window; no indefinite raw retention |
| **No cross-tenant blending** | Analytics aggregates never mix organizations |

---

## 13. Enterprise Compatibility

| Requirement | How satisfied |
|-------------|---------------|
| Clean Architecture | Adapters outer, policy inward, dependency direction preserved |
| Ports & Adapters | 9 new ports; all backends swappable at composition root |
| Event-Driven | Telemetry + replication ride middleware/Phase 12 bus |
| Multi-Tenant / Workspace / AI | Scope-bound signals; vendor-neutral (no `switch(vendor)`) |
| Storage-Agnostic | Telemetry sink, analytics store, offline journal, sync metadata all behind ports |
| Vendor-Neutral | OTel/OTLP standards; cloud/region are opaque descriptor fields |
| SOC2 / ISO 27001 | Audit export, SLO registry (Phase 19), access control (Phase 17) |
| GDPR / residency | Region pinning, redaction, erasure cascade (§12) |
| Zero-downtime adoption | Every capability default OFF; additive REST/MCP |

## 14. Future Compatibility (three-phase horizon, Constitution §24)

| Future need | Pre-provisioned by |
|-------------|--------------------|
| New telemetry event types | Discriminated union is additive; new `type` = new adapter mapping |
| New analytics KPI | New `IUsageAnalyticsService` method (additive) + new aggregate query |
| New sync tier (e.g. `partner`) | `SyncTier` union additive; orchestrator routing unchanged |
| New transport (QUIC, WebTransport) | New `IFederationTransport` adapter; orchestrator unaffected |
| ML-driven anomaly detection on telemetry | Reads analytics store; stays read-only, external to `src/services/` |
| Marketplace telemetry plugins | Register via Phase 20 plugin SDK / ADR-008 ports |

**Guarantee:** none of the above forces a `MemoryService` change or a `*V2` fork.

---

## 15. Testing Strategy

| Suite | Verifies |
|-------|----------|
| Telemetry event contract | Each of 10 events serializes to envelope + OTLP mapping; no content fields present |
| Redactor unit | Bodies/prompts stripped or hashed per policy; `redaction` mode accurate |
| Cardinality lint | High-cardinality ids never appear as metric labels |
| Recorder hot-path | `record()` is non-blocking; noop sink adds no measurable latency when flag OFF |
| Analytics derivation | Each KPI computed correctly from synthetic telemetry fixtures |
| Analytics isolation | No write path from analytics to `memories` (layer lint) |
| Sync orchestrator | Tier routing delegates to Phase 14 exchange with correct scope/policy |
| Offline journal | Append → reconcile → conflict resolution round-trip; idempotent replay |
| Conflict policy | Version + vector-clock resolution deterministic; no silent merge |
| Cross-scope deny | Telemetry/analytics/sync fail-closed across workspace/org |
| Privacy/residency | Region pinning prevents cross-region export; erasure cascades |
| Regression | `GLOBAL_INTELLIGENCE_PLATFORM=false` → full existing suite green, MemoryService diff = 0 |
| Layer lint | No Phase 25 imports inside `memory.service.ts` or repositories |

**Coverage gate:** no decrease vs baseline (473+ green with flags off).

---

## 16. ADR Requirements

| ADR | Title | Scope | Status |
|-----|-------|-------|--------|
| **ADR-036** | Global AI Intelligence Platform | Umbrella phase gate; composition boundary; master flag | Proposed |
| **ADR-037** | AI Telemetry Event Model | 10-event model, envelope, OTLP mapping, privacy defaults | Proposed |
| **ADR-038** | Usage Analytics Engine | Read-only derivations, KPI catalog, analytics store port | Proposed |
| **ADR-043** | Cloud Federation Sync Topology | 5-tier sync, offline journal, conflict policy, cloud ecosystem | Proposed |

**Approval order:** ADR-036 first (boundary), then 037/038/043 in parallel. No implementation until all four are **Approved**. Each must pass the Vision proposal gate (§Proposal gate in vision charter) and Constitution design-validation checklist.

---

## 17. Wajib dijawab

| Question | Answer |
|----------|--------|
| **Why needed?** | AI-Brain must learn from its own usage and be globally present, without collecting content |
| **Why Phase 25?** | Requires events (12), protocol (13), federation (14), cloud (18), observability (19), infra (20) |
| **What changes?** | New `src/intelligence/` module: telemetry, analytics, sync orchestration ports + adapters |
| **What stays?** | `MemoryService`, repositories, REST v1, MCP tool schemas |
| **Extension points?** | 9 ports (3 telemetry, 2 analytics, 4 sync) + reuse of Phase 14/18/19 ports |
| **Hardcode / vendor coupling?** | Forbidden — OTel/OTLP standards; cloud/region opaque; env-driven adapters |
| **MemoryService?** | Unchanged — called as library by sync orchestrator only |
| **Content collection?** | Off by default; opt-in sampling requires ADR + owner approval |

---

## 18. Non-goals

- Agent reasoning, planning, or execution (external — Phase 7/15 boundary)
- Writing analytics/learning results back into SSOT without stewardship (Vision #3)
- Hosting Grafana/Prometheus/Jaeger in core repo (adapters + templates only)
- A single global primary database or CRDT full auto-merge without policy
- Changing `MemoryService` signatures or forking `*V2` services
- Collecting user content for analytics by default

---

## 19. References

- [ADR-036](../../../docs/adr/036-global-ai-intelligence-platform.md) · [ADR-037](../../../docs/adr/037-ai-telemetry-event-model.md) · [ADR-038](../../../docs/adr/038-usage-analytics-engine.md) · [ADR-043](../../../docs/adr/043-cloud-federation-sync-topology.md)
- Phase 14 Federation [DESIGN](../14-federation/DESIGN.md) · Phase 18 Cloud · Phase 19 Observability [DESIGN](../19-observability-platform/DESIGN.md) · Phase 20 AI Infrastructure
- [ADR-013 analytics store](../../../docs/adr/013-duckdb-analytics-store.md) · [ADR-026 memory quality signals](../../../docs/adr/026-memory-quality-signals.md)
- [Vision charter](../../core/vision/01-COLLABORATIVE-MEMORY-PLATFORM.md) · [Intelligence pipeline](../../core/vision/03-INTELLIGENCE-PIPELINE.md)

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). No implementation until ADR-036, 037, 038, 043 are **Approved**.*
