# P2-A Ontory Runtime Kernel — Forge Intent
**Status:** Approved — ready for isolate/blueprint (ADR-0007 Accepted)
**Slug:** ontory-runtime-p2-a-intent
**Baseline:** `org-memory-p1-d-complete`
**Branch (proposed):** `forge/ontory-runtime-p2-a` (in `ontory` repo) + Studio adapter branch
**Phase:** 04-proof-of-platform → Ontory product track
**Category:** Must Enable
**ADR:** [ADR-0007](../../core/architecture/ADR-0007-ontory-runtime-kernel-boundary.md) **Accepted**

---

## Problem

P1-D locked Studio’s runtime-neutral `AIExecutionRequest` and `WorkspaceAiRuntimePort`, but execution is still an echo stub. Without a dedicated Ontory kernel, pressure builds to put providers (or agents) inside Studio — collapsing the boundary just frozen.

Core question:

> Can Ontory execute `AIExecutionRequest` as a minimal dispatcher + stub provider + REST adapter, returning a frozen response envelope, without owning memory or requiring Studio to know Ontory internals?

---

## Locked decisions (from ADR-0007)

| ID | Decision |
|----|----------|
| D1 | Separate **`ontory`** repository (Runtime Platform ownership) |
| D2 | **REST first**; transport is **not** part of the runtime contract |
| D3 | **Stub injectable** before any vendor SDK adapter |
| D4 | Runtime is **stateless** (request/execution/streaming scope only) |

---

## Constraints

1. Start from `org-memory-p1-d-complete` — do not mutate P1-C/P1-D frozen contracts without ADR.
2. Obey [FROZEN-BOUNDARY-BYPASS-POLICY.md](../../core/constitution/FROZEN-BOUNDARY-BYPASS-POLICY.md).
3. Ontory must not import Ratary recall internals or query Ratary DB.
4. Ontory must not depend on Studio.
5. Studio must gain only a RuntimePort **adapter** (REST client), not Ontory domain types in UI.
6. Provider SDKs may exist only behind Ontory provider adapters — never leak into Studio.

---

## In scope (Ontory P0 / P2-A)

- Immutable `AIExecutionRequest` at boundary
- Runtime dispatcher
- Provider abstraction + **StubRuntimeProvider**
- Frozen `AIExecutionResponse` envelope
- REST transport adapter
- Studio `WorkspaceAiRuntimePort` → Ontory REST adapter
- Boundary tests + evidence package
- Stateless execution lifecycle (dispose after response)

---

## Out of scope

- Autonomous agents / planning loops
- Tool execution / marketplace / multi-agent
- Ontory memory store / recall / knowledge store
- OpenAI (or other) adapter until stub contract is green
- Ratary advanced intelligence
- Studio productization UX expansion
- gRPC / queue transports (later adapters under same port)

---

## Decision

Execute P2-A as **Ontory Runtime Kernel** in repo `ontory`:

```text
Studio → WorkspaceAiRuntimePort → REST → Ontory Dispatcher → StubProvider → AIExecutionResponse
```

Then (post DoD): vendor adapters behind the same provider interface.

---

## Definition of Done

See ADR-0007 DoD checklist. Smoke path must prove:

```text
AIExecutionRequest → Dispatcher → StubProvider → AIExecutionResponse
```

with no Ratary/Studio/provider-SDK leakage.

---

## Owner approval

- [x] ADR-0007 Accepted
- [x] Problem and D1–D4 locked
- [x] Open questions resolved
- [x] This intent approved

**Next:** forge-isolate (`ontory` bootstrap + Studio adapter branch) → blueprint → implement kernel only.
