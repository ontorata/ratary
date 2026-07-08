# Blueprint: ontory-provider-p2-b

| Field | Value |
|-------|-------|
| **Status** | Execute — Task 1–2 ✅ · Task 3 next (ResponseMapper / ErrorMapper) |
| **Intent** | [ontory-provider-p2-b-intent.md](./ontory-provider-p2-b-intent.md) |
| **Isolate** | [ontory-provider-p2-b-isolate.md](./ontory-provider-p2-b-isolate.md) |
| **ADR** | ADR-0008 Accepted |
| **Repo** | `ontory` · branch `forge/ontory-provider-p2-b` |
| **Baseline** | `org-memory-p2-a-complete` @ `c18cacc` |

---

## Locked flow (end state — not after Task 1)

```text
AIExecutionRequest → ProviderRuntime → OpenAIProviderAdapter → AIExecutionResponse
```

After **Task 1 only**:

```text
ProviderRuntime (unchanged)
        │
ProviderError (new contract)
```

No OpenAI adapter yet.

---

## Execution progress

- [x] Task 1 — Provider contract & `ProviderError` (**no OpenAI**) · Ontory `ac5aa19`
- [x] Task 2 — RequestMapper · Ontory (pure · no SDK)
- [ ] Task 3 — ResponseMapper / ErrorMapper (vendor → `ProviderError`)
- [ ] Task 4 — `OpenAIProviderAdapter` (official SDK · adapter folder only)
- [ ] Task 5 — Configuration (`stub` \| `openai`, model default `gpt-4o-mini`)
- [ ] Task 6 — REST composition (default remains stub)
- [ ] Task 7 — Evidence & A1/A2 verification
- [ ] Task 8 — Closeout tag

---

## Task 1 — Provider contract & ProviderError ✅

- **Commit:** Ontory `ac5aa19`
- **Files:** `src/runtime/contracts/provider-error.ts` · tests · re-export · doc on `ProviderRuntime`
- **Verify:** 10 tests PASS · boundary OK · typecheck OK
- **Done when:** ✅ Runtime knows `ProviderError` · no OpenAI · no networking · no Dispatcher / REST changes

## Task 2 — RequestMapper ✅

- **Files:** `src/adapters/openai/request-mapper.ts` · `tests/adapters/openai-request-mapper.test.ts`
- **Do:** Pure `mapAIExecutionRequestToOpenAIChatParams(request, { model })` → frozen `{ model, messages }`
- **Notes:** `temperature` / `max_tokens` **not** on `AIExecutionRequest` — omitted; `tools` ignored (P2-B no tool calling); model is an explicit arg (no env)
- **Verify:** 14 tests PASS · boundary OK · no `openai` package
- **Done when:** ✅ pure · no network · no env · no Dispatcher · no ProviderRuntime change · no OpenAI client

### Task 3 — ResponseMapper / ErrorMapper

- **Files:** `response-mapper.ts` · `error-mapper.ts` · tests
- **Do:** Completion → `AIExecutionResponse`; vendor errors → `ProviderError`

### Task 4 — OpenAIProviderAdapter

- **Files:** adapter + boundary allowlist for `src/adapters/openai/**` only · add `openai` dep
- **Do:** `implements ProviderRuntime`; official SDK confined to folder

### Task 5 — Configuration

- **Files:** `src/adapters/openai/config.ts`
- **Do:** Ontory-only env; default model `gpt-4o-mini`

### Task 6 — REST composition

- **Files:** `src/adapters/rest/server.ts` (injection only)
- **Do:** select stub vs openai; **default stub**

### Task 7 — Evidence

- **Repo:** ai-brain reviews + ADR-0008 DoD

### Task 8 — Closeout

- Tag when DoD met; no Anthropic in same wave unless complete

---

## Rejection criteria

Abort if Task 1 pulls in SDK, HTTP, mappers, or Dispatcher changes.

**Owner approval:** ✅ Task 1 scope = contract only · execute unlocked.
