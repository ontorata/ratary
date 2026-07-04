# Phase 09.8 — Multi-Client Memory Synchronization

**Status:** ✅ Implemented (2026-07-04) · ADR-042 Accepted  
**Capability:** Hub SSOT sync for Cursor, Claude, ChatGPT, Gemini, Codex, Qwen, OpenHands, Continue, MCP servers — pull/push with **conflict resolution**.

**Flag:** `MULTI_CLIENT_SYNC_ENABLED=false` (default)

---

## Documents

| Document | Purpose |
|----------|---------|
| [DESIGN.md](DESIGN.md) | Ports, strategies, invariants |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Modules, wiring, file map |
| [TESTING.md](TESTING.md) | Verification strategy |
| [CHECKLIST.md](CHECKLIST.md) | Gate checklist |

**ADR:** [ADR-042](../../../docs/adr/042-multi-client-memory-sync.md)

---

## Quick start

```bash
# Enable in .env
MULTI_CLIENT_SYNC_ENABLED=true
MULTI_CLIENT_SYNC_STORE_PROVIDER=sql
MULTI_CLIENT_SYNC_STRATEGY=lww   # lww | field_merge | manual_queue

# Check sync cursor + pending conflicts
npm run sync:status -- --platform=cursor --owner=<ownerId>

# REST (when enabled)
GET  /api/v1/sync/status?platformId=cursor
GET  /api/v1/sync/pull?platformId=cursor&cursor=<iso>
POST /api/v1/sync/push
```

Updates with stale `expectedUpdatedAt` are rejected (LWW) or resolved per strategy. Manifest reports `capabilities.supportsMultiClientSync: true` when flag enabled.

---

## Related

- Phase 9 baseline sync: [09-multi-ai-workspace](../09-multi-ai-workspace/README.md)
- Phase 09.7 evolution (optional branch merge): [09.7-memory-evolution](../09.7-memory-evolution/README.md)
- Phase 14 federation (node-to-node): [14-federation](../14-federation/README.md)
