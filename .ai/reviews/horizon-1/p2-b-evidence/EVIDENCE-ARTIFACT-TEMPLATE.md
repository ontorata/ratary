# Evidence Artifact Template

**This is a template for creating P2-B evidence artifacts.**

**Copy this template when creating new evidence.**

---

```markdown
---
evidence-id: EVD-XXX
quality-level: L3
claim: [Architectural claim being validated]
adr-reference: ADR-XXXX
success-criteria: [Reference to SUCCESS-CRITERIA-PER-LEVEL.md]
quality-attribute: [Reference to QUALITY-ATTRIBUTE-SCENARIOS.md]
test-date: YYYY-MM-DD
commit: [Git commit hash]
reviewer: [Reviewer name]
status: Pending
---

# Evidence: [Short Description]

**Quality Level:** L3 (Automated Evidence)  
**ADR Reference:** ADR-XXXX  
**Claim:** [Architectural claim being validated]

---

## Evidence Acceptance Criteria (9 Questions)

### 1. What was tested?

**Exact feature/capability tested:**

[Description]

**Architectural claim being validated:**

[Claim reference]

**ADR reference:**

ADR-XXXX ([ADR title])

---

### 2. How was it tested?

**Test method:**

[Automated test / Manual test / Code review / Observation]

**Test type:**

[Unit / Integration / E2E / Chaos / Stress / Performance]

**Test tool/framework:**

[Vitest / Jest / Playwright / K6 / etc.]

**Test suite location:**

[File path, e.g., tests/integration/provider-swap.test.ts]

---

### 3. When was it tested?

**Test execution date:**

YYYY-MM-DD HH:MM UTC+7

**Test duration:**

[Duration, e.g., 45 seconds]

---

### 4. Which commit/version?

**Implementation commit:**

[Git commit hash]

**Test commit:**

[Git commit hash, if different]

**Branch:**

[Branch name, e.g., feature/p2-b-provider-integration]

---

### 5. What was the configuration?

**Environment:**

[Development / Staging / Production]

**Configuration files:**

[.env.staging / .env.production / etc.]

**Provider configuration:**

[OpenAI (gpt-4), Anthropic (claude-3-5-sonnet), etc.]

**Secrets/credentials handling:**

[Anonymized / Redacted in logs]

---

### 6. What was the expected result?

**Expected behavior:**

[Description of expected behavior]

**Success criteria reference:**

[Reference to SUCCESS-CRITERIA-PER-LEVEL.md, e.g., Provider Independence (P2-B Level 1)]

---

### 7. What was the actual result?

**Actual behavior:**

[Description of actual behavior]

**Pass/fail status:**

[PASS / FAIL]

**Deviations from expected:**

[None / List deviations]

---

### 8. What is the quality level?

**Quality level:**

L3 (Automated Evidence)

**Justification:**

- ✅ Fully automated
- ✅ CI/CD integrated
- ✅ Reproducible by anyone
- ✅ Version controlled

---

### 9. How can it be reproduced?

**Exact reproduction steps:**

```bash
# Step 1: Checkout commit
git checkout [commit-hash]

# Step 2: Install dependencies
npm ci

# Step 3: Copy configuration
cp .env.staging .env

