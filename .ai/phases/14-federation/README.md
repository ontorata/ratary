# Phase 14 — Federation

**Status:** 🔲 Reserved — Design draft (2026-07-04); **awaiting owner approval**  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)  
**Roadmap:** [10-POST-ROADMAP.md](../roadmap/10-POST-ROADMAP.md) § Phase 14  
**ADR gate:** [ADR-029](../../adr/029-federation-layer.md) — **Proposed**

---

## Summary

Enable **multiple AI Brain nodes** to exchange knowledge across workspace, region, organization, and cloud boundaries — entirely through **federation ports**. `MemoryService` **unchanged**; local persistence via existing APIs only.

| Dimension | Supported via |
|-----------|---------------|
| Cross Workspace | `FederationScopeRef` + policy |
| Cross Region | `FederationNodeDescriptor.region` |
| Cross Organization | `IFederationPolicy` + trust store |
| Cross Cloud | Provider-agnostic transport/registry ports |

**Default:** `FEDERATION_ENABLED=false` — zero behavior change.

**Renumbering:** Former Phase 14 *Search & Graph Production* → **Phase 16**.

**Hard dependency:** Phase 9 ✅ · Phase 10 ✅ · Phase 13 ✅ (protocol transport) · Phase 12 recommended (async replication)

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Full design |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Implementation prompt |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |
| [COMPLETION_TEMPLATE.md](COMPLETION_TEMPLATE.md) | Closure form |
| [RISKS.md](RISKS.md) | Risk register |

---

## Layer law

```
Federation adapters  →  IKnowledgeExchangeService  →  MemoryService (unchanged)
                              ↓
                    Federation ports only (no vendor SDKs inward)
```

---

*Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md). No implementation until ADR-029 **Approved**.*
