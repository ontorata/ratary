# P2-A Ontory Runtime Kernel — Forge Intent
**Status:** Draft — pending ADR-0007 acceptance
**Slug:** ontory-runtime-p2-a-intent
**Baseline:** `org-memory-p1-d-complete`
**Phase:** 04-proof-of-platform → Ontory product track
**Category:** Must Enable

---

## Problem

P1-D locked Studio’s runtime-neutral `AIExecutionRequest` and `WorkspaceAiRuntimePort`, but execution is still an echo stub. Without a dedicated Ontory kernel, pressure builds to put providers (or agents) inside Studio — collapsing the boundary just frozen.

Core question:

> Can Ontory execute `AIExecutionRequest` as a minimal dispatcher + provider adapter, returning a response envelope, without owning memory or requiring Studio to know Ontory internals?

---

## Constraints

1. Start from `org-memory-p1-d-complete` — do not mutate P1-C/P1-D frozen contracts without ADR.
2. ADR-0007 must be **Accepted** before isolate/code.
3. Obey [FROZEN-BOUNDARY-BYPASS-POLICY.md](../../core/constitution/FROZEN-BOUNDARY-BYPASS-POLICY.md).
4. Ontory must not import Ratary recall internals or query Ratary DB directly.
5. Studio must gain only a RuntimePort **adapter**, not Ontory domain types in UI.

---

## In scope (Ontory P0 / P2-A)

- Runtime dispatcher for `AIExecutionRequest`
- At least one provider adapter (stub → real provider may be gated)
- `AIExecutionResponse` envelope (text + metadata; streaming optional later wave)
- Studio adapter implementing `WorkspaceAiRuntimePort` → Ontory HTTP/RPC
- Boundary tests + evidence package

---

## Out of scope

- Autonomous agents / planning loops
- Tool marketplace / multi-agent
- Ontory memory store
- Ratary advanced intelligence
- Studio productization UX expansion

---

## Decision

Execute P2-A as **Ontory Runtime Kernel**, not Studio feature work and not Ratary deepening.

```text
Studio → WorkspaceAiRuntimePort → Ontory Dispatcher → Provider Adapter → Response
```

---

## Open questions (resolve at ADR acceptance)

1. Ontory host language/repo layout (empty `ontory` repo vs new service under monorepo)?
2. Transport: REST-only vs gRPC for RuntimePort?
3. First real provider vs keep provider as injectable stub for P2-A contract lock?

---

## Owner approval

- [ ] ADR-0007 Accepted
- [ ] This intent approved
- [ ] Open questions resolved or deferred with defaults

**Next after approval:** forge-isolate → blueprint → implement kernel only.
