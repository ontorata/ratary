# Architecture

**Purpose:** Durable description of system structure — not decision history.

**Why this folder exists:** ADRs explain *why a choice was made*; architecture docs explain *what the system is*. Separating them lets structure be updated without rewriting decision history.

---

## Documents

| File | Responsibility |
|------|----------------|
| [structural-law.md](structural-law.md) | Layer boundaries, ports, dependency direction (permanent) |
| [operational-snapshot.md](operational-snapshot.md) | Current phase status, ports, deployment facts (mutable) |

---

## Rules

- Structural law changes require ADR when boundaries move.
- Operational snapshot MAY be updated by maintainers after each phase.
- MUST NOT contain implementation code.

---

*Must align with [constitution](../governance/constitution/README.md) and [accepted ADRs](../decisions/accepted/README.md).*
