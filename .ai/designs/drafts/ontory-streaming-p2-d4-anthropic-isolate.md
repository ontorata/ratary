# P2-D.4 Anthropic Streaming — Forge Isolate

| Field | Value |
|-------|-------|
| **Repo** | `D:\Apps\ontory` (`@ontorata/ontory`) |
| **Branch** | `forge/ontory-streaming-p2-d4-anthropic` |
| **Baseline** | `org-memory-p2-d3-complete` @ `1202c5c` |
| **ADR** | ADR-0012 **Accepted · Amended** (frozen semantic authority) |
| **Blueprint** | [ontory-streaming-p2-d4-anthropic-blueprint.md](./ontory-streaming-p2-d4-anthropic-blueprint.md) |
| **Codename** | `TASK-0029` |
| **Status** | ✅ Isolate active — blueprint draft ready for owner review |
| **Verification** | 2026-07-09 — `npm test` 191 PASS / 4 skipped · typecheck OK · `check:boundary` OK |

---

## Pre-flight checklist

- [x] P2-D.3 tagged `org-memory-p2-d3-complete` @ `1202c5c`
- [x] ADR-0012 semantic locks frozen
- [x] OpenAI streaming pattern established (mapper · client port · adapter ownership)
- [x] Entry authorization approved by owner
- [x] Branch created from baseline tag
- [x] Working tree clean at isolate
- [x] Baseline green on new branch
- [x] Anthropic `stream()` still `not_implemented`

---

## Acceptance (isolate)

| Area | Required | Status |
|------|----------|--------|
| Branch from P2-D.3 tag | `forge/ontory-streaming-p2-d4-anthropic` @ `1202c5c` | ✅ |
| Baseline green | 191 passed · 4 skipped · typecheck · boundary | ✅ |
| Contract frozen | ADR-0012 / validators / `d-*.ts` untouched | ✅ |
| OpenAI streaming preserved | Regression subject remains green | ✅ |
| Coding blocked until blueprint review | Owner review next | ✅ |

**Reject isolate if:** runtime contract files change, new event types appear, or Gemini streaming lands in this branch.

---

## Explicit non-goals preserved

- ADR-0012 modification
- `AIExecutionEvent` schema expansion
- New lifecycle states
- Consumer / validator / scenario contract edits
- Anthropic-specific event types in shared envelopes
- Gemini streaming (P2-D.5)
- Transport SSE REST adapter
- Tool execution / capability probe / routing

---

## Next

1. Owner review P2-D.4 blueprint boundary
2. On approval → implement Anthropic adapter streaming only (mirror OpenAI P2-D.3 pattern)
3. Inherit 13 P2-D + Anthropic P2-C scenarios — do not invent new lifecycle scenarios

**Ready for blueprint review.** Coding remains blocked until owner approves the blueprint.
