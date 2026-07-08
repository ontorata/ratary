# Blueprint: ai-workspace-p1-d

| Field | Value |
|-------|-------|
| **Status** | Approved — W3 complete (W1–W2 accepted) |
| **Intent** | [ai-workspace-p1-d-intent.md](./ai-workspace-p1-d-intent.md) |
| **Isolate** | [ai-workspace-p1-d-isolate.md](./ai-workspace-p1-d-isolate.md) |
| **Implementation repo** | `Ontorata-Studio` |
| **Branch** | `forge/ai-workspace-p1-d` |
| **Ratary baseline** | `org-memory-p1-c-complete` @ `d1ddc1e` |

---

## Execution progress

- [x] Wave 1 — Workspace contracts and public interfaces (**ACCEPTED**)
  - [x] Task 1 — domain recall consumption contracts
  - [x] Task 2 — `WorkspaceRecallPort` application port
  - [x] Task 3 — SDK adapter (via `StudioRataryClient` only)
  - [x] Task 4 — dual import boundary guards (ESLint + CI script)
  - [x] Task 5 — unit tests + W1 boundary proof
- [x] Wave 2 — Session/workspace orchestration (**ACCEPTED**)
  - [x] Task 6 — immutable `WorkspaceContextPackage` + snapshot refs
  - [x] Task 7 — `WorkspaceSessionPort` + in-memory adapter
  - [x] Task 8 — `WorkspaceRecallOrchestrator` (recall-stateless)
  - [x] Task 9 — orchestrator tests + extended boundary guards
  - [x] Task 10 — W2 evidence proof stub
- [x] Wave 3 — ContextPackage consumption alignment
  - [x] Task 11 — `useWorkspaceRecallOrchestrator` hook
  - [x] Task 12 — read-only presentation helpers
  - [x] Task 13 — migrate WorkspaceAiPanel + OntoryChatPage off direct SDK context
  - [x] Task 14 — expand UI SDK/`buildContext` guards
  - [x] Task 15 — W3 evidence proof
- [ ] Wave 4 — AI interaction pipeline
- [ ] Wave 5 — Integration evaluation (smoke then extended)
- [ ] Wave 6 — Documentation and release closeout

---

## W1 scope lock

W1 introduces **contracts and ports only** — no UI wiring, no recall behavior changes in Ratary.

Dependency rule:

```text
application/recall → domain/recall types
infrastructure/ratary/workspace-recall-adapter → StudioRataryClient → @ratary/sdk
```

---

## Task breakdown (Wave 1)

## Task 1 — Domain recall consumption contracts

- **Repo:** Ontorata-Studio
- **Files:** `src/domain/recall/workspace-context-package.ts`
- **Do:** Define `WorkspaceContextRequest`, `WorkspaceContextItem`, `WorkspaceContextPackage` (consumer-facing, order-preserving, no ranking fields).
- **Verify:** `npm test -- tests/unit/workspace-context-package.test.ts`
- **Done when:** Types validate mapping inputs from SDK `BuildContextResult` without exposing recall internals.

## Task 2 — Application port

- **Files:** `src/application/recall/workspace-recall.port.ts`
- **Do:** Define `WorkspaceRecallPort.fetchContextPackage(request)`.
- **Verify:** Typecheck passes; port has no infrastructure imports.
- **Done when:** Port is the only application-layer recall entry point.

## Task 3 — SDK adapter

- **Files:** `src/infrastructure/ratary/workspace-recall-adapter.ts`, `src/infrastructure/ratary/map-sdk-context-result.ts`
- **Do:** Implement port using `StudioRataryClient.buildContext()`; map SDK result → `WorkspaceContextPackage`.
- **Verify:** `npm test -- tests/unit/workspace-recall-adapter.test.ts`
- **Done when:** Adapter never imports Ratary `src/` paths; only `@ratary/sdk` types via client.

## Task 4 — Dual import boundary guards

- **Files:** `eslint.config.js`, `scripts/check-recall-consumer-boundary.mjs`, `package.json` (`lint` script)
- **Do:** ESLint blocks recall-internal patterns; CI script verifies allowed adapter locations and forbidden import patterns.
- **Verify:** `npm run lint`
- **Done when:** Violations fail lint/CI with actionable messages.

## Task 5 — W1 evidence stub

- **Repo:** ai-brain (governance)
- **Files:** `.ai/reviews/org-memory-dogfood/workspace-recall-consumer-boundary-proof.md` (stub)
- **Do:** Document W1 boundary: Studio port → SDK only; P1-C untouched.
- **Verify:** `rg "WorkspaceRecallPort|@ratary/sdk" Ontorata-Studio/src`
- **Done when:** Evidence stub references W1 files and verification commands.

---

## Regression gates (every W1+ commit)

| Gate | Command | Repo |
|------|---------|------|
| Studio unit tests | `npm test` | Ontorata-Studio |
| Studio lint + boundary | `npm run lint` | Ontorata-Studio |
| P1-C recall eval | `npm run eval:recall-intelligence` | ratary |
| P1-C acceptance | `npm run ci:recall-intelligence-acceptance` | ratary |

---

## Dependencies

- Task 1 before Task 2–3
- Task 2 before Task 3
- Task 3 before Task 5
- Task 4 parallel with Task 1–3 after Task 2 port exists

**Owner approval:** ✅ W1 execute unlocked (intent D1–D4 locked).
