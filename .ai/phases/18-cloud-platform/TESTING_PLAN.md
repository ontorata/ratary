# Phase 18 — TESTING_PLAN

## Test pyramid

```
                    ┌─────────────┐
                    │ DR drill    │  (staging, manual)
                    ├─────────────┤
                    │ Admin e2e   │
                    ├─────────────┤
                    │ Port unit   │
                    └─────────────┘
```

## Suite matrix

| Suite | Scope | Flags |
|-------|-------|-------|
| **Default regression** | Full `npm test` | All OFF |
| **Port unit — IControlPlane** | provision, deprovision, assignRegion, rotateApiKey | Mock stores |
| **Port unit — IUsageMeter** | recordUsage, aggregate, export | Mock event bus |
| **Port unit — IDisasterRecovery** | scheduleBackup, restore, verifyIntegrity | Mock backup port |
| **Port unit — IRegionRegistry** | primary/secondary CRUD | In-memory |
| **Integration — admin REST** | Admin routes → control plane → scope resolution | ON + Phase 17 auth |
| **Integration — usage subscriber** | Phase 12 event → meter aggregate | ON, async |
| **Integration — federation region** | assignRegion updates peer map | ON + Phase 14 |
| **Isolation — negative** | Cross-tenant admin denied | ON + Phase 17 |
| **Performance — hot path** | Memory CRUD latency with meter ON | Meter async; p99 unchanged |
| **Rollback** | Flags OFF → identical responses vs baseline | OFF |

## DR drill (staging only)

| Step | Verify |
|------|--------|
| 1 | Schedule backup via DR port |
| 2 | Write test memories in primary region |
| 3 | Restore to secondary / clean instance |
| 4 | `verifyIntegrity` passes |
| 5 | Optional failover promotes secondary in region registry |

## MemoryService invariant

| Check | Method |
|-------|--------|
| No MemoryService diff | `git diff` baseline vs post-implementation |
| Service tests unchanged | Existing memory test suite green with flags OFF |

## CI gates

- [ ] All unit tests pass
- [ ] Admin integration subset passes (flag ON job)
- [ ] Default regression job (flags OFF) — required for merge
- [ ] No new failures in federation or security test suites

## Manual verification

- [ ] `.env.example` documents all flags
- [ ] External K8s/TF adapter doc reviewed (smoke checklist)
- [ ] Billing export sample validated by stakeholder (format only)
