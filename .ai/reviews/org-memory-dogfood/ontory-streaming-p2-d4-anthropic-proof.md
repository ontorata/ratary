# Ontory Streaming P2-D.4 Anthropic Proof (A1/A2)

**Date:** 2026-07-09  
**Phase:** P2-D Streaming · Wave 4 — Anthropic Provider Streaming  
**Branch:** `forge/ontory-streaming-p2-d4-anthropic`  
**Baseline:** `org-memory-p2-d3-complete` @ `1202c5c`  
**Tag:** `org-memory-p2-d4-complete`  
**ADR:** ADR-0012 Ontory Streaming Execution Lifecycle (Accepted + Amended) — **unchanged**  
**Codename:** `TASK-0029`

---

## Scope

**Objective:** Prove the Anthropic adapter can emit `AsyncIterable<AIExecutionEvent>` that satisfies ADR-0012 semantic locks without modifying the frozen contract.

**In scope:**
- Anthropic stream event mapper (pure SSE-like event → actions / event factories)
- Client stream port (`messages.stream` + AbortSignal → MessageStream.abort)
- `AnthropicProviderAdapter.stream()` orchestration (sequence, lifecycle, cancellation)
- Anthropic P2-D conformance subject (13 inherited scenarios)
- Adapter unit tests (mocked stream — no live network required for gate)

**Out of scope:**
- ADR-0012 / `AIExecutionEvent` / lifecycle validator changes
- Modifications to `tests/conformance/scenarios/d-*.ts`
- Gemini streaming (P2-D.5)
- Tool / thinking stream mapping
- REST SSE transport adapter
- Live vendor credential streaming as harness acceptance

---

## A1 — Contract Evidence

| Claim | Evidence |
|-------|----------|
| Provider follows contract | Anthropic maps to frozen `AIExecutionEvent` only |
| Contract unchanged | No diff on ADR-0012 / `src/runtime/contracts/*` / `d-*.ts` |
| Lifecycle transitions | started → delta* → metadata? → terminal |
| No Anthropic field leakage | `text_delta` → Ontory `payload.text` only |
| Subject-only proof | `anthropic-d-lifecycle.conformance.test.ts` inherits frozen scenarios |

---

## A2 — Runtime Evidence

| Claim | Evidence |
|-------|----------|
| Delta ordering | Unit + D-LIFECYCLE subject |
| Completion behavior | `message_stop` → mapper `finish` → adapter `completed` |
| Cancellation propagation | CancellationSignal → AbortController → client stream |
| Usage metadata path | late `metadata` before terminal and/or `completed.usage` |
| Empty stream | started → completed |
| Error path | ProviderError → `failed` event |

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
Anthropic Client Port (messages.stream)
        │
        v
raw Anthropic-like events
        │
        v
stream-event-mapper (interpretation)
        │
        v
AnthropicProviderAdapter (sequence · lifecycle · terminal)
        │
        v
AIExecutionEvent[]  (ADR-0012)
```

| Layer | Responsibility |
|-------|----------------|
| Client | Transport — raw events only |
| Mapper | Chunk/event meaning — never owns sequence |
| Adapter | Runtime semantics — sequence, FSM, terminal |
| Contract | Frozen ADR-0012 authority |

---

## Validation Matrix

| Area | Evidence | Status |
|------|----------|--------|
| `text_delta` → `payload.text` | stream-event-mapper + unit tests | ✅ |
| Client stream port | anthropic-client.ts + client-stream tests | ✅ |
| Adapter sequence ownership | anthropic-provider-adapter.ts | ✅ |
| Lifecycle ordering | Anthropic D-LIFECYCLE subject | ✅ |
| Cancellation FSM | Anthropic D-CANCELLATION subject | ✅ |
| Sequence semantics | Anthropic D-SEQUENCE subject | ✅ |
| Error → `failed` | Provider stream unit test | ✅ |
| `complete()` regression | P2-C Anthropic subject | ✅ |
| OpenAI streaming regression | openai-d-lifecycle subject | ✅ |
| Boundary (`@anthropic-ai/sdk` isolation) | `npm run check:boundary` | ✅ |
| ADR-0012 unchanged | No contract file changes | ✅ |

---

## Implementation Tasks

| Task | Deliverable | Status |
|------|-------------|--------|
| 0 | forge-isolate @ `1202c5c` | ✅ |
| 1 | Blueprint approved | ✅ |
| 2 | Stream event mapper + 16 tests | ✅ |
| 3 | Client stream port + 5 tests | ✅ |
| 4 | Adapter.stream orchestration + 7 tests | ✅ |
| 5 | Anthropic P2-D subject (13 scenarios) | ✅ |
| 6–8 | Evidence + closeout + tag | ✅ |

### Files added (Ontory)

- `src/adapters/anthropic/stream-event-mapper.ts`
- `tests/adapters/anthropic-stream-event-mapper.test.ts`
- `tests/adapters/anthropic-client-stream.test.ts`
- `tests/adapters/anthropic-client-mock.ts`
- `tests/adapters/anthropic-provider-stream.test.ts`
- `tests/conformance/anthropic-d-lifecycle.conformance.test.ts`

### Files modified (Ontory)

- `src/adapters/anthropic/anthropic-provider-adapter.ts` — `stream()` + client port type
- `src/adapters/anthropic/anthropic-client.ts` — `messages.stream` wiring
- `src/adapters/anthropic/index.ts` — exports
- Complete-path mocks updated for required `stream` port method

### Files NOT modified (contract lock)

- ADR-0012
- `src/runtime/contracts/*`
- `tests/runtime/lifecycle-validator.ts`
- `tests/conformance/scenarios/d-*.ts`
- OpenAI streaming implementation (regression only)

---

## Test Evidence

| Suite | Tests | Result |
|-------|-------|--------|
| Stream event mapper | 16 | ✅ PASS |
| Client stream port | 5 | ✅ PASS |
| Provider stream orchestration | 7 | ✅ PASS |
| **P2-D Anthropic lifecycle subject** | **13** | ✅ **PASS** |
| P2-D OpenAI lifecycle (regression) | 13 | ✅ PASS |
| P2-D Stub lifecycle (regression) | 13 | ✅ PASS |
| P2-C subjects (regression) | green | ✅ PASS |
| **Full suite** | **232 passed · 4 skipped** | ✅ |

**Typecheck:** ✅ PASS  
**Boundary:** ✅ PASS  

### Conformance matrix (inherited)

| Scenario group | Count | Anthropic subject |
|----------------|-------|-------------------|
| D-LIFECYCLE | 5 | ✅ |
| D-CANCELLATION | 4 | ✅ |
| D-SEQUENCE | 4 | ✅ |
| P2-C Anthropic (complete path) | 7 runnable + 1 skipped C-CAN | ✅ |

---

## Unified Streaming Boundary

```text
P2-D.1 Runtime Stream Contract
        │
P2-D.2 Lifecycle Conformance (semantic locks)
        │
P2-D.3 OpenAI Streaming Proof
        │
P2-D.4 Anthropic Streaming Proof  ← this release
        │
        v
Unified provider streaming boundary (ADR-0012)
```

---

## Decision

**P2-D.4 Anthropic Streaming:** ✅ **ACCEPTED** as compliance proof against frozen ADR-0012.

**Next:** P2-D.5 Gemini Streaming from baseline `org-memory-p2-d4-complete`.
