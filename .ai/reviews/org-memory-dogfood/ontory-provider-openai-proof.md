# Evidence Pack — P2-B Ontory Provider Integration (OpenAI First)

| Field | Value |
|-------|-------|
| **Milestone** | P2-B Provider Integration (wave 1 · OpenAI) |
| **ADR** | ADR-0008 **Accepted** |
| **Date** | 2026-07-08 |
| **Nature** | Governance / boundary verification — **no runtime behavior changes** |
| **Status** | ✅ COMPLETE (Tasks 1–6 verified · A1/A2 documented) |
| **Baseline prior** | `org-memory-p2-a-complete` (Runtime Kernel) |
| **Ontory branch** | `forge/ontory-provider-p2-b` @ `e63bb93` |

---

## Clarification of milestone naming

| Tag / ADR | Meaning |
|-----------|---------|
| **P2-A** / ADR-0007 / `org-memory-p2-a-complete` | Runtime Kernel (Dispatcher · stub · REST · Studio RuntimePort) — **already CLOSED** |
| **P2-B** / ADR-0008 | Provider Integration — OpenAI thin adapter behind `ProviderRuntime` (this pack) |

Owner blueprint Tasks 1–7 in this pack refer to **P2-B** execute waves (contract → mappers → adapter → config → REST → evidence).

---

## Commit pins (Ontory `forge/ontory-provider-p2-b`)

| Task | Commit | Concern |
|------|--------|---------|
| 1 | `ac5aa19` | `ProviderError` contract |
| 2 | `e55d858` | RequestMapper (pure) |
| 3 | `7db112e` | ResponseMapper + ErrorMapper (pure) |
| 4 | `6e9393c` | Thin `OpenAIProviderAdapter` + official SDK |
| 5 | `9bbe74b` | Config defaults + provider factory |
| 6 | `e63bb93` | REST composition (default stub) |

Studio / Kernel contracts: **unchanged** for P2-B DoD (`043666e` path still RuntimePort → REST).

---

## Architecture as implemented

```text
HTTP Request
     │
     ▼
REST Adapter
     │
     ▼
RuntimeDispatcher
     │
     ▼
ProviderRuntime
     │
     ├── Stub Provider (default · ONTORY_PROVIDER unset|stub)
     │
     └── OpenAI Provider (ONTORY_PROVIDER=openai + OPENAI_API_KEY)
             │
             ▼
        RequestMapper
             │
             ▼
        OpenAI SDK (adapters/openai only)
             │
             ▼
        ResponseMapper
             │
             ▼
        AIExecutionResponse
```

Error path: SDK/failure facts → ErrorMapper → `ProviderError`.

Composition root:

```text
Environment → resolveOntoryProviderConfig → createProviderFromConfig → ProviderRuntime → Dispatcher → REST
```

---

## A1 — Provider execution evidence

| Claim | Evidence |
|-------|----------|
| Request enters via REST | `tests/adapters/rest-adapter.test.ts` — `POST /v1/execute` returns `AIExecutionResponse` |
| Runtime dispatch runs | `tests/runtime/dispatcher.test.ts` · adapter-behind-dispatcher case in `openai-provider-adapter.test.ts` |
| Provider selected by config | `tests/config/provider-config.test.ts` — stub default · openai wires `OpenAIProviderAdapter` · missing key → `ProviderError(configuration)` |
| Default startup uses stub | `rest-adapter.test.ts` — “default composition uses stub provider” with `ONTORY_PROVIDER` unset |
| Response envelope consistent | Frozen `AIExecutionResponse` (`text`, `provider`, `requestId`, `finishedAt`, optional `usage`) from stub and mocked OpenAI paths |
| OpenAI path (mocked) | `openai-provider-adapter.test.ts` — RequestMapper → client → ResponseMapper; 401 → ErrorMapper → `unauthorized` |

Live OpenAI smoke: **optional / local secrets only** — not required for CI DoD (ADR-0008).

---

## A2 — Boundary evidence

| Claim | Evidence |
|-------|----------|
| Dispatcher does not import SDK | `src/runtime/dispatcher.ts` — no `openai`; boundary script bans OpenAI payloads in dispatcher |
| Runtime contracts do not import OpenAI | `src/runtime/**` has no `from 'openai'` |
| SDK only under allowlist | `import OpenAI from 'openai'` only in `src/adapters/openai/openai-client.ts`; `check-runtime-boundary.mjs` allows openai imports **only** under `src/adapters/openai/**` |
| Default remains stub | Config default `ONTORY_PROVIDER=stub`; REST `defaultRuntime()` uses config |
| OpenAI only via configuration path | `createProviderFromConfig` + env; Studio does not select vendor |
| SDK types do not cross `ProviderRuntime` | Port methods use `AIExecutionRequest` / `AIExecutionResponse` / throw `ProviderError`; `asOpenAIChatClient` adapts SDK → thin `OpenAIChatClient` |
| Studio vendor-agnostic (ADR A1) | Studio `src/` grep: no `openai` package, no `OpenAIProviderAdapter`, no hardcoded `gpt-4o` routing |
| Studio path unchanged | Still `WorkspaceAiRuntimePort` → REST (P2-A); no Studio code changes in P2-B Tasks 1–6 |

---

## Gate table (Ontory @ `e63bb93` · 2026-07-08)

| Command | Result |
|---------|--------|
| `npm test` | ✅ 7 files / **34** tests |
| `npm run check:boundary` | ✅ |
| `npm run typecheck` | ✅ |

---

## ADR-0008 DoD map

| DoD item | Status |
|----------|--------|
| ADR Accepted | ✅ |
| `OpenAIProviderAdapter` behind `ProviderRuntime` | ✅ |
| Dispatcher injects OpenAI **or** stub via Ontory config | ✅ |
| Request/response/error mapping tested | ✅ |
| Studio path unchanged · no vendor SDK in Studio | ✅ |
| A1 Studio vendor-agnostic | ✅ |
| A2 no SDK types outside adapter / boundary CI | ✅ |
| Evidence pack + acceptance | ✅ this pack + [P2-B-ACCEPTANCE.md](./P2-B-ACCEPTANCE.md) |

---

## Explicit non-goals preserved

Streaming · tools · MCP · memory · recall · agents · Anthropic/Gemini adapters · dynamic registry · retry orchestration · Studio contract changes.

---

## Next

Task 8 — closeout tag (e.g. `org-memory-p2-b-complete`) when owner accepts this pack.
