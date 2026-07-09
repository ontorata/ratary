# P2-D.3 OpenAI Streaming — Forge Isolate

| Field | Value |
|-------|-------|
| **Repo** | `D:\Apps\ontory` (`@ontorata/ontory`) |
| **Branch** | `forge/ontory-streaming-p2-d3-openai` |
| **Baseline** | `org-memory-p2-d2-complete` @ `9b63290` |
| **ADR** | ADR-0012 **Accepted · Amended** (frozen semantic authority) |
| **Blueprint** | [ontory-streaming-p2-d3-openai-blueprint.md](./ontory-streaming-p2-d3-openai-blueprint.md) |
| **Codename** | `TASK-0028` |
| **Status** | ✅ Isolate active — blueprint draft ready for owner review |
| **Verification** | 2026-07-09 — `npm test` 151 PASS / 4 skipped · typecheck OK · `check:boundary` OK |

---

## Pre-flight checklist

- [x] P2-D.2 tagged `org-memory-p2-d2-complete` @ `9b63290`
- [x] ADR-0012 semantic locks frozen (lifecycle · sequence · cancellation · consumer)
- [x] Kickoff / forge authorization approved by owner
- [x] Branch created from baseline tag (not from dirty tip)
- [x] Working tree clean at isolate
- [x] Baseline green on new branch
- [x] No OpenAI streaming implementation yet (`stream()` still `not_implemented`)

---

## Acceptance (isolate)

| Area | Required | Status |
|------|----------|--------|
| Branch from P2-D.2 tag | `forge/ontory-streaming-p2-d3-openai` @ `9b63290` | ✅ |
| Baseline green | 151 passed · 4 skipped · typecheck · boundary | ✅ |
| Contract frozen | ADR-0012 / validators / scenarios untouched | ✅ |
| No premature Anthropic/Gemini streaming | OpenAI-only wave | ✅ |
| Coding blocked until blueprint review | Owner review next | ✅ |

**Reject isolate if:** runtime contract files change, new event types appear, or Anthropic/Gemini streaming lands in this branch.

---

## Explicit non-goals preserved

- ADR-0012 modification
- `AIExecutionEvent` schema expansion
- New lifecycle states
- Consumer / validator / scenario contract edits
- OpenAI-specific event types in shared envelopes
- Anthropic / Gemini streaming (P2-D.4 / P2-D.5)
- Transport SSE REST adapter (outside provider adapter)
- Tool execution / capability probe / routing

---

## Next

1. Owner review P2-D.3 blueprint boundary
2. On approval → implement OpenAI adapter streaming only
3. Inherit 13 P2-D + OpenAI P2-C scenarios — do not invent new lifecycle scenarios

**Ready for blueprint review.** Coding remains blocked until owner approves the blueprint.
