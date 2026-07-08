# Blueprint: P2-D.1 Runtime Stream Contract

| Field | Value |
|-------|-------|
| **Status** | Approved — owner approval 2026-07-09 |
| **Intent** | [ontory-streaming-p2-d-intent.md](./ontory-streaming-p2-d-intent.md) Accepted |
| **ADR** | ADR-0012 Accepted |
| **Repo** | `ontory` (runtime layer only — no adapter implementation this wave) |
| **Baseline** | `org-memory-p2-c2-complete` @ `7241319` |
| **Branch (proposed)** | `forge/ontory-streaming-p2-d1` |

---

## Scope boundary (non-negotiable)

P2-D.1 is **runtime contract layer only**:

✅ In scope:
- `AIExecutionEvent` type definitions
- Lifecycle state machine
- Cancellation boundary contract
- Transport abstraction boundary
- Stub stream path (contract validation only — minimal implementation)

❌ Out of scope:
- OpenAI / Anthropic / Gemini streaming implementation (P2-D.3–D.5)
- SSE transport adapter implementation (REST layer — separate from contract)
- Tool execution orchestration
- Capability runtime probe

---

## Core abstraction — execution surface

### 1. Dual execution paths (extension, not replacement)

```ts
interface ProviderRuntime {
  readonly name: string;
  
  // P2-C path — frozen, unchanged
  complete(request: AIExecutionRequest, requestId: string): Promise<AIExecutionResponse>;
  
  // P2-D extension — new surface
  stream(
    request: AIExecutionRequest,
    requestId: string,
    signal?: CancellationSignal
  ): AsyncIterable<AIExecutionEvent>;
}
```

**Invariant:** `complete()` remains valid; P2-C conformance subjects MUST pass without streaming dependency.

**Backward compatibility:** Existing P2-C callers MUST NOT require streaming capability discovery or stream handling. Consumer code using `runtime.complete(request)` remains valid without `if (supportsStreaming)` branching.

### 2. Backward compatibility gate

| Provider | complete() | stream() |
|----------|-----------|----------|
| stub | ✅ P2-C baseline | ✅ P2-D.1 minimal |
| openai | ✅ P2-C frozen | ⏭ P2-D.3 |
| anthropic | ✅ P2-C frozen | ⏭ P2-D.4 |
| gemini | ✅ P2-C frozen | ⏭ P2-D.5 |

P2-D.1 acceptance: stub `stream()` yields valid events; other adapters remain complete-only.

---

## Stream contract — `AIExecutionEvent`

### Event envelope (frozen in ADR-0012)

```ts
interface AIExecutionEvent {
  readonly executionId: string;
  readonly sequence: number;
  readonly type: AIExecutionEventType;
  readonly timestamp: string; // ISO-8601
  readonly payload: AIExecutionEventPayload;
}

type AIExecutionEventType =
  | 'started'
  | 'delta'
  | 'metadata'
  | 'tool_call'      // reserved — schema in P2-D.1, implementation deferred
  | 'completed'
  | 'failed'
  | 'cancelled';

type AIExecutionEventPayload =
  | { text: string }                    // delta
  | { usage?: UsageMetadata }           // metadata (vendor-neutral)
  | { tool: ToolCallDescriptor }        // tool_call (schema TBD)
  | { result: AIExecutionResponse }     // completed (P2-C envelope)
  | { error: ProviderError }            // failed
  | Record<string, never>;              // started / cancelled (empty payload)
```

**Rule:** No vendor-specific fields in shared types (`content_block_delta`, `candidates`, OpenAI chunk keys forbidden).

### Sequence semantics

```text
sequence is monotonic per executionId

Valid:
  1 started
  2 metadata
  3 delta
  4 delta
  5 completed

Invalid:
  1 started
  3 delta
  2 delta  ← out of order
```

Runtime or conformance harness MAY reject non-monotonic sequences.

---

## Lifecycle state machine (frozen in ADR-0012)

```text
CREATED
   │
   ▼
STARTED  ──► event: { type: 'started' }
   │
   ▼
STREAMING ──► event: { type: 'delta' | 'metadata' | 'tool_call' }
   │
   ▼
COMPLETED ──► event: { type: 'completed', payload: { result } }
```

**Terminal states** (no further events allowed):

```text
FAILED     ──► event: { type: 'failed', payload: { error } }
CANCELLED  ──► event: { type: 'cancelled' }
COMPLETED  ──► (already shown above)
```

**Constraint:** `completed`, `failed`, `cancelled` are terminal. Any event after terminal state is a contract violation.

Example violations:

```text
completed → delta         ✗
failed → metadata         ✗
cancelled → completed     ✗
```

---

## Cancellation boundary (definition only — no vendor implementation)

### Contract

Runtime owns cancellation intent:

```ts
interface CancellationSignal {
  readonly cancelled: boolean;
  onCancel(callback: () => void): void;
}
```

(or equivalent `AbortSignal`-like abstraction)

### Boundary

