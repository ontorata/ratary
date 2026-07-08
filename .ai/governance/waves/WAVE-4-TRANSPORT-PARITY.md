---
id: IDENTITY-FOUNDATION-WAVE-4
phase: 04-proof-of-platform
stage: forge-execute
wave: 4
status: Complete
owner: Ontorata
workload: Engineering Governance
evidence_package: identity-foundation
constitution:
  - Internal Proof Before Public Capability
dependencies:
  - IDENTITY-FOUNDATION-WAVE-3
  - identity-foundation-plan
commits:
  - b190da5
branch: forge/identity-foundation
baseline_tag: identity-wave-3-locked
updated: 2026-07-08
---

# Wave 4 selesai — Transport Parity

| Field | Value |
|-------|-------|
| **Baseline** | `identity-wave-3-locked` (`e96330b`) |
| **Branch** | `forge/identity-foundation` |
| **Gate** | **LOCKED** — ready for Wave 5 |

---

## Objective

Membuktikan REST API dan MCP Remote menggunakan **security model yang sama** — bukan authorization terpisah per transport.

```
Different Transport
        ↓
Same Identity
        ↓
Same Tenant Context
        ↓
Same Permission Context
        ↓
Same Resource Decision
```

---

## Implementasi

| Task | Deliverable | Status |
|------|-------------|--------|
| Shared authorization service | `authorization-boundary.ts` | ✅ |
| REST middleware wiring | tenant + permission → shared service | ✅ |
| MCP remote wiring | tenant + permission + error parity | ✅ |
| Handler parity | MCP remote uses Wave 3 permissions in handlers | ✅ |
| SDK tenant header | `organizationId` → `X-Organization-Id` | ✅ |
| Parity tests | REST ↔ MCP identity/scope/permission | ✅ |
| Audit metadata | `transport: REST \| MCP` on decisions | ✅ |

---

## 1. Identity Context Parity

**Shared service:** `src/auth/authorization-boundary.ts`

| Transport | Entry |
|-----------|-------|
| REST | `resolveAuthorizedTenantContext(..., 'REST')` + `evaluateRestAuthorization` |
| MCP Remote | `authorizeMcpRemoteSession` + `assertMcpRemoteHandlerPermission` |

**Requirement met:** `identityId`, `organizationId`, `workspaceId` identik untuk credentials + headers yang sama. Tidak ada MCP-specific identity bypass.

---

## 2. Tenant Propagation

Semua MCP remote authenticated requests wajib tenant headers (`X-Organization-Id`, `X-Workspace-Id`) — sama dengan REST data-plane.

| Case | Expected | Status |
|------|----------|--------|
| REST dengan tenant valid | Allow | ✅ |
| MCP dengan tenant valid | Allow | ✅ |
| REST tanpa workspace | Deny | ✅ |
| MCP tanpa workspace | Deny | ✅ |
| Cross organization | Deny | ✅ |

---

## 3. Permission Enforcement Parity

Wave 3 contract unchanged — **transport bukan permission boundary**:

- `memory.read`
- `memory.write`
- `workspace.read`
- `workspace.manage`
- `organization.manage`

MCP remote handler scope (`resolve-handler-scope.ts`) memanggil `assertMcpRemoteHandlerPermission` dengan permission yang sama seperti REST route mapping.

---

## 4. Error Parity

| REST | MCP Remote |
|------|------------|
| HTTP 403 Forbidden | `{ code: "FORBIDDEN", reason: "permission_denied" }` |
| HTTP 400 TENANT_CONTEXT_REQUIRED | `{ code: "TENANT_CONTEXT_REQUIRED", reason: "tenant_context_required" }` |

Formatter: `formatMcpAuthorizationError` in `authorization-boundary.ts`

---

## 5. Audit Boundary

Authorization audit record:

```typescript
{
  transport: 'REST' | 'MCP',
  identityId,
  organizationId,
  workspaceId,
  permission,
  decision: 'allow' | 'deny',
  reason?: string
}
```

Sink hook: `setAuthorizationAuditSink` (used in tests; production logs via audit records).

---

## Test Validation

| Suite | Result |
|-------|--------|
| Wave 1–3 regression | ✅ |
| authorization-boundary | 6/6 ✅ |
| rest-mcp-parity | 2/2 ✅ |
| mcp-scope-recall | 3/3 ✅ |
| tenant-isolation.rest | 3/3 ✅ |
| Identity suite | 49/49 ✅ |
| Full suite | 81/81 ✅ |

**Commands:**

```bash
npm test -- authorization-boundary rest-mcp-parity mcp-scope-recall tenant-isolation
npm run test:identity
```

---

## Non-Goals (locked)

- ❌ Redesign permission model
- ❌ Role system / new permissions
- ❌ Database authorization migration
- ❌ Tenant model changes
- ❌ MCP stdio bootstrap path (Wave 5 / separate scope)

---

## Gate menuju Wave 5

| Gate | Status |
|------|--------|
| REST authorization proof | ✅ |
| MCP authorization proof | ✅ |
| Cross-transport isolation test | ✅ |
| Shared authorization service | ✅ |

**Next:** Wave 5 — Studio E2E (`X-Organization-Id` session wiring)

---

## Related

- [Wave 3 checkpoint](./WAVE-3-AUTHORIZATION.md)
- [Wave checkpoints index](./README.md)
- [acceptance-test.md](../../reviews/identity-foundation/acceptance-test.md)
