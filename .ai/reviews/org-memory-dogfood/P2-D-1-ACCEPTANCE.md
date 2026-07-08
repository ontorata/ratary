# P2-D.1 Runtime Stream Contract — Acceptance Record

**Date:** 2026-07-09  
**Phase:** P2-D Streaming Wave 1  
**Branch:** `forge/ontory-streaming-p2-d1`  
**Tag:** `org-memory-p2-d1-complete`  
**ADR:** ADR-0012 Ontory Streaming Execution Lifecycle

## Acceptance Criteria

| Criterion | Result |
|-----------|--------|
| AIExecutionEvent contract frozen | ✅ PASS |
| Lifecycle FSM frozen | ✅ PASS |
| Sequence semantics frozen | ✅ PASS |
| execute() preservation confirmed | ✅ PASS — P2-C: 26 conformance tests green |
| executeStream() boundary frozen | ✅ PASS |
| Cancellation boundary defined | ✅ PASS |
| Transport separation confirmed | ✅ PASS |
| Provider adapter impact mapped | ✅ PASS |

## Implementation Evidence

- **A1/A2 Evidence:** `.ai/reviews/org-memory-dogfood/ontory-streaming-p2-d1-proof.md`
- **Commits:**
  - `1f7d6f0` P2-D.1.1 Type Definitions
  - `f77bcb6` P2-D.1.2 Stub Stream Implementation
- **Tests:** 97 passed | 4 skipped (101)
- **Conformance:** 26 passed | 4 skipped (30) — P2-C regression ✅
- **Boundary check:** ✅ PASS
- **Typecheck:** ✅ PASS

## Contract Additions

### New Types

- `AIExecutionEvent` — provider-neutral stream event envelope
- `AIExecutionEventType` — frozen event types (no vendor leakage)
- `ExecutionLifecycleState` — separate from event types
- `CancellationSignal` — provider-neutral cancellation abstraction

### Interface Extension

- `ProviderRuntime.stream()` — dual path with `complete()`

### Error Code

- `'not_implemented'` — for deferred provider streaming (P2-D.3–5)

## Backward Compatibility

✅ **P2-C callers unaffected:**
- `runtime.complete()` unchanged
- No streaming capability discovery required
- Existing consumers work without modification

## Provider Adapter Status

| Provider | Status |
|----------|--------|
| Stub | ✅ Stream implemented (P2-D.1.2) |
| OpenAI | 🔒 Deferred (P2-D.3) |
| Anthropic | 🔒 Deferred (P2-D.4) |
| Gemini | 🔒 Deferred (P2-D.5) |

## Guardrails Enforced

✅ No vendor-specific event types  
✅ Payload opaque from core (`unknown`)  
✅ Lifecycle state separate from event type  
✅ Cancellation abstraction provider-neutral  
✅ Sequence monotonic per executionId  
✅ Terminal state = last event (no further events)

## Decision

**P2-D.1 Runtime Stream Contract:** ✅ **ACCEPTED**

Contract frozen. Provider streaming waves (P2-D.2–6) can proceed without runtime core changes.

---

**Acceptance authority:** Ontorata governance (AI-Brain)  
**Evidence package:** Complete  
**Next wave:** P2-D.2 (Stub cancellation validation)
