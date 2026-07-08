---
id: IDENTITY-FOUNDATION
phase: 04-proof-of-platform
stage: forge-blueprint
status: Approved
owner: Ontorata
workload: Engineering Governance
evidence_package: identity-foundation
constitution:
  - Internal Proof Before Public Capability
dependencies:
  - EXECUTION-CONTRACT
  - identity-foundation-intent
  - identity-foundation-isolate
updated: 2026-07-08
---

# Blueprint: Identity Foundation (P0-A)

| Field | Value |
|-------|-------|
| **Branch** | `forge/identity-foundation` |
| **Baseline** | 32/32 vitest passed (2026-07-08) |
| **Intent** | [identity-foundation-intent.md](./identity-foundation-intent.md) |
| **Isolate** | [identity-foundation-isolate.md](./identity-foundation-isolate.md) |
| **Evidence** | `.ai/reviews/identity-foundation/` |

---

## 1. Implementation objective

> **Implement tenant-aware identity boundary so all Ratary access (REST, MCP remote, Studio) runs through organization-scoped context provable via isolation tests.**

---

## 2. Current state mapping

| Component | Existing | Change |
|-----------|----------|--------|
| `organizations` table | ✅ `schema.sql`, `migrateEnterprisePhase1` | Validate lifecycle; optional NOT NULL audit migration |
| `IOrganizationStore` / `D1OrganizationStore` | ✅ Wired in `create-platform-adapters.ts` | Expose REST workflow; use at register/create workspace |
| Organization backfill | ✅ `scripts/lib/organization-backfill.ts` | Integrate into runtime bind (not manual-only) |
| `workspace-store.ts` | ✅ CRUD + `ensureDefaultWorkspace` | **Enforce org binding** on create/default |
| `DefaultScopeResolver` | ✅ Owner + workspace + org from workspace row | **Always** resolve `organizationId`; merge header hint |
| `resolve-transport-scope.ts` | ⚠️ Parses `x-organization-id` but drops in hints | Pass `organizationId` into resolver hints |
| `AuthUser` / auth middleware | ✅ Multi-provider auth | Extend optional `organizationId` on context (derived, not stored) |
| `permission.middleware.ts` | ✅ `memory.read` / `memory.write` | Extend route map for org/workspace admin paths |
| `repository-scope.ts` | ✅ owner + workspace filters | Validate workspace→org chain; reject cross-org workspace id |
| MCP remote | ✅ Auth + `resolveFromRequest` | Parity tests with REST |
| MCP stdio | ✅ Env-based owner | **Out of proof** — document limitation |
| Studio auth | ✅ Shipped (`Ontorata-Studio`) | Verify + add `X-Organization-Id` in SDK |
| Organization REST API | ❌ None | **Add** minimal list/create |
| Isolation tests | ❌ None | **Add** full suite under `tests/identity/` |

**Mindset:** extend and harden — no rewrite.

---

## 3. Execution waves

### Wave 1 — Data boundary

**Goal:** Organization and workspace have correct lifecycle; no orphan workspaces after mutations.

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **1.1** | `src/db/migrations.ts`, `schema.sql` | Audit `organizations` + `workspaces.organization_id` FK; add migration `migrateIdentityFoundationPhase1` if needed (backfill + index) | `npm run build` |
| **1.2** | `src/scope/organization-store.ts` (**new**) | SQL helpers: `ensureDefaultOrganization`, `findOrganizationById`, `listOrganizationsByOwner`, `createOrganization` — mirror workspace-store pattern using `ISqlDatabase` | unit tests |
| **1.3** | `src/scope/workspace-store.ts` | Update `createWorkspace` + `ensureDefaultWorkspace` to call `ensureDefaultOrganization` and INSERT with `organization_id` | Wave 1 tests |
| **1.4** | `scripts/lib/organization-backfill.ts` | Refactor to reuse `organization-store` helpers (single source) | `npm run db:migrate` (local) |
| **1.5** | `tests/identity/organization-isolation.test.ts` (**new**) | O1–O3: create org, owner binding, resolve by owner+slug | `npm test -- organization-isolation` |
| **1.6** | `tests/identity/workspace-boundary.test.ts` (**new**) | W1–W3: workspace always has org; multi-workspace; default bound | `npm test -- workspace-boundary` |

**Wave 1 verify:** `npm test -- organization workspace-boundary`

**Done when:** zero orphan workspaces after register/create/default in tests.

---

### Wave 2 — Identity context

**Goal:** Every authenticated request carries resolved identity context through to handlers.

**Target flow:**

