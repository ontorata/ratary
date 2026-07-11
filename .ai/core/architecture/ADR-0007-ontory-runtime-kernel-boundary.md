# ADR-0007 — Ontory Runtime Kernel Boundary

| Field | Value |
|-------|-------|
| **Status** | **Accepted** — locked before any Ontory implementation |
| **Date** | 2026-07-08 |
| **Accepted** | 2026-07-08 |
| **Baseline** | `org-memory-p1-d-complete` (Studio `85cd066` · ratary tag `103bf7c`) |
| **Related** | ADR-0006 · P1-D AI Workspace · Future Runtime Compatibility · FROZEN-BOUNDARY-BYPASS-POLICY |
| **Deciders** | Engineering · Product (owner) |
| **Host repo** | `ontory` (separate) |
| **First transport** | REST (adapter only — not part of runtime contract) |
| **First provider** | Stub injectable → then real vendor adapters |

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

Ontory is treated as a **platform**, not an LLM integration shim.

### Layer responsibilities (locked)

| Layer | Owns | Must not own |
|-------|------|--------------|
| **Ratary** | Memory · recall · `ContextPackage` assembly | Model calls · agent loops · Studio UX |
| **Studio** | Workspace UX · `AIExecutionRequest` emission · `WorkspaceAiRuntimePort` client | Provider SDKs · Ontory internals · ranking/recall |
| **Ontory** | Runtime dispatcher · provider adapters · response envelope · (later) tools/agents | Ratary DB · Studio UI · recall ranking · permanent memory |

### Required call path

```text
Studio
  → WorkspaceAiRuntimePort
  → Ontory Runtime Kernel
  → Provider Adapter
  → AIExecutionResponse
```

Context for AI tasks enters only via **`AIExecutionRequest`** (prompt assembled from Ratary `ContextPackage`). Ontory must not re-fetch or re-rank memory via Ratary internals.

### P2-A minimal kernel (in scope)

```text
AIExecutionRequest (immutable)
        │
        ▼
Runtime Dispatcher
        │
        ▼
Provider Adapter (stub first)
        │
        ▼
AIExecutionResponse (frozen envelope)
```

**In scope:** dispatcher · provider abstraction · response envelope · runtime lifecycle · REST transport **adapter** · Studio RuntimePort client adapter  

**Out of scope:** agent loop · planning · tool execution · marketplace · multi-agent · memory management · recall · knowledge store

### Locked implementation decisions (owner — immutable for P2-A)

#### D1 — Separate `ontory` repository

Ownership separation:

```text
Ratary  = Memory Platform
Ontory  = Runtime Platform
Studio  = Product
```

Dependency direction:

```text
Studio → Ontory → Provider SDK
Ratary → (no Ontory/Studio dependency)
```

Forbidden layout: stuffing `runtime/`, `providers/`, `agents/` under Studio.

#### D2 — Transport is NOT part of the runtime contract

P2-A ships **REST first** (contract validation priority, not throughput).

`WorkspaceAiRuntimePort` is the contract. Transport adapters may later include REST, gRPC, in-process, or queue — all under the same port. Changing transport must not change Studio domain types.

#### D3 — Stub provider before vendor SDK

Order:

```text
StubRuntimeProvider → contract validation → OpenAI (or other) Adapter
```

P2-A locks the **Ontory API**, not a vendor SDK shape. Real providers must conform to Ontory’s provider abstraction — never the reverse.

#### D4 — Runtime must be stateless

Ontory Runtime **MUST NOT** persist:

- conversation memory
- project memory
- workspace state
- permanent recall cache

Allowed ephemeral scopes only:

- request scope
- execution scope
- streaming scope

When the response completes: **execution is disposed**. Permanent state stays outside Ontory (Ratary / Studio session store as already designed).

### Port contract (Studio-facing)

```ts
interface WorkspaceAiRuntimePort {
  complete(request: AIExecutionRequest): Promise<AIExecutionResponse>;
}
```

Naming may evolve (`complete` / `execute`) via compatible adapter — **Studio MUST NOT** gain `executeWithOntory()`, `callAgent()`, or provider-specific methods.

### Frozen-boundary rule

> **No component may bypass a frozen boundary for convenience.**

Rejected patterns:

- Studio → provider SDK (skip Ontory / RuntimePort)
- Ontory → Ratary database / recall internals
- Workspace → independent recall/ranking
- Runtime → persist organizational memory without Ratary APIs

---

## Definition of Done (P2-A)

P2-A is **COMPLETE** when all are true:

- [x] Decision locked in this ADR (acceptance)
- [x] `AIExecutionRequest` remains immutable at Ontory boundary
- [x] Dispatcher implemented
- [x] `WorkspaceAiRuntimePort` stable (Studio ↔ Ontory)
- [x] Stub provider works end-to-end
- [x] `AIExecutionResponse` envelope frozen
- [x] REST adapter available
- [x] No provider SDK leaks into Studio UI/domain
- [x] No Ratary dependency from Ontory (except public context already in the request)
- [x] No Studio dependency from Ontory
- [x] All execution enters via RuntimePort

**Evidence (Task 8 · governance only):** [ontory-runtime-kernel-proof.md](../../reviews/org-memory-dogfood/ontory-runtime-kernel-proof.md) · [P2-A-ACCEPTANCE.md](../../reviews/org-memory-dogfood/P2-A-ACCEPTANCE.md) · pinned commits Ontory `c18cacc` · Studio `043666e`.

---

## Consequences

### Positive

- Completes the third platform layer without collapsing layers
- Preserves `AIExecutionRequest` neutrality from P1-D
- Defers agent complexity until a real workload exists
- Keeps Ratary frozen while execution evolves
- Stub-first prevents vendor-shaped contracts

### Negative / tradeoffs

- Studio production path is Ontory REST (stub provider); real models wait for **P2-B**
- Cross-repo ownership (Studio · Ontory · Ratary)
- Early Ontory must resist agent-framework / vendor-adapter temptation until contracts stay locked

### Non-goals

- Studio productization UI expansion as P2-A scope
- P3 Ratary Advanced Intelligence as P2-A scope

---

## Alternatives considered

### A — Build providers inside Studio (rejected)
Couples UX to vendors; recreates the anti-pattern P1-D eliminated.

### B — Ontory Runtime Kernel first (chosen)
Minimal dispatcher + stub provider + REST adapter; Studio stays port-only.

### C — Deepen Ratary recall before execution (deferred)
Risks over-smart context without workload feedback; schedule as **P3**.

### D — Studio productization next (deferred to P2-C)
UX without a real runtime locks workflows to stubs prematurely.

### E — gRPC or vendor adapter first (rejected for P2-A)
Throughput and vendor SDKs are adapter concerns; contracts lock first.

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

1. ~~This ADR Accepted by owner~~ ✅
2. Forge intent `ontory-runtime-p2-a-intent` approved
3. Isolate from `org-memory-p1-d-complete` (Studio) + empty/bootstrapped `ontory` repo
4. Contract tests: Studio adapter ↔ Ontory response envelope
5. Boundary CI: no provider SDKs in Studio presentation; no Ratary recall imports in Ontory; Ontory remains request-scoped/stateless

---

## Acceptance

- [x] Owner accepts ADR-0007
- [x] D1–D4 implementation decisions locked
- [x] Indexed in architecture README + ADR-INDEX
- [x] P2-A forge intent unlocked for isolate/blueprint

**P2-A engineering DoD:** ✅ met (Tasks 1–8). **Closeout tag:** Task 9. **Next phase:** P2-B provider integration (one concern · no tools/memory/agents).
