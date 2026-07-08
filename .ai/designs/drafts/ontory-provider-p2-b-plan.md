# Blueprint: ontory-provider-p2-b

| Field | Value |
|-------|-------|
| **Status** | Approved — OpenAI-only execute unlocked |
| **Intent** | [ontory-provider-p2-b-intent.md](./ontory-provider-p2-b-intent.md) |
| **Isolate** | [ontory-provider-p2-b-isolate.md](./ontory-provider-p2-b-isolate.md) |
| **ADR** | ADR-0008 Accepted |
| **Repo** | `ontory` · branch `forge/ontory-provider-p2-b` |
| **Baseline** | `org-memory-p2-a-complete` @ `c18cacc` |

---

## Locked flow

```text
AIExecutionRequest
        │
ProviderRuntime
        │
OpenAIProviderAdapter
        ├── RequestMapper
        ├── ResponseMapper
        ├── ErrorMapper
        └── openai SDK client
        │
OpenAI Chat Completions
        │
AIExecutionResponse
```

Studio path unchanged. Streaming deferred.

---

## Execution progress

- [ ] Task 1 — `ProviderError` + boundary script allowlist for `adapters/openai` only
- [ ] Task 2 — RequestMapper / ResponseMapper / ErrorMapper (no SDK types exported)
- [ ] Task 3 — `OpenAIProviderAdapter` implements `ProviderRuntime`
- [ ] Task 4 — Ontory config + composition root: `ONTORY_PROVIDER=stub|openai`, model default `gpt-4o-mini`
- [ ] Task 5 — Unit tests with mocked OpenAI client (CI, no live key)
- [ ] Task 6 — Wire REST `defaultRuntime()` via config; keep stub default for CI
- [ ] Task 7 — Evidence pack + A1/A2 verification · ADR DoD
- [ ] Task 8 — Closeout tag when DoD met

---

## Task details

### Task 1 — ProviderError + boundary allowlist

- **Files:** `src/runtime/provider-error.ts` (or `contracts/provider-error.ts`) · `scripts/check-runtime-boundary.mjs`
- **Do:** Stable Ontory error type/codes; allow `openai` package **only** under `src/adapters/openai/**`; forbid SDK imports elsewhere; keep forbidding OpenAI in dispatcher
- **Verify:** `npm run check:boundary` (still PASS on stub-only tree; fail if openai imported in runtime/)
- **Done when:** CI boundary encodes A2

### Task 2 — Mappers

- **Files:** `src/adapters/openai/request-mapper.ts` · `response-mapper.ts` · `error-mapper.ts`
- **Do:** Map `AIExecutionRequest` → Chat Completions create params; completion → `AIExecutionResponse`; SDK/HTTP errors → `ProviderError`. **Export only Ontory types** from public adapter entry
- **Verify:** unit tests mapping pure functions
- **Done when:** no `openai` types in mapper public signatures

### Task 3 — OpenAIProviderAdapter

- **Files:** `src/adapters/openai/openai-provider-adapter.ts` · `index.ts`
- **Do:** `implements ProviderRuntime`; `name = 'openai'`; uses official SDK; timeout; default model `gpt-4o-mini` if config omitted
- **Verify:** unit test with injected mock client
- **Done when:** `complete()` returns frozen envelope

### Task 4 — Config

- **Files:** `src/adapters/openai/config.ts` · README note
- **Do:** read `ONTORY_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, optional base URL / timeout — Ontory-only
- **Verify:** config unit smoke
- **Done when:** missing key → clear ProviderError when openai selected

### Task 5 — Tests

- **Files:** `tests/adapters/openai-*.test.ts`
- **Do:** mock SDK; cover happy path, unauthorized, timeout mapping; assert dispatcher + openai injection without vendor strings in dispatcher
- **Verify:** `npm test`
- **Done when:** green without live API key

### Task 6 — REST composition

- **Files:** `src/adapters/rest/server.ts` (composition only)
- **Do:** `defaultRuntime()` selects stub vs openai from env; **default remains stub** if unset (CI safety)
- **Verify:** `npm test` · existing REST test still stub path
- **Done when:** no Studio changes

### Task 7 — Evidence (governance)

- **Files:** ai-brain `.ai/reviews/.../ontory-provider-openai-proof.md` · ADR-0008 DoD checkboxes
- **Verify:** Ontory gates + Studio still no openai package
- **Done when:** A1/A2 documented

### Task 8 — Closeout

- **Do:** tag `org-memory-p2-b-complete` (or agreed name) on pins when owner accepts
- **Must not:** Anthropic/Gemini in same tag unless separately completed

---

## Rejection criteria

Abort if:

- SDK types cross `ProviderRuntime`
- Studio gains vendor imports or model hard-codes
- Tools / streaming / agents / MCP / memory land in this branch
- Dispatcher gains `chat.completions` or OpenAI identifiers beyond injecting `ProviderRuntime`

**Owner approval:** ✅ ADR Accepted · isolate green · OpenAI-only blueprint unlocked.
