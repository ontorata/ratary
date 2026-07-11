# Boundary Verification Report — P2-A Ontory Runtime Kernel

| Field | Value |
|-------|-------|
| **Date** | 2026-07-08 |
| **Milestone** | P2-A |
| **Purpose** | Prove frozen boundaries without changing runtime behavior |
| **Status** | ✅ PASS |

---

## Required path

```text
Studio → WorkspaceAiRuntimePort → REST → Ontory → Dispatcher → ProviderRuntime → Stub → Response
```

Forbidden shortcuts reviewed and **absent**:

| Bypass | Result |
|--------|--------|
| Studio → provider SDK | ✅ absent |
| Studio → Ontory packages / Dispatcher in-process | ✅ absent (CI) |
| Ontory → Ratary DB / recall | ✅ absent |
| Ontory → Studio | ✅ absent |
| Vendor adapters in P2-A | ✅ absent |

---

## Ontory (`c18cacc`)

### Dependency surface

`package.json` production deps: **`zod` only**.  
No `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`, `@ratary/sdk`, Studio packages.

### Boundary script

`scripts/check-runtime-boundary.mjs` — **PASS** (`npm run check:boundary`).

Enforces: no vendor SDK imports · no Ratary SDK · no provider payload symbols in **dispatcher**.

### Layout

```text
src/runtime/          contracts · dispatcher · ports
src/adapters/rest/    HTTP only
src/adapters/stub-provider/
```

---

## Studio (`043666e`)

### RuntimePort client

| File | Role |
|------|------|
| `src/application/ai/workspace-ai-runtime.port.ts` | Port contract |
| `src/infrastructure/ai/ontory-rest-workspace-ai-runtime.ts` | HTTP client (allowlisted `fetch`) |
| `src/hooks/useWorkspaceAiPipeline.ts` | Default = REST; Echo iff `VITE_ONTORY_RUNTIME=echo` |

### Boundary script

`scripts/check-sdk-boundary.mjs` — **PASS**.

Allowlisted `fetch` adapters only (Ratary client · auth adapter · Ontory REST).  
Forbids `@ontorata/ontory` imports and `new RuntimeDispatcher` / `new StubRuntimeProvider` in Studio.

`check-recall-consumer-boundary.mjs` — **PASS** (P1-C/D recall boundary unchanged).

### Vendor / Dispatcher grep (src)

No production imports of OpenAI/Anthropic/Gemini SDKs.  
Vendor names appear only in **comments** describing future adapters (not executable coupling).

---

## Gate table

| Gate | Ontory | Studio |
|------|--------|--------|
| Unit / contract tests | 4 PASS | 48 PASS |
| Boundary CI | PASS | PASS |
| Typecheck | PASS | PASS (prior session) |

---

## Conclusion

Boundaries matching ADR-0007 and FROZEN-BOUNDARY-BYPASS-POLICY hold at the pinned commits. Task 8 introduces **no** API, dispatcher, or adapter behavior changes — verification only.
