# Phase 18 — Cloud Platform — DESIGN

**Document:** DESIGN · **ADR:** [ADR-033](../../adr/033-cloud-platform.md) · **Phase status:** ✅ Closed — gate PASS (2026-07-04)  
---

## 1. Mengapa phase ini diperlukan?

Enterprise cloud deployments need **operational control** beyond a single-node AI Brain instance: workspace provisioning at scale, multi-region topology, usage metering for billing export, disaster recovery runbooks, and tenant isolation guarantees — all **provider-agnostic**.

Without Phase 18:

- Operators manually edit env/config per tenant → **configuration drift**, no audit trail.
- Federation (Phase 14) lacks region-aware orchestration → cross-region failover is ad hoc.
- Security (Phase 17) identity exists but **no lifecycle API** for workspace/API key provisioning.
- Billing teams cannot consume standardized usage events → revenue leakage or manual reconciliation.

Phase 18 introduces a **control plane** that orchestrates metadata and operational policy while the **data plane** (MemoryService + existing ports) remains unchanged.

---

## 2. Mengapa tidak digabung dengan phase lain?

| Phase | Why separate |
|-------|--------------|
| 14 Federation | Peer sync protocol — not tenant provisioning or metering |
| 17 Enterprise Security | Identity, SSO, OPA — **consumes** control plane scope, doesn't provision regions |
| 19 Observability | Metrics/traces/logs export — cloud ops **feeds** observability, not vice versa |
| 20 AI Infrastructure | Plugin marketplace capstone — control plane **governs** allow-lists, not plugin catalog |

**Coupling avoided:** Provisioning ≠ identity federation ≠ observability export ≠ plugin registry.

---

## 3. Scope

### In scope

| Deliverable | Detail |
|-------------|--------|
| **`IControlPlane` port** | Workspace lifecycle, API key lifecycle, region assignment, tenant metadata |
| **`IUsageMeter` port** | Event-driven usage aggregation (consumes Phase 12 bus) for billing export |
| **`IDisasterRecovery` port** | Backup/restore orchestration (wraps existing backup + federation hooks) |
| **Control plane / data plane split** | Control = metadata orchestration; data = MemoryService + adapters |
| **Multi-region topology** | Region registry, primary/secondary assignment, read preference hints |
| **Tenant isolation** | Extends Phase 10/17 scope model — no rewrite of MemoryService |
| **Reference adapters** | Manual config (default), K8s hook, Terraform output consumer (TF not in repo) |
| **Feature flags** | `CONTROL_PLANE_ENABLED`, per-port toggles — default OFF |

### Out of scope

- Cloud vendor-specific IaC in repo (Terraform modules live externally)
- MemoryService business logic changes
- Agent runtime / planner
- Payment processing or subscription billing engine (export only)
- Observability stack (Phase 19)
- Plugin marketplace (Phase 20)

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Control Plane (metadata orchestration)                          │
│  IControlPlane │ IUsageMeter │ IDisasterRecovery                  │
│  Region registry │ Tenant scope │ DR runbooks                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ resolves scope, region, quotas
┌───────────────────────────▼─────────────────────────────────────┐
│  Data Plane (unchanged business logic)                           │
│  MemoryService │ ContextService │ Federation (Phase 14)          │
│  Storage │ Embedding │ Vector │ Graph adapters (ADR-008)         │
└─────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│  External orchestrators (optional adapters)                      │
│  K8s operator hook │ Terraform output │ Manual admin API         │
└─────────────────────────────────────────────────────────────────┘
```

### Control plane vs data plane

| Plane | Responsibility | Touches MemoryService? |
|-------|----------------|------------------------|
| **Control** | Provision workspace, assign region, rotate API keys, schedule DR | **No** — passes resolved `MemoryScope` |
| **Data** | CRUD, search, context, federation sync | **Yes** — existing service layer |

### Multi-region model

```
Region A (primary)          Region B (secondary)
┌──────────────────┐       ┌──────────────────┐
│ Data plane node  │◄─────►│ Data plane node  │  Federation (Phase 14)
│ MemoryService    │ sync  │ MemoryService    │
└────────┬─────────┘       └────────┬─────────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌──────────────────┐
         │ Control plane    │  Region registry, failover metadata
         │ (single logical) │
         └──────────────────┘
