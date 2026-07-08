# Blueprint: ontory-provider-p2-b

| Field | Value |
|-------|-------|
| **Status** | ✅ CLOSED — Tasks 1–8 complete · tag `org-memory-p2-b-complete` |
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
- [x] Task 2 — RequestMapper · Ontory `e55d858`
- [x] Task 3 — ResponseMapper / ErrorMapper · Ontory `7db112e`
- [x] Task 4 — `OpenAIProviderAdapter` · official SDK · Ontory (thin)
- [x] Task 5 — Configuration · Ontory `src/config/provider-config.ts`
- [x] Task 6 — REST composition · default stub via config
- [x] Task 7 — Evidence & A1/A2 verification (governance)
- [x] Task 8 — Closeout tag `org-memory-p2-b-complete`

---

## Task 1 — Provider contract & ProviderError ✅

- **Commit:** Ontory `ac5aa19`
- **Files:** `src/runtime/contracts/provider-error.ts` · tests · re-export · doc on `ProviderRuntime`
- **Verify:** 10 tests PASS · boundary OK · typecheck OK
- **Done when:** ✅ Runtime knows `ProviderError` · no OpenAI · no networking · no Dispatcher / REST changes

## Task 2 — RequestMapper ✅

- **Commit:** Ontory `e55d858`
- **Files:** `src/adapters/openai/request-mapper.ts` · `tests/adapters/openai-request-mapper.test.ts`
- **Do:** Pure `mapAIExecutionRequestToOpenAIChatParams(request, { model })` → frozen `{ model, messages }`
- **Notes:** `temperature` / `max_tokens` **not** on `AIExecutionRequest` — omitted; `tools` ignored (P2-B no tool calling); model is an explicit arg (no env)
- **Verify:** 14 tests PASS · boundary OK · no `openai` package
- **Done when:** ✅ pure · no network · no env · no Dispatcher · no ProviderRuntime change · no OpenAI client

## Task 3 — ResponseMapper / ErrorMapper ✅

- **Commit:** Ontory `7db112e`
- **Files:** `response-mapper.ts` · `error-mapper.ts` · `tests/adapters/openai-response-error-mapper.test.ts`
- **Do:** Pure completion → `AIExecutionResponse`; failure facts → `ProviderError` (401/403→unauthorized, 429→rate_limited, timeout/abort→timeout, 400/422→bad_request, else provider_error)
- **Must not:** logging · retry · metrics · HTTP · SDK import
- **Verify:** 22 tests PASS · boundary OK
- **Done when:** ✅ pure translation only · no OpenAI client

## Task 4 — OpenAIProviderAdapter ✅

- **Files:** `openai-provider-adapter.ts` · `openai-client.ts` · `index.ts` · `check-runtime-boundary.mjs` (openai allowlist under `adapters/openai/**`) · `package.json` (`openai` dep) · tests
- **Do:** Thin compose: RequestMapper → injected client → ResponseMapper; errors → ErrorMapper; factory `createOpenAISdkClient({ apiKey })` does not read env
- **Verify:** 26 tests PASS · boundary OK · typecheck OK
- **Done when:** ✅ no env/retry/Dispatcher knowledge · SDK import only in openai adapter folder · REST default unchanged (stub)

## Task 5 — Configuration ✅

- **Files:** `src/config/provider-config.ts` · `tests/config/provider-config.test.ts` · `asOpenAIChatClient` bridge in `openai-client.ts`
- **Do:** `resolveOntoryProviderConfig` + `createProviderFromConfig`; default provider `stub`; default model `gpt-4o-mini`; openai requires `OPENAI_API_KEY`
- **Must not:** change mapper/adapter contracts · wire REST (Task 6)
- **Verify:** 33 tests PASS · boundary OK · typecheck OK
- **Done when:** ✅ config sets defaults; adapter still receives resolved model/client only

## Task 6 — REST composition ✅

- **Files:** `src/adapters/rest/server.ts` · `tests/adapters/rest-adapter.test.ts`
- **Do:** `defaultRuntime()` = `createProviderFromConfig(resolveOntoryProviderConfig())` → `RuntimeDispatcher`; explicit runtime injection unchanged; default still stub
- **Must not:** business logic in endpoints · move config policy into handlers · change contracts/mappers/adapters
- **Verify:** 34 tests PASS · boundary OK · typecheck OK
- **Done when:** ✅ REST composes config only · stub default preserved

## Task 7 — Evidence & A1/A2 ✅ (governance only)

- **Files:**
  - [ontory-provider-openai-proof.md](../../reviews/org-memory-dogfood/ontory-provider-openai-proof.md)
  - [P2-B-ACCEPTANCE.md](../../reviews/org-memory-dogfood/P2-B-ACCEPTANCE.md)
  - ADR-0008 DoD checkboxes
- **Do:** Document A1 (REST → dispatch → config-selected provider → envelope) and A2 (SDK isolation · stub default · Studio vendor-agnostic); pin Ontory `e63bb93`
- **Verify:** Ontory 34 PASS · boundary OK · Studio has no openai package
- **Done when:** ✅ DoD mapped · acceptance ACCEPTED · no runtime code in Task 7

### Task 8 — Closeout ✅ (administrative only)

- **Do:** release record · summary card · tag `org-memory-p2-b-complete` on Ontory `e63bb93` + ai-brain evidence `fe70ede`
- **Must not:** functional runtime / adapter / Studio code changes
- **Done when:** ✅ tags pushed · ADR-0008 Closed · acceptance CLOSED

---

## Rejection criteria

Abort if Task 1 pulls in SDK, HTTP, mappers, or Dispatcher changes.

**Owner approval:** ✅ P2-B CLOSED · OpenAI wave 1 complete.
