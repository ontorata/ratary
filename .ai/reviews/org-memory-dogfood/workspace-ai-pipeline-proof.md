# P1-D W4 — AI Interaction Pipeline Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-D AI Workspace |
| **Wave** | W4 — AI interaction pipeline |
| **Implementation repo** | `Ontorata-Studio` |
| **Status** | ✅ **ACCEPTED** (approved with minor design strengthen 2026-07-08) |

---

## Pipeline

```text
User Prompt
      │
      ▼
WorkspaceRecallOrchestrator
      │
      ▼
WorkspaceContextPackage
      │
      ▼
PromptAssembler          ← formatting only
      │
      ▼
AIExecutionRequest       ← identity / scope / tools (not in prompt string)
      │
      ▼
WorkspaceAiRuntimePort   ← neutral abstraction
      │
      ├── Echo stub (W4)
      ├── OpenAI / Anthropic / Local (future)
      └── Ontory Runtime Adapter (future)
```

---

## Explicit invariants

**PromptAssembler MUST accept:** `WorkspaceContextPackage`

**PromptAssembler MUST NOT accept:** recall-policy / decision types, candidate arrays, provider results, SDK result types

**WorkspaceAiRuntimePort MUST accept:** `AIExecutionRequest`

**WorkspaceAiRuntimePort MUST NOT accept:** ContextPackage assembly internals or recall-domain decision types

---

## Design strengthen (pre-commit)

1. Keep `WorkspaceAiRuntimePort` as the only LLM seam (no vendor lock-in).
2. Name stays Studio-neutral enough for future Ontory adapters.
3. Add `AIExecutionRequest` so identity/workspace/tools stay outside prompt text.
4. Echo stub only — real providers deferred (e.g. P1-E).
5. Boundary guard strips comments before matching (docs must not false-positive).

---

## Verification

| Command | Expected |
|---------|----------|
| `npm test` | PASS |
| `npm run check:recall-boundary` | PASS |
| `npm run eval:recall-intelligence` | PASS (ratary · P1-C untouched) |

---

## Explicit non-goals for W4

- No production LLM provider wiring
- No Ontory Builder Runtime implementation
- No tool execution engine

W4 ensures Studio does **not** block a future Ontory runtime — it does not build Ontory yet.

---

## Future Runtime Compatibility

`AIExecutionRequest` is **runtime-neutral**.

The workspace layer **MUST NOT** depend on:

- a concrete model provider,
- an agent framework,
- Ontory implementation details.

Forbidden Studio surface shapes (illustrative):

- `executeWithOntory()`
- `callAgent()`
- provider-specific parameter bags on UI/pipeline ports

Allowed evolution:

```text
AIExecutionRequest
        │
        ├── Ontory Runtime Adapter (future)
        ├── OpenAI Adapter (future)
        ├── Claude Adapter (future)
        └── Local Model Adapter (future)
```

Studio says: *“here is an AI task with context and prompt.”*  
Studio does **not** say: *“call model X with parameter Y.”*

---

## Next

W5 — integration evaluation (smoke 3–5 scenarios, then extended corpus). Focus: pipeline path — not model quality.
