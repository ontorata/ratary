# Phase 14 — Federation

**Status:** ✅ Implemented (2026-07-04)  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 14  
**ADR:** [ADR-029 Implemented](../../adr/029-federation-layer.md)

---

## Summary

Enable **multiple Ratary nodes** to exchange knowledge across workspace, region, organization, and cloud boundaries — entirely through **federation ports**. `MemoryService` **unchanged**; local persistence via existing APIs only.

| Dimension | Supported via |
|-----------|---------------|
| Cross Workspace | `FederationScopeRef` + in-process transport |
| Cross Region | `FederationNodeDescriptor.region` |
| Cross Organization | `IFederationPolicy` + trust store |
| Cross Cloud | Provider-agnostic transport/registry ports |

**Default:** `FEDERATION_ENABLED=false` — zero behavior change.

**Renumbering:** Former Phase 14 *Search & Graph Production* → **Phase 16**.

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

## Layer law

```
Federation adapters  →  IKnowledgeExchangeService  →  MemoryService (unchanged)
                              ↓
                    Federation ports only (no vendor SDKs inward)
```

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md).*
