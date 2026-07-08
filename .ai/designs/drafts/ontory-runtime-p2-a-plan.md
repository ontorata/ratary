# Blueprint: ontory-runtime-p2-a

| Field | Value |
|-------|-------|
| **Status** | Execute — Tasks 1–7 complete · Task 8 evidence pack next |
| **Intent** | [ontory-runtime-p2-a-intent.md](./ontory-runtime-p2-a-intent.md) |
| **Isolate** | [ontory-runtime-p2-a-isolate.md](./ontory-runtime-p2-a-isolate.md) |
| **ADR** | ADR-0007 Accepted |
| **Repo** | `ontory` · branch `forge/ontory-runtime-p2-a` |

---

## Locked flow (four contract arrows only)

```text
Studio
    │
    ▼
REST Runtime Adapter
    │
    ▼
Dispatcher
    │
    ▼
ProviderRuntime (stub)
    │
    ▼
Response Envelope
```

---

## Execution progress

- [x] Task 1 — repo bootstrap (`package.json`, tsconfig, README, boundary script)
- [x] Task 2 — request/response contracts + runtime port
- [x] Task 3 — Dispatcher (no provider-specific logic)
- [x] Task 4 — StubRuntimeProvider
- [x] Task 5 — REST adapter (`POST /v1/execute`, `GET /health`)
- [x] Task 6 — unit + REST contract tests
- [x] Task 7 — Studio `WorkspaceAiRuntimePort` → Ontory REST client adapter (Studio repo)
- [ ] Task 8 — evidence package + P2-A quality gates
- [ ] Task 9 — closeout (tag when DoD met)

---

## Task details

### Task 7 — Studio REST client adapter ✅

- **Repo:** Ontorata-Studio · branch `forge/ai-workspace-p1-d`
- **Files:** `src/infrastructure/ai/ontory-rest-workspace-ai-runtime.ts` · wired in `useWorkspaceAiPipeline` (default); Echo via `VITE_ONTORY_RUNTIME=echo`
- **Do:** HTTP POST `/v1/execute` + `GET /health`; map `AIExecutionRequest` ↔ JSON; error envelope; timeout; no Ontory package import
- **Verify:** `tests/unit/ontory-rest-workspace-ai-runtime.test.ts` · `npm test` 48 PASS · `check:boundaries` OK
- **Evidence:** [ontory-runtime-studio-rest-adapter-proof.md](../../reviews/org-memory-dogfood/ontory-runtime-studio-rest-adapter-proof.md)
- **Done when:** ✅ UI pipeline default path is REST RuntimePort (Echo optional fallback only)

### Task 8 — Evidence

- **Repo:** ai-brain governance and/or ontory `.ai` stub
- **Files:** `.ai/reviews/.../ontory-runtime-kernel-proof.md`
- **Verify:** `npm test && npm run check:boundary` in ontory; Studio boundary still green
- **Done when:** DoD checklist in ADR-0007 updated for implemented items

---

## Rejection criteria (scope creep)

Abort / refuse commits that introduce:

- vendor SDKs (`openai`, Anthropic, Gemini, …)
- memory / recall / Ratary imports
- agent / tool / planning modules
- provider-specific code inside `dispatcher.ts`

**Owner approval:** ✅ forge-isolate ACCEPTED · Task 7 complete · Task 8+ sequential · vendor adapters still forbidden.
