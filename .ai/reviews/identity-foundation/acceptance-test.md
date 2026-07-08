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
| I1 | Identity present | Protected path without auth → 401 | ✅ Wave 5 E2E |
| I2 | Owner resolved | `AuthUser.ownerId` on authenticated paths | ✅ Wave 2/5 |
| I3 | Organization resolved | `MemoryScope.organizationId` set | ✅ Wave 2/5 |
| I4 | Workspace resolved | `MemoryScope.workspaceId` set | ✅ Wave 2/5 |
| I5 | Permissions enforced | `permission-enforcement.test.ts` | ✅ Wave 3 |
| I6 | Studio session path | `studio-identity-e2e.test.ts` + [studio-e2e-proof.md](./studio-e2e-proof.md) | ✅ Wave 5 |

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
| Memory | ✅ Wave 5 E2E | ✅ |
| Search | ✅ Wave 5 E2E | ✅ |
| Metrics | ⬜ | ⬜ |

## Test commands

```bash
npm test -- organization-isolation
npm test -- workspace-boundary
npm run test:identity
npm run test:e2e
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
**Wave 5 Studio E2E:** ✅ PASS (7 E2E + 4 Studio unit) — checkpoint [WAVE-5-STUDIO-E2E.md](../../governance/waves/WAVE-5-STUDIO-E2E.md)  
**Overall P0-A:** ✅ **COMPLETE**
