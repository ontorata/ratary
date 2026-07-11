# Blueprint: P2-D.2 Stream Lifecycle Conformance

| Field | Value |
|-------|-------|
| **Status** | Closed — P2-D.2 complete 2026-07-09 |
| **Intent** | ADR-0012 Semantic Amendment (2026-07-09) |
| **ADR** | ADR-0012 Accepted + Amended |
| **Repo** | `ontory` (runtime validation only — no provider implementation) |
| **Baseline** | `org-memory-p2-d1-complete` @ `f77bcb6` |
| **Branch (proposed)** | `forge/ontory-streaming-p2-d2-lifecycle` |
| **Tag (target)** | `org-memory-p2-d2-complete` |
| **Codename** | `TASK-0027` |
| **Phase** | P2-D Streaming · Wave 2 — Lifecycle & Cancellation Conformance |

---

## Objective

**Prove runtime stream implementation complies with ADR-0012 semantic locks without provider dependency.**

Validate:
- Event lifecycle ordering (flexible metadata position)
- Terminal event guarantee (exactly once, no events after)
- Cancellation state machine (idempotent, at-most-once callback)
- Sequence semantics (monotonic, stream instance scope)
- Consumer contract (AsyncIterable, defensive handling)

**Boundary:**

```
Provider Runtime
       |
       v
Stream Lifecycle Validator
       |
       v
AIExecutionEvent Contract
```

**Not in scope:**
- Provider adapter implementation (P2-D.3–5)
- Event type changes
- Payload expansion
- AsyncIterable contract changes
- Transport layer (SSE/WebSocket)

**API Surface Invariant:**

> P2-D.2 MUST NOT introduce new public runtime API surface.

**Rationale:** P2-D.2 is validation/conformance phase, not API evolution. Contract defined in P2-D.1, proven in P2-D.2, implemented in P2-D.3–5.

---

## Context

P2-D.1 froze **contract surface** (`AIExecutionEvent`, `CancellationSignal`, `ProviderRuntime.stream()`). ADR-0012 amendment added **semantic locks** (lifecycle ordering, sequence rules, cancellation FSM, consumer contract).

**Gap:** Contract semantics frozen in ADR, but not validated in conformance harness.

**Risk:** Without lifecycle conformance validation, provider adapters (P2-D.3–5) may:
- Emit invalid event sequences
- Violate terminal guarantees
- Implement incorrect cancellation semantics
- Break sequence monotonicity

**Gate:** P2-D.2 must close before P2-D.3 (OpenAI streaming) opens.

---

## Acceptance Criteria

### AC-1: Event Lifecycle Compliance

**Invariant (ADR-0012 amendment):**

```
STARTED (mandatory, first non-terminal)
   |
   ├─ METADATA? (optional, flexible position after started)
   |
   ├─ DELTA* (zero or more)
   |     |
   |     └─ METADATA? (optional, after delta stream)
   |
   └─ TERMINAL (exactly one: completed | failed | cancelled)
```

**Validation:**

| Sequence | Valid | Reason |
|----------|-------|--------|
| `started → metadata → delta → delta → metadata → completed` | ✅ | Flexible metadata position |
| `started → delta → completed` | ✅ | Minimal valid stream |
| `started → completed` | ✅ | No delta (empty response) |
| `delta → started → completed` | ❌ | started not first |
| `started → completed → delta` | ❌ | Event after terminal |
| `started → metadata → completed → metadata` | ❌ | metadata after terminal |

**Implementation:**
- Stub provider: emit valid lifecycle sequences
- Test harness: validate ordering constraints
- Consumer: detect invalid ordering defensively

### AC-2: Terminal Guarantee

**Invariant:**

```
terminalCount === 1 per stream instance
```

**Terminal event types:**
- `completed`
- `failed`
- `cancelled`

**Rules:**
- Exactly one terminal event per stream
- No events allowed after terminal
- Consumer MUST stop iteration on terminal

**Validation:**

| Scenario | Expected |
|----------|----------|
| Stream ends with `completed` | ✅ Pass |
| Stream ends with `failed` | ✅ Pass |
| Stream ends with `cancelled` | ✅ Pass |
| `completed → delta` | ❌ Fail — event after terminal |
| `failed → completed` | ❌ Fail — two terminals |
| No terminal event | ❌ Fail — incomplete stream |

### AC-3: Cancellation State Machine

**FSM (ADR-0012 amendment):**

```
CREATED
   |
   v
STARTED
   |
   v
STREAMING
   |
   ├─────────────────┐
   |                 |
cancel()       terminal emitted
   |                 |
   v                 v
CANCELLED       CLOSED
   |
   v
CLOSED
```

**Rules:**
1. **Before stream start:** `cancel()` → `cancelled` terminal only
2. **During delta:** `cancel()` → stop stream → `cancelled` terminal
3. **After terminal:** `cancel()` → no-op (idempotent)
4. **Double cancel:** callback executes at most once
5. **Terminal race:** first terminal wins (by sequence)

