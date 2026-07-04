# Architecture Decision Policy

**Status:** Active governance — applies to all structural changes.  
**Hierarchy:** [../core/constitution/00-CONSTITUTION.md](../core/constitution/00-CONSTITUTION.md) → this policy → individual ADRs → implementation.

---

## Rule

**Every structural change requires an ADR.**

**No architectural refactor may be implemented without an approved ADR.**

Bug fixes, behavior-preserving refactors inside an approved design, tests, and docs that do not change boundaries are exempt (see §What requires an ADR).

---

## What requires an ADR

| Requires ADR | Examples |
|--------------|----------|
| ✅ Yes | New port or interface family; split/merge modules; change layer boundaries |
| ✅ Yes | New persistence backend (Postgres, Vectorize, R2); hybrid retrieval |
| ✅ Yes | Schema design that affects swap points (`memory_embeddings`, `object_key` usage) |
| ✅ Yes | Auth/tenant model; audit model for memory access |
| ✅ Yes | God-class split; ISP/DIP refactors that change public contracts |
| ✅ Yes | MCP/REST contract changes (non-additive) |

| Exempt (no ADR) | Examples |
|-----------------|----------|
| ❌ No | Fix `recordAccess` semantics inside existing contract |
| ❌ No | Add method to port **already described** in approved phase design + ADR |
| ❌ No | Projection query optimization (same interface) |
| ❌ No | Tests, lint, format, typo |
| ❌ No | Implement commit N of an **already-approved** ADR (reference ADR id in commit) |

When unsure: **write the ADR first** and wait for owner approval.

---

## ADR lifecycle

```
Proposed → Approved → Implemented → Superseded
```

| State | Meaning |
|-------|---------|
| **Proposed** | Written under `.ai/adr/`; no structural code yet |
| **Approved** | Owner explicitly approves in chat/PR/issue |
| **Implemented** | Code merged; ADR updated with implementation note |
| **Superseded** | Replaced by newer ADR; link forward |

---

## Required sections (every ADR)

Each ADR **must** include all sections below. Use [000-template.md](000-template.md).

1. **Context** — situation, phase, links to constitution/architecture  
2. **Problem** — what fails or will fail without a decision  
3. **Constraints** — constitution, no V2, backward compatibility, D1-not-only, etc.  
4. **Alternatives** — at least two real options  
5. **Decision** — chosen option (single clear statement)  
6. **Tradeoffs** — what we gain and what we accept  
7. **Migration** — steps, phased commits, data backfill  
8. **Rollback** — how to revert safely  
9. **Impact on future phases** — Phases 5–10 effects  

---

## File naming

```
.ai/adr/NNN-short-title.md
```

- `NNN` = three-digit sequence (`001`, `002`, …)  
- Lowercase kebab-case title  
- Index maintained in [README.md](README.md)

---

## Implementation gate

Before merging structural code, PR / commit must:

1. Reference approved ADR: `ADR-003: embedding storage MVP`  
2. Answer constitution PR checklist (layer, port, future phase)  
3. Pass quality gate: `lint` → `format:check` → `typecheck` → `test`  
4. One concern per commit  

Agents: if no approved ADR exists → **stop and write Proposed ADR**, do not code.

---

## Related documents

| Document | Role |
|----------|------|
| [.ai/core/ai-rules/11-AI-RULES.md](../.ai/core/ai-rules/11-AI-RULES.md) | Immutable rules + module registry |
| [.ai/core/architecture/04-ARCHITECTURE.md](../.ai/core/architecture/04-ARCHITECTURE.md) | Structure, layers, extension points |
| [.ai/workflow/05-WORKFLOW.md](../.ai/workflow/05-WORKFLOW.md) | Principal Engineer process & pre-code analysis |
| [TASK_PROMPT.md](TASK_PROMPT.md) | Current work only (rotates per phase) |
| [adr/README.md](adr/README.md) | ADR index |
| [archive/PHASE-5-EMBEDDING-DESIGN.md](archive/PHASE-5-EMBEDDING-DESIGN.md) | Phase design (feeds ADRs, not a substitute) |

**Hierarchy:** Constitution → Architecture → ADR Policy → ADR → archive design → TASK_PROMPT.
