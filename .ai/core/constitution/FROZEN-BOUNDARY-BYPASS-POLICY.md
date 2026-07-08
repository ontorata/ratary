# Frozen Boundary Bypass Policy

| Field | Value |
|-------|-------|
| **Status** | Active — architecture baseline v1.0 |
| **Authority** | Subordinate to ENGINEERING-CONSTITUTION · complements SECURITY-BOUNDARY |
| **Baseline tags** | `org-memory-p1-c-complete` · `org-memory-p1-d-complete` |
| **Related** | ADR-0006 · ADR-0007 (proposed) · P1-D Future Runtime Compatibility |
| **Updated** | 2026-07-08 |

---

## Rule

> **No component may bypass a frozen boundary for convenience.**

Frozen boundaries exist so layers remain independently evolvable. A “shortcut” that saves a sprint usually collapses the platform into an inseparable blob.

---

## Locked layers (v1.0)

| Layer | Responsibility | Baseline |
|-------|----------------|----------|
| **Ratary** | What should be remembered / recalled? | P1-C |
| **Studio** | Where does the user work? | P1-D |
| **Ontory** | How is AI executed? | P2-A (proposed · not yet implemented) |

---

## Rejected bypasses

| Bypass | Why forbidden |
|--------|----------------|
| Studio → model provider SDK | Skips runtime boundary; locks UX to vendor |
| Ontory → Ratary DB / recall internals | Makes execution own memory; breaks recall governance |
| Workspace → self-managed recall/ranking | Duplicates P1-C intelligence |
| Runtime → write org memory without Ratary | Splits source of truth |
| `executeWithOntory()` / `callAgent()` on Studio ports | Couples Studio to Ontory/agent frameworks |

---

## Required path

```text
Studio
  → WorkspaceAiRuntimePort
  → Ontory (when live)
  → Provider Adapter
```

Memory/context for AI tasks enters as **`AIExecutionRequest`** (prompt assembled from Ratary `ContextPackage`).  
Ontory consumes that envelope — it does **not** re-implement recall.

---

## Change control

1. Any intentional bypass → **new ADR** + milestone (not a “quick fix”).
2. Convenience under deadline is **not** a permitted change class.
3. CI/boundary guards that encode these rules are part of the baseline; weakening them requires ADR.

---

## Evidence references

- P1-D release: `.ai/governance/releases/P1-D-AI-WORKSPACE.md`
- P1-D future runtime note: `.ai/reviews/org-memory-dogfood/workspace-ai-pipeline-proof.md`
- Ontory kernel ADR: `.ai/core/architecture/ADR-0007-ontory-runtime-kernel-boundary.md`
