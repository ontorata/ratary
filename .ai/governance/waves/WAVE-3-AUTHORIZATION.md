---
id: IDENTITY-FOUNDATION-WAVE-3
phase: 04-proof-of-platform
stage: forge-execute
wave: 3
status: Complete
owner: Ontorata
workload: Engineering Governance
evidence_package: identity-foundation
constitution:
  - Internal Proof Before Public Capability
dependencies:
  - EXECUTION-CONTRACT
  - identity-foundation-intent
  - identity-foundation-isolate
  - identity-foundation-plan
commits:
  - ed3b65a
branch: forge/identity-foundation
updated: 2026-07-08
---

# Wave 3 selesai — Authorization Boundary

| Field | Value |
|-------|-------|
| **Commit** | `ed3b65a` |
| **Message** | `feat(identity): enforce tenant scoped permissions` |
| **Branch** | `forge/identity-foundation` |
| **Gate** | **LOCKED** — ready for Wave 4 |

---

## Implementasi

| Task | Deliverable | Status |
|------|-------------|--------|
| Permission contract | Canonical action strings | ✅ Implemented |
| Permission resolution | `permission-context.ts` → `PermissionContext` | ✅ Implemented |
| Enforcement middleware | Tenant-before-permission flow | ✅ Implemented |
| Data plane protection | `/memory`, `/search`, ingest, `/context` | ✅ Implemented |

---

## 1. Permission Contract

Permission resmi yang digunakan:

- `memory.read`
- `memory.write`
- `workspace.read`
- `workspace.manage`
- `organization.manage`

**Keputusan:** Tidak menggunakan alias permission. Permission contract bersifat eksplisit dan menjadi single source of truth untuk authorization layer.

**Implementation:** `src/auth/permission-context.ts` · re-export `src/auth/permissions.ts`

---

## 2. Permission Resolution

**File:** `src/auth/permission-context.ts`

Menghasilkan `PermissionContext`:

| Field | Role |
|-------|------|
| `identityId` | Authenticated identity |
| `ownerId` | Data-plane owner root |
| `organizationId` | Tenant organization |
| `workspaceId` | Tenant workspace |
| `permissions` | Granted actions for this identity |

Permission resolution berjalan berdasarkan tenant context yang sudah tervalidasi — bukan global `ownerId` scope.

---

## 3. Enforcement Middleware

Authorization flow dikunci menjadi:

```
Authentication
        ↓
Tenant Context
        ↓
Permission Evaluation
        ↓
Resource Access
```

**Aturan:**

- Tenant context wajib tersedia sebelum permission dievaluasi.
- Permission tidak boleh diproses tanpa `organizationId` + `workspaceId` pada seluruh data-plane routes.
- Jika permission tidak terpenuhi: **HTTP 403 Forbidden** (bukan 404, bukan silent empty result).

**Hook order:** `authenticate` → `resolveTenantContext` → `enforcePermissions` → handler

---

## 4. Data Plane Protection

| Resource / route | Permission |
|------------------|------------|
| Read memory / context / search | `memory.read` |
| Write memory / ingest | `memory.write` |

Protected paths include `/api/v1/memory*`, `/api/v1/search`, `/api/v1/context` (POST), knowledge-fabric ingest.

---

## Keputusan Arsitektur

### Tenant scoped authorization

Permission bersifat **tenant scoped**, bukan global ownerId scoped.

**Konsekuensi:**

- Identity yang sama dapat memiliki permission berbeda pada tenant berbeda (model ready; storage per-tenant RBAC = future).
- Authorization selalu mengikuti boundary organization/workspace.

### Cross organization isolation

```
Request
  ↓
Authentication
  ↓
Tenant Validation
  ↓
Reject Cross-Org Access
  ↓
Permission Evaluation
```

Cross-org access ditolak pada tenant layer **sebelum** permission check.

### Bootstrap route exception

Route berikut exempt dari tenant headers (identity-level authorization):

- `/api/v1/auth/*`
- `GET` / `POST` `/api/v1/workspaces`

Tenant enforcement hanya berlaku pada data-plane routes.

---

## Test Validation

| Suite | Result |
|-------|--------|
| Wave 1 | 14/14 ✅ |
| Wave 2 | 10/10 ✅ |
| Wave 3 | 11/11 ✅ |
| Identity suite | 35/35 ✅ |
| Full suite | 67/67 ✅ |

**Commands:**

```bash
npm test -- permission-enforcement
npm test -- tenant-permission-isolation
npm run test:identity
```

**Evidence tests:**

- `tests/identity/permission-enforcement.test.ts`
- `tests/identity/tenant-permission-isolation.test.ts`

---

## Evidence & Governance

| Artifact | Path |
|----------|------|
| Acceptance checklist | `.ai/reviews/identity-foundation/acceptance-test.md` |
| E2E proof | `.ai/reviews/identity-foundation/e2e-proof.md` |
| Blueprint | `.ai/designs/drafts/identity-foundation-plan.md` |
| This checkpoint | `.ai/governance/waves/WAVE-3-AUTHORIZATION.md` |

**Status:**

- Wave 3 PASS ✅
- I5 Authorization Boundary ✅
- Memory Authorization ✅

---

## Gate menuju Wave 4

| Gate | Status |
|------|--------|
| Permission contract | ✅ |
| Permission enforcement | ✅ |
| Tenant-scoped authorization | ✅ |
| Memory access protected | ✅ |

**Status:** **READY**

---

## Next Phase — Wave 4 Transport Parity

**Scope:** REST ↔ MCP Remote

Boundary yang sama:

```
Authentication
        ↓
Tenant Context
        ↓
Permission Evaluation
        ↓
Resource Access
```

Wave 4 hanya dimulai setelah authorization boundary Wave 3 dianggap **locked** ✅

---

## Related

- [Wave checkpoints index](./README.md)
- [identity-foundation acceptance-test.md](../../reviews/identity-foundation/acceptance-test.md)
- [IMPLEMENTATION-COMPLETION-PROTOCOL.md](../../core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md)
