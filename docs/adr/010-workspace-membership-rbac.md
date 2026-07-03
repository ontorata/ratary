# ADR-010: Workspace Membership RBAC

**Status:** Implemented  
**Date:** 2026-07-03  
**Approved:** 2026-07-03  
**Deciders:** Project owner  

---

## Context

Phase 9 activated workspace-scoped memory via `IScopeResolver` ([ADR-007](007-multi-ai-workspace-scope.md)). Phase 10 adds enterprise tenancy: organizations group workspaces, and identities require explicit membership to access a workspace when RBAC is enabled ([ADR-002](002-workspace-identity-model.md)).

## Problem

Owner-level API keys can access any workspace owned by the same `owner_id` without role checks. Enterprise deployments need workspace-scoped deny/allow at the transport boundary without rewriting `MemoryService`.

## Decision

**Adopt opt-in RBAC at the composition root:**

| Component | Role |
|-----------|------|
| `organizations` + `workspace_memberships` tables | Persist tenant + role bindings |
| `IWorkspaceMembership` port | `assertAccess(identityId, workspaceId, permission)` |
| `D1WorkspaceMembership` | D1 adapter when `ENTERPRISE_RBAC=true` |
| `AllowAllWorkspaceMembership` | No-op when `ENTERPRISE_RBAC=false` (default) |
| `createWorkspaceMembershipMiddleware` | Fastify hook after auth; runs only when `X-Workspace-Id` + identity present |
| JWT claims | Additive optional `organization_id`, `workspace_roles[]` |

**Permissions:** `memory.read`, `memory.write`, `memory.admin` mapped from roles `viewer`, `member`, `admin`, `owner`.

**Default:** `ENTERPRISE_RBAC=false` preserves Phase 9 behavior (310+ test baseline unchanged).

## Consequences

- RBAC is enforced outside domain services (Constitution-compliant)
- Cross-org E2E tests required when flag enabled
- `MemoryScope.organizationId` populated from `workspaces.organization_id` when present
- Backfill script links existing workspaces to default organization per owner

## References

- [ADR-002 Workspace identity model](002-workspace-identity-model.md)
- [ADR-007 Multi-AI workspace scope](007-multi-ai-workspace-scope.md)
- [.ai/phases/10-enterprise/DESIGN.md](../../.ai/phases/10-enterprise/DESIGN.md)
