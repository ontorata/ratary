# Phase 07.1 — Agent Forge — RISKS

| ID | Risk | Mitigation | Status |
|----|------|------------|--------|
| R-01 | Agents ignore skills despite rule | `alwaysApply` rule + owner habit; Recall at session start | Accepted |
| R-02 | Skill pack drift from constitution | `forge-inspect` constitutional severity; `.ai/` authority chain | Mitigated |
| R-03 | MCP unavailable — Recall/Remember skipped | Chat handoff fallback in `forge-remember` | Mitigated |
| R-04 | Duplicate SSOT (agent-forge vs phase) | Single folder `phases/07.1-agent-forge/` | Resolved |