```
Request → Auth Middleware → AuthUser → Organization Context → Workspace Context → Handler
```

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **2.1** | `src/scope/iscope-resolver.interface.ts` | Add `organizationId?: string` to `ScopeResolutionHints` | build |
| **2.2** | `src/transport/shared/resolve-transport-scope.ts` | Include `organizationId` in `scopeHintsFromTransportContext`; remove owner-only fallback on authenticated REST (`resolveMemoryScopeFromTransportContext` must require auth for protected routes) | inspect |
| **2.3** | `src/scope/default-scope-resolver.ts` | Resolve org: hint → workspace.org → `ensureDefaultOrganization`; fail closed if hint org ≠ workspace org | scope tests |
| **2.4** | `src/auth/account.service.ts` | On register/login: `ensureDefaultOrganization` before `ensureDefaultWorkspace`; return `organizationId` in `AccountAuthResult` | auth tests |
| **2.5** | `src/types/memory-scope.ts` | Document invariant: `organizationId` required on authenticated scope | — |
| **2.6** | `tests/identity/auth-context.integration.test.ts` (**new**) | I1–I4: 401 without auth; owner+org+workspace on JWT path | `npm test -- auth-context` |

**Wave 2 verify:** `npm test -- auth-context`

**Done when:** `MemoryScope` from resolver always includes `organizationId` for authenticated requests.

---

### Wave 3 — Authorization boundary

**Goal:** Permissions enforced — not metadata only.

| Action | Required permission |
|--------|-------------------|
| Read memory / search / GET | `memory.read` |
| Write memory / ingest / POST·PUT·PATCH·DELETE | `memory.write` |
| Admin org/workspace routes (new) | `memory.write` (P0-A — no separate admin perm) |

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **3.1** | `src/auth/permissions.ts` | Map `/api/v1/organizations` GET→read POST→write; keep existing memory routes | — |
| **3.2** | `src/auth/permission.middleware.ts` | Ensure runs for all `/api/v1/*` except public list (audit `rest-server.ts` hook order) | — |
| **3.3** | `src/routes/v1/organization.routes.ts` (**new**) | GET/POST `/organizations` | route tests |
| **3.4** | `src/controllers/organization.controller.ts` (**new**) | list/create scoped to `AuthUser.ownerId` | — |
| **3.5** | `src/routes/v1/index.ts` | Register organization routes + controller wiring | — |
| **3.6** | `tests/identity/permission-enforcement.test.ts` (**new**) | I5: missing permission → 403; read-only cannot POST memory | `npm test -- permission-enforcement` |

**Wave 3 verify:** `npm test -- permission-enforcement`

**Done when:** matrix above covered by automated tests.

---

### Wave 4 — Transport consistency

**Goal:** REST and MCP remote use identical scope resolution.

```
REST Request ──┐
               ├──→ Scope Resolver ──→ MemoryScope
MCP Request  ──┘
```

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **4.1** | `src/transport/mcp/remote/register-remote-mcp-routes.ts` | Confirm `AsyncLocalStorage` transport context includes auth + hints (audit only; fix if gap) | — |
| **4.2** | `src/transport/shared/handlers/resolve-handler-scope.ts` | Single entry: always `resolveMemoryScopeFromRequest` / transport context | — |
| **4.3** | `packages/sdk/src/transports/rest-transport.ts` | Add optional `organizationId` → header `X-Organization-Id` | SDK test |
| **4.4** | `tests/identity/rest-mcp-parity.test.ts` (**new**) | Same owner+org+workspace: REST write memory + MCP `search_memory` sees it | `npm test -- rest-mcp-parity` |
| **4.5** | `tests/identity/mcp-scope-recall.test.ts` (**new**) | MCP scoped recall; cross-org token cannot read | `npm test -- mcp-scope-recall` |
| **4.6** | `tests/identity/tenant-isolation.rest.test.ts` (**new**) | ISO-REST: Org A ≠ Org B | `npm test -- tenant-isolation.rest` |
| **4.7** | `tests/identity/tenant-isolation.memory.test.ts` (**new**) | ISO-MEM | `npm test -- tenant-isolation.memory` |
| **4.8** | `tests/identity/tenant-isolation.search.test.ts` (**new**) | ISO-SEARCH | `npm test -- tenant-isolation.search` |
| **4.9** | `tests/identity/tenant-isolation.metrics.test.ts` (**new**) | ISO-METRICS: `sql-usage-meter` scoped | `npm test -- tenant-isolation.metrics` |

**Wave 4 verify:** `npm test -- scope rest-mcp-parity mcp-scope-recall tenant-isolation`

**Done when:** REST and MCP remote produce identical scope for same credentials + headers.

---

### Wave 5 — Studio end-to-end

**Goal:** Real user path: org → workspace → login → memory → recall → isolation.

**Scenario:**

```
Create Organization → Create Workspace → Login Studio → Access Ratary
    → Store Memory → Recall Memory → Verify Isolation
```

