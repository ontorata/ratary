# Phase 14 — Federation — IMPLEMENTATION

**Phase status:** Closed  
**Gate:** PASS 2026-07-04  
**ADR:** [ADR-029 Implemented](../../adr/029-federation-layer.md)

---

## Deliverables

| Track | Deliverable | Status |
|-------|-------------|--------|
| 14A | Federation ports + wire DTO types | ✅ |
| 14B | `KnowledgeExchangeService` + `NoOpKnowledgeExchangeService` | ✅ |
| 14C | `StaticFederationRegistry`, `NoOpFederationTrustStore` | ✅ |
| 14D | `InProcessFederationTransport` (same-node / cross-workspace) | ✅ |
| 14E | `RuleBasedFederationPolicy`, `DefaultFederationScopeMapper`, LWW conflict resolver | ✅ |
| 14F | REST `/api/v1/federation/*`, manifest `federation` section | ✅ |

---

## File map

```
src/federation/
  types/                    FederationNodeDescriptor, FederatedMemoryBundle, ...
  ports/                    IFederationRegistry, IFederationTransport, ...
  adapters/                 static registry, in-process transport, policy, ...
  knowledge-exchange.service.ts
  noop-knowledge-exchange.service.ts
src/infrastructure/federation/
  sql-federation-metadata-store.ts
src/composition/create-federation-ports.ts
src/controllers/federation.controller.ts
src/routes/v1/federation.routes.ts
src/db/migrations.ts        migrateExtensionTracksPhase6 (federation_* tables)
tests/federation/knowledge-exchange.test.ts
```

---

## Env flags

| Env | Default | Purpose |
|-----|---------|---------|
| `FEDERATION_ENABLED` | `false` | Master gate |
| `FEDERATION_NODE_ID` | UUID | Local node identity |
| `FEDERATION_PEERS_JSON` | `[]` | Static peer list |
| `FEDERATION_TRANSPORT_PROVIDER` | `in-process` | Transport adapter |
| `FEDERATION_METADATA_PROVIDER` | `none` | SQL cursors when `sql` |

---

## REST endpoints (when enabled)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/federation/peers` | List visible peers |
| GET | `/api/v1/federation/status` | Node + sync status |
| POST | `/api/v1/federation/exchange/pull` | Pull bundle + apply |
| POST | `/api/v1/federation/exchange/push` | Export + push |

---

## Invariants

- `MemoryService` unchanged — orchestrator calls `createMemory` / `updateMemory` only
- Federation metadata in separate tables — not in `MemoryRepository`
- Cross-org denied without trust link (fail closed)
- Default `FEDERATION_ENABLED=false`

---

## Rollback

`FEDERATION_ENABLED=false` — routes not mounted; regression unchanged.
