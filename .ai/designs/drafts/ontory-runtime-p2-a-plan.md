# Blueprint: ontory-runtime-p2-a

| Field | Value |
|-------|-------|
| **Status** | Tasks 1–8 complete · Task 9 closeout tag pending |
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
- [x] Task 8 — evidence package + P2-A quality gates (governance only)
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

### Task 8 — Evidence ✅ (governance only — no runtime code)

- **Repo:** ai-brain
- **Files:**
  - [ontory-runtime-kernel-proof.md](../../reviews/org-memory-dogfood/ontory-runtime-kernel-proof.md)
  - [P2-A-ACCEPTANCE.md](../../reviews/org-memory-dogfood/P2-A-ACCEPTANCE.md)
  - [ontory-runtime-boundary-verification.md](../../reviews/org-memory-dogfood/ontory-runtime-boundary-verification.md)
  - ADR-0007 DoD checklist (all items checked)
- **Verify:** Ontory `c18cacc` — 4 tests + boundary PASS · Studio `043666e` — 48 tests + boundaries PASS
- **Done when:** ✅ DoD mapped · D1–D4 traced · architecture diagram matches repos · acceptance manifest ACCEPTED

---

## Rejection criteria (scope creep)

Abort / refuse commits that introduce:

- vendor SDKs (`openai`, Anthropic, Gemini, …)
- memory / recall / Ratary imports
- agent / tool / planning modules
- provider-specific code inside `dispatcher.ts`

**Owner approval:** ✅ forge-isolate ACCEPTED · Tasks 1–8 complete · vendor adapters deferred to **P2-B** · Task 9 = tag-only closeout.
