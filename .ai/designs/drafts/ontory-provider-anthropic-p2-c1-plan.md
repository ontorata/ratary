# Blueprint: ontory-provider-anthropic-p2-c1

| Field | Value |
|-------|-------|
| **Status** | ✅ Approved — ready for isolate |
| **Intent** | [ontory-provider-anthropic-p2-c1-intent.md](./ontory-provider-anthropic-p2-c1-intent.md) |
| **ADR** | ADR-0010 (proposed) · ADR-0009 contract frozen |
| **Repo** | `ontory` · branch `forge/ontory-provider-anthropic-p2-c1` |
| **Baseline** | `org-memory-p2-c0-complete` @ `8e307ce` |

---

## Harness compliance rule (non-negotiable)

> Anthropic **plugs into** the P2-C.0 Provider Contract. The conformance harness **validates** the adapter; it does **not** change for Anthropic.

| Allowed | Forbidden |
|---------|-----------|
| Add `tests/conformance/anthropic.conformance.test.ts` | Edit scenario IDs or MUST/OPTIONAL matrix |
| Add Anthropic scenario runners under `tests/conformance/scenarios/` | Change `contract.md` semantics |
| Add `results/anthropic-pass.md` at closeout | Modify OpenAI/stub conformance expectations to “fit” Anthropic |
| Re-run full `npm run test:conformance` (all subjects) | Kernel / `ProviderRuntime` changes for convenience |

Regression gate: **OpenAI + stub conformance MUST stay PASS** throughout P2-C.1.

---

## Locked flow (end state)

```text
AIExecutionRequest → ProviderRuntime → AnthropicProviderAdapter → AIExecutionResponse
```

Config selects: `stub` (default) | `openai` | `anthropic`.

---

## Execution tasks

- [ ] Task 0 — forge-isolate from `org-memory-p2-c0-complete` · baseline tests green
- [ ] Task 1 — ADR-0010 Proposed (governance) · intent approved
- [ ] Task 2 — RequestMapper (pure) · `mapAIExecutionRequestToAnthropicMessagesParams`
- [ ] Task 3 — ResponseMapper + ErrorMapper (pure)
- [ ] Task 4 — `AnthropicProviderAdapter` + client factory (thin · injected client)
- [ ] Task 5 — Config: `anthropic` provider · env resolution · `createProviderFromConfig` wire
- [ ] Task 6 — REST composition (config-only · stub default preserved)
- [ ] Task 7 — Unit tests (mocked SDK · no live network in CI)
- [ ] Task 8 — **Conformance subject** `anthropic.conformance.test.ts` — all MUST scenarios PASS
- [ ] Task 9 — Boundary CI: allow `@anthropic-ai/sdk` under `adapters/anthropic/` only
- [ ] Task 10 — Evidence A1/A2 + `anthropic-pass.md` + P2-C.1 acceptance
- [ ] Task 11 — Closeout tag `org-memory-p2-c1-complete`

---

## Task 2 — RequestMapper

- **Files:** `src/adapters/anthropic/request-mapper.ts` · `tests/adapters/anthropic-request-mapper.test.ts`
- **Do:** Pure map `AIExecutionRequest` + explicit `model` → Messages API create params (adapter-local types)
- **Must not:** SDK import · env · network · Dispatcher knowledge
- **Verify:** `npm test` focused file PASS

## Task 3 — ResponseMapper / ErrorMapper

- **Files:** `response-mapper.ts` · `error-mapper.ts` · tests
- **Do:** Message response → `AIExecutionResponse`; vendor failures → `ProviderError` codes per contract
- **Map:** 401/403→unauthorized · 429→rate_limited · timeout/abort→timeout · 400→bad_request · else provider_error
- **Verify:** mapper tests PASS · no SDK in mappers

## Task 4 — AnthropicProviderAdapter

- **Files:** `anthropic-provider-adapter.ts` · `anthropic-client.ts` · `index.ts`
- **Do:** Compose mappers + injected client; `name = 'anthropic'`
- **Verify:** adapter tests PASS · SDK only in anthropic folder

## Task 5 — Configuration

- **Files:** `src/config/provider-config.ts` · `tests/config/provider-config.test.ts`
- **Env:** `ONTORY_PROVIDER=anthropic` · `ANTHROPIC_API_KEY` · `ANTHROPIC_MODEL` (default per intent)
- **Do:** Missing key → `ProviderError(configuration)`
- **Verify:** config tests PASS · stub default unchanged

## Task 8 — Conformance (gate)

- **Files:** `tests/conformance/anthropic.conformance.test.ts` · optional `scenarios/c-req-anthropic.ts` etc.
- **Scenarios (MUST):** C-REQ · C-RES · C-ERR · C-TMO · C-META · C-CFG · C-RTY
- **Scenarios (SKIP):** C-CAN (deferred P2-D)
- **Verify:**

```bash
npm run test:conformance   # stub + openai + anthropic — all MUST PASS
npm test                 # full suite
npm run typecheck
npm run check:boundary
```

---

## Evidence pack (Task 10)

| Artifact | Path |
|----------|------|
| Proof | `.ai/reviews/org-memory-dogfood/ontory-provider-anthropic-proof.md` |
| Acceptance | `.ai/reviews/org-memory-dogfood/P2-C-1-ACCEPTANCE.md` |
| Conformance | `.ai/governance/provider-conformance/results/anthropic-pass.md` |
| Release | `.ai/governance/releases/P2-C-1-ONTORY-PROVIDER-ANTHROPIC.md` |
| ADR extension | ADR-0009 extension note (Anthropic subject registered — not P2-C.0 revision) |

---

## Forge inspect checklist (per task)

- [ ] Spec match to task scope
- [ ] No `src/runtime` contract drift
- [ ] No Studio touch
- [ ] Conformance regression green
- [ ] Single-intent commit
