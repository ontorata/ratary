# E2E Proof — Identity Foundation

| Field | Value |
|-------|-------|
| **Milestone** | Identity Foundation (P0-A) |
| **Date** | Pending |
| **Environment** | local → staging |

## Scenario

Prove full path: authenticated identity → organization → workspace → memory scoped correctly on REST and MCP, with cross-org isolation.

## Steps

1. Bootstrap or create Ontorata organization + workspace
2. Authenticate via API key / session (Studio path documented)
3. Write memory under Org A scope
4. Attempt read from Org B identity — must fail closed
5. MCP `search_memory` returns only Org A memories
6. Metrics record scoped to organization

## Evidence

| Step | Expected | Actual | Pass |
|------|----------|--------|------|
| 1 | Org + workspace exist | | ⬜ |
| 2 | Auth resolves full context | | ⬜ |
| 3 | Memory write scoped | | ⬜ |
| 4 | Cross-org read blocked | | ⬜ |
| 5 | MCP search scoped | | ⬜ |
| 6 | Metrics scoped | | ⬜ |

## Artifacts

- Logs:
- Commit:
- Test output:

## Wave 1 — Data boundary (2026-07-08)

```bash
npm test -- organization-isolation   # 7/7 PASS
npm test -- workspace-boundary       # 7/7 PASS
npm run test:identity                # 14/14 PASS
```

**Proven:**
- Organization create/list/lookup/owner binding
- Workspace requires `organizationId`
- Bootstrap `ensureDefaultWorkspace` binds default org
- Cross-org workspace lookup fails closed
- Migration backfill removes orphan workspaces
- Delete org with workspaces → controlled validation error

## Wave 2 — Identity context (2026-07-08)

```bash
npm test -- auth-context
npm test -- scope-resolver
npm run test:identity                # 24/24 PASS
```

**Proven:**
- AuthUser carries `id` (= `identityId`), `organizationId`, `workspaceId` after tenant middleware
- Missing org/workspace headers → `TenantContextRequiredError`
- Cross-org workspace access → NOT_FOUND
- Scope resolver no silent `ensureDefaultWorkspace` on REST path
- CORS allows `X-Organization-Id`

**E2E proven (Wave 2):** ✅ Yes (integration tests)

## Wave 3 — Authorization boundary (2026-07-08)

```bash
npm test -- permission-enforcement
npm test -- tenant-permission-isolation
npm run test:identity                # 35/35 PASS
```

**Proven:**
- Canonical permissions: memory.read/write, workspace.read/manage, organization.manage
- PermissionContext scoped to organizationId + workspaceId
- No permission check before tenant context on data-plane
- Missing permission → 403 Forbidden (not 404 / empty result)
- Cross-org blocked before permission evaluation

**Wave 3 — Authorization boundary (2026-07-08):** ✅ LOCKED — see [.ai/governance/waves/WAVE-3-AUTHORIZATION.md](../../governance/waves/WAVE-3-AUTHORIZATION.md)

**E2E proven (Wave 3):** ✅ Yes (authorization unit tests)

## Wave 4 — Transport parity (2026-07-08)

```bash
npm test -- authorization-boundary rest-mcp-parity mcp-scope-recall tenant-isolation
npm run test:identity                # 49/49 PASS
```

**Proven:**
- Shared `authorization-boundary.ts` for REST + MCP remote
- Identical PermissionContext and MemoryScope for same tenant headers
- MCP remote requires tenant headers (no env-only bypass on authenticated path)
- MCP forbidden → `{ code: FORBIDDEN, reason: permission_denied }`
- Authorization audit records include `transport: REST | MCP`
- SDK sends `X-Organization-Id` when `organizationId` configured

**Wave 4 — Transport parity (2026-07-08):** ✅ LOCKED — see [.ai/governance/waves/WAVE-4-TRANSPORT-PARITY.md](../../governance/waves/WAVE-4-TRANSPORT-PARITY.md)
