---
id: IDENTITY-FOUNDATION
phase: 04-proof-of-platform
stage: forge-isolate
status: Approved
owner: Ontorata
workload: Engineering Governance
evidence_package: identity-foundation
constitution:
  - Internal Proof Before Public Capability
dependencies:
  - EXECUTION-CONTRACT
  - identity-foundation-intent
updated: 2026-07-08
---

# Identity Foundation — Forge Isolate

| Field | Value |
|-------|-------|
| **Branch** | `forge/identity-foundation` (from `staging`) |
| **Baseline** | ✅ **32/32 tests passed** (vitest, 2026-07-08) |
| **Intent** | [identity-foundation-intent.md](./identity-foundation-intent.md) |
| **Evidence** | `.ai/reviews/identity-foundation/` |

---

## Scope boundary

### In scope

| Area | Includes |
|------|----------|
| Identity context | Organization · Workspace · Auth context · Permission context |
| Scope resolver | Unified `MemoryScope` for all authenticated paths |
| Tenant context | Identity propagation REST · MCP (remote) · Studio (native auth path) |
| Isolation | Org A cannot read/write/search Org B data |
| Backfill | Bind orphan workspaces to org on register/create/default |
| Tests | Acceptance-mapped integration/E2E suite |
| API (minimal) | Organization create + list under owner |

### Out of scope (deferred)

Marketplace · Billing · Plugin · Cloud · Federation · Analytics · Advanced RBAC · Enterprise IAM · SSO · OIDC federation · AI workflow · Memory optimization · MCP stdio multi-tenant rewrite · IdP org claims sync (Zitadel) · `ENTERPRISE_RBAC` role matrix expansion

---

## Baseline audit (pre-implementation)

| Component | Exists | Gap |
|-----------|--------|-----|
| `organizations` table + `IOrganizationStore` | ✅ | No REST API; store unused at runtime |
| `workspaces` + `ensureDefaultWorkspace` | ✅ | Creates orphan rows (`organization_id` null) |
| `AuthUser` + auth middleware | ✅ | No org in auth context |
| `DefaultScopeResolver` | ✅ | Org only if workspace row already has `organization_id` |
| `x-organization-id` header | ⚠️ | Parsed to `TransportContext` but **not** merged into `MemoryScope` |
| Repository SQL filters | ✅ owner + workspace | **No** `organization_id` enforcement |
| Organization backfill script | ✅ | Manual only — not on register/create |
| Tenant isolation tests | ❌ | None |
| Studio → Ratary org sync | ❌ | Workspace + Bearer only; IdP org ≠ Ratary org |

**Conclusion:** Phase 9–10 scaffolding exists; P0-A requires a **vertical slice** binding org at creation time, propagating scope everywhere, and proving isolation with tests.

---

## 1. Identity model

No ambiguity. Canonical hierarchy:

```
Identity (api_key | jwt | oauth | service_account | mcp_token)
    │
    ├── ownerId          ← authentication boundary (AuthUser)
    ├── identityId
    ├── identityType
    ├── clientId?
    └── permissions[]    ← memory.read | memory.write (P0-A minimum)

Organization
    │
    ├── id
    ├── ownerId          ← same owner as identity (P0-A: one owner ↔ many orgs allowed, default org required)
    ├── name
    └── slug

Workspace
    │
    ├── id
    ├── ownerId
    ├── organizationId ← REQUIRED (non-null after P0-A)
    ├── name
    └── slug

User (P0-A)
    └── Native account → identity via JWT; maps to ownerId; org/workspace via scope resolver (not separate User table)

Session (P0-A)
    └── Bearer token (JWT or API key) + optional X-Workspace-Id + optional X-Organization-Id
```

**Rules:**

| Rule | Enforcement |
|------|-------------|
| Every workspace belongs to exactly one organization | DB NOT NULL after migration + runtime guard |
| Every authenticated request resolves organizationId | Scope resolver — never optional on protected paths |
| Owner owns organizations | `organizations.owner_id = AuthUser.ownerId` |
| Permissions are identity-scoped | `permission.middleware` before handlers |

**Default org policy (P0-A):** On first register/bootstrap, create organization slug `ontorata` (internal) or `default` (generic) and bind default workspace.

---

## 2. Context flow

Single path — no alternate scope shortcuts:

```
HTTP Request
    │
    ▼
createAuthenticateMiddleware (auth.middleware.ts)
    │  → AuthUser on request.user
    ▼
createPermissionMiddleware (permission.middleware.ts)
    │  → memory.read / memory.write by method
    ▼
resolveTransportScope (resolve-transport-scope.ts)
    │  → headers: X-Workspace-Id, X-Organization-Id, X-Project-Id
    ▼
DefaultScopeResolver.resolveFromRequest
    │  → ensure org exists (lookup or default)
    │  → ensure workspace under org
    │  → MemoryScope { ownerId, organizationId, workspaceId, agentId?, projectId? }
    ▼
Handlers (REST memory/search/context | MCP tools via AsyncLocalStorage)
    │
    ├── REST controllers
    ├── MCP remote (authenticated)
    └── Studio SDK (Bearer + X-Workspace-Id [+ X-Organization-Id])
```

**MCP remote:** Same `AuthUser` + same resolver — no env-only owner bypass on remote path.

**MCP stdio (out of P0-A proof):** Remains env-based single-tenant; document in `known-limitations.md`.

**Change required:** Merge `TransportContext.organizationId` hint into resolver; resolver must **fail closed** if workspace org ≠ header org.

---

## 3. Isolation boundary

```
Organization (tenant boundary for P0-A)
    │
    ├── Workspace A
    ├── Workspace B
    └── Workspace C

Invariant: Workspace MUST NOT exist outside Organization.
Invariant: Memory/search/metrics scoped by ownerId + organizationId + workspaceId.
Invariant: Org A identity MUST NOT access Org B rows (404/403).
```

