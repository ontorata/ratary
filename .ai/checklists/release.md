# Release Checklist

**Purpose:** Pre-release verification beyond merge gates.

---

- [ ] All TASK_PROMPT deliverables complete
- [ ] ARCHITECTURE.md phase status accurate
- [ ] ADR statuses updated (Proposed → Approved where applicable)
- [ ] CHANGELOG or release notes updated if user-visible
- [ ] PANDUAN.md updated if operator steps changed
- [ ] `.env.example` reflects new configuration
- [ ] No known blocker issues in handoff memory
- [ ] Migration idempotency verified if schema changed
- [ ] Production secrets not in repository

---

*Checklist only — subordinate to [05-DEVELOPMENT-WORKFLOW.md](../../workflow/05-WORKFLOW.md) release stage.*
