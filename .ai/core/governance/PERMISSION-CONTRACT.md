# Permission Contract — Security Invariant

| Field | Value |
|-------|-------|
| **Status** | **Locked** — P0-A Wave 3 · enforced P0-B Wave 2 |
| **Authority** | [ADR-0003-authorization-model.md](../architecture/ADR-0003-authorization-model.md) |
| **Source of truth (runtime)** | `src/auth/permission-context.ts` → `PERMISSIONS` |
| **Enforcement** | `npm run ci:permission-contract` |

---

## Canonical permission strings

These five strings are the **complete** P0-A permission contract. No aliases. No additions without ADR-0003 amendment.

| Permission | Purpose |
|------------|---------|
| `memory.read` | Read memory, search, GET data-plane |
| `memory.write` | Write, ingest, delete memory |
| `workspace.read` | List/read workspaces |
| `workspace.manage` | Create/update workspaces |
| `organization.manage` | Create/list organizations |

---

## Change rules

Changes to any of the following require **all** of:

1. `npm run test:identity` pass
2. `npm run ci:adr-impact` pass (ADR in diff)
3. `npm run ci:permission-contract` pass (contract still valid)

**Trigger paths:**

- `src/auth/` (permission resolution · middleware · boundary)
- `src/auth/permission-context.ts`
- `src/auth/authorization-boundary.ts`

---

## Forbidden without governance

- Adding new permission strings without ADR-0003 amendment
- Renaming or aliasing existing permissions
- Bypassing `permission-context.ts` as canonical definition

---

## Related

- [ARCHITECTURE-CHANGE-MAP.md](./ARCHITECTURE-CHANGE-MAP.md)
- [CI-RULES.md](../../governance/ci/CI-RULES.md)
