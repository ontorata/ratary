# Pre-Merge Checklist

**Purpose:** Pre-merge verification. Authoritative rules: [08-REVIEW-CHECKLIST.md](../../core/standards/08-REVIEW.md).

---

Canonical checklist: [.ai/core/standards/08-REVIEW.md](../../core/standards/08-REVIEW.md)

**Minimum gate before merge:**

- [ ] `npm run lint && npm run format:check && npm run typecheck && npm test` passes
- [ ] Architecture and layer boundaries respected
- [ ] No scope leakage; all queries owner-scoped
- [ ] API and MCP contracts preserved or owner-approved
- [ ] Tests cover changed behavior
- [ ] Documentation updated per [07-DOCUMENTATION-STANDARD.md](../../core/standards/07-DOCUMENTATION.md)
- [ ] No secrets in diff
- [ ] TASK_PROMPT definition of done satisfied

---

*Checklist only — full criteria in canonical file.*