| Task | Files | Do | Verify |
|------|-------|-----|--------|
| **5.1** | `D:/Apps/Ontorata-Studio/src/infrastructure/ratary/studio-ratary-client.ts` | Pass `organizationId` from session → `X-Organization-Id` | Studio lint |
| **5.2** | `D:/Apps/Ontorata-Studio/src/infrastructure/auth/ratary-native-auth-adapter.ts` | Persist `organizationId` from login/register response | manual |
| **5.3** | `D:/Apps/Ontorata-Studio/src/hooks/useStudioClient.tsx` | Wire org id into client factory | — |
| **5.4** | `tests/identity/studio-identity-e2e.test.ts` (**new**) | Programmatic E2E: register → org in response → save memory → search → cross-org negative | see below |
| **5.5** | `package.json` | Add scripts: `"test:identity": "vitest run tests/identity"`, `"test:e2e": "vitest run tests/identity/studio-identity-e2e.test.ts"` | `npm run test:e2e` |
| **5.6** | `.ai/reviews/identity-foundation/e2e-proof.md` | Paste commands + output (I6) | manual review |
| **5.7** | `.ai/reviews/identity-foundation/acceptance-test.md` | Mark all criteria ✅ | — |

**Wave 5 verify:** `npm run test:e2e` then `npm run test:identity`

**Studio cross-repo note:** Tasks 5.1–5.3 are minimal Studio changes on same forge branch or linked PR; Ratary tasks 5.4–5.5 can run without Studio UI if E2E uses REST native auth only. Full Studio UI proof documented in `e2e-proof.md`.

**Done when:** E2E test green + e2e-proof.md filled.

---

## 4. Definition of Done (blueprint → forge-land)

| # | Criterion | Evidence |
|---|-----------|----------|
| [ ] | Organization boundary enforced | `tenant-isolation.*.test.ts` |
| [ ] | Workspace cannot escape tenant | `workspace-boundary.test.ts` |
| [ ] | Identity propagated REST | `auth-context.integration.test.ts` |
| [ ] | Identity propagated MCP remote | `mcp-scope-recall.test.ts` |
| [ ] | Studio session mapped | `studio-identity-e2e.test.ts` + `e2e-proof.md` |
| [ ] | Permission enforced | `permission-enforcement.test.ts` |
| [ ] | Isolation tests pass | full `npm run test:identity` |
| [ ] | Evidence package updated | `.ai/reviews/identity-foundation/*` all sections |

---

## 5. Commit boundary

```
forge-blueprint (this document)
        │
        ▼
commit blueprint only          ← no src/ changes
        │
        ▼
forge-execute (waves 1→5)
        │
        ▼
implementation commits         ← one commit per wave recommended
        │
        ▼
forge-land
        │
        ▼
evidence finalized + merge PR
```

| Artifact | Git scope |
|----------|-----------|
| Design decision | `.ai/designs/drafts/identity-foundation-plan.md` (this file) |
| Code | `src/`, `packages/sdk/`, `tests/identity/` |
| Proof | `.ai/reviews/identity-foundation/` |
| Public mirror | `docs/` only if API contract changes (org routes) |

**Repo note:** `.ai/` and `tests/` are gitignored on `origin` (ontorata/ratary). Maintainer sync via `ai-brain-legacy` remote. Do **not** push `.ai/` to public `origin`.

---

## 6. Acceptance gate (before forge-execute)

> **If another developer reads this plan, can they implement P0-A without asking the maintainer?**

| Area | Self-contained? |
|------|-----------------|
| Objective | ✅ One sentence |
| Current state | ✅ Table with files |
| Tasks | ✅ 5 waves, paths, verify commands |
| Out of scope | ✅ In isolate doc |
| Evidence mapping | ✅ Per-wave test files |
| DoD checklist | ✅ Section 4 |
| Commit sequence | ✅ Section 5 |

**Gate:** ✅ **Ready for forge-execute** after blueprint commit.

---

## 7. Parallelization

| Parallel-safe | Waves |
|---------------|-------|
| No | Wave 1 must complete before 2–4 |
| Partial | Wave 4 tests can be drafted alongside Wave 3 |
| No | Wave 5 depends on 1–4 |

---

## 8. Recommended implementation commit messages

```
feat(identity): wave 1 — org/workspace data boundary
feat(identity): wave 2 — identity context propagation
feat(identity): wave 3 — permission enforcement + org API
feat(identity): wave 4 — REST/MCP scope parity + isolation tests
feat(identity): wave 5 — Studio E2E + evidence package
```

---

## Related

- [identity-foundation-isolate.md](./identity-foundation-isolate.md)
- [acceptance-test.md](../../reviews/identity-foundation/acceptance-test.md)
- [FORGE-METADATA.md](../../workflow/FORGE-METADATA.md)
