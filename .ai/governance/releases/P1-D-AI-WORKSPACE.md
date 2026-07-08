---
id: P1-D-AI-WORKSPACE
phase: 04-proof-of-platform
status: closed
distribution: baseline-locked
owner: Ontorata
workload: AI Workspace Pipeline Boundary
baseline_tag: org-memory-p1-c-complete
forge_branch: forge/ai-workspace-p1-d
studio_head: 85cd066
governance_head: 32ffd37
closeout_tag: org-memory-p1-d-complete
acceptance_manifest: .ai/reviews/org-memory-dogfood/P1-D-ACCEPTANCE.md
proof_artifact: .ai/reviews/org-memory-dogfood/workspace-ai-integration-eval-proof.md
updated: 2026-07-08
---

# Org Memory P1-D Completion

## Objective

Establish the **workspace AI execution boundary**: Studio consumes Ratary `ContextPackage` outputs and emits a runtime-neutral `AIExecutionRequest`, without coupling to model providers, agent frameworks, or Ontory.

---

## Components

### Ratary (frozen platform — P1-C)

- recall intelligence
- knowledge / memory foundation
- context assembly → `ContextPackage`

### Ontorata Studio (this milestone)

- workspace UX
- `WorkspaceRecallOrchestrator`
- `PromptAssembler`
- `AIExecutionRequest`
- `WorkspaceAiRuntimePort` (execution lifecycle seam)
- session continuum (snapshot refs only)

### Ontory (explicit non-goal)

- future runtime boundary only — **not implemented in P1-D**

---

## Architecture locked

```text
Ratary
(memory / recall intelligence)
        │
        ▼
ContextPackage
        │
        ▼
Studio Workspace
(AIExecutionRequest)
        │
        ▼
Future Runtime
(Ontory / provider / agent adapters)
```

| Layer | Responsibility |
|-------|----------------|
| Ratary | What should be remembered / recalled? |
| Studio | Where does the user work? |
| Ontory | How is AI executed? (**future**) |

**Do not merge these layers.**

---

## Guarantees

Studio **MUST NOT**:

- fetch memory via recall internals
- rank / filter / reorder memories
- call a model provider directly from UI
- depend on Ontory implementation details
- expose `executeWithOntory()` / `callAgent()` style APIs

Studio **MUST**:

- consume `WorkspaceContextPackage` only through the orchestrator path
- assemble prompts from packages without re-ranking
- pass `AIExecutionRequest` to `WorkspaceAiRuntimePort`
- keep `AIExecutionRequest` runtime-neutral (Future Runtime Compatibility)

---

## Waves (P1-D)

| Wave | Focus | Evidence |
|------|-------|----------|
| W1 | Consumer contracts + dual boundary guards | `workspace-recall-consumer-boundary-proof.md` |
| W2 | Recall-stateless session orchestration | `workspace-session-orchestration-proof.md` |
| W3 | ContextPackage UI consumption | `workspace-context-consumption-proof.md` |
| W4 | PromptAssembler → AIExecutionRequest → RuntimePort | `workspace-ai-pipeline-proof.md` |
| W5 | Pipeline smoke (5 scenarios · no live LLM) | `workspace-ai-integration-eval-proof.md` |
| W6 | Documentation + release closeout | this file |

**Deferred:** W5 extended corpus (quality/scalability stress) — not an architectural gate for P1-D.

---

## Validation snapshot

| Check | Result |
|-------|--------|
| Studio `npm test` | 45 PASS |
| `npm run eval:workspace-ai-smoke` | PASS |
| `npm run check:recall-boundary` | PASS |
| Ratary `npm run eval:recall-intelligence` | PASS (P1-C regression) |

---

## Closeout outcome

- Owner acceptance: **P1-D ACCEPTED**
- Baseline lock tag: `org-memory-p1-d-complete`
- Architecture baseline **v1.0** for consumer workspace ↔ recall platform separation

## Next (choose after lock — do not mix into P1-D)

- **Option A** — Ontory Runtime (`AIExecutionRequest` → Ontory adapter)
- **Option B** — Ratary Intelligence deepening (new ADR; do not mutate P1-C without one)
- **Option C** — Studio productization (chat/artifacts/collaboration on frozen ports)
