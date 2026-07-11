# P2-B Evidence Quality Framework

**Horizon:** 1 (Architecture Foundation Framework)  
**Phase:** P2-B (Provider Integration & Architecture Validation)  
**Document Type:** Evidence Quality Framework  
**Date:** 2026-07-11  
**Authority:** Chief Architect

---

## Purpose

This framework defines **evidence quality standards** for P2-B architectural validation.

**Critical Principle:**

> **Architecture verdicts MUST be based on high-quality evidence.**

Low-quality evidence → Low-confidence verdict → Architectural risk

---

## Evidence Quality Levels

### L1: Observational Evidence

**Definition:**

- Direct observation of system behavior
- No formal validation method
- Single perspective

**Characteristics:**

- ✅ Easy to capture
- ✅ Quick to produce
- ❌ Low reproducibility
- ❌ Single-observer bias
- ❌ Context-dependent

**Example:**

> "I ran the provider and it worked."

**Acceptable Uses:**

- Preliminary investigation
- Initial hypothesis formation
- Low-impact decisions

**NOT Acceptable For:**

- High-confidence architectural verdicts
- Production readiness decisions
- Baseline validation

---

### L2: Documented Evidence

**Definition:**

- Structured documentation of behavior
- Reproducible conditions documented
- Multiple data points

**Characteristics:**

- ✅ Reproducible conditions
- ✅ Structured format
- ✅ Multiple observations
- ⚠️ Manual verification required
- ❌ No automated validation

**Example:**

> "Test case TC-001: Provider swap test
> - Configuration: OpenAI → Anthropic
> - Test date: 2026-07-11 14:30 UTC+7
> - Result: All 15 test scenarios passed
> - Evidence: Test log attached"

**Acceptable Uses:**

- Medium-impact decisions
- Initial evidence for architectural claims
- Documentation of manual validation

**NOT Acceptable For:**

- High-confidence architectural verdicts (without L3+ support)
- Continuous validation claims

---

### L3: Automated Evidence

**Definition:**

- Automated test validation
- Reproducible via CI/CD
- Version-controlled test suite

**Characteristics:**

- ✅ Fully automated
- ✅ CI/CD integrated
- ✅ Reproducible by anyone
- ✅ Version controlled
- ⚠️ Limited to "what was tested"

**Example:**

> "Automated swap test suite (v1.2.0)
> - Test: tests/integration/provider-swap.test.ts
> - CI Pipeline: GitHub Actions #482
> - Commit: a3f0e42c
> - Result: 271 tests passed
> - Evidence: CI log + test coverage report"

**Acceptable Uses:**

- High-confidence architectural verdicts
- Production readiness evidence
- Baseline validation
- Continuous validation

**Required For:**

- All critical architectural claims
- All P2-B success criteria validation
- All "production-ready" claims

---

### L4: Adversarial Evidence

**Definition:**

- Evidence from attempting to break the system
- Stress testing, chaos engineering
- Independent validation (not by implementer)

**Characteristics:**

- ✅ All L3 characteristics
- ✅ Adversarial testing
- ✅ Independent review
- ✅ Stress/chaos scenarios

**Example:**

> "Provider failover chaos test (v1.0.0)
> - Test: Randomly kill provider mid-request
> - Scenarios: 1000 requests with random failures
> - Independent reviewer: @reviewer-name
> - Result: 100% graceful degradation
> - Evidence: Chaos test report + independent review sign-off"

**Acceptable Uses:**

- Highest-confidence architectural verdicts
- Production resilience claims
- Critical architectural invariants validation

**Required For:**

- Claims about resilience, fault tolerance
- Claims about "production-ready under stress"
- Critical quality attributes (QA-AVAIL-*, QA-PERFORM-*)

---

## Evidence Acceptance Criteria

**Every piece of evidence submitted for P2-B MUST answer these 9 questions:**

### 1. What was tested?

**Required Information:**

- Exact feature/capability tested
- Exact architectural claim being validated
- ADR reference (if applicable)

**Example:**

> "Provider abstraction: Zero consumer changes when replacing provider (ADR-1001)"

---

### 2. How was it tested?

**Required Information:**

- Test method (automated test, manual test, observation, code review)
- Test type (unit, integration, e2e, chaos, stress)
- Test tool/framework