```

- **Primary region:** write authority for tenant workspace (configurable).
- **Secondary region:** read replica or async sync target via federation.
- **Failover:** DR port orchestrates restore; federation handles incremental sync where enabled.

### Tenant isolation

Isolation builds on existing scope chain (Phase 10 → Phase 17 hierarchy):

```
Organization → Department → Project → Workspace → MemoryScope
```

Control plane **never** bypasses scope resolution. Cross-tenant access remains impossible at handler boundary (ADR-007). Control plane APIs require admin/service identity from Phase 17.

---

## 5. Extension points & interfaces

| Port / Contract | Location | Purpose | Default adapter |
|-----------------|----------|---------|-----------------|
| `IControlPlane` | `src/ports/cloud/` | Workspace/API key/region lifecycle | Manual config |
| `IUsageMeter` | `src/ports/cloud/` | Usage event aggregation + export | Noop |
| `IDisasterRecovery` | `src/ports/cloud/` | Backup schedule, restore orchestration | Local backup wrapper |
| `ICloudProvisioner` | `src/ports/cloud/` | External infra hook (K8s, TF consumer) | Noop |
| `IRegionRegistry` | `src/ports/cloud/` | Region metadata, primary/secondary map | In-memory / SQL |
| `ITenantMetadataStore` | `src/ports/cloud/` | Tenant provisioning records | SQL adapter |

### IControlPlane (conceptual surface)

| Operation | Description |
|-----------|-------------|
| `provisionWorkspace` | Create workspace under org/dept/project with region |
| `deprovisionWorkspace` | Soft-delete + audit; data plane purge via existing delete flows |
| `assignRegion` | Set primary/secondary for workspace |
| `rotateApiKey` | Lifecycle hook; delegates to existing API key store |
| `getTenantTopology` | Return region assignment + federation peer map |

### IUsageMeter (conceptual surface)

| Operation | Description |
|-----------|-------------|
| `recordUsage` | Subscribe to Phase 12 events (memory CRUD, embedding, search, federation egress) |
| `aggregate` | Roll up by tenant/workspace/billing period |
| `export` | Push to external billing (webhook, file, adapter) |

**Event source:** Phase 12 event bus — **read-only consumer**, not a replacement for business event handlers.

### IDisasterRecovery (conceptual surface)

| Operation | Description |
|-----------|-------------|
| `scheduleBackup` | Cron/trigger metadata; invokes existing backup port |
| `restore` | Point-in-time restore orchestration |
| `failover` | Promote secondary region; update region registry |
| `verifyIntegrity` | Post-restore checksum / sample read |

---

## 6. Dependency rule

```
Request → Auth (Phase 17) → IControlPlane (admin routes only)
                         → Handlers → MemoryService (unchanged)

Phase 12 events → IUsageMeter (async, optional)
Backup port → IDisasterRecovery (orchestration layer)
Federation (Phase 14) → IDisasterRecovery + multi-region sync
```

**Forbidden:** Control plane calling MemoryService internals directly — only public service APIs or scope injection at composition root.

---

## 7. Migration strategy

| Step | Action | Server impact |
|------|--------|---------------|
| M1 | Add ports + noop adapters; `CONTROL_PLANE_ENABLED=false` | None at runtime |
| M2 | Add `IRegionRegistry`, `ITenantMetadataStore` SQL adapters (additive tables) | Additive schema only |
| M3 | Wire admin API routes (REST/gRPC additive) | New routes; existing v1 unchanged |
| M4 | Connect `IUsageMeter` to Phase 12 bus (subscriber) | Async sidecar; hot path unchanged |
| M5 | `IDisasterRecovery` wraps existing backup; DR admin routes | Opt-in |
| M6 | Reference K8s/TF consumer adapters (external docs) | None in core repo |

**Compatibility:**

- Single-node deployments: all flags OFF → identical to pre-Phase-18 behavior.
- Existing env-based adapter selection (Phase 10): unchanged when control plane disabled.
- REST v1 memory routes: **no breaking changes**.

**Backfill:**

- Existing workspaces → default region `local`, primary = current node.
- Existing orgs → synthetic tenant metadata record (idempotent migration).

---

## 8. Impact summary

| Dimension | Impact |
|-----------|--------|
| Scalability | Multi-region topology enables horizontal data plane expansion |
| Enterprise | **Primary beneficiary** — provisioning, DR, metering export |
| Security | Control plane admin routes gated by Phase 17 identity + policy |
| Developer | SDK (Phase 16) gains optional admin client surface (additive) |
| Federation | Region-aware peer assignment; DR uses federation sync |
| Observability | Control plane emits audit events → Phase 19 dashboards |
| Governance | Tenant lifecycle auditable; usage export for compliance |
| AI ecosystem | No impact on agent runtime (external) |

---

## 9. Rollback

| Flag | Effect |
|------|--------|
| `CONTROL_PLANE_ENABLED=false` | Disable all control plane routes and orchestration |
| `USAGE_METER_ENABLED=false` | Stop usage aggregation; Phase 12 bus unchanged |
| `DR_PLATFORM_ENABLED=false` | Revert to manual backup scripts |

**Data rollback:** Tenant metadata tables remain but are ignored — no data plane corruption. DR restore points preserved externally.

**Zero rollback required for MemoryService** — business logic untouched.

---

## 10. References

- [ADR-033](../../adr/033-cloud-platform.md) — Cloud Platform decision
- [ADR-008](../../adr/008-ports-and-adapters.md) — Port/adapter pattern
- Phase 14 — Federation
- Phase 17 — Enterprise Security
- [11-ENTERPRISE-ROADMAP.md](../roadmap/11-ENTERPRISE-ROADMAP.md)
- [04-ARCHITECTURE.md](../../core/constitution/04-ARCHITECTURE.md)

*Implementation: [IMPLEMENTATION.md](IMPLEMENTATION.md) · [TESTING.md](TESTING.md).*
