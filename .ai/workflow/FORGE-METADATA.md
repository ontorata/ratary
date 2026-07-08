# Forge Document Metadata Convention

| Field | Value |
|-------|-------|
| **Authority** | Agent Forge |
| **Status** | Active — Phase 4 |
| **Applies to** | All `.ai/designs/drafts/*` forge stage documents |

Every forge stage document MUST include this metadata block (YAML frontmatter or table) for Ratary indexing and dependency tracing.

---

## Required fields

```yaml
---
id: IDENTITY-FOUNDATION          # Stable milestone ID (UPPER-KEBAB)
phase: 04-proof-of-platform
stage: forge-isolate             # intent | isolate | blueprint | execute | land | remember
status: Approved                 # Draft | Approved | In Progress | Complete
owner: Ontorata
workload: Engineering Governance # Blocked workload or N/A
evidence_package: identity-foundation
constitution:
  - Internal Proof Before Public Capability
dependencies:
  - EXECUTION-CONTRACT
  - identity-foundation-intent     # prior stage doc id/slug
updated: 2026-07-08
---
```

---

## Stage documents

| Stage | File pattern | Purpose |
|-------|--------------|---------|
| forge-intent | `{slug}-intent.md` | Problem, constraints, acceptance criteria |
| forge-isolate | `{slug}-isolate.md` | Scope, baseline, six blueprint questions |
| forge-blueprint | `{slug}-plan.md` | Tasks with paths and verify commands |
| forge-execute | (code + evidence updates) | Implementation |
| forge-land | completion in evidence + CURRENT.md | Merge/PR decision |
| forge-remember | Ratary `save_memory` handoff | Session end |

---

## Indexing

Ratary ingest SHOULD use `id`, `phase`, `stage`, `evidence_package`, and `dependencies` as structured tags.
