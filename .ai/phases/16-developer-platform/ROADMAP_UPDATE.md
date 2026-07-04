# Phase 16 — ROADMAP_UPDATE

**Target documents:**

- [.ai/phases/roadmap/10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md)
- [.ai/phases/roadmap/11-ENTERPRISE-ROADMAP.md](../roadmap/11-ENTERPRISE-ROADMAP.md)
- [.ai/core/architecture/10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md)

**Apply when:** ADR-031 **Approved**.

---

## 10-POST-ROADMAP.md

| Action | Content |
|--------|---------|
| Add row | Phase 16 Developer Platform — P1 after Phase 15 |
| Dependency note | Requires Phase 13 (gRPC proto) for full SDK surface; REST-only SDK may ship earlier |
| Renumbering | Confirm Phase 21/22 (Search Graph, Content Scale) unchanged |

## 11-ENTERPRISE-ROADMAP.md

| Action | Content |
|--------|---------|
| Status | Phase 16: Designed → In progress when ADR Approved |
| Gate | ADR-031 Approved required before `packages/` merge |

## 10-PHASE-STATUS.md

| Metric | Update |
|--------|--------|
| Phase 16 status | 🔲 Reserved → 🔄 In progress |
| Deliverables | SDK langs (7), CLI, MCP server, templates |

---

## Sequencing rule

```
Phase 15 (catalog) → Phase 16 (SDK consumes catalog API)
Phase 13 (proto)   → Phase 16 (gRPC SDK gen)
```

Phase 16 **must not** block Phase 11 or Phase 17.

---

## Owner approval gate

Implementation blocked until ADR-031 status = **Approved** in `docs/adr/README.md`.
