# Ontory Streaming P2-D.3 OpenAI Proof (A1/A2)

**Date:** 2026-07-09  
**Phase:** P2-D Streaming · Wave 3 — OpenAI Provider Streaming  
**Branch:** `forge/ontory-streaming-p2-d3-openai`  
**Baseline:** `org-memory-p2-d2-complete` @ `9b63290`  
**Tag:** `org-memory-p2-d3-complete`  
**ADR:** ADR-0012 Ontory Streaming Execution Lifecycle (Accepted + Amended) — **unchanged**  
**Codename:** `TASK-0028`

---

## Scope

**Objective:** Prove the OpenAI adapter can emit `AsyncIterable<AIExecutionEvent>` that satisfies ADR-0012 semantic locks without modifying the frozen contract.

**In scope:**
- OpenAI stream event mapper (pure chunk → actions / event factories)
- Client stream port (`stream: true` + `include_usage`)
- `OpenAIProviderAdapter.stream()` orchestration (sequence, lifecycle, cancellation)
- OpenAI P2-D conformance subject (13 inherited scenarios)
- Adapter unit tests (mocked stream — no live network required for gate)

**Out of scope:**
- ADR-0012 / `AIExecutionEvent` / lifecycle validator changes
- Modifications to `tests/conformance/scenarios/d-*.ts`
- Anthropic / Gemini streaming (P2-D.4 / P2-D.5)
- REST SSE transport adapter
- Tool call streaming
- Live vendor credential streaming as harness acceptance

---

## Architecture (boundary)

```text
CancellationSignal
        │
        v
AbortController (adapter-internal only)
        │
        v
request-mapper
        │
        v
OpenAI Client Port (stream: true)
        │
        v
raw OpenAI-like chunks
        │
        v
stream-event-mapper (interpretation)
        │
        v
OpenAIProviderAdapter (sequence · lifecycle · terminal)
        │
        v
AIExecutionEvent[]  (ADR-0012)
```

| Layer | Responsibility |
|-------|----------------|
| Client | HTTP/SSE transport — raw chunks only |
| Mapper | Chunk meaning — never owns sequence |
| Adapter | Runtime semantics — sequence, FSM, terminal |
| Contract | Frozen ADR-0012 authority |

---

## Validation Matrix

| Area | Evidence | Status |
|------|----------|--------|
| Delta `content` → `payload.text` | `stream-event-mapper` + unit tests | ✅ |
| Client stream port | `openai-client.ts` + `openai-client-stream.test.ts` | ✅ |
| Adapter sequence ownership | `openai-provider-adapter.ts` | ✅ |
| Lifecycle ordering | OpenAI D-LIFECYCLE subject | ✅ |
| Cancellation FSM | OpenAI D-CANCELLATION subject | ✅ |
| Sequence semantics | OpenAI D-SEQUENCE subject | ✅ |
| Error → `failed` | Provider stream unit test | ✅ |
| `complete()` regression | P2-C OpenAI subject | ✅ |
| Boundary (`openai` SDK isolation) | `npm run check:boundary` | ✅ |
| ADR-0012 unchanged | No diff on ADR / runtime contracts | ✅ |

---

## Implementation Tasks

| Task | Deliverable | Status |
|------|-------------|--------|
| 0 | forge-isolate @ `9b63290` | ✅ |
| 1 | Blueprint approved | ✅ |
| 2 | Stream event mapper + 16 tests | ✅ |
| 3 | Client stream port + 5 tests | ✅ |
| 4 | Adapter.stream orchestration + 6 tests | ✅ |
| 5 | OpenAI P2-D subject (13 scenarios) | ✅ |
| 6–8 | Evidence + closeout + tag | ✅ |

### Files added (Ontory)

- `src/adapters/openai/stream-event-mapper.ts`
- `tests/adapters/openai-stream-event-mapper.test.ts`
- `tests/adapters/openai-client-stream.test.ts`
- `tests/adapters/openai-client-mock.ts`
- `tests/adapters/openai-provider-stream.test.ts`
- `tests/conformance/openai-d-lifecycle.conformance.test.ts`

### Files modified (Ontory)

- `src/adapters/openai/openai-provider-adapter.ts` — `stream()` implementation + client port type
- `src/adapters/openai/openai-client.ts` — `stream: true` wiring
- `src/adapters/openai/index.ts` — exports
- Complete-path mocks updated for required `stream` port method

### Files NOT modified (contract lock)

- `.ai/core/architecture/ADR-0012-*.md`
- `src/runtime/contracts/ai-execution-event.ts`
- `src/runtime/contracts/cancellation-signal.ts`
- `src/runtime/contracts/execution-lifecycle.ts`
- `tests/runtime/lifecycle-validator.ts`
- `tests/conformance/scenarios/d-lifecycle.ts`
- `tests/conformance/scenarios/d-cancellation.ts`
- `tests/conformance/scenarios/d-sequence.ts`

---

## Test Evidence

| Suite | Tests | Result |
|-------|-------|--------|
| Stream event mapper | 16 | ✅ PASS |
| Client stream port | 5 | ✅ PASS |
| Provider stream orchestration | 6 | ✅ PASS |
| **P2-D OpenAI lifecycle subject** | **13** | ✅ **PASS** |
| P2-D Stub lifecycle (regression) | 13 | ✅ PASS |
| P2-C OpenAI | 8 (1 skipped) | ✅ PASS |
| P2-C Stub / Anthropic / Gemini | regression | ✅ PASS |
| **Full suite** | **191 passed · 4 skipped** | ✅ |

**Typecheck:** ✅ PASS  
**Boundary:** ✅ PASS  

### Conformance matrix (inherited)

| Scenario group | Count | OpenAI subject |
|----------------|-------|----------------|
| D-LIFECYCLE | 5 | ✅ |
| D-CANCELLATION | 4 | ✅ |
| D-SEQUENCE | 4 | ✅ |
| P2-C OpenAI (complete path) | 7 runnable + 1 skipped C-CAN | ✅ |

---

## ADR-0012 Unchanged Proof

- Semantic authority remains P2-D.2 locks (ordering, terminal, sequence, cancellation, consumer).
- Delta payload uses Ontory `text`, not OpenAI `content`.
- No new event types; no new lifecycle states; no consumer API changes.
- OpenAI entered the contract; the contract did not follow OpenAI.

---

## Decision

**P2-D.3 OpenAI Streaming:** ✅ **ACCEPTED** as compliance proof against frozen ADR-0012.

**Next:** P2-D.4 Anthropic Streaming from baseline `org-memory-p2-d3-complete`.
