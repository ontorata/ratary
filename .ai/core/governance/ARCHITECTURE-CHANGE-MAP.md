# Architecture Change Map

| Field | Value |
|-------|-------|
| **Status** | Active — P0-B Wave 1 |
| **Authority** | [CHANGE-GATING.md](./CHANGE-GATING.md) |
| **Enforcement** | `npm run ci:adr-impact` |

---

## Purpose

Map **code paths** to **required ADR coverage** so architecture-impacting PRs cannot merge without an explicit decision record.

---

## Trigger paths → ADR

| Path pattern | ADR | Change types requiring amendment |
|--------------|-----|----------------------------------|
| `src/auth/` (except pure formatting) | ADR-0001 · ADR-0003 | Identity resolution · middleware order · permission evaluation |
| `src/scope/` | ADR-0001 · ADR-0002 | Org/workspace resolution · scope hints · isolation |
| `src/transport/shared/` · `src/transport/mcp/remote/` | ADR-0004 · ADR-0003 | Transport scope · MCP remote auth · handler scope |
| `src/db/migrations.ts` · `schema.sql` (tenant tables) | ADR-0002 | Organization/workspace schema · tenant columns |
| `tests/identity/` (behavior change) | ADR-0001–0004 | Isolation · parity · permission contract tests |

---

## ADR reference signals (CI)

A PR satisfies ADR gating when **any** of the following appear in the diff against base:

| Signal | Pattern |
|--------|---------|
| Core architecture ADR | `.ai/core/architecture/ADR-*.md` |
| Public index update | `docs/architecture/governance/adr-index.md` |
| Cross-product ADR | `.ai/core/adr/ADR-*.md` |

If **trigger paths** change without **ADR signals**, `ci:adr-impact` **fails**.

---

## Mandatory review topics

| Topic | ADR |
|-------|-----|
| Identity | ADR-0001 |
| Tenant | ADR-0002 |
| Permission | ADR-0003 |
| Data ownership / scope | ADR-0001 · ADR-0002 |
| Transport boundary | ADR-0004 |

---

## Exemptions

| Change | ADR required? |
|--------|---------------|
| Comment-only / typo in trigger paths | No |
| Test assertion update matching unchanged behavior | No — if no production code change |
| Wave 1 governance-only commits (this map, ADRs, CI script) | N/A — no trigger path change |

When unsure → file ADR amendment.

---

## Related

- [ADR-INDEX.md](../architecture/ADR-INDEX.md)
- [IMPLEMENTATION-COMPLETION-PROTOCOL.md](./IMPLEMENTATION-COMPLETION-PROTOCOL.md)
