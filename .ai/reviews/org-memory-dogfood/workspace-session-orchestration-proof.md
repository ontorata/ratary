# P1-D W2 — Workspace Session Orchestration Proof

| Field | Value |
|-------|-------|
| **Milestone** | P1-D AI Workspace |
| **Wave** | W2 — Session/workspace orchestration |
| **Implementation repo** | `Ontorata-Studio` |
| **Status** | W2 boundary established |

---

## Principle

Session is **orchestration layer**, not recall cache or second implementation of retrieval/ranking.

```text
WorkspaceRecallOrchestrator
    ├── WorkspaceSessionPort (snapshot refs only)
    └── WorkspaceRecallPort (immutable ContextPackage)
```

Session stores `WorkspaceContextSnapshotRef` — not recall pipeline state.

---

## W2 artifacts (Studio)

| File | Role |
|------|------|
| `src/domain/session/workspace-session.ts` | Recall-stateless session model |
| `src/application/session/workspace-session.port.ts` | Session lifecycle port |
| `src/application/session/workspace-recall-orchestrator.ts` | Coordinates session + recall consumption |
| `src/infrastructure/session/in-memory-workspace-session-port.ts` | W2 session adapter |

---

## Invariants

1. `WorkspaceContextPackage` is deeply frozen at creation.
2. `WorkspaceRecallPort` remains minimal (`fetchContextPackage` only).
3. Session snapshots hold references (`packageId`, `query`, counts) — not mutable recall state.
4. No UI wiring in W2 (orchestration layer only).

---

## Verification

| Command | Expected |
|---------|----------|
| `npm test` | PASS (orchestrator + immutable package tests) |
| `npm run check:recall-boundary` | PASS |
| `npm run eval:recall-intelligence` | PASS (ratary · P1-C unchanged) |