**Example:**

> "Automated integration test using Vitest
> Test suite: tests/integration/provider-swap.test.ts
> Test method: Replace OpenAI with Anthropic, run all Studio workflows"

---

### 3. When was it tested?

**Required Information:**

- Test execution date and time (UTC+7)
- Test duration (if long-running)

**Example:**

> "Executed: 2026-07-11 14:30 UTC+7
> Duration: 45 seconds"

---

### 4. Which commit/version?

**Required Information:**

- Git commit hash (implementation code)
- Git commit hash (test code, if different)
- Branch name

**Example:**

> "Implementation: ai-brain @ a3f0e42c
> Test: ai-brain @ a3f0e42c
> Branch: feature/p2-b-provider-integration"

---

### 5. What was the configuration?

**Required Information:**

- Environment (development, staging, production)
- Configuration files used
- Secrets/credentials handling (anonymized)
- Provider configuration (if applicable)

**Example:**

> "Environment: staging (ontory-staging.ontorata.com)
> Config: .env.staging (API keys anonymized)
> Providers: OpenAI (gpt-4), Anthropic (claude-3-5-sonnet)"

---

### 6. What was the expected result?

**Required Information:**

- Expected behavior
- Success criteria reference

**Example:**

> "Expected: All 15 Studio workflows complete successfully with Anthropic
> Success Criteria: Zero consumer changes (SUCCESS-CRITERIA-PER-LEVEL.md, P2-B Level 1)"

---

### 7. What was the actual result?

**Required Information:**

- Actual behavior observed
- Pass/fail status
- Deviations from expected (if any)

**Example:**

> "Actual: 15/15 workflows passed
> Status: PASS
> Deviations: None"

---

### 8. What is the quality level?

**Required Information:**

- Quality level (L1, L2, L3, L4)
- Justification for level

**Example:**

> "Quality Level: L3 (Automated Evidence)
> Justification: Automated test suite, CI/CD integrated, reproducible"

---

### 9. How can it be reproduced?

**Required Information:**

- Exact reproduction steps
- Commands to run (if automated)
- Access requirements (if manual)

**Example:**

```bash
# Reproduction steps
git checkout a3f0e42c
npm ci
cp .env.staging .env
npm run test:integration -- tests/integration/provider-swap.test.ts
```

---

## Evidence Labeling Standard

**All evidence artifacts MUST be labeled with their quality level.**

**File naming convention:**

```
<evidence-id>-<quality-level>-<short-description>.md

Example:
EVD-001-L3-provider-swap-test.md
EVD-002-L2-deployment-validation.md
EVD-003-L4-chaos-test-report.md
```

**Markdown front matter:**

```markdown
---
evidence-id: EVD-001
quality-level: L3
claim: Provider abstraction survives replacement (ADR-1001)
test-date: 2026-07-11
commit: a3f0e42c
reviewer: chief-architect
---
```

---

## Verdict Confidence Matrix

**Evidence Quality → Verdict Confidence mapping:**

| Evidence Quality | Verdict Confidence | Use Case |
|------------------|-------------------|----------|
| L1 only | **Low** (≤60%) | Preliminary findings, hypothesis |
| L2 only | **Medium** (60-80%) | Initial validation, medium-impact decisions |
| L3 (≥2 artifacts) | **High** (80-95%) | Production readiness, architectural validation |
| L4 (≥1 artifact) | **Very High** (≥95%) | Critical architectural invariants, resilience |

**Rule:**

> **High-confidence verdicts REQUIRE L3+ evidence.**

**Example:**

❌ **Invalid Verdict:**

> "Provider abstraction is production-ready."
> 
> Evidence: L1 (manual observation: "I swapped providers and it worked")

✅ **Valid Verdict:**

> "Provider abstraction is production-ready."
> 
> Evidence:
> - EVD-001 (L3): Automated swap test (271 tests passed)
> - EVD-002 (L3): CI/CD pipeline green (3 providers integrated)
> - EVD-003 (L3): Integration test suite (100% pass rate)
> - EVD-004 (L2): Code review (zero business logic changes)

---

## Evidence Package Requirements

**P2-B Evidence Package MUST contain:**

