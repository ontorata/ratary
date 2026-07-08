# Studio E2E Proof — Identity Foundation (I6)

| Field | Value |
|-------|-------|
| **Milestone** | Identity Foundation Wave 5 |
| **Date** | 2026-07-08 |
| **Scope** | Studio session → REST/MCP tenant propagation |

---

## Scenario

Prove Studio-compatible session path:

```
Register/Login → organizationId + workspaceId in session
        ↓
Studio client headers (X-Organization-Id, X-Workspace-Id)
        ↓
REST data-plane (memory write + search)
        ↓
MCP remote tenant enforcement (same boundary)
```

---

## Evidence

| Step | Expected | Command / artifact | Pass |
|------|----------|-------------------|------|
| Session creation | `identityId`, `organizationId`, `workspaceId` in register response | `npm run test:e2e` | ✅ |
| Session refresh | Login preserves tenant context | `studio-identity-e2e.test.ts` | ✅ |
| REST propagation | Memory create + search with tenant headers | `studio-identity-e2e.test.ts` | ✅ |
| Missing org header | Data-plane denied (400) | `studio-identity-e2e.test.ts` | ✅ |
| Cross-org deny | 404 on mismatched org/workspace | `studio-identity-e2e.test.ts` | ✅ |
| MCP parity | MCP denies missing workspace header | `studio-identity-e2e.test.ts` | ✅ |
| Studio tenant resolver | Route workspace override | `Ontorata-Studio/tests/tenant-context.test.ts` | ✅ |

---

## Test output (2026-07-08)

```bash
npm run test:e2e
# 7/7 PASS — studio-identity-e2e.test.ts

npm run test:identity
# 56/56 PASS (includes wave 1–5 regression)

cd D:/Apps/Ontorata-Studio && npm test -- tenant-context
# 4/4 PASS
```

---

## Studio wiring verified

- `ratary-native-auth-adapter.ts` persists `organizationId` from auth gateway response
- `useStudioClient.tsx` resolves tenant via `resolveStudioTenantContext(session, routeWorkspaceId)`
- `StudioRataryClient` sends `X-Organization-Id` + `X-Workspace-Id` via vendored SDK
- `NativeWorkspaceBootstrap` backfills org/workspace from `listWorkspaces()` when missing

---

## Checkpoint

[WAVE-5-STUDIO-E2E.md](../../governance/waves/WAVE-5-STUDIO-E2E.md)
