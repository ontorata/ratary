# Decision Gate Checklist

**Purpose:** Pre-code verification. Authoritative rules: [13-AI-DECISION-FRAMEWORK.md](../../core/decision-framework/13-AI-DECISION-FRAMEWORK.md).

---

Before generating code, verify:

- [ ] Constitution read; no violation
- [ ] Relevant Approved ADRs read
- [ ] Structural architecture preserved ([04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md))
- [ ] Existing implementation checked; canonical owner identified
- [ ] Extension chosen over new module (or design discussion complete)
- [ ] No duplicated logic, services, repositories, or utilities
- [ ] Backward compatible (or owner-approved break)
- [ ] Security preserved ([11-SECURITY-STANDARD.md](../../supplementary/SECURITY.md))
- [ ] Future phases not blocked ([09-ROADMAP.md](../../roadmap/09-ROADMAP.md))
- [ ] Pre-code analysis complete ([ENGINEERING.md](../../workflow/05-WORKFLOW.md))
- [ ] Escalations resolved ([prompts/escalation.md](../prompts/escalation.md))

**If any item fails → do not code.**

---

*Checklist only — not law.*
