# Ontorata Engineering — Constitution Summary

**Status:** Public mirror (summary)  
**Canonical source:** `.ai/core/constitution/ENGINEERING-CONSTITUTION.md` (local, gitignored)  
**Last updated:** 2026-07-07

> Full constitution text is maintained in `.ai/` for AI agents and lead maintainers.  
> This document is the **onboarding summary** for all engineers.

---

## Authority

| Priority | Document |
|----------|----------|
| 1 | Engineering Constitution |
| 2 | ADRs (`.ai/core/adr/`) |
| 3 | Product docs (`docs/`, Studio `docs/`) |
| 4 | Implementation (`src/`) |

---

## Products

| Product | Role |
|---------|------|
| **Ratary** | AI Brain — memory, knowledge, agents, RAG, eval, MCP, REST |
| **Ontory** | Enterprise assistant — persona, conversation UX (not data SoR) |
| **Studio** | Enterprise builder — configure and operate Ratary |
| **Auth Gateway** | Credential boundary — not AI data plane |

---

## Non-negotiable rules

1. **API First** — cross-product integration via REST/MCP/OIDC only
2. **Provider Agnostic** — LLM/IdP behind interfaces
3. **Security First** — least privilege, audit at boundaries
4. **ADR Required** — significant architecture changes documented
5. **Enterprise Ready** — multi-tenant `owner_id`, SSO paths
6. **Modular Architecture** — Studio ≠ Auth ≠ Ratary

---

## AI ownership (ADR-007)

| Owns | Product |
|------|---------|
| Memory, knowledge, retrieval, agents, tools, evaluation | **Ratary** |
| Persona, conversation experience | **Ontory** |
| Token generation only | **LLM provider** (via Ratary ports) |
| Builder UI | **Studio** |

---

## Data & models (ADR-008, ADR-009)

- All durable AI data → **Ratary**, scoped by `owner_id`
- Training data → **opt-in** per tenant; anonymization required
- Model lifecycle → dataset → validation → training → eval → RC → production → monitoring → retraining

---

## Getting full constitution

Maintainers with local clone: read `.ai/core/constitution/ENGINEERING-CONSTITUTION.md`

---

## Related

- [adr-index.md](./adr-index.md)
- [GOVERNANCE-STATUS mirror](./GOVERNANCE-STATUS.md)
- [../../auth/](../../../Ontorata-Studio/docs/auth/) (Studio — separate repo)