# Step 4: Run test
npm run test:integration -- [test-file-path]
```

**Access requirements:**

[None / Staging environment access / API keys required]

**Expected output:**

[Description of expected test output]

---

## Evidence Details

### Test Results

**Test output:**

```
[Paste test output here]
```

**Test logs:**

[Link to CI/CD logs or attach logs]

---

### Observations

**Key observations:**

[List key observations from test execution]

**Surprises:**

[Any unexpected behavior?]

---

### Limitations

**What was NOT tested:**

[Explicitly state what was not covered by this evidence]

**Known limitations:**

[Any limitations of this evidence?]

**Assumptions:**

[Any assumptions made during testing?]

---

## Traceability

**ADR:**

ADR-XXXX ([ADR title])

**Success Criteria:**

[Reference to SUCCESS-CRITERIA-PER-LEVEL.md section]

**Quality Attribute:**

[Reference to QUALITY-ATTRIBUTE-SCENARIOS.md scenario]

**Related Evidence:**

- EVD-XXX ([Related evidence])
- EVD-YYY ([Related evidence])

---

## Reviewer Sign-Off

**Reviewer:** [Name]  
**Review Date:** [YYYY-MM-DD]  
**Review Status:** [Pending/Accepted/Rejected/Needs Revision]

**Review Comments:**

[Reviewer comments]

**Acceptance Checklist:**

- [ ] Quality level assigned and justified
- [ ] All 9 acceptance criteria questions answered
- [ ] Evidence traces to ADR/Success Criteria/Quality Attribute
- [ ] Reproduction steps provided and tested
- [ ] Evidence labeled correctly (file name + front matter)
- [ ] Limitations and assumptions documented
- [ ] No obvious confirmation bias

---

**Evidence Version:** 1.0  
**Date:** [YYYY-MM-DD]  
**Status:** [Pending/Accepted/Rejected]  
**Authority:** [Author name]
```

---

## Usage Instructions

### Step 1: Copy Template

Copy this entire template to create a new evidence artifact.

### Step 2: Name File

Use naming convention:

```
EVD-<id>-<quality-level>-<short-description>.md

Example:
EVD-001-L3-provider-swap-test.md
```

### Step 3: Fill Front Matter

Replace all placeholders in YAML front matter:

```yaml
---
evidence-id: EVD-001
quality-level: L3
claim: Provider abstraction survives replacement (ADR-1001)
adr-reference: ADR-1001
success-criteria: Provider Independence (P2-B Level 1)
quality-attribute: QA-MAINT-001 (Provider Addition)
test-date: 2026-07-11
commit: a3f0e42c
reviewer: chief-architect
status: Pending
---
```

### Step 4: Answer All 9 Questions

Fill in each of the 9 evidence acceptance criteria questions with specific, concrete information.

### Step 5: Provide Test Results

Include test output, logs, and observations.

### Step 6: Document Limitations

Explicitly state what was NOT tested and any known limitations or assumptions.

### Step 7: Ensure Traceability

Link evidence to ADR, Success Criteria, and Quality Attribute.

### Step 8: Submit for Review

Submit evidence to reviewer (Chief Architect or Independent Reviewer).

### Step 9: Update Index

After acceptance, add entry to `03-EVIDENCE-INDEX.md`.

### Step 10: Update Traceability Matrix

After acceptance, update `02-ADR-TRACEABILITY-MATRIX.md`.

---

## Quality Level Selection Guide

### Choose L1 (Observational) if:

- Manual observation only
- No formal validation method
- Single perspective
- **NOT acceptable for high-confidence verdicts**

### Choose L2 (Documented) if:

- Structured documentation
- Reproducible conditions documented
- Multiple observations
- Manual verification required

### Choose L3 (Automated) if:

- Fully automated test
- CI/CD integrated
- Reproducible by anyone
- Version controlled
- **REQUIRED for high-confidence verdicts**

### Choose L4 (Adversarial) if:

- All L3 characteristics
- Adversarial testing (attempting to break)
- Independent validation
- Stress/chaos scenarios
- **REQUIRED for resilience claims**

---

## Example Evidence Artifact

**See:** `evidence/EVD-000-L3-example-template.md` (if created as example)

---

**Document Version:** 1.0 (TEMPLATE)  
**Date:** 2026-07-11  
**Status:** Template for P2-B Evidence Artifacts  
**Authority:** Chief Architect  
**Cross-Reference:** 00-EVIDENCE-QUALITY-FRAMEWORK.md, 02-ADR-TRACEABILITY-MATRIX.md, 03-EVIDENCE-INDEX.md
