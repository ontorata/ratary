# Phase 13 — Protocol Layer — CHECKLIST

**Phase status:** 🔲 Reserved — Design draft (2026-07-04)  
**Design:** [DESIGN.md](DESIGN.md) · **ADR:** [ADR-028](../../adr/028-protocol-layer.md)

---

## Readiness

### Dependencies

- [ ] Phase 10 ✅
- [ ] Phase 10.5 Implemented (ADR-027) — **recommended hard prerequisite**
- [ ] Phase 11 not regressed
- [ ] Phase 12 optional (event subscribe stub OK)

### ADR

- [ ] ADR-028 **Approved** (currently Proposed)
- [ ] Roadmap renumber Phase 15 Content Scale — owner approved

### Layer impact preview

| Layer | Change |
|-------|--------|
| Protocol | New WS, SSE, stream ports, benchmark |
| Handlers | Add `context-stream.handler` |
| Services | **None** (optional stream source adapter) |
| Repositories | **None** |
| Storage | **None** |
| REST unary | **None** |
| MCP | **None** |

---

## Implementation tracks

- [ ] 13A Streaming ports
- [ ] 13B SSE adapter + route
- [ ] 13C WebSocket adapter
- [ ] 13D gRPC stream
- [ ] 13E Protocol benchmark CLI
- [ ] 13F Manifest + docs

---

## Gate

- [ ] Handler parity (unary + stream)
- [ ] Layer lint: no protocol in services/repos
- [ ] Benchmark report valid
- [ ] REVIEW PASS

---

*Subordinate to [08-REVIEW.md](../../core/standards/08-REVIEW.md).*
