# Ontory Streaming P2-D.5 Gemini Proof (A1/A2)

**Date:** 2026-07-09  
**Phase:** P2-D Streaming · Wave 5 — Gemini Provider Streaming  
**Branch:** `forge/ontory-streaming-p2-d5-gemini`  
**Baseline:** `org-memory-p2-d4-complete` @ `8ded5d4`  
**Tag:** `org-memory-p2-d5-complete`  
**ADR:** ADR-0012 Ontory Streaming Execution Lifecycle (Accepted + Amended) — **unchanged**  
**Codename:** `TASK-0030`

---

## Scope

**Objective:** Prove the Gemini adapter can emit `AsyncIterable<AIExecutionEvent>` that satisfies ADR-0012 semantic locks without modifying the frozen contract.

**In scope:**
- Gemini stream event mapper (pure chunk → actions / event factories)
- Client stream port (`generateContentStream` + AbortSignal)
- `GeminiProviderAdapter.stream()` orchestration (sequence, lifecycle, cancellation)
- Gemini P2-D conformance subject (13 inherited scenarios)
- Adapter unit tests (mocked stream — no live network required for gate)

**Out of scope:**
- ADR-0012 / `AIExecutionEvent` / lifecycle validator changes
- Modifications to `tests/conformance/scenarios/d-*.ts`
- Tool / function-call stream mapping
- REST SSE transport adapter
- Live vendor credential streaming as harness acceptance

---

## A1 — Contract Evidence

| Claim | Evidence |
|-------|----------|
| Provider follows contract | Gemini maps to frozen `AIExecutionEvent` only |
| Contract unchanged | No diff on ADR-0012 / `src/runtime/contracts/*` / `d-*.ts` |
| Lifecycle transitions | started → delta* → metadata? → terminal |
| No Gemini field leakage | candidate text → Ontory `payload.text` only |
| Subject-only proof | `gemini-d-lifecycle.conformance.test.ts` inherits frozen scenarios |

---

## A2 — Runtime Evidence

| Claim | Evidence |
|-------|----------|
| Delta ordering | Unit + D-LIFECYCLE subject |
| Completion behavior | `finishReason` → mapper `finish` → adapter `completed` |
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
Gemini Client Port (generateContentStream)
        │
        v
raw Gemini-like chunks
        │
        v
stream-event-mapper (interpretation)
        │
        v
GeminiProviderAdapter (sequence · lifecycle · terminal)
        │
        v
AIExecutionEvent[]  (ADR-0012)
```

| Layer | Responsibility |
|-------|----------------|
| Client | Transport — raw chunks only |
| Mapper | Chunk meaning — never owns sequence |
| Adapter | Runtime semantics — sequence, FSM, terminal |
| Contract | Frozen ADR-0012 authority |

---

## Validation Matrix

| Area | Evidence | Status |
|------|----------|--------|
| candidate text → `payload.text` | stream-event-mapper + unit tests | ✅ |
| Client stream port | gemini-client.ts + client-stream tests | ✅ |
| Adapter sequence ownership | gemini-provider-adapter.ts | ✅ |
| Lifecycle ordering | Gemini D-LIFECYCLE subject | ✅ |
| Cancellation FSM | Gemini D-CANCELLATION subject | ✅ |
| Sequence semantics | Gemini D-SEQUENCE subject | ✅ |
| Error → `failed` | Provider stream unit test | ✅ |
| `complete()` regression | P2-C Gemini subject | ✅ |
| OpenAI streaming regression | openai-d-lifecycle subject | ✅ |
| Anthropic streaming regression | anthropic-d-lifecycle subject | ✅ |
| Boundary (`@google/generative-ai` isolation) | `npm run check:boundary` | ✅ |
| ADR-0012 unchanged | No contract file changes | ✅ |

---

## Implementation Tasks

| Task | Deliverable | Status |
|------|-------------|--------|
| 0 | forge-isolate @ `8ded5d4` | ✅ |
| 1 | Blueprint approved | ✅ |
| 2 | Stream event mapper + 15 tests | ✅ |
| 3 | Client stream port + 5 tests | ✅ |
| 4 | Adapter.stream orchestration + 6 tests | ✅ |
| 5 | Gemini P2-D subject (13 scenarios) | ✅ |
| 6–8 | Evidence + closeout + tag | ✅ |

### Files added (Ontory)

- `src/adapters/gemini/stream-event-mapper.ts`
- `tests/adapters/gemini-stream-event-mapper.test.ts`
- `tests/adapters/gemini-client-stream.test.ts`
- `tests/adapters/gemini-client-mock.ts`
- `tests/adapters/gemini-provider-stream.test.ts`
- `tests/conformance/gemini-d-lifecycle.conformance.test.ts`

### Files modified (Ontory)

- `src/adapters/gemini/gemini-provider-adapter.ts` — `stream()` + client port type
- `src/adapters/gemini/gemini-client.ts` — `generateContentStream` wiring
- `src/adapters/gemini/index.ts` — exports
- Complete-path mocks updated for required `stream` port method

### Files NOT modified (contract lock)

- ADR-0012
- `src/runtime/contracts/*`
- `tests/runtime/lifecycle-validator.ts`
- `tests/conformance/scenarios/d-*.ts`
- OpenAI / Anthropic streaming implementation (regression only)

---

## Test Evidence

| Suite | Tests | Result |
|-------|-------|--------|
| Stream event mapper | 15 | ✅ PASS |
| Client stream port | 5 | ✅ PASS |
| Provider stream orchestration | 6 | ✅ PASS |
| **P2-D Gemini lifecycle subject** | **13** | ✅ **PASS** |
| P2-D OpenAI lifecycle (regression) | 13 | ✅ PASS |
| P2-D Anthropic lifecycle (regression) | 13 | ✅ PASS |
| P2-D Stub lifecycle (regression) | 13 | ✅ PASS |
| P2-C subjects (regression) | green | ✅ PASS |
| **Full suite** | **271 passed · 4 skipped** | ✅ |

**Typecheck:** ✅ PASS  
**Boundary:** ✅ PASS  

### Conformance matrix (inherited)

| Scenario group | Count | Gemini subject |
|----------------|-------|----------------|
| D-LIFECYCLE | 5 | ✅ |
| D-CANCELLATION | 4 | ✅ |
| D-SEQUENCE | 4 | ✅ |
| P2-C Gemini (complete path) | 7 runnable + 1 skipped C-CAN | ✅ |

---

## Unified Streaming Boundary

```text
P2-D.1 Runtime Stream Contract
        │
P2-D.2 Lifecycle Conformance (semantic locks)
        │
P2-D.3 OpenAI Streaming Proof
        │
P2-D.4 Anthropic Streaming Proof
        │
P2-D.5 Gemini Streaming Proof  ← this release
        │
        v
Unified provider streaming boundary (ADR-0012)
```

Provider compatibility after P2-D.5:

```text
                Ontory Contract

OpenAI  --------|
                |
Anthropic ------|----> AIExecutionEvent Stream
                |
Gemini  --------|
```

---

## Decision

**P2-D.5 Gemini Streaming:** ✅ **ACCEPTED** as compliance proof against frozen ADR-0012.

**Next:** P2-D series streaming provider matrix complete for OpenAI · Anthropic · Gemini.
