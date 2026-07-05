# Phase 13 — Protocol Layer

**Status:** ✅ Implemented (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 13  
**ADR:** [ADR-028 Implemented](../../adr/028-protocol-layer.md)

---

## Summary

Complete **multi-protocol access** with streaming and measurable benchmarks. All protocols delegate to the **same** `MemoryService` (and sibling application services) via shared use-case handlers. **Zero** business logic, repository, or storage change.

| Protocol | Role | Default |
|----------|------|---------|
| REST | Public API (existing v1) | ✅ always |
| gRPC | Internal / enterprise typed RPC + stream | opt-in |
| WebSocket | Bidirectional live updates | opt-in |
| SSE | Unidirectional browser-friendly stream | opt-in |
| MCP stdio | AI clients (from Phase 10.5) | ✅ always |

**Renumbering note:** Former Phase 13 *Content & Vector Scale* → **Phase 15** (see POST-ROADMAP amendment).

**Hard dependency:** Phase 10.5 ✅ (or ADR-027 Implemented) · Phase 12 recommended (event fan-out for WS/SSE subscriptions)

**Extension:** [Phase 13.1 Remote MCP Clients](../13.1-remote-mcp-clients/README.md) — ChatGPT Server URL (ADR-048 Implemented)

---

## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
| [DESIGN.md](DESIGN.md) | Approved design intent | ✅ Complete |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Build plan and modules | ✅ Complete |
| [MIGRATION.md](MIGRATION.md) | Schema and data migrations | ✅ N/A (no DDL) or prior phase |
| [TESTING.md](TESTING.md) | Verification strategy | ✅ Complete |
| [REVIEW.md](REVIEW.md) | Architecture review and gate | ✅ Complete |
| [COMPLETION.md](COMPLETION.md) | Success criteria evidence | ✅ Complete |
| [RETROSPECTIVE.md](RETROSPECTIVE.md) | Lessons learned | ✅ Complete |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist instance | ✅ Complete |
| [RISKS.md](RISKS.md) | Risk register | ✅ Complete |

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS 2026-07-04.*


---

## Layer law (immutable)

```
Protocol adapters  →  Application handlers  →  Services  →  Repository ports  →  Storage adapters
     ↑ knows protocol only          ↑ knows domain DTOs only    ↑ no protocol    ↑ no storage in controller
```

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md).*
