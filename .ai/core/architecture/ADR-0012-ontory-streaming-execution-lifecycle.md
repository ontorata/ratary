# ADR-0012 — Ontory Streaming & Execution Lifecycle (P2-D)

| Field | Value |
|-------|-------|
| **Status** | **Accepted** |
| **Accepted** | 2026-07-09 |
| **Date** | 2026-07-09 |
| **Baseline** | `org-memory-p2-c2-complete` (Ontory `7241319` · ai-brain `8fbecae`) |
| **Related** | ADR-0007 · ADR-0008 · ADR-0009 · ADR-0010 · ADR-0011 · FROZEN-BOUNDARY-BYPASS-POLICY |
| **Deciders** | Engineering · Product (owner) |
| **Host repo** | `ontory` (runtime contracts + adapters) |
| **Studio impact** | Contract consumption only — no vendor branching |
| **Supersedes** | Deferred streaming notes in ADR-0008; promotes C-CAN from ADR-0009 DEFER |

---

## Context

P2-A locked the runtime kernel. P2-B/C locked **non-streaming** `ProviderRuntime.complete()` with three vendor adapters behind ADR-0009 conformance.

ADR-0008 and ADR-0009 explicitly deferred:

- Streaming
- Cooperative cancellation (C-CAN)
- Capability metadata negotiation

P2-C is **closed**. Three providers proved contract compatibility without vendor-specific envelope fields.

Streaming is not a transport tweak. It changes execution semantics:

```text
Today (P2-C):     Request → Provider → AIExecutionResponse

P2-D target:      Request → Provider → AIExecutionEvent* → AIExecutionResponse (terminal)
```

If streaming is treated as transport-only (raw vendor chunks), adapters become SDK wrappers and contract drift returns.

---

## Decision

### 1. Streaming is a runtime semantic (not transport-only)

Ontory defines a **provider-neutral event stream**. Adapters map vendor-native stream frames into frozen runtime events.

**Rejected alternative:** expose OpenAI SSE / Anthropic event objects / Gemini candidate structures directly.

### 2. Preserve `complete()` — extend, do not replace

**Invariant:** Streaming extension **MUST NOT** modify non-stream execution semantics.

| Surface | Role |
|---------|------|
| `complete(request)` | Frozen P2-C path — remains valid and conformance-gated |
| `stream(request)` (or `executeStream`) | P2-D extension — parallel surface, not a replacement |

Existing conformance subjects for stub · openai · anthropic · gemini MUST remain PASS without modification to scenario matrix semantics.

### 3. Execution lifecycle state machine

Each execution has explicit lifecycle states:

```text
CREATED
   │
   ▼
STARTED
   │
   ▼
STREAMING
   │
   ▼
COMPLETED
```

**Terminal states** (no further transitions allowed):

- `FAILED`
- `CANCELLED`
- `COMPLETED`

**Constraint:** `COMPLETED`, `FAILED`, and `CANCELLED` are terminal — no event may follow a terminal state. Invalid sequences such as `completed → delta → completed` are contract violations.

Lifecycle state is runtime-owned; adapters emit events that drive state transitions.

### 4. Event envelope — `AIExecutionEvent` (frozen)

Provider-neutral stream unit:

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
  | 'tool_call'
  | 'completed'
  | 'failed'
  | 'cancelled';
```

**Payload rules:**

- `delta` → `{ text: string }` (incremental assistant text)
- `metadata` → vendor-neutral usage/progress hints only (no vendor field names)
- `tool_call` → provider-neutral tool invocation descriptor — **type and schema frozen in P2-D.1; provider mapping and orchestration deferred**
- `completed` → terminal `AIExecutionResponse` envelope (same fields as P2-C)
- `failed` → `ProviderError` code + message (no raw vendor error objects)
- `cancelled` → cooperative cancel acknowledgement

**Envelope rule (inherited from P2-C):** shared runtime types MUST NOT carry vendor-specific fields.

### 5. Sequence guarantee

`sequence` is **monotonic per `executionId`**.

Valid:

```text
1 started
2 metadata
3 delta
4 delta
5 completed
```

Invalid:

```text
1 started
3 delta
2 delta
```

Runtime or conformance harness MAY reject out-of-order sequences.

### 6. Core output abstraction

Runtime core produces semantic events only:

```ts
AsyncIterable<AIExecutionEvent>
```

(or equivalent abstraction). Core MUST NOT know transport primitives (`Response.write()`, `text/event-stream`, chunk framing, flush).

### 7. Transport boundary — SSE first

Transport is a separate adapter layer below semantic events:

```text
AIExecutionEvent
        │
        ▼
Transport Adapter
        │
        ├── SSE          (first — P2-D REST)
        ├── WebSocket    (future)
        └── Queue/EventBus (future)
