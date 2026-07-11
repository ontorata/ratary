# P2-B Issue Classification Framework

**Horizon:** 1 (Architecture Foundation Framework)  
**Phase:** P2-B (Provider Integration & Architecture Validation)  
**Document Type:** Issue Classification Framework  
**Date:** 2026-07-11  
**Authority:** Chief Architect

---

## Purpose

This framework defines **how to classify findings during P2-B** to prevent all discoveries from being incorrectly labeled as "Architecture Debt."

**Critical Principle:**

> **Not all findings are debt. Some are issues. Some are limitations. Only architectural consequences requiring future evolution are debt.**

---

## Three Categories

### 1. Issue

**Definition:**

> A deviation from expected behavior or a problem that MUST be fixed before production.

**Characteristics:**

- ❌ Violates specification
- ❌ Breaks tests
- ❌ Introduces bugs
- ❌ Causes errors
- ✅ Can be fixed NOW (within P2-B scope)

**Examples:**

> **ISS-001: Provider fails when rate limit exceeded**
> - Category: Issue
> - Impact: High (production blocker)
> - Action: Fix within P2-B (add rate limit handling)
> - ADR: Not required (bug fix)

> **ISS-002: Test suite fails intermittently**
> - Category: Issue
> - Impact: Medium (CI/CD unreliable)
> - Action: Fix within P2-B (stabilize tests)
> - ADR: Not required (test quality)

**Classification Criteria:**

- Violates specification? → Issue
- Breaks existing tests? → Issue
- Causes production errors? → Issue
- Can be fixed within current phase? → Issue

**Action:**

- Fix immediately (if high/critical impact)
- Backlog (if medium/low impact)
- **NO ADR REQUIRED** (unless architectural decision needed)

---

### 2. Limitation

**Definition:**

> A known boundary or constraint of the current design that is ACCEPTED and does NOT require immediate evolution.

**Characteristics:**

- ✅ Known and documented
- ✅ Acceptable within current scope
- ✅ Does not violate specifications
- ⚠️ May require evolution in future phases
- ✅ Documented with trigger conditions

**Examples:**

> **LIM-001: Provider abstraction supports 3 providers (OpenAI, Anthropic, Gemini) only**
> - Category: Limitation
> - Impact: Low (sufficient for P2-B)
> - Accepted: Yes (P2-B scope = 3 providers)
> - Trigger: When P3 requires 4th provider
> - ADR: ADR-1001 (Provider Abstraction Strategy, scope = 3 providers)

> **LIM-002: No automatic failover between providers**
> - Category: Limitation
> - Impact: Medium (manual failover required)
> - Accepted: Yes (P2-B does not require auto-failover)
> - Trigger: When P4 requires high availability
> - ADR: ADR-1005 (Provider Failover Strategy, deferred to P3)

**Classification Criteria:**

- Known boundary? → Limitation
- Accepted within current scope? → Limitation
- Documented explicitly? → Limitation
- Does NOT violate specifications? → Limitation
- Trigger condition defined? → Limitation

**Action:**

- Document in ADR (if architectural)
- Document trigger condition (when to revisit)
- Monitor (ensure limitation does not become issue)
- **NO immediate action required**

---

### 3. Architecture Debt

**Definition:**

> A consequence of an architectural decision that will REQUIRE architectural evolution in a future phase.

**Characteristics:**

- ⚠️ Intentional compromise (not a bug)
- ⚠️ Creates future work
- ⚠️ Requires architectural evolution (not just bug fix)
- ⚠️ May impact baseline (Stage 1.0 or later)
- ⚠️ Accumulates risk if not addressed

**Examples:**

> **DEBT-001: Provider abstraction tightly coupled to HTTP REST**
> - Category: Architecture Debt
> - Impact: Medium (limits future protocols)
> - Rationale: P2-B scope = HTTP REST only
> - Future Evolution: P4 may require WebSocket, gRPC
> - ADR: ADR-1001 (Provider Abstraction Strategy, HTTP REST assumption)
> - Trigger: When non-HTTP providers needed (e.g., local models via gRPC)

> **DEBT-002: Context assembly occurs in Studio, not ACOS layer**
> - Category: Architecture Debt
> - Impact: High (violates ACOS ownership model)
> - Rationale: P2-B deferred ACOS layer implementation
> - Future Evolution: P3 must move context assembly to ACOS
> - ADR: ADR-1053 (ACOS Deployment Model, assembly deferred)
> - Trigger: P3 (Context Manager Prototype)

**Classification Criteria:**

- Intentional compromise? → Debt
- Requires architectural evolution? → Debt
- Creates future work? → Debt
- May impact baseline? → Debt
- Documented in ADR? → Debt (if architectural)

**Action:**

- Document in **Architecture Debt Register** (ADRg)
- Document rationale (why compromise accepted)
- Document trigger (when debt must be addressed)
- Document evolution plan (how to resolve)
- **MAY require ADR** (if architectural decision)

---

## Classification Decision Tree

