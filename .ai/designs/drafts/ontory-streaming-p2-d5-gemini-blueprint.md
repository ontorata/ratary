# Blueprint: P2-D.5 Gemini Streaming Adapter

| Field | Value |
|-------|-------|
| **Status** | ✅ Complete — closed 2026-07-09 |
| **Intent / Kickoff** | TASK-0030 · P2-D.5 Gemini Streaming Kickoff Accepted |
| **ADR** | ADR-0012 Accepted · Amended (frozen — **do not modify**) |
| **Repo** | `ontory` · branch `forge/ontory-streaming-p2-d5-gemini` |
| **Baseline** | `org-memory-p2-d4-complete` @ `8ded5d4` |
| **Isolate** | [ontory-streaming-p2-d5-gemini-isolate.md](./ontory-streaming-p2-d5-gemini-isolate.md) |
| **Tag** | `org-memory-p2-d5-complete` |
| **Codename** | `TASK-0030` |
| **Phase** | P2-D Streaming · Wave 5 — Gemini provider conformance |
| **Pattern reference** | P2-D.3 OpenAI · P2-D.4 Anthropic |
| **Proof** | `.ai/reviews/org-memory-dogfood/ontory-streaming-p2-d5-gemini-proof.md` |
| **Acceptance** | `.ai/reviews/org-memory-dogfood/P2-D-5-ACCEPTANCE.md` |

---

## Objective

Prove Gemini can emit `AsyncIterable<AIExecutionEvent>` under ADR-0012 without contract changes.

**Invariant:** Gemini follows contract. Contract does not follow Gemini.

---

## Layer rules (locked)

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| Client | connect/read stream, transport errors, close | emit AIExecutionEvent, lifecycle, sequence |
| Mapper | text/usage/finish interpretation → actions | started/completed/failed/cancelled emission |
| Adapter | sequence, FSM, cancellation, terminal | vendor field leakage |

---

## Gemini mapping

| Gemini native | Mapper action | Adapter emits |
|---------------|---------------|---------------|
| candidate text part (non-empty) | `delta` `{ text }` | `delta` |
| `finishReason` present (e.g. STOP) | `finish` | `completed` |
| `usageMetadata` tokens | `usage` | late `metadata` / `completed.usage` |
| empty / structural-only chunk | `ignore` | — |
| tool / function calls | `ignore` (deferred) | — |

Delta payload MUST be Ontory `{ text }` — never Gemini `candidates` / `parts` leakage.

---

## Execution tasks

- [x] Task 0 — forge-isolate from `org-memory-p2-d4-complete`
- [x] Task 1 — Kickoff / blueprint approved
- [x] Task 2 — Stream event mapper (pure) + unit tests
- [x] Task 3 — Client stream port (`generateContentStream`)
- [x] Task 4 — `GeminiProviderAdapter.stream()` + cancellation
- [x] Task 5 — Gemini P2-D subject (13 scenarios)
- [x] Task 6 — Gates + regression (OpenAI + Anthropic D subjects)
- [x] Task 7 — Evidence A1/A2 + acceptance + release
- [x] Task 8 — Tag `org-memory-p2-d5-complete`

---

## Acceptance

Same AC matrix as P2-D.3/D.4: lifecycle, cancel, sequence, errors, usage timing, 13 inherited scenarios, full regression green, ADR-0012 unchanged, boundary PASS.

**Final suite:** 271 passed · 4 skipped · typecheck PASS · boundary PASS.