**Data plane (P0-A minimum):**

| Layer | Boundary key |
|-------|--------------|
| workspaces | `organization_id` NOT NULL |
| memories | `owner_id` + `workspace_id` (workspace implies org) |
| usage_metrics | `organization_id` on write |
| MCP search | scope filter via resolver output |

Cross-org attack vectors to test:

```
Owner X + Org A workspace → must not list/read Owner X + Org B workspace memories
Owner X + Org A → must not pass Org B id in X-Organization-Id header
```

---

## 4. Permission enforcement

P0-A uses existing permission strings — no role matrix expansion.

| Action | Permission | Enforced at | Scope required |
|--------|------------|-------------|----------------|
| Read memory/search/get | `memory.read` | `permission.middleware` + handler | org + workspace |
| Write/save/ingest memory | `memory.write` | same | org + workspace |
| Search (REST `/search`, MCP `search_memory`) | `memory.read` | same | org + workspace |
| Ingest pipelines | `memory.write` | same | org + workspace |
| Delete memory | `memory.write` | same | org + workspace |
| List workspaces | `memory.read` | workspace routes | owner |
| Create organization | `memory.write` | new org routes | owner |
| Metrics write | internal | usage meter | organizationId from scope |

**Workspace membership RBAC (`ENTERPRISE_RBAC`):** Out of scope — remains off; document as limitation.

**Who reads/writes (P0-A):**

| Actor | Read | Write | Search | Ingest | Delete |
|-------|------|-------|--------|--------|--------|
| API key with memory.read | ✅ scoped | — | ✅ scoped | — | — |
| API key with memory.write | ✅ scoped | ✅ scoped | ✅ scoped | ✅ scoped | ✅ scoped |
| JWT (default both perms) | ✅ scoped | ✅ scoped | ✅ scoped | ✅ scoped | ✅ scoped |
| Unauthenticated | ❌ 401 | ❌ 401 | ❌ 401 | ❌ 401 | ❌ 401 |

---

## 5. Evidence mapping

Every acceptance criterion maps to executable proof — no criterion without test.

| Acceptance ID | Criterion | Evidence type | Test location |
|---------------|-----------|---------------|---------------|
| O1 | Organization can be created | API test | `tests/identity/organization.api.test.ts` |
| O2 | Organization has owner | Integration | same + schema assertion |
| O3 | Org resolvable from request | Integration | `tests/identity/scope-resolver.test.ts` |
| W1 | Workspace under organization | Integration + SQL audit | `tests/identity/workspace-org-binding.test.ts` |
| W2 | Multi-workspace validated | API test | `tests/identity/workspace.api.test.ts` |
| W3 | Default workspace bound to org | Integration | register/bootstrap test |
| I1 | Identity present | API test | existing auth + 401 cases |
| I2 | Owner resolved | Integration | scope-resolver test |
| I3 | Organization resolved | Integration | scope-resolver test |
| I4 | Workspace resolved | Integration | scope-resolver test |
| I5 | Permissions enforced | Authorization test | `tests/identity/permissions.test.ts` |
| I6 | Studio session path | E2E proof doc | `.ai/reviews/identity-foundation/e2e-proof.md` (manual + script) |
| ISO-REST | Org A ≠ Org B REST | E2E test | `tests/identity/tenant-isolation.rest.test.ts` |
| ISO-MCP | MCP scoped recall | Functional test | `tests/identity/tenant-isolation.mcp.test.ts` |
| ISO-MEM | Memory scoped | Integration | `tests/identity/tenant-isolation.memory.test.ts` |
| ISO-SEARCH | Search scoped | Integration | `tests/identity/tenant-isolation.search.test.ts` |
| ISO-METRICS | Metrics scoped | Integration | `tests/identity/tenant-isolation.metrics.test.ts` |

Evidence files updated on pass:

- `.ai/reviews/identity-foundation/acceptance-test.md` — all ⬜ → ✅
- `.ai/reviews/identity-foundation/e2e-proof.md` — commands + output
- `.ai/reviews/identity-foundation/metrics.md` — `production_organizations: 1`

---

## 6. Exit criteria (forge-isolate → forge-blueprint gate)

Forge-isolate is **complete** when this document answers:

| Question | Answer |
|----------|--------|
| **What to build?** | Org API · org bind on workspace create/default/register · unified scope resolver · isolation test suite · Studio header propagation (org id) |
| **What NOT to build?** | Out-of-scope list above |
| **How to prove correct?** | Evidence mapping table — 17 automated tests + e2e-proof.md |

**Open questions resolved for blueprint:**

| Question | Decision |
|----------|----------|
| Default org slug | `default` for generic owners; script creates `Default Organization` |
| Backfill timing | Run on startup migration hook OR register/login/createWorkspace (prefer runtime bind) |
| Org in JWT | Optional P0-A stretch — header + resolver sufficient for proof |
| Memories `organization_id` column | **Not in P0-A** — isolation via workspace→org chain; add column only if tests prove insufficient |

**Ready for forge-blueprint:** ✅ Yes — proceed to `identity-foundation-plan.md`.

---

## Forge branch

```bash
git checkout -b forge/identity-foundation staging
npm test   # baseline: 32/32 passed (2026-07-08)
```

Worktree optional — single-agent execution on branch is sufficient for P0-A.

---

## Related

- [identity-foundation-intent.md](./identity-foundation-intent.md)
- [FORGE-METADATA.md](../../workflow/FORGE-METADATA.md)
- [acceptance-test.md](../../reviews/identity-foundation/acceptance-test.md)