**Validation matrix:**

| Scenario | Expected |
|----------|----------|
| Cancel before stream start | `cancelled` terminal only |
| Cancel during delta | Stop stream + `cancelled` terminal |
| Cancel during metadata | Stop stream + `cancelled` terminal |
| Cancel after `completed` | No-op (idempotent) |
| Cancel twice | Callback fires once |
| Cancel + provider failure race | First terminal wins |

**`CancellationSignal` invariant:**
- Callback MUST execute **at most once**
- Multiple `cancel()` calls → idempotent

### AC-4: Sequence Validation

**Invariant (ADR-0012 amendment):**

```
event[i].sequence === previous.sequence + 1
```

**Rules:**
- Sequence starts at `1` (human-friendly)
- Strictly increasing within stream instance
- No gaps allowed
- Sequence belongs to **stream instance**, not execution identity
- Retry → new stream → sequence resets to `1`

**Valid example (retry scenario):**

```
executionId: "exec-123"
  └─ stream attempt #1: seq 1,2,3,CANCELLED
  └─ stream attempt #2: seq 1,2,3,4,COMPLETED  ✅ valid
```

**Validation:**

| Sequence | Valid | Reason |
|----------|-------|--------|
| `1 → 2 → 3 → 4` | ✅ | Strictly increasing |
| `1 → 3 → 4` | ❌ | Gap (missing 2) |
| `1 → 2 → 2 → 3` | ❌ | Duplicate sequence |
| `1 → 2 → 1 → 3` | ❌ | Out of order |
| Retry: `1,2,3,CANCELLED` then `1,2,COMPLETED` | ✅ | Stream instance scope |

**Runtime constraint:** MUST NOT emit out-of-order  
**Consumer constraint:** MUST handle out-of-order defensively

### AC-5: Consumer Contract

**Interface:**

```typescript
stream(
  request: AIExecutionRequest,
  requestId: string,
  signal?: CancellationSignal
): AsyncIterable<AIExecutionEvent>
```

**Consumer mandatory handling:**

1. **Terminal detection:** Stop iteration after terminal event
2. **Cancellation propagation:** Pass `CancellationSignal` to runtime
3. **Defensive ordering:** Handle out-of-order events (buffer/terminate/replay)

**Pattern:**

```typescript
for await (const event of runtime.stream(request, id, signal)) {
  if (event.type === 'completed' || event.type === 'failed' || event.type === 'cancelled') {
    break; // terminal
  }
  
  // Process delta/metadata
}
```

**Validation:**
- Consumer test: iterate stream, detect terminal, stop
- Consumer test: handle cancellation signal
- Consumer test: reject/buffer out-of-order events

---

## Test Matrix (Minimum Coverage)

| # | Test | Expected | AC |
|---|------|----------|-----|
| 1 | Normal completion: `started → delta → completed` | ✅ Pass | AC-1, AC-2 |
| 2 | Empty stream: `started → completed` | ✅ Pass | AC-1, AC-2 |
| 3 | Metadata early: `started → metadata → delta → completed` | ✅ Pass | AC-1 |
| 4 | Metadata late: `started → delta → metadata → completed` | ✅ Pass | AC-1 |
| 5 | Metadata after terminal: `started → completed → metadata` | ❌ Fail | AC-1 |
| 6 | Delta after terminal: `started → completed → delta` | ❌ Fail | AC-2 |
| 7 | Cancel before start | `cancelled` terminal only | AC-3 |
| 8 | Cancel during delta | Stop + `cancelled` | AC-3 |
| 9 | Cancel during metadata | Stop + `cancelled` | AC-3 |
| 10 | Cancel after `completed` | No-op (idempotent) | AC-3 |
| 11 | Double cancel | Callback fires once | AC-3 |
| 12 | Cancel vs provider failure race | First terminal wins | AC-3 |
| 13 | Sequence strictly monotonic: `1,2,3,4` | ✅ Pass | AC-4 |
| 14 | Sequence gap: `1,3,4` | ❌ Fail | AC-4 |
| 15 | Retry sequence reset | `1,2,3,CANCELLED` → `1,2,COMPLETED` | ✅ Pass | AC-4 |
| 16 | Consumer terminal detection | Iteration stops | AC-5 |
| 17 | Consumer cancellation propagation | Signal passed | AC-5 |
| 18 | Consumer out-of-order handling | Defensive (buffer/reject) | AC-5 |

**Coverage:**
- Event lifecycle ordering: tests 1–6
- Terminal guarantee: tests 1, 2, 5, 6
- Cancellation state machine: tests 7–12
- Sequence validation: tests 13–15
- Consumer contract: tests 16–18

---

## Implementation Tasks

### Task 1: Lifecycle Validation Helpers

**Files:**
- `tests/runtime/lifecycle-validator.ts` (new)

