# Task Prompt — Phase 13 Protocol Layer

**Status:** 🔲 Reserved — **Do not implement until ADR-028 Approved**  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-028](../../adr/028-protocol-layer.md)  
**Prerequisite:** Phase 10.5 (ADR-027 Implemented) recommended

---

# TASK

Implement **Phase 13 — Protocol Layer**: REST (unary unchanged), gRPC streaming, WebSocket, SSE, shared handlers → **same MemoryService**, and **Protocol Benchmark** CLI — without changing business logic, repositories, or storage ports.

---

## Requirements

### Layer law (mandatory)

- Protocol adapters only — no business logic
- Handlers → services only — **no repository imports in controllers/handlers**
- Services → **no protocol imports**
- Repositories → **no protocol awareness**
- Single DI-wired `MemoryService` graph for all protocols

### Tracks

| Track | Deliverable |
|-------|-------------|
| 13A | `IStreamPublisher`, `IContextStreamSource`, chunk types |
| 13B | SSE adapter — `GET /api/v1/context/stream` (`SSE_ENABLED=false`) |
| 13C | WebSocket adapter — `WS /api/v1/ws` (`WEBSOCKET_ENABLED=false`) |
| 13D | gRPC context server-stream (extends 10.5) |
| 13E | `npm run benchmark:protocols` + report schema |
| 13F | Manifest `protocols` section; docs |

### ADR gates

| ADR | Title | Status |
|-----|-------|--------|
| [028](../../adr/028-protocol-layer.md) | Protocol Layer | **Proposed → approve** |
| [027](../../adr/027-transport-connectivity-layer.md) | Transport foundation | Prerequisite |
| [025](../../../docs/adr/025-capability-discovery-api.md) | Manifest amend | Additive |

---

## Constraints

- Clean Architecture + Ports & Adapters + DI at composition root
- Backward compatible REST v1 unary + MCP tools
- Default deploy unchanged (flags off)
- No `*V2` services
- No agent runtime

---

## Definition of done

- [ ] ADR-028 Approved → Implemented at gate
- [ ] SC-13-01 through SC-13-09 PASS
- [ ] Handler parity including stream scenarios
- [ ] Layer lint gates pass
- [ ] 457+ tests at default env

---

## Quality gate

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

---

*Blocked until owner approval.*
