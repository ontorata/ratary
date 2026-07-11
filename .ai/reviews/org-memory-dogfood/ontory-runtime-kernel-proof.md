# Evidence Pack — P2-A Ontory Runtime Kernel

| Field | Value |
|-------|-------|
| **Milestone** | P2-A Ontory Runtime Kernel |
| **ADR** | ADR-0007 **Accepted** |
| **Date** | 2026-07-08 |
| **Nature** | Governance only — **no runtime behavior changes** in this pack |
| **Status** | ✅ COMPLETE (engineering + architecture gates validated) |

---

## Commit pins (immutable for this evidence)

| Repo | Branch | HEAD | Message |
|------|--------|------|---------|
| **ontory** | `forge/ontory-runtime-p2-a` | `c18cacc` | bootstrap P2-A kernel (stub + REST) |
| **Ontorata-Studio** | `forge/ai-workspace-p1-d` | `043666e` | integrate Ontory via REST RuntimePort |
| **ai-brain** (governance) | `forge/ai-workspace-p1-d` | `cfbf43e`+ | Task 7 evidence · this pack |

Baseline prior: `org-memory-p1-d-complete`.

---

## Actual architecture (as implemented)

```text
Studio
    │
WorkspaceAiRuntimePort
    │
    ▼
REST Client (OntoryRestWorkspaceAiRuntime)
    │
HTTP  POST /v1/execute · GET /health
    ▼
Ontory REST Adapter
    │
    ▼
Runtime Dispatcher  (validate · coordinate · envelope — no vendor logic)
    │
    ▼
ProviderRuntime port
    │
    ▼
StubRuntimeProvider
    │
    ▼
AIExecutionResponse
```

**No vendor adapters present.** Echo in Studio is env-gated fallback only (`VITE_ONTORY_RUNTIME=echo`).

---

## ADR-0007 DoD → implementation map

| DoD item | Status | Trace |
|----------|--------|-------|
| Decision locked in ADR | ✅ | ADR-0007 Accepted 2026-07-08 |
| `AIExecutionRequest` immutable at Ontory boundary | ✅ | `ontory/src/runtime/contracts/ai-execution-request.ts` · `Object.freeze` after Zod parse |
| Dispatcher implemented | ✅ | `ontory/src/runtime/dispatcher.ts` |
| `WorkspaceAiRuntimePort` stable (Studio ↔ Ontory) | ✅ | Studio port + `OntoryRestWorkspaceAiRuntime` |
| Stub provider end-to-end | ✅ | `StubRuntimeProvider` · REST /v1/execute · Studio REST client tests |
| `AIExecutionResponse` envelope frozen | ✅ | `ontory/src/runtime/contracts/ai-execution-response.ts` |
| REST adapter available | ✅ | `ontory/src/adapters/rest/server.ts` |
| No provider SDK in Studio UI/domain | ✅ | Studio vendor-token grep clean · boundary scripts |
| No Ratary dependency from Ontory | ✅ | `package.json` deps = `zod` only · boundary script |
| No Studio dependency from Ontory | ✅ | no Studio package imports |
| All execution enters via RuntimePort | ✅ | Default pipeline → REST port; no direct Dispatcher from Studio |

---

## D1–D4 traceability matrix

| Decision | Meaning | Evidence |
|----------|---------|----------|
| **D1** Separate `ontory` repo | Ownership: Ratary · Ontory · Studio | Repo `https://github.com/ontorata/ontory` · `@ontorata/ontory` |
| **D2** Transport ≠ contract | REST adapter; port is contract | Studio domain types unchanged; HTTP only in infra adapter |
| **D3** Stub before vendor SDK | Contract first | Only `StubRuntimeProvider`; no openai/anthropic/gemini deps |
| **D4** Stateless runtime | Request/execution scope only | Dispatcher holds no conversation/workspace store; comment + constructor fields = provider + clock + id factory |

---

## Boundary verification (commands · 2026-07-08)

### Ontory @ `c18cacc`

| Command | Result |
|---------|--------|
| `npm test` | ✅ 2 files / **4** tests |
| `npm run check:boundary` | ✅ `ontory runtime boundary OK` |
| `npm run typecheck` | ✅ |

### Studio @ `043666e`

| Command | Result |
|---------|--------|
| `npm test` | ✅ 18 files / **48** tests |
| `npm run check:boundaries` | ✅ SDK + recall consumer OK |

### Static isolation checks

| Check | Result |
|-------|--------|
| Studio `src/` import `@ontorata/ontory` / in-process Dispatcher | ✅ none (enforced by `check-sdk-boundary.mjs`) |
| Ontory deps on Ratary / Studio / vendor SDKs | ✅ none (`zod` only) |
| Studio production path default = REST | ✅ `useWorkspaceAiPipeline` → `OntoryRestWorkspaceAiRuntime` |
| Vendor AI packages in Ontory | ✅ forbidden by `check-runtime-boundary.mjs` |

Supporting proof: [ontory-runtime-studio-rest-adapter-proof.md](./ontory-runtime-studio-rest-adapter-proof.md) · [ontory-runtime-boundary-verification.md](./ontory-runtime-boundary-verification.md)

---

## Explicit non-goals preserved (P2-A)

OpenAI · Anthropic · Gemini · provider registry · tool execution · MCP · memory · recall · agent orchestration · workflow orchestration · streaming optimization · API contract changes in Task 8 · new behavior-altering tests in Task 8.

---

## Runtime readiness (for P2-B provider phase)

| Ready | Item |
|-------|------|
| ✅ | Separate Ontory kernel with Dispatcher + ProviderRuntime port |
| ✅ | Frozen request/response envelopes |
| ✅ | REST transport validated |
| ✅ | Studio consumes RuntimePort only |
| ✅ | Stub proves E2E without shaping contract to a vendor |
| ⏭ | Real provider adapter(s) — **P2-B** |
| ⏭ | Workload validation against live model — **P2-B** |
| ⏭ | Studio productization on frozen ports — **P2-C** |

---

## Pack index

| Artifact | Path |
|----------|------|
| This evidence pack | `.ai/reviews/org-memory-dogfood/ontory-runtime-kernel-proof.md` |
| Acceptance manifest | `.ai/reviews/org-memory-dogfood/P2-A-ACCEPTANCE.md` |
| Boundary verification | `.ai/reviews/org-memory-dogfood/ontory-runtime-boundary-verification.md` |
| Task 7 REST proof | `.ai/reviews/org-memory-dogfood/ontory-runtime-studio-rest-adapter-proof.md` |
| Isolate record | `.ai/designs/drafts/ontory-runtime-p2-a-isolate.md` |
| Blueprint | `.ai/designs/drafts/ontory-runtime-p2-a-plan.md` |
| ADR | `.ai/core/architecture/ADR-0007-ontory-runtime-kernel-boundary.md` |
