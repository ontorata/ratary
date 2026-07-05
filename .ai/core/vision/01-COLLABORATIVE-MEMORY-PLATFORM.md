# Collaborative Memory Intelligence Platform — Vision Charter

**Status:** Draft (2026-07-04) — awaiting owner approval  
**Authority:** Subordinate to [00-CONSTITUTION.md](../constitution/00-CONSTITUTION.md)  
**Audience:** Principal architects, maintainers, AI assistants

---

## Identity

Ratary is **not** a chatbot, AI agent, or vector database.

Ratary is a **Collaborative Memory Intelligence Platform** — the shared knowledge foundation for multiple developers, AI assistants, repositories, projects, and organizations.

> **Git manages source code. Ratary manages knowledge.**

---

## Principles

### Principle #1 — Knowledge independence

Knowledge is independent from AI. LLMs, IDEs, and storage engines may change; **knowledge must remain**.

- SSOT: `MemoryService` + `memories` row identity (id, codename, slug)
- Vectors, embeddings, and indexes are **replaceable adapters**
- Stable wire contracts: REST `/api/v1`, MCP tools (additive)

### Principle #2 — Team ownership

Knowledge belongs to the **team** (workspace/org), not an individual AI session.

- Scope boundary: `MemoryScope.workspaceId`
- Agents: attribution only (`last_modified_by_agent_id`)
- Multi-AI clients share one pool via shared handlers (Phase 10.5)

### Principle #3 — Immutable knowledge, adaptive learning

Memory stores knowledge. Learning adapts **policy** (ranking, recommendations, patterns) — not SSOT content without explicit review/stewardship/evolution paths.

---

## Supported actors

Human developers → teams → organizations → AI assistants (Cursor, Claude, ChatGPT, Gemini, Codex, Continue, OpenHands, Windsurf, VS Code, JetBrains, custom MCP) → agent frameworks → enterprise platforms.

**Vendor-neutral:** no business logic branches on AI vendor.

---

## Workspace model (target hierarchy)

```
Organization → Workspace → Project → Repository (metadata) → Knowledge → Memory → Context → AI
```

Security boundary: Organization / Workspace. `project` and repository refs are grouping and provenance.

---

## Proposal gate (all ADRs / phases)

1. Does knowledge survive vendor/storage/client swap?
2. Is knowledge scoped to team workspace, not agent session?
3. Are REST/MCP/gRPC handlers shared (no duplicated orchestration)?
4. Is learning/policy separate from SSOT mutation?
5. Does the change extend ports — not fork `MemoryService` / `RankerV2`?

---

## References

- [02-AI-BRAIN-OS-ENGINE-MAP.md](02-AI-BRAIN-OS-ENGINE-MAP.md)
- [03-INTELLIGENCE-PIPELINE.md](03-INTELLIGENCE-PIPELINE.md)
- [12-MASTER-ROADMAP-ARCHITECTURE.md](../../phases/roadmap/12-MASTER-ROADMAP-ARCHITECTURE.md)
