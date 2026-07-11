# P2-D.1 — Ontory Streaming Contract (Runtime)

**Release:** org-memory-p2-d1-complete  
**Date:** 2026-07-09  
**Phase:** P2-D Streaming · Wave 1  
**ADR:** ADR-0012

## Summary

Runtime streaming contract established without provider implementations. Frozen event envelope, lifecycle FSM, cancellation boundary. Stub stream implementation validates contract. P2-C regression green.

## Scope

### Contract Additions

- `AIExecutionEvent` — provider-neutral stream event envelope
- `AIExecutionEventType` — frozen event types (7 types)
- `ExecutionLifecycleState` — separate lifecycle state (6 states)
- `CancellationSignal` — provider-neutral cancellation interface
- `ProviderRuntime.stream()` — dual path extension (additive)

### Implementation

- **Stub stream:** started → delta → metadata → completed
- **Validation:** monotonic sequence, terminal state, cancellation check
- **Non-stub adapters:** throw `'not_implemented'` (deferred to P2-D.3–5)

## Backward Compatibility

✅ **P2-C callers unaffected:**
- `complete()` unchanged
- No capability discovery required
- No stream handling required

## Tests

- **Unit:** 97 passed | 4 skipped (101)
- **Conformance (P2-C):** 26 passed | 4 skipped (30) — ✅ regression green
- **Boundary:** ✅ PASS
- **Typecheck:** ✅ PASS

## Evidence

- **Branch:** `forge/ontory-streaming-p2-d1`
- **Tag:** `org-memory-p2-d1-complete`
- **Commits:** `1f7d6f0`, `f77bcb6`
- **Proof:** `.ai/reviews/org-memory-dogfood/ontory-streaming-p2-d1-proof.md`
- **Acceptance:** `.ai/reviews/org-memory-dogfood/P2-D-1-ACCEPTANCE.md`

## Architecture

```
P2-C Frozen Contract
        |
        v
P2-D.1 Runtime Stream Contract ← ADR-0012
        |
        ├── AIExecutionEvent (envelope)
        ├── ExecutionLifecycleState (FSM)
        ├── CancellationSignal (boundary)
        └── ProviderRuntime.stream() (signature)
        |
        v
P2-D.2–5 Provider Streaming
        |
        ├── P2-D.2 Stub cancellation
        ├── P2-D.3 OpenAI streaming
        ├── P2-D.4 Anthropic streaming
        └── P2-D.5 Gemini streaming
```

## Guardrails

✅ No vendor-specific event types  
✅ Payload opaque from core  
✅ Lifecycle state ≠ event type  
✅ Cancellation provider-neutral  
✅ Sequence monotonic  
✅ Terminal state enforced

## Next Wave

**P2-D.2:** Stub cancellation validation  
**P2-D.3:** OpenAI streaming  
**P2-D.4:** Anthropic streaming  
**P2-D.5:** Gemini streaming  
**P2-D.6:** Cancellation validation across providers

## Acceptance

✅ **ACCEPTED** — contract frozen, implementation waves ready.
