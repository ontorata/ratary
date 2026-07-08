# Evidence — P2-A Task 7 · Studio → Ontory REST RuntimePort

| Field | Value |
|-------|-------|
| **Date** | 2026-07-08 |
| **Milestone** | P2-A Ontory Runtime Kernel · Blueprint Task 7 |
| **Studio branch** | `forge/ai-workspace-p1-d` |
| **Ontory branch** | `forge/ontory-runtime-p2-a` |
| **ADR** | ADR-0007 Accepted (D1–D4) |
| **Status** | ✅ Task 7 complete — ready for Task 8 gate pack |

---

## Accepted boundary (unchanged from isolate)

```text
Studio
    │
WorkspaceAiRuntimePort
    │
    ▼
REST Client (OntoryRestWorkspaceAiRuntime)
    │
HTTP
    ▼
Ontory Runtime (/v1/execute · /health)
```

**Not used:** `import` Ontory packages · in-process Dispatcher · provider SDKs.

---

## Acceptance criteria (owner)

| Criterion | Evidence |
|-----------|----------|
| `WorkspaceAiRuntimePort` implemented as REST client | `Ontorata-Studio/src/infrastructure/ai/ontory-rest-workspace-ai-runtime.ts` |
| No direct dependency on Ontory internal packages | `check-sdk-boundary.mjs` forbids `@ontorata/ontory` / in-process `RuntimeDispatcher` |
| No in-process execution | Default hook uses HTTP only; Echo only if `VITE_ONTORY_RUNTIME=echo` |
| Requests use `AIExecutionRequest` | POST body maps prompt + workspace/user/capability/tools/metadata |
| Responses map to completion envelope | `{ text, provider, requestId? }` from Ontory success JSON |
| Health + error envelope | `GET /health`; `OntoryRuntimeHttpError` from `{ error, message }` |
| Studio does not know runtime internals | Adapter talks HTTP only |

---

## Verification (Studio · 2026-07-08)

| Command | Result |
|---------|--------|
| `npm test` | ✅ 18 files / 48 tests (incl. 3 Ontory REST unit tests) |
| `npm run check:boundaries` | ✅ SDK + recall consumer OK |
| `npm run typecheck` | ✅ |

---

## Allowed / still forbidden (scope discipline)

**Still allowed:** REST client · error envelope · timeout · retry/correlation later · basic observability  

**Still forbidden:** OpenAI / Anthropic / Gemini adapters · tool execution · streaming optimization · agent orchestration · memory · recall · prompt management inside Ontory kernel

---

## Next

Task 8 — evidence package + ADR-0007 DoD checklist update · then Task 9 closeout when DoD met.
