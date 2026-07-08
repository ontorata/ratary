# ADR-0007 — Ontory Runtime Kernel Boundary

| Field | Value |
|-------|-------|
| **Status** | Proposed — awaiting owner acceptance before any Ontory code |
| **Date** | 2026-07-08 |
| **Baseline** | `org-memory-p1-d-complete` (Studio `85cd066` · ratary tag `103bf7c`) |
| **Related** | ADR-0006 · P1-D AI Workspace · Future Runtime Compatibility |
| **Deciders** | Engineering · Product |

---

## Context

P1-D locked the Studio consumer AI pipeline:

```text
ContextPackage → PromptAssembler → AIExecutionRequest → WorkspaceAiRuntimePort
```

Ratary owns memory/recall (P1-C frozen). Studio owns workspace UX and emits a **runtime-neutral** `AIExecutionRequest`.  

What is still missing is an **execution boundary** — a component that receives `AIExecutionRequest` and returns a response without forcing Studio to know providers, agents, or Ontory internals.

Without an explicit Ontory kernel ADR:
- Studio may call providers directly “for convenience”;
- Ontory may reach into Ratary DB or recall internals;
- agent frameworks may land before a minimal dispatcher exists.

---

## Decision

Introduce **Ontory Runtime Kernel (P2-A)** as a separate product/runtime owning AI execution, above Ratary context and below Studio workspace.

### Layer responsibilities (locked)

| Layer | Owns | Must not own |
|-------|------|--------------|
| **Ratary** | Memory · recall · `ContextPackage` assembly | Model calls · agent loops · Studio UX |
| **Studio** | Workspace UX · `AIExecutionRequest` emission · `WorkspaceAiRuntimePort` client | Provider SDKs · Ontory internals · ranking/recall |
| **Ontory** | Runtime dispatcher · provider adapters · streaming · (later) tools/agents | Ratary DB · Studio UI · recall ranking |

### Required call path

```text
Studio
  → WorkspaceAiRuntimePort
  → Ontory Runtime Kernel
  → Provider Adapter
  → Response Envelope
```

Context input to Ontory (when needed) is **`ContextPackage` / assembled prompt content already present in `AIExecutionRequest`** — Ontory must not re-fetch or re-rank memory via Ratary internals.

### P2-A minimal kernel (in scope)

```text
AIExecutionRequest
        │
        ▼
Runtime Dispatcher
        │
        ▼
Provider Adapter
        │
        ▼
AIExecutionResponse (envelope)
```

### Explicit non-goals for P2-A (Ontory P0)

- Autonomous agents / planning loops
- Tool marketplace
- Multi-agent orchestration
- Ontory-owned memory store
- Direct Ratary database/query access
- Advanced Ratary recall deepening (semantic decay, contradiction, etc.)

### Port contract (Studio-facing)

Studio continues to depend only on a port shaped like:

```ts
interface WorkspaceAiRuntimePort {
  complete(request: AIExecutionRequest): Promise<AIExecutionResponse>;
}
```

Naming may evolve (`complete` / `execute`) via compatible adapter — **Studio MUST NOT** gain `executeWithOntory()` or provider-specific methods.

### Frozen-boundary rule (constitutional for this stack)

> **No component may bypass a frozen boundary for convenience.**

Rejected patterns:

- Studio → provider SDK (skip Ontory / RuntimePort)
- Ontory → Ratary database / recall internals
- Workspace → independent recall/ranking
- Runtime → persist organizational memory without Ratary APIs

---

## Consequences

### Positive

- Completes the third platform layer without collapsing layers
- Preserves `AIExecutionRequest` neutrality from P1-D
- Defers agent complexity until a real workload exists
- Keeps Ratary frozen while execution evolves

### Negative / tradeoffs

- Studio chat remains echo/stub until Ontory adapter lands
- Cross-repo coordination (Studio adapter ↔ Ontory service)
- Early Ontory must resist agent-framework temptation

### Non-goals

- Studio productization UI expansion as P2-A scope
- P3 Ratary Advanced Intelligence as P2-A scope

---

## Alternatives considered

### A — Build providers inside Studio (rejected)
Couples UX to vendors; recreates the anti-pattern P1-D eliminated.

### B — Ontory Runtime Kernel first (chosen)
Minimal dispatcher + provider adapter; Studio stays port-only.

### C — Deepen Ratary recall before execution (deferred)
Risks over-smart context without workload feedback; schedule as **P3** after real Ontory usage.

### D — Studio productization next (deferred to P2-C)
UX without a real runtime locks workflows to stubs/providers prematurely.

---

## Recommended roadmap (post `org-memory-p1-d-complete`)

| Phase | Focus |
|-------|-------|
| **P2-A** | Ontory Runtime Kernel (this ADR) |
| **P2-B** | Real AI workload validation against kernel |
| **P2-C** | Studio productization on frozen ports |
| **P3** | Ratary Advanced Intelligence (new ADR) |

---

## Evidence / gates before implementation

1. This ADR **Accepted** by owner
2. Forge intent `ontory-runtime-p2-a-intent` approved
3. Isolate from `org-memory-p1-d-complete`
4. Contract tests: Studio adapter ↔ Ontory response envelope
5. Boundary CI: no provider SDKs in Studio presentation; no Ratary `src/memory/recall` imports in Ontory

---

## Acceptance

- [ ] Owner accepts ADR-0007
- [ ] Indexed in architecture README + ADR-INDEX
- [ ] P2-A forge intent unlocked

**Next after acceptance:** draft forge-intent for Ontory P0 kernel — still **no implementation code**.
