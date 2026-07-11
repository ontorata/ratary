# P2-D Streaming & Execution Lifecycle — Forge Intent

**Status:** Accepted — owner approval 2026-07-09  
**Slug:** ontory-streaming-p2-d-intent  
**Baseline:** `org-memory-p2-c2-complete` (Ontory `7241319` · ai-brain `8fbecae`)  
**Branch:** governance on `forge/ai-workspace-p1-d` — **ontory coding blocked until P2-D.1 blueprint**  
**Phase:** 04-proof-of-platform → Ontory execution lifecycle track  
**Category:** Must Prove (contract extension — ADR-only gate)  
**Authority:** ADR-0012 (Accepted) · ADR-0007 · ADR-0009 · [contract.md](../../governance/provider-conformance/contract.md)

---

## Problem

P2-C proved three vendors behind one frozen `ProviderRuntime.complete()` contract. Streaming and C-CAN were explicitly deferred.

Core question:

> Can Ontory add streaming as a **runtime semantic** without breaking P2-C conformance on the existing complete path?

---

## Locked decisions

| ID | Decision |
|----|----------|
| D1 | **ADR-only gate** — ADR-0012 Accepted before any `ontory` implementation |
| D2 | **Runtime semantic (B)** — adapters map vendor events → frozen `AIExecutionEvent` |
| D3 | **`complete()` preserved** — streaming MUST NOT modify non-stream semantics; `stream()` is extension not replacement |
| D4 | **Lifecycle state machine** — CREATED → STARTED → STREAMING → COMPLETED; terminal FAILED/CANCELLED/COMPLETED |
| D5 | **Sequence monotonic** per `executionId` |
| D6 | **Core output** — `AsyncIterable<AIExecutionEvent>` only; no transport primitives in core |
| D7 | **Transport** — SSE first via transport adapter; WebSocket/queue future |
| D8 | **Cancellation** — Runtime `CancellationSignal`; vendor abort internal to adapters |
| D9 | **Capability** — static `ExecutionCapability` per adapter; runtime probe deferred |
| D10 | **`tool_call`** — type + schema frozen in P2-D.1; provider mapping + orchestration deferred |
| D11 | **C-CAN** — DEFER → MUST in P2-D.6 |
| D12 | **Envelope rule** — no vendor-specific fields in shared runtime types |

### Contract boundary (owner-locked)

> **Freeze contract first. Provider follows contract. Never let provider behavior define runtime semantics.**

---

## Open questions — resolved (2026-07-09)

| # | Decision |
|---|----------|
| O1 | `tool_call` type reserved; schema frozen P2-D.1; provider mapping + orchestration deferred |
| O2 | SSE first transport; outside core contract |
| O3 | Static capability per adapter; runtime probe deferred |
| O4 | ADR-0012 |

---

## Implementation waves

```text
P2-D (ADR-0012)     ✅ Accepted
        │
        ├── P2-D.1  Runtime stream contract + lifecycle + stub path
        ├── P2-D.2  Stub streaming adapter
        ├── P2-D.3  OpenAI streaming
        ├── P2-D.4  Anthropic streaming
        ├── P2-D.5  Gemini streaming
        └── P2-D.6  Cancellation (C-CAN MUST)
```

---

## Next step

1. Governance commit + push ✅ (this wave)
2. `forge-isolate` → P2-D.1 blueprint on `org-memory-p2-c2-complete`
3. Implement — **not started**