```

SSE is approved as the **first** REST transport encoding. SSE MUST NOT enter the core contract or `src/runtime/` types.

### 8. Cancellation boundary

```text
User / client cancel
        │
        ▼
Runtime CancellationSignal
        │
        ▼
Provider adapter maps → vendor abort (internal only)
        │
        ▼
AIExecutionEvent { type: 'cancelled' }  and/or  ProviderError(cancelled)
```

**MUST NOT** appear in `src/runtime/` or Dispatcher: vendor abort controller types or vendor-specific cancel APIs.

C-CAN scenario status: **DEFER → MUST** when P2-D.6 lands.

### 9. Capability metadata — static per adapter

Capability is described by **features**, not vendor registry strings:

```ts
interface ExecutionCapability {
  readonly streaming: boolean;
  readonly tools: boolean;
  readonly vision: boolean;
  readonly structuredOutput: boolean;
}
```

Each adapter reports static `ExecutionCapability` (e.g. `{ streaming: true, tools: true, vision: false, structuredOutput: true }`).

**Runtime probe deferred** — probe introduces credential dependency, network dependency, provider availability, and nondeterministic startup unsuitable for kernel contract.

### 10. `tool_call` — contract reserved, implementation deferred

| P2-D.1 acceptance | Status |
|-------------------|--------|
| `tool_call` type reserved in `AIExecutionEventType` | ✅ |
| Payload schema frozen | ✅ |
| Provider tool mapping | ❌ deferred |
| Tool execution orchestration | ❌ deferred — separate phase |

P2-D is lifecycle/streaming, not tool execution.

### 11. Adapter mapping responsibility

Each vendor adapter:

1. Accepts `AIExecutionRequest` + `CancellationSignal` + resolved config
2. Opens vendor-native stream internally
3. Yields monotonic `AIExecutionEvent` sequence
4. Ends with `completed`, `failed`, or `cancelled` (terminal)

| Vendor native | Ontory event |
|---------------|--------------|
| OpenAI chunk delta | `{ type: 'delta', payload: { text } }` |
| Anthropic `content_block_delta` | `{ type: 'delta', payload: { text } }` |
| Gemini candidate text | `{ type: 'delta', payload: { text } }` |

---

## Implementation waves (post-acceptance only)

| Wave | Scope |
|------|-------|
| **P2-D** | This ADR — contract freeze ✅ |
| **P2-D.1** | Runtime stream contract + lifecycle + stub stream path |
| **P2-D.2** | Stub streaming adapter + stream conformance subject |
| **P2-D.3** | OpenAI streaming adapter |
| **P2-D.4** | Anthropic streaming adapter |
| **P2-D.5** | Gemini streaming adapter |
| **P2-D.6** | Cancellation validation — C-CAN MUST |

No adapter streaming work before ADR-0012 Accepted. **Coding gate opens at P2-D.1 blueprint after governance commit on remote.**

---

## Definition of Done — ADR acceptance (P2-D gate)

- [x] ADR-0012 Accepted by owner
- [x] Stream semantics frozen (runtime semantic B)
- [x] `AIExecutionEvent` envelope frozen
- [x] Lifecycle state machine frozen
- [x] Sequence monotonic guarantee frozen
- [x] `complete()` preservation invariant documented
- [x] Cancellation boundary frozen
- [x] `ExecutionCapability` boundary frozen (static per adapter)
- [x] Transport boundary frozen (SSE first, outside core)
- [x] `tool_call` reserved — implementation deferred
- [x] No provider-specific leakage rule documented
- [x] P2-C `complete()` regression plan documented
- [x] Implementation waves P2-D.1–D.6 sequenced

---

## Consequences

### Positive

- Streaming adds UX without sacrificing kernel abstraction
- Lifecycle state machine prevents anomalous event sequences
- C-CAN gains a proper lifecycle home
- Capability metadata has a neutral model before routing/orchestration
- P2-C investment preserved — complete path stays conformance-gated

### Tradeoffs

- New port surface and conformance scenarios (stream catalog extension)
- Higher upfront design cost vs `stream=true` shortcut
- Tool streaming and orchestration deferred to later phases

### Non-goals (P2-D ADR)

- Provider routing / orchestration
- Vendor registry
- Runtime capability probe
- Tool execution orchestration
- Modifying P2-C complete envelopes without explicit extension note
- Live vendor streaming credential tests as harness acceptance

---

## Compliance

Changes that violate this ADR require a **new or amended ADR** before merge.

P2-C conformance harness: `complete()` subjects remain mandatory regression gate for all P2-D implementation waves.

---

## Next

1. Governance commit + push (this ADR Accepted)
2. `forge-isolate` → P2-D.1 blueprint on `org-memory-p2-c2-complete`
3. Implement runtime stream contract — no vendor streaming before P2-D.1 acceptance
