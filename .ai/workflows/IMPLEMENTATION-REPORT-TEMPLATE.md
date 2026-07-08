# Implementation Report — Agent Handoff Template

Use when **Cursor (or primary execution agent)** hands work to **Claude Code (review/execute)** or another execution agent.

Copy, fill, and attach to handoff prompt. Repository paths must be real — no assumed context.

---

## Implementation Report

| Field | Value |
|-------|-------|
| **Date** | YYYY-MM-DD |
| **From agent** | Cursor \| … |
| **To agent** | Claude Code \| … |
| **Branch** | |
| **Baseline** | tag / commit |
| **Wave / scope** | e.g. P0-B Wave 3 — governance only |

---

### Task executed

<!-- One paragraph: what was implemented and why -->

---

### Files changed

| Path | Change |
|------|--------|
| | |

---

### Architecture impact

<!-- None for governance-only waves -->

| ADR | Action |
|-----|--------|
| | N/A \| follows \| amends |

---

### Tests executed

```bash
# paste commands
```

| Command | Result |
|---------|--------|
| `npm test` | |
| `npm run ci:governance` | |

---

### Governance artifacts updated

- `.ai/...`
- `docs/...`

---

### Documentation impact categories

- [ ] Governance
- [ ] Architecture
- [ ] No impact (explain)

---

### Known risks / open items

-

---

### Next action for receiving agent

<!-- Single step: review · refactor · commit · run wave N+1 -->

---

### Completion status

- [ ] Ready for governance review
- [ ] Ready for merge
- [ ] Blocked — reason:

---

## Related

- [CHANGE-EVIDENCE.md](./CHANGE-EVIDENCE.md)
- [COMPLETION-REPORT-TEMPLATE.md](../core/governance/COMPLETION-REPORT-TEMPLATE.md)