### Minimum Evidence Quality Distribution

| Quality Level | Minimum Count | Required For |
|--------------|---------------|--------------|
| L3 | ≥10 artifacts | All critical architectural claims |
| L2 | ≥5 artifacts | Documentation/manual validation |
| L4 | ≥2 artifacts | Resilience/stress testing claims |

**Rationale:**

- L3 minimum ensures all critical claims are automated and reproducible
- L2 supplements for areas not yet automated
- L4 ensures resilience claims are validated under stress

---

### Evidence Coverage Matrix

**Evidence MUST cover all dimensions:**

| Dimension | Required Evidence |
|-----------|-------------------|
| Architecture | L3: Swap test, Lifecycle validation |
| Engineering | L3: Test suite, Deployment logs |
| Governance | L2: ADR review, Baseline diff |
| Evidence | L3: Traceability matrix, Evidence index |

---

## Evidence Review Gate

**Before any evidence artifact is accepted into Evidence Package:**

### Evidence Reviewer Checklist

- [ ] Quality level assigned (L1/L2/L3/L4)
- [ ] Quality level justified
- [ ] All 9 acceptance criteria questions answered
- [ ] Reproduction steps provided
- [ ] Evidence labeled correctly (file name + front matter)
- [ ] Evidence traceable to ADR/Success Criteria/Quality Attribute

**Reviewer Authority:**

- Chief Architect (final approval)
- Engineering Lead (L3 automation review)
- Independent Reviewer (L4 adversarial validation)

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Low-Quality Evidence for High-Impact Decisions

**Example:**

> "Provider abstraction is production-ready."
> 
> Evidence: L1 (manual observation)

**Why Wrong:**

- High-impact claim requires high-quality evidence (L3+)
- Manual observation not reproducible

**Correct Approach:**

- Write automated swap test (L3)
- CI/CD integration (L3)
- Independent review (L4, if critical)

---

### ❌ Anti-Pattern 2: Evidence Without Traceability

**Example:**

> "Test suite passed."

**Why Wrong:**

- No trace to architectural claim
- No trace to ADR or success criteria

**Correct Approach:**

- Link evidence to ADR-1001 (Provider Abstraction)
- Link to SUCCESS-CRITERIA-PER-LEVEL.md (Provider Independence)
- Link to QUALITY-ATTRIBUTE-SCENARIOS.md (QA-MAINT-001)

---

### ❌ Anti-Pattern 3: Evidence Without Reproducibility

**Example:**

> "Test passed on my machine."

**Why Wrong:**

- Not reproducible by others
- No commit hash, no configuration, no environment

**Correct Approach:**

- Commit hash: a3f0e42c
- Environment: staging
- Config: .env.staging
- Reproduction: `npm run test:integration`

---

## Governance Rule

**Evidence Quality Gate is NON-NEGOTIABLE.**

> **If evidence quality is insufficient, the verdict is INVALID.**

**Process:**

```
Evidence Submitted
    ↓
Quality Level Assigned
    ↓
9 Questions Answered? → NO → REJECTED (insufficient metadata)
    ↓ YES
Quality Level Sufficient for Claim? → NO → REJECTED (quality too low)
    ↓ YES
Reproducible? → NO → REJECTED (cannot verify)
    ↓ YES
Evidence ACCEPTED
```

---

## Summary

**P2-B Evidence Quality Standards:**

1. **L3+ evidence REQUIRED** for all high-confidence architectural verdicts
2. **All evidence MUST answer 9 acceptance criteria questions**
3. **Evidence MUST be labeled** with quality level (file name + front matter)
4. **Evidence MUST be traceable** to ADR/Success Criteria/Quality Attribute
5. **Evidence MUST be reproducible** (commit + config + steps)

**Outcome:**

> If P2-B Evidence Package meets these standards, Architecture Assessment can produce **high-confidence verdict** on Stage 1.0 validity.

---

**Document Version:** 1.0 (FINAL)  
**Date:** 2026-07-11  
**Status:** Authoritative Evidence Quality Standard for P2-B  
**Authority:** Chief Architect  
**Cross-Reference:** P2-B-DEFINITION-OF-DONE.md, SUCCESS-CRITERIA-PER-LEVEL.md