**Exports:**
- `validateEventSequence(events: AIExecutionEvent[]): ValidationResult`
- `isTerminal(event: AIExecutionEvent): boolean`
- `validateLifecycleTransition(from: ExecutionLifecycleState, to: ExecutionLifecycleState): boolean`

**Purpose:** Reusable validation logic for conformance tests.

### Task 2: Cancellation Test Scenarios

**Files:**
- `tests/runtime/cancellation-lifecycle.test.ts` (new)

**Tests:** AC-3 scenarios (7 tests)
- Cancel before start
- Cancel during delta
- Cancel during metadata
- Cancel after terminal
- Double cancel
- Cancel vs failure race
- At-most-once callback

### Task 3: Sequence Validation Tests

**Files:**
- `tests/runtime/sequence-validation.test.ts` (new)

**Tests:** AC-4 scenarios (3+ tests)
- Strictly monotonic
- Gap detection
- Retry sequence reset

### Task 4: Consumer Contract Tests

**Files:**
- `tests/runtime/consumer-contract.test.ts` (new)

**Tests:** AC-5 scenarios (3+ tests)
- Terminal detection
- Cancellation propagation
- Out-of-order handling

### Task 5: Stub Provider Lifecycle Extensions

**Files:**
- `src/adapters/stub-provider/stub-runtime-provider.ts` (extend P2-D.1.2)

**Extensions:**
- Add early metadata emission option
- Add late metadata emission option
- Add cancellation signal handling (already present, validate)
- Add failure scenario emission

**Goal:** Stub provider can emit all valid lifecycle patterns for test coverage.

### Task 6: Conformance Subject Extensions

**Files:**
- `tests/conformance/scenarios/d-lifecycle.ts` (new)
- `tests/conformance/scenarios/d-cancellation.ts` (new)
- `tests/conformance/scenarios/d-sequence.ts` (new)

**Purpose:** Extend conformance harness with P2-D.2 lifecycle scenarios. Stub provider runs all scenarios. Provider adapters (P2-D.3–5) inherit these scenarios.

### Task 7: Evidence Package

**Files:**
- `.ai/reviews/org-memory-dogfood/P2-D-2-ACCEPTANCE.md` (new)
- `.ai/reviews/org-memory-dogfood/ontory-streaming-p2-d2-lifecycle-proof.md` (new)

**Content:**
- Test results (all AC green)
- Coverage matrix
- Conformance subject pass rate
- ADR-0012 compliance validation

---

## Definition of Done

- [ ] AC-1: Event lifecycle ordering validated (6 tests)
- [ ] AC-2: Terminal guarantee validated (4 tests)
- [ ] AC-3: Cancellation state machine validated (7 tests)
- [ ] AC-4: Sequence validation complete (3+ tests)
- [ ] AC-5: Consumer contract validated (3+ tests)
- [ ] Test matrix: 18+ tests pass
- [ ] Conformance scenarios: stub provider green
- [ ] P2-D.1 regression: P2-C conformance still green
- [ ] Boundary check: ✅ PASS
- [ ] Typecheck: ✅ PASS
- [ ] Evidence package: A1/A2 + acceptance record
- [ ] Tag: `org-memory-p2-d2-complete`
- [ ] No provider adapter implementation (deferred to P2-D.3–5)

---

## Dependencies

**Baseline:**
- `org-memory-p2-d1-complete` @ `f77bcb6` (ontory)
- ADR-0012 semantic amendment @ `6240796` (ai-brain)

**Blocked by:** None — P2-D.1 complete, ADR-0012 amended

**Blocks:**
- P2-D.3 OpenAI streaming
- P2-D.4 Anthropic streaming
- P2-D.5 Gemini streaming

---

## Risks

| Risk | Mitigation |
|------|------------|
| Test matrix incomplete → edge cases missed | Minimum 18 tests cover all 5 AC areas |
| Stub provider doesn't cover all lifecycle patterns | Task 5 extends stub with early/late metadata, failure scenarios |
| Consumer contract ambiguous | AC-5 provides explicit AsyncIterable pattern |
| Cancellation race conditions not caught | AC-3 includes cancel vs failure race test |

---

## Success Criteria

**P2-D.2 acceptance:**

1. All 5 acceptance criteria validated with tests
2. Test matrix: 18+ tests pass
3. Conformance: stub provider green on lifecycle scenarios
4. P2-C regression: 26 conformance tests still pass
5. Evidence: A1/A2 proof + acceptance record
6. Tag: `org-memory-p2-d2-complete` pushed

**Gate opens for P2-D.3–5:**

After P2-D.2 closes, provider streaming waves can proceed. Adapters inherit conformance scenarios and must validate against frozen lifecycle semantics.

---

## Next Phase Note

**P2-E Ontory Native Model Foundation** becomes viable after P2-D.2 because:
- Runtime + lifecycle + memory boundary stable
- Stream semantics frozen
- Provider abstraction proven across 3 vendors
- Cancellation and consumer contracts locked

P2-D.2 completion = ideal gate for internal model foundation work.
