# Task Prompt — Phase 14 Federation

**Status:** 🔲 Reserved — **Do not implement until ADR-029 Approved**  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-029](../../adr/029-federation-layer.md)  
**Prerequisites:** Phase 9–10 ✅ · Phase 13 Implemented · Phase 12 recommended

---

# TASK

Implement **Phase 14 — Federation**: cross-node knowledge exchange (workspace, region, organization, cloud) via **federation ports only** — **`MemoryService` unchanged**.

---

## Requirements

### Layer law

- Federation → `IKnowledgeExchangeService` → `MemoryService` (existing methods only)
- No cloud/region/org hardcoding in services or repositories
- All providers env-selected at composition root
- `FEDERATION_ENABLED=false` default

### Tracks

| Track | Deliverable |
|-------|-------------|
| 14A | Federation ports + types |
| 14B | `KnowledgeExchangeService` |
| 14C | Registry + trust adapters |
| 14D | Transport adapters (in-process, gRPC, REST, event-bus) |
| 14E | Policy + scope mapper + conflict resolver |
| 14F | REST `/api/v1/federation/*` + manifest |

### ADR gates

| ADR | Status |
|-----|--------|
| [ADR-029](../../adr/029-federation-layer.md) | **Proposed → approve** |

---

## Definition of done

- [ ] SC-14-01 through SC-14-09 PASS
- [ ] MemoryService zero logic change (review verified)
- [ ] Federation lint: no federation in repositories/memory.service

---

*Blocked until owner approval.*
