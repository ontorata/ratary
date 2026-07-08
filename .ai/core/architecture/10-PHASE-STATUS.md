# 10 — Phase Status

**Status:** Living operational snapshot (mutable).  
**Audience:** AI assistants and maintainers.  
**Authority:** Subordinate to [04-ARCHITECTURE.md](../04-ARCHITECTURE.md) (structural law).

**Last updated:** Governance alignment — native auth (2026-07-07) · Phases 32–34 gate PASS (2026-07-06) · main `28e6719`

---

# Purpose

Record **live** project metrics, deployment facts, and documented technical debt.

Gate evidence: `.ai/phases/NN-name/COMPLETION.md` · Public: [docs/PHASES-32-34.md](../../../docs/PHASES-32-34.md).

---

# Live metrics

| Metric | Value |
|--------|-------|
| Tests passing (OSS repo vitest) | 23 |
| MCP tools | 28 |
| Agent Forge skills | 13 |
| REST deploy | Vercel (`api/index.ts`) · `https://ratary.ontorata.com` |
| MCP entry | `npm run mcp` / `npm run setup` |
| npm packages | `@ratary/sdk@1.1.0` · `@ratary/cli@1.1.0` · `@ratary/mcp-server@1.1.0` |
| Knowledge fabric prod | ON (Notion) · `supportsKnowledgeFabric: true` |

---

# Current phase pointer

| Item | Value |
|------|-------|
| **Company phase** | **Phase 4 — Proof of Platform** — `.ai/phases/04-proof-of-platform/PHASE.md` |
| **Structure** | Frozen 2026-07-08 — evolution allowed |
| **Core memory path** | Phases 1–11 — default deploy unchanged |
| **Enterprise platform** | Phases 10.5–25 + **32–34** — implemented, **default OFF** |
| **Last gates** | 28 SDK · 29 Connectors · **32 Universal fabric · 33 Neptune · 34 Enterprise connectors** — PASS (2026-07-06) |
| **Next work** | Phase 4 evidence — OTel, isolation, workloads metric, Studio beta |
| **Blocker** | Evidence, not documentation |

---

# Deployment and ops commands

| Command | Purpose |
|---------|---------|
| `.\scripts\vercel-production-env.ps1` | Push fabric/connector env to Vercel |
| `npm run db:migrate` | Apply migrations (incl. `knowledge_fabric_provenance`) |
| `npx tsx scripts/test-connector-sync.ts --connector <id> --url <host> --dry-run` | Connector smoke |
| `npm run generate:sdks` | Regenerate OpenAPI language SDKs (Java 11+) |

User onboarding: [PANDUAN.md](../../../docs/PANDUAN.md).

---

# Known technical debt

| ID | Item | Status |
|----|------|--------|
| D-GOV | Phase governance scaffolds | Mitigated — COMPLETION.md for 28–29, 32–34 |
| OPS-CI | SDK codegen workflow on GitHub | Open — [SDK-CODEGEN-CI.md](../../../docs/SDK-CODEGEN-CI.md) |
| OPS-OAUTH | ChatGPT MCP OAuth | Open — DCR IdP setup |
| OPS-DIR | MCP directory PRs | Open — [directory-status.md](../../../MCP/submission/directory-status.md) |
| GOV-AUTH | Auth governance docs | **Done** — `.ai/core/constitution/` + ADR-006; Studio `docs/auth/` |
| GOV-2 | AI / data / model governance | **Done** — ADR-007, 008, 009; public mirror `docs/architecture/governance/` |
| GOV-3 | Observability pipeline | Open — ADR-010 candidate |

Aggregate: [docs/CROSS-PHASE-DEBT.md](../../../docs/CROSS-PHASE-DEBT.md).

---

*Operational snapshot only.*
