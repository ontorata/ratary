---
id: P0-A-IDENTITY-FOUNDATION
phase: 04-proof-of-platform
status: released
distribution: verified on origin
owner: Ontorata
workload: Engineering Governance
release_commit: 2a57647
release_tag: identity-foundation-p0-a-complete
forge_branch: forge/identity-foundation
merged_to: main
remote_main: 239f9d2
updated: 2026-07-08
---

# P0-A Identity Foundation — Release Record

| Field | Value |
|-------|-------|
| **Milestone** | Identity Foundation (P0-A) |
| **Engineering status** | ✅ COMPLETE · 🔒 LOCKED · CLOSED internally |
| **Distribution status** | ✅ **RELEASED** (verified on `origin`) |
| **Release commit** | `2a57647` — merge: identity foundation P0-A waves 1-5 |
| **Release tag** | `identity-foundation-p0-a-complete` → `2a57647` |
| **Remote main** | `239f9d2` (post-merge governance doc) |
| **Forge branch** | `forge/identity-foundation` (merged) |
| **Consumer proof** | Ontorata-Studio `af266a7` (separate repo) |

---

## Remote verification (2026-07-08)

Verified on `https://github.com/ontorata/ratary.git`:

| Ref | Expected | Remote |
|-----|----------|--------|
| `refs/tags/identity-foundation-p0-a-complete^{}` | `2a57647` | ✅ `2a57647a243e64e9656c696d3c429573582e31bd` |
| `refs/tags/identity-wave-3-locked` | immutable | ✅ `e96330b` |
| `refs/tags/identity-wave-4-locked` | immutable | ✅ `459f925` |
| `refs/tags/identity-wave-5-locked` | immutable | ✅ `e4a7c71` |
| `refs/heads/main` | contains merge | ✅ `239f9d2` |

Commands:

```bash
git ls-remote origin refs/tags/identity-foundation-p0-a-complete
git ls-remote origin "refs/tags/identity-wave-*"
```

Wave lock tags are **immutable** — do not move or force-update.

---

## Architectural boundary (locked)

```
Authentication
        ↓
Tenant Context
        ↓
Permission Evaluation
        ↓
Resource Access
```

Shared implementation: `src/auth/authorization-boundary.ts` (REST + MCP Remote)

---

## Wave chain

| Wave | Focus | Implementation | Governance | Lock tag |
|------|-------|----------------|------------|----------|
| 1 | Data Boundary | `215ce28` | — | — |
| 2 | Identity Context | `2080258` | — | — |
| 3 | Authorization | `ed3b65a` | `e96330b` | `identity-wave-3-locked` |
| 4 | Transport Parity | `b190da5` | `459f925` | `identity-wave-4-locked` |
| 5 | Studio E2E | `24b5511` | `e4a7c71` | `identity-wave-5-locked` |

**Governance checkpoints:**

- [WAVE-3-AUTHORIZATION.md](../waves/WAVE-3-AUTHORIZATION.md)
- [WAVE-4-TRANSPORT-PARITY.md](../waves/WAVE-4-TRANSPORT-PARITY.md)
- [WAVE-5-STUDIO-E2E.md](../waves/WAVE-5-STUDIO-E2E.md)

**Evidence package:** `.ai/reviews/identity-foundation/`

---

## Test evidence (pre-merge)

| Suite | Result | Command |
|-------|--------|---------|
| Identity | 56/56 ✅ | `npm run test:identity` |
| Studio E2E | 7/7 ✅ | `npm run test:e2e` |
| Full | 88/88 ✅ | `npm test` |

---

## Known non-goals (documented)

| Item | Status |
|------|--------|
| MCP stdio bootstrap (env-based owner/workspace) | Deferred |
| Permission / role UI in Studio | Out of scope Wave 5 |
| Per-tenant RBAC storage | Model-ready; storage future |

---

## Next phase

**P0-B — Engineering Governance** — opened after P0-A RELEASED ✅

| Gate | Status |
|------|--------|
| P0-A RELEASED on origin | ✅ |
| P0-B forge-intent approved | ✅ 2026-07-08 |
| P0-B forge-isolate | ✅ Active on `forge/engineering-governance` |

Intent: [engineering-governance-intent.md](../../designs/drafts/engineering-governance-intent.md)  
Release record: [P0-B-ENGINEERING-GOVERNANCE.md](./P0-B-ENGINEERING-GOVERNANCE.md)

---

## Related

- [identity-foundation-intent.md](../../designs/drafts/identity-foundation-intent.md)
- [acceptance-test.md](../../reviews/identity-foundation/acceptance-test.md)
- [studio-e2e-proof.md](../../reviews/identity-foundation/studio-e2e-proof.md)
- [FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md](../../phases/04-proof-of-platform/FIRST-WORKLOAD-ENGINEERING-GOVERNANCE.md)
