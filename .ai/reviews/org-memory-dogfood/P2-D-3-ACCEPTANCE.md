# P2-D.3 OpenAI Streaming — Acceptance Record

**Date:** 2026-07-09  
**Phase:** P2-D Streaming · Wave 3  
**Branch:** `forge/ontory-streaming-p2-d3-openai` (ontory)  
**Baseline:** `org-memory-p2-d2-complete` @ `9b63290`  
**Tag:** `org-memory-p2-d3-complete`  
**ADR:** ADR-0012 (Accepted + Amended) — **unchanged**  
**Codename:** `TASK-0028`

---

## Acceptance Criteria

| ID | Criterion | Result |
|----|-----------|--------|
| AC-1 | OpenAI `stream()` yields ADR-0012-valid sequences | ✅ PASS |
| AC-2 | Delta maps `delta.content` → `payload.text` | ✅ PASS |
| AC-3 | Terminal exactly once; last event | ✅ PASS |
| AC-4 | CancellationSignal → internal abort → `cancelled` when appropriate | ✅ PASS |
| AC-5 | Errors via error-mapper → `failed` payload | ✅ PASS |
| AC-6 | Usage timing: late metadata and/or completed.usage; never after terminal | ✅ PASS |
| AC-7 | 13 P2-D scenarios PASS on OpenAI subject (no scenario edits) | ✅ PASS |
| AC-8 | P2-C OpenAI + stub + anthropic + gemini regression green | ✅ PASS |
| AC-9 | ADR-0012 and runtime contracts unchanged | ✅ PASS |
| AC-10 | Boundary check PASS | ✅ PASS |

---

## Test Evidence

| Layer | Result |
|-------|--------|
| Unit (mapper + client + adapter stream) | 27 PASS |
| P2-D OpenAI conformance | 13 PASS |
| P2-D Stub conformance (regression) | 13 PASS |
| P2-C subjects (regression) | green (4 skipped C-CAN) |
| **Full suite** | **191 passed · 4 skipped** |
| Typecheck | ✅ PASS |
| Boundary | ✅ PASS |

---

## Guardrails Maintained

✅ ADR-0012 unchanged  
✅ `AIExecutionEvent` schema unchanged  
✅ Frozen `d-*.ts` scenarios unchanged  
✅ No OpenAI-specific fields on shared envelopes  
✅ `complete()` path preserved  
✅ Client does not emit `AIExecutionEvent`  
✅ Mapper does not own sequence  

---

## Decision

**P2-D.3 OpenAI Streaming:** ✅ **ACCEPTED**

OpenAI streaming is a compliance proof against the P2-D.2 semantic anchor.

**Next wave:** P2-D.4 Anthropic Streaming (blocked until this tag is locked).

---

**Acceptance authority:** Ontorata governance (AI-Brain)  
**Evidence package:** Complete  
**Proof:** [ontory-streaming-p2-d3-openai-proof.md](./ontory-streaming-p2-d3-openai-proof.md)