```text
User / client cancel
        │
        ▼
Runtime CancellationSignal  (passed to adapter via stream() signature)
        │
        ▼
Adapter maps → vendor abort (internal only — not P2-D.1 scope)
        │
        ▼
AIExecutionEvent { type: 'cancelled' }
```

**P2-D.1 scope:** type definition + signature only. Vendor abort mapping deferred to P2-D.3–D.5.

**P2-D.6 scope:** C-CAN conformance validation (DEFER → MUST).

---

## Transport separation (core output abstraction)

### Core produces semantic events only

```ts
AsyncIterable<AIExecutionEvent>
```

### Transport is encoding layer (outside core)

```text
Core Runtime
      │
      ▼
AsyncIterable<AIExecutionEvent>
      │
      ▼
Transport Adapter         ← REST layer, not core contract
      │
      ├── SSE (first)
      ├── WebSocket (future)
      └── Queue/EventBus (future)
```

**Forbidden in `src/runtime/`:**

- `Response.write()`
- `text/event-stream` MIME type
- HTTP chunk primitives
- SSE `data:` framing
- `flush()` / `end()` response methods

Core contract is transport-agnostic.

---

## Provider adapter impact (P2-D.1)

### Stub adapter — minimal stream path

P2-D.1 adds stub `stream()` implementation:

```ts
async *stream(request, requestId, signal?) {
  yield { executionId: requestId, sequence: 1, type: 'started', ... };
  yield { executionId: requestId, sequence: 2, type: 'delta', payload: { text: 'stub ' } };
  yield { executionId: requestId, sequence: 3, type: 'delta', payload: { text: 'stream' } };
  const result = await this.complete(request, requestId);  // reuse P2-C path
  yield { executionId: requestId, sequence: 4, type: 'completed', payload: { result } };
}
```

Validates:
- Event envelope shape
- Lifecycle transitions
- Monotonic sequence
- Terminal state

### OpenAI / Anthropic / Gemini adapters

**P2-D.1:** `stream()` method signature added; throws `ProviderError('not_implemented')` or returns single `completed` event wrapping `complete()`.

**P2-D.3–D.5:** Vendor streaming implementation (out of P2-D.1 scope).

---

## Execution tasks

- [ ] Task 0 — forge-isolate from `org-memory-p2-c2-complete`
- [ ] Task 1 — Type definitions (`AIExecutionEvent`, lifecycle enums, `CancellationSignal`)
- [ ] Task 2 — Extend `ProviderRuntime` interface with `stream()` signature
- [ ] Task 3 — Stub stream implementation (minimal — validation path only)
- [ ] Task 4 — Unit tests (event envelope, sequence validation, lifecycle FSM)
- [ ] Task 5 — OpenAI/Anthropic/Gemini adapters: add `stream()` stub (throws or wraps `complete()`)
- [ ] Task 6 — P2-C regression: `npm run test:conformance` — all existing subjects PASS
- [ ] Task 7 — Typecheck + boundary CI
- [ ] Task 8 — Evidence: stream contract A1 (no A2 yet — transport deferred)
- [ ] Task 9 — Closeout tag `org-memory-p2-d1-complete`

---

## Acceptance criteria (P2-D.1 Blueprint)

| Criterion | Status |
|-----------|--------|
| `AIExecutionEvent` contract frozen | ✅ ADR-0012 |
| Lifecycle FSM frozen | ✅ ADR-0012 |
| Sequence semantics frozen | ✅ ADR-0012 |
| `execute()` preservation confirmed | ✅ dual path in contract |
| `executeStream()` boundary frozen | ✅ signature defined |
| Cancellation boundary defined | ✅ `CancellationSignal` type + flow |
| Transport separation confirmed | ✅ `AsyncIterable` only in core |
| Provider adapter impact mapped | ✅ stub stream + vendor stubs |
| Backward compatibility invariant | ✅ P2-C callers require no stream awareness |
| Implementation tasks sequenced | ✅ above |

**Coding gate:** Opens after blueprint approval + forge-isolate.

---

## Explicit non-goals (P2-D.1)

- OpenAI/Anthropic/Gemini vendor streaming implementation
- SSE transport adapter (REST encoding layer)
- Tool execution orchestration
- Capability runtime probe
- Streaming conformance catalog (P2-D.2 scope)
- C-CAN validation (P2-D.6)

---

## Validation gates

```bash
cd D:\Apps\ontory
npm test                   # P2-C subjects + new stream contract tests
npm run test:conformance   # P2-C regression — all MUST PASS
npm run typecheck
npm run check:boundary
```

P2-D.1 success: stub `stream()` yields valid events; OpenAI/Anthropic/Gemini remain complete-only; P2-C gate green.

---

## Next after approval

1. Owner approves this blueprint
2. `forge-isolate` → `forge/ontory-streaming-p2-d1` from `org-memory-p2-c2-complete`
3. Execute tasks 0–9
4. Tag `org-memory-p2-d1-complete`
5. P2-D.2 blueprint: streaming conformance catalog + stub stream subject