```
Finding Discovered
    ↓
Violates specification? → YES → Issue
    ↓ NO
Breaks tests? → YES → Issue
    ↓ NO
Can be fixed within P2-B? → YES → Issue
    ↓ NO
Accepted within current scope? → YES → Limitation
    ↓ NO
Requires architectural evolution? → YES → Architecture Debt
    ↓ NO
Document as Observation (no action)
```

---

## Governance Rules

### Rule 1: All Findings MUST Be Classified

**Process:**

```
Finding Discovered
    ↓
Classify (Issue / Limitation / Debt)
    ↓
Document in appropriate register:
    - Issue → Issue Tracker (GitHub Issues, Jira, etc.)
    - Limitation → ADR (scope section)
    - Debt → Architecture Debt Register (ADRg)
```

---

### Rule 2: Classification MUST Be Justified

**Every classification MUST answer:**

1. **Why is this [Issue/Limitation/Debt]?**
2. **What is the impact?**
3. **What is the trigger condition?** (when to revisit)
4. **What is the action?** (fix now, monitor, defer)

**Example:**

> **Finding:** Provider abstraction does not support streaming responses
> 
> **Classification:** Limitation
> 
> **Justification:**
> - Why Limitation? Streaming not required for P2-B scope (Studio workflows are request/response)
> - Impact: Low (P2-B scope met without streaming)
> - Trigger: P3 when Studio requires real-time streaming
> - Action: Document in ADR-1001, defer to P3

---

### Rule 3: Do NOT Over-Classify as Debt

**Anti-Pattern:**

> "Everything not perfect = Architecture Debt"

**Correct Approach:**

- Is it a bug? → Issue (fix it)
- Is it a known boundary within scope? → Limitation (document it)
- Does it require future architectural evolution? → Debt (register it)

**Example:**

❌ **Incorrect:**

> "Provider abstraction does not support 10 providers → DEBT-001"

✅ **Correct:**

> "Provider abstraction supports 3 providers (OpenAI, Anthropic, Gemini) → LIM-001: Limitation (P2-B scope = 3 providers, sufficient)"

---

## Architecture Debt Register (ADRg)

**Location:** `.ai/reviews/horizon-1/p2-b-evidence/ARCHITECTURE-DEBT-REGISTER.md`

**Format:**

```markdown
## DEBT-001: [Short Description]

**Category:** Architecture Debt  
**Impact:** [Low/Medium/High/Critical]  
**Discovered:** [Date]  
**Phase:** [P2-B]  
**ADR Reference:** [ADR-XXXX]

**Description:**

[What is the debt?]

**Rationale:**

[Why was this compromise accepted?]

**Trigger Condition:**

[When MUST this debt be addressed?]

**Evolution Plan:**

[How will this debt be resolved?]

**Risk if Not Addressed:**

[What happens if debt accumulates?]
```

**Example:**

```markdown
## DEBT-001: Provider abstraction tightly coupled to HTTP REST

**Category:** Architecture Debt  
**Impact:** Medium  
**Discovered:** 2026-07-11  
**Phase:** P2-B  
**ADR Reference:** ADR-1001

**Description:**

Provider abstraction assumes all providers expose HTTP REST APIs. This limits future support for non-HTTP protocols (e.g., gRPC, WebSocket, local function calls).

**Rationale:**

P2-B scope = 3 cloud providers (OpenAI, Anthropic, Gemini), all HTTP REST. Introducing protocol abstraction now would be premature (no requirement yet).

**Trigger Condition:**

When P4 requires local model integration (e.g., Ollama via gRPC) or real-time streaming (WebSocket).

**Evolution Plan:**

Introduce `ProviderTransport` abstraction layer:
- `HTTPTransport` (current implementation)
- `GRPCTransport` (for local models)
- `WebSocketTransport` (for streaming)

**Risk if Not Addressed:**

Protocol-specific logic may leak into business logic, making future protocol support difficult.
```

---

## Summary

**Three Categories:**

| Category | Definition | Action | ADR Required? |
|----------|-----------|--------|---------------|
| **Issue** | Deviation from specification | Fix now | No (unless architectural) |
| **Limitation** | Known boundary within scope | Document, monitor | Yes (if architectural) |
| **Debt** | Architectural evolution required | Register, plan | Yes (if architectural) |

**Governance Rules:**

1. All findings MUST be classified (Issue/Limitation/Debt)
2. Classification MUST be justified (why, impact, trigger, action)
3. Do NOT over-classify as debt (avoid "everything is debt" mindset)

**Outcome:**

> If P2-B classifies findings correctly, Architecture Assessment can distinguish between "problems that must be fixed" (Issues), "acceptable boundaries" (Limitations), and "future evolution work" (Debt).

---

**Document Version:** 1.0 (FINAL)  
**Date:** 2026-07-11  
**Status:** Authoritative Issue Classification Standard for P2-B  
**Authority:** Chief Architect  
**Cross-Reference:** P2-B-DEFINITION-OF-DONE.md, EVIDENCE-QUALITY-FRAMEWORK.md
