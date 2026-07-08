---
id: P2-A-ONTORY-RUNTIME-KERNEL
phase: 04-proof-of-platform
status: closed
distribution: baseline-locked
owner: Ontorata
workload: Ontory Runtime Kernel
baseline_tag: org-memory-p1-d-complete
forge_branch_governance: forge/ai-workspace-p1-d
forge_branch_studio: forge/ai-workspace-p1-d
forge_branch_ontory: forge/ontory-runtime-p2-a
ontory_head: c18cacc
studio_head: 043666e
governance_head: 35ff553
closeout_tag: org-memory-p2-a-complete
acceptance_manifest: .ai/reviews/org-memory-dogfood/P2-A-ACCEPTANCE.md
proof_artifact: .ai/reviews/org-memory-dogfood/ontory-runtime-kernel-proof.md
adr: ADR-0007
updated: 2026-07-08
---

# Org Memory P2-A Completion — Ontory Runtime Kernel

## Objective

Establish the **Ontory Runtime Kernel**: a separate execution platform that accepts `AIExecutionRequest` and returns `AIExecutionResponse` via a provider-agnostic Dispatcher, with Studio talking only through `WorkspaceAiRuntimePort` over REST.

---

## Locked path

```text
Studio
    │
WorkspaceAiRuntimePort
    │
REST
    │
Ontory Runtime Kernel
    │
Dispatcher
    │
Provider Port (abstract · stub only)
```

**No concrete vendor providers** in this milestone (intentional).

---

## Components

| Layer | Delivered |
|-------|-----------|
| **Ontory** | Contracts · Dispatcher · StubRuntimeProvider · REST `/v1/execute` + `/health` · boundary CI |
| **Studio** | `OntoryRestWorkspaceAiRuntime` · default pipeline = REST · Echo env fallback only |
| **Ratary / governance** | ADR-0007 DoD · evidence pack · acceptance · D1–D4 traceability |

---

## Baseline pins (`org-memory-p2-a-complete`)

| Repo | Branch | Commit |
|------|--------|--------|
| **ontory** | `forge/ontory-runtime-p2-a` | `c18cacc` |
| **Ontorata-Studio** | `forge/ai-workspace-p1-d` | `043666e` |
| **ai-brain (ratary)** | `forge/ai-workspace-p1-d` | `35ff553` |

Regressions after this tag that involve vendor SDKs or provider payloads belong to **P2-B+**, not the Runtime Kernel.

---

## Guarantees locked

- Dispatcher **must not** know vendor payload shapes
- Studio **must not** import Ontory packages or run Dispatcher in-process
- Transport (REST) ≠ runtime contract (`WorkspaceAiRuntimePort`)
- Runtime is **stateless** (request / execution scope only)
- D1–D4 remain immutable for this baseline

---

## Explicit non-goals (deferred)

| Item | Phase |
|------|-------|
| OpenAI / Anthropic / Gemini / local providers | **P2-B** |
| Tools / MCP | later (not P2-B scope unless separately ADR'd) |
| Memory / recall changes | Ratary / P3 |
| Agents / workflow orchestration | later |

---

## Evidence

- Acceptance: [P2-A-ACCEPTANCE.md](../../reviews/org-memory-dogfood/P2-A-ACCEPTANCE.md)
- Kernel proof: [ontory-runtime-kernel-proof.md](../../reviews/org-memory-dogfood/ontory-runtime-kernel-proof.md)
- Boundary: [ontory-runtime-boundary-verification.md](../../reviews/org-memory-dogfood/ontory-runtime-boundary-verification.md)
- Task 7 REST: [ontory-runtime-studio-rest-adapter-proof.md](../../reviews/org-memory-dogfood/ontory-runtime-studio-rest-adapter-proof.md)
- ADR: [ADR-0007](../../core/architecture/ADR-0007-ontory-runtime-kernel-boundary.md)

---

## Status

**CLOSED** · **Runtime Kernel Complete** · tag `org-memory-p2-a-complete`
