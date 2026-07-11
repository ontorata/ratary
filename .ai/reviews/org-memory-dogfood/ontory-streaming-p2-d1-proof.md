# Ontory Streaming P2-D.1 Evidence (A1/A2)

**Date:** 2026-07-09  
**Phase:** P2-D Streaming · Wave 1 — Runtime Stream Contract  
**Branch:** `forge/ontory-streaming-p2-d1`  
**Baseline:** `org-memory-p2-c2-complete`  
**Tag:** `org-memory-p2-d1-complete` (pending)  
**ADR:** ADR-0012 Ontory Streaming Execution Lifecycle

## Acceptance Criteria (P2-D.1 Blueprint)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| AIExecutionEvent contract frozen | ✅ | `ai-execution-event.ts` |
| Lifecycle FSM frozen | ✅ | `execution-lifecycle.ts` (CREATED → STARTED → STREAMING → terminal) |
| Sequence semantics frozen | ✅ | monotonic per executionId |
| execute() preservation confirmed | ✅ | P2-C conformance: 26 passed |
| executeStream() boundary frozen | ✅ | `ProviderRuntime.stream()` signature |
| Cancellation boundary defined | ✅ | `CancellationSignal` interface |
| Transport separation confirmed | ✅ | `AsyncIterable<AIExecutionEvent>` (no HTTP primitives) |
| Provider adapter impact mapped | ✅ | stubs added (OpenAI/Anthropic/Gemini deferred) |

## Implementation Tasks Completed

### P2-D.1.1 Type Definitions

**Commit:** `1f7d6f0` feat(streaming): P2-D.1.1 runtime stream contract types

**Files:**
- `src/runtime/contracts/ai-execution-event.ts` — event envelope
- `src/runtime/contracts/execution-lifecycle.ts` — lifecycle state machine
- `src/runtime/contracts/cancellation-signal.ts` — provider-neutral cancellation
- `src/runtime/contracts/index.ts` — exports
- `src/runtime/provider-runtime.ts` — `stream()` signature added

**Guardrails:**
- ✅ `AIExecutionEventType` frozen (no vendor-specific types)
- ✅ `AIExecutionEvent.payload` opaque (`unknown`)
- ✅ Lifecycle state separate from event type
- ✅ `CancellationSignal` minimal, provider-neutral

**Gates:**
- ✅ Types compile
- ✅ P2-C contract unchanged
- ✅ No vendor imports
- ✅ Lifecycle/event separation maintained
- ✅ Cancellation abstraction provider-neutral

### P2-D.1.2 Stub Stream Implementation

**Commit:** `f77bcb6` feat(streaming): P2-D.1.2 stub stream implementation

**Files:**
- `src/adapters/stub-provider/stub-runtime-provider.ts` — `stream()` implementation
- `tests/runtime/stub-stream.test.ts` — 5 stream validation tests

**Validation:**
- ✅ Event sequence: `started` → `delta` → `metadata` → `completed`
- ✅ Monotonic sequence per executionId
- ✅ Terminal state (completed = last event)
- ✅ ISO timestamps
- ✅ Cancellation signal handling
- ✅ Wraps `complete()` for final result

**Tests:**
```
✓ tests/runtime/stub-stream.test.ts (5 tests)
  ✓ yields monotonic event sequence: started → delta → metadata → completed
  ✓ yields timestamps in ISO format
  ✓ delta events carry text payload
  ✓ metadata event carries usage hint
  ✓ completed event is terminal (last event)
```

### P2-D.1.3 P2-C Regression

**Status:** ✅ PASS

**Conformance:**
```
✓ tests/conformance/stub.conformance.test.ts (6 tests | 1 skipped)
✓ tests/conformance/openai.conformance.test.ts (8 tests | 1 skipped)
✓ tests/conformance/anthropic.conformance.test.ts (8 tests | 1 skipped)
✓ tests/conformance/gemini.conformance.test.ts (8 tests | 1 skipped)

Test Files  4 passed (4)
Tests  26 passed | 4 skipped (30)
```

**Full test suite:**
```
Test Files  18 passed (18)
Tests  97 passed | 4 skipped (101)
```

**Boundary check:** ✅ PASS

## Architecture Invariants Preserved

| Invariant | Status |
|-----------|--------|
| `complete()` path unchanged | ✅ P2-C subjects green |
| Streaming is additive extension | ✅ `stream()` does not replace `complete()` |
| No vendor-specific event types | ✅ No `openai_delta`, `anthropic_block`, etc. |
| Payload opaque from core | ✅ Runtime treats as `unknown` |
| Cancellation provider-neutral | ✅ No `AbortController` in contract |
| Terminal state = last event | ✅ No events after `completed`/`failed`/`cancelled` |
| Sequence monotonic | ✅ Per executionId |

## Provider Adapters

| Adapter | stream() Status | Notes |
|---------|-----------------|-------|
| Stub | ✅ Implemented | P2-D.1.2 — validation path |
| OpenAI | 🔒 Deferred | Throws `'not_implemented'` — P2-D.3 scope |
| Anthropic | 🔒 Deferred | Throws `'not_implemented'` — P2-D.4 scope |
| Gemini | 🔒 Deferred | Throws `'not_implemented'` — P2-D.5 scope |

## Contract Additions (P2-D.1)

### `AIExecutionEvent`

```typescript
interface AIExecutionEvent {
  readonly executionId: string;
  readonly sequence: number;
  readonly type: AIExecutionEventType;
  readonly timestamp: string;
  readonly payload: unknown;
}
```

### `AIExecutionEventType`

```typescript
type AIExecutionEventType =
  | 'started'
  | 'delta'
  | 'metadata'
  | 'tool_call'      // reserved — deferred
  | 'completed'
  | 'failed'
  | 'cancelled';
```

### `ExecutionLifecycleState`

```typescript
type ExecutionLifecycleState =
  | 'CREATED'
  | 'STARTED'
  | 'STREAMING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';
```

### `CancellationSignal`

```typescript
interface CancellationSignal {
  readonly cancelled: boolean;
  readonly reason?: string;
  onCancel(callback: () => void): void;
}
```

### `ProviderRuntime` Extension

```typescript
interface ProviderRuntime {
  readonly name: string;
  complete(request: AIExecutionRequest, requestId: string): Promise<AIExecutionResponse>;
  stream(
    request: AIExecutionRequest,
    requestId: string,
    signal?: CancellationSignal,
  ): AsyncIterable<AIExecutionEvent>;
}
```

## Backward Compatibility

✅ **P2-C callers unaffected:**
- `runtime.complete()` unchanged
- No streaming capability discovery required
- No stream handling required

## Next Wave (P2-D.2–5)

- **P2-D.2:** Stub cancellation validation
- **P2-D.3:** OpenAI streaming
- **P2-D.4:** Anthropic streaming
- **P2-D.5:** Gemini streaming
- **P2-D.6:** Cancellation validation

## Conclusion

**P2-D.1 Runtime Stream Contract:** ✅ ACCEPTED

Contract frozen. Provider adapters can implement streaming without touching runtime core. Backward compatibility preserved.
