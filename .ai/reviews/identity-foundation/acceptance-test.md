# Acceptance Test — Identity Foundation

| Field | Value |
|-------|-------|
| **Milestone** | Identity Foundation (P0-A) |
| **Intent** | [identity-foundation-intent.md](../../designs/drafts/identity-foundation-intent.md) |

## Organization (O1–O3)

| ID | Criterion | Test | Pass |
|----|-----------|------|------|
| O1 | Organization can be created | `organization-isolation.test.ts` | ✅ Wave 1 |
| O2 | Organization has owner | `organization-isolation.test.ts` | ✅ Wave 1 |
| O3 | Org resolvable from request | `auth-context.integration.test.ts` | ✅ Wave 2 |
| I2 | Owner resolved | `AuthUser.ownerId` on authenticated paths | ✅ Wave 2 |
| I3 | Organization resolved | `MemoryScope.organizationId` from tenant middleware | ✅ Wave 2 |
| I4 | Workspace resolved | `MemoryScope.workspaceId` from tenant middleware | ✅ Wave 2 |

## Workspace (W1–W3)

| ID | Criterion | Test | Pass |
|----|-----------|------|------|
| W1 | Workspace under organization | `workspace-boundary.test.ts` | ✅ Wave 1 |
| W2 | Multi-workspace validated | `workspace-boundary.test.ts` | ✅ Wave 1 |
| W3 | Default workspace bound to org | `workspace-boundary.test.ts` | ✅ Wave 1 |

## Identity (I1–I6)

| ID | Criterion | Test | Pass |
|----|-----------|------|------|
| I1 | Identity present | Protected path without auth → 401 | ⬜ |
| I2 | Owner resolved | `AuthUser.ownerId` on authenticated paths | ⬜ |
| I3 | Organization resolved | `MemoryScope.organizationId` set | ⬜ |
| I4 | Workspace resolved | `MemoryScope.workspaceId` set | ⬜ |
| I5 | Permissions enforced | `permission-enforcement.test.ts` | ✅ Wave 3 |
| I6 | Studio session path | Studio → Auth → Ratary documented + tested | ⬜ |

## Authorization — same context

| Surface | Read | Write | Search | Pass |
|---------|------|-------|--------|------|
| REST | ✅ Wave 4 | ✅ Wave 4 | ✅ Wave 4 | ✅ |
| MCP | ✅ Wave 4 | ✅ Wave 4 | ✅ Wave 4 | ✅ |
| Memory | ✅ Wave 3 | ✅ Wave 3 | — | ✅ |

## Tenant isolation

| Vector | Org A cannot see Org B | Pass |
|--------|------------------------|------|
| REST | ✅ Wave 4 | ✅ |
| MCP | ✅ Wave 4 | ✅ |
| Memory | ⬜ | ⬜ |
| Search | ⬜ | ⬜ |
| Metrics | ⬜ | ⬜ |

## Test commands

```bash
npm test -- organization-isolation
npm test -- workspace-boundary
npm run test:identity
```

## Wave 1 result (2026-07-08)

| Suite | Tests | Pass |
|-------|-------|------|
| organization-isolation | 7 | ✅ |
| workspace-boundary | 7 | ✅ |

**Wave 1 data boundary:** ✅ PASS (14 tests)  
**Wave 2 identity context:** ✅ PASS (10 tests)  
**Wave 3 authorization boundary:** ✅ PASS (11 tests) — checkpoint [WAVE-3-AUTHORIZATION.md](../../governance/waves/WAVE-3-AUTHORIZATION.md)  
**Wave 4 transport parity:** ✅ PASS (14 tests) — checkpoint [WAVE-4-TRANSPORT-PARITY.md](../../governance/waves/WAVE-4-TRANSPORT-PARITY.md)  
**Overall P0-A:** ⬜ IN PROGRESS (wave 5 pending)
