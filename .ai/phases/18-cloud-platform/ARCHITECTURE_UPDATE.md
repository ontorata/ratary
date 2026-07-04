# Phase 18 — ARCHITECTURE_UPDATE

**Target document:** [.ai/core/architecture/04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md)  
**Apply when:** ADR-033 **Approved**.

---

## Sections to add or extend

### 1. Control plane / data plane split

| Plane | Responsibility | Location |
|-------|----------------|----------|
| **Control plane** | Provisioning, API keys, regions, subscriptions | `IControlPlane` port |
| **Data plane** | Memory CRUD, search, context | Existing handlers (unchanged) |

### 2. New ports

| Port | Location | Default |
|------|----------|---------|
| `IControlPlane` | `src/ports/cloud/` | Manual config |
| `IUsageMeter` | `src/ports/cloud/` | Noop |
| `IDisasterRecovery` | `src/ports/cloud/` | Local backup wrapper |
| `ICloudProvisioner` | `src/ports/cloud/` | Noop |
| `IRegionRegistry` | `src/ports/cloud/` | In-memory / SQL |
| `ITenantMetadataStore` | `src/ports/cloud/` | SQL |

### 3. Federation cross-link

Document Phase 14 federation as **data-plane sync**; Phase 18 DR orchestrates backup/restore across regions.

### 4. Phase 12 event bus

`IUsageMeter` = async subscriber only — hot path unchanged.

---

## Sections unchanged

- MemoryService, storage adapters (ADR-008)
- Tenant data isolation enforced at repository + Phase 17 policy

---

## Verification checklist

- [ ] Admin routes gated by Phase 17 RBAC/OPA
- [ ] Rate limit = edge adapter, not MemoryService
- [ ] Link ADR-033
