# P1-D W5 — Workspace AI Integration Evaluation Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-D AI Workspace |
| **Wave** | W5 — Integration evaluation (smoke) |
| **Implementation repo** | `Ontorata-Studio` |
| **Status** | Smoke suite green · extended corpus deferred |

---

## Evaluation focus (not model quality)

W5 proves the **pipeline path**, not LLM answers:

```text
Prompt
  → WorkspaceRecallOrchestrator
  → WorkspaceContextPackage
  → PromptAssembler
  → AIExecutionRequest
  → WorkspaceAiRuntimePort
```

No production model provider. Echo / mock runtimes only.

---

## Smoke scenarios (5)

| ID | Focus | Assertion |
|----|-------|-----------|
| `s1-empty-context` | Workspace baru tanpa context | `AIExecutionRequest` remains well-formed; 0 sources |
| `s2-single-context` | Context package tunggal | source order preserved into runtime |
| `s3-multi-source` | Multiple sources | 3 labels ordered; no reorder |
| `s4-session-resume` | Session resume | snapshot count=2; prior query retained |
| `s5-boundary` | Boundary violation attempt | runtime payload has no recall internals |

Fixture: `tests/fixtures/workspace-ai-smoke-fixture.ts`  
Harness: `tests/integration/workspace-ai-pipeline-smoke.test.ts`  
Command: `npm run eval:workspace-ai-smoke`

---

## Future Runtime Compatibility (locked from W4)

`AIExecutionRequest` is runtime-neutral. The workspace layer **MUST NOT** depend on model provider, agent framework, or Ontory implementation details.

Forbidden Studio shapes: `executeWithOntory()`, `callAgent()`, provider-specific UI/pipeline APIs.

---

## Verification

| Command | Result |
|---------|--------|
| `npm run eval:workspace-ai-smoke` | PASS |
| `npm test` | PASS (45) |
| `npm run check:recall-boundary` | PASS |
| `npm run eval:recall-intelligence` (ratary) | PASS — P1-C regression |

---

## Extended corpus (next increment)

After smoke stays green:

- larger project context packages
- multiple workspace IDs in one run
- longer session lifecycle chains
- keep P1-C `eval:recall-intelligence` as permanent regression gate

---

## Next

W6 — documentation + release closeout (`org-memory-p1-d-complete`).
