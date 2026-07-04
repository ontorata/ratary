# Phase 14 — Federation — TESTING

**Status:** Implemented (2026-07-04)

---

## Automated

| Suite | File | Coverage |
|-------|------|----------|
| Federation composition | `tests/federation/knowledge-exchange.test.ts` | ports gate, cross-org deny, peer list |
| Migration Phase 6 | `tests/db/extension-tracks-migration.test.ts` | federation_* tables |
| Manifest | `tests/capabilities/manifest-contract.test.ts` | supportsFederation flag |
| Layer boundaries | `tests/transport/layer-boundaries.test.ts` | no federation in services/ |

---

## Manual smoke

```bash
FEDERATION_ENABLED=true FEDERATION_METADATA_PROVIDER=sql npm run dev

# List peers
curl -H "Authorization: Bearer aic_..." http://localhost:3000/api/v1/federation/peers

# Pull from local node (cross-workspace in-process)
curl -X POST -H "Authorization: Bearer aic_..." -H "Content-Type: application/json" \
  -d '{"peerId":"<LOCAL_NODE_ID>","sourceNodeId":"<LOCAL_NODE_ID>","sourceOwnerId":"owner-id","sourceWorkspaceId":"<WS_A>","targetWorkspaceId":"<WS_B>"}' \
  http://localhost:3000/api/v1/federation/exchange/pull
```

---

## Quality gate

562 tests green at default env.
