# Generates repository-agnostic prompt library files. Run once; safe to re-run.
$base = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Prompt($p) {
    $dir = Join-Path $base $p.cat
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $in = ($p.input | ForEach-Object { "- $_" }) -join "`n"
    $out = ($p.output | ForEach-Object { "- $_" }) -join "`n"
    $ast = $p.assistants
    $body = $p.body.Trim()
    $content = @"
# $($p.title)

**Category:** $($p.cat)  
**ID:** ``$($p.cat)/$($p.slug)``  
**Version:** 1.0.0

---

## Purpose

$($p.purpose)

---

## Expected input

$in

---

## Expected output

$out

---

## When to execute

$($p.when)

---

## Dependencies

$($p.deps)

---

## Compatible AI assistants

$ast

---

## Prompt

``````
$body
``````

---

*Repository-agnostic prompt per [SCHEMA.md](../SCHEMA.md).*
"@
    Set-Content -Path (Join-Path $dir "$($p.slug).md") -Value $content -Encoding utf8
}

$all = @(
    @{ cat='planning'; slug='scope-definition'; title='Scope Definition'; purpose='Define bounded scope with explicit inclusions, exclusions, and success criteria for a feature, phase, or epic.'; input=@('{PROJECT_NAME}','{TASK_DESCRIPTION} or epic text','{CONSTRAINTS}','{CONSTITUTION_PATH} (optional)'); output=@('In-scope and out-of-scope lists','Measurable success criteria','Assumptions and open questions','Recommended next prompt'); when='New feature request, phase kickoff, or epic grooming  -  before design.'; deps='`operations/session-start` (recommended)'; assistants='**ChatGPT**, **Claude**, **Gemini**  -  strong for scope negotiation. **Cursor**  -  with ticket context. Not ideal for code execution.'; body=@'
You are a software planning assistant for {PROJECT_NAME}.

Task: Define scope for the following work.

{SCOPE}

Constraints:
{CONSTRAINTS}

If {CONSTITUTION_PATH} is provided, ensure scope does not violate stated architectural boundaries.

Deliver:
1. **In scope**  -  bullet list
2. **Out of scope**  -  bullet list
3. **Success criteria**  -  measurable and testable
4. **Assumptions**
5. **Open questions**  -  blockers for design
6. **Recommended next step**  -  which prompt ID to run next

Do not propose implementation details. Flag scope creep explicitly.
'@ },
    @{ cat='planning'; slug='work-breakdown'; title='Work Breakdown'; purpose='Decompose approved scope into ordered milestones with deliverables and acceptance checks.'; input=@('Approved scope from `planning/scope-definition`','{SCOPE}','Capacity or deadline hints (optional)'); output=@('Milestone table with acceptance checks','Critical path','Parallelizable streams'); when='After scope is agreed  -  before implementation scheduling.'; deps='`planning/scope-definition`'; assistants='**ChatGPT**, **Claude**, **Gemini**. All general-purpose assistants.'; body=@'
You are a software planning assistant for {PROJECT_NAME}.

Approved scope:
{SCOPE}

Deliver:
1. **Milestones**  -  table: # | Name | Deliverable | Acceptance check | Complexity (S/M/L)
2. **Critical path**  -  ordered list
3. **Parallel streams**  -  concurrent work
4. **First milestone**  -  next actions (no code)

Prefer thin vertical slices. Each milestone must be independently verifiable.
'@ },
    @{ cat='planning'; slug='dependency-planning'; title='Dependency Planning'; purpose='Identify technical and organizational dependencies, blockers, and sequencing constraints.'; input=@('Milestone list from `planning/work-breakdown`','{SCOPE}','External systems or teams'); output=@('Dependency graph (mermaid)','Blocker table with owners','Sequencing recommendation'); when='After work breakdown  -  before sprint or phase scheduling.'; deps='`planning/work-breakdown`'; assistants='**ChatGPT**, **Claude**, **Cursor** (for repo-accurate technical deps), **Gemini**.'; body=@'
You are a dependency analyst for {PROJECT_NAME}.

Work to schedule:
{SCOPE}

Deliver:
1. **Dependency graph**  -  mermaid: hard vs soft dependencies
2. **Blockers**  -  table: Blocker | Type | Owner | Resolution
3. **Sequencing**  -  recommended order with rationale
4. **Top 3 dependency risks**

Flag circular dependencies. Do not assume unavailable approvals exist.
'@ },
    @{ cat='planning'; slug='risk-register'; title='Risk Register'; purpose='Identify, classify, and propose mitigations for delivery and technical risks.'; input=@('{SCOPE}','{CONSTRAINTS}','Known failure modes (optional)'); output=@('Risk register table','Mitigation plans','Residual risks requiring acceptance'); when='Parallel with scope definition; refresh at phase or release gates.'; deps='`planning/scope-definition` (recommended)'; assistants='**ChatGPT**, **Claude**, **Gemini**.'; body=@'
You are a risk analyst for {PROJECT_NAME}.

Scope: {SCOPE}
Constraints: {CONSTRAINTS}

Deliver risk register:
| ID | Risk | Likelihood (L/M/H) | Impact (L/M/H) | Mitigation | Owner | Status |

Cover: technical, schedule, security, compatibility, operational.
End with **residual risks** requiring explicit acceptance.
'@ },

    @{ cat='analysis'; slug='codebase-exploration'; title='Codebase Exploration'; purpose='Orient in an unfamiliar repository: structure, conventions, and extension points.'; input=@('{SOURCE_ROOT}','{TARGET_MODULE} or area of interest','{TASK_DESCRIPTION}  -  specific questions'); output=@('Relevant directory map','Entry points and key abstractions','Observed conventions','Extension point recommendations'); when='New contributor, unfamiliar module, or pre-design reconnaissance.'; deps='`operations/session-start`'; assistants='**Cursor**, **Codex**, **OpenHands**  -  IDE/repo access required. **Claude** with codebase context.'; body=@'
You are a codebase analyst for {PROJECT_NAME}.

Explore {SOURCE_ROOT} focusing on: {TARGET_MODULE}

Questions: {TASK_DESCRIPTION}

Deliver:
1. **Structure**  -  relevant directories and responsibilities
2. **Entry points**  -  where execution starts
3. **Key abstractions**  -  interfaces, services, patterns
4. **Conventions**  -  naming, layering, testing
5. **Extension points**  -  where to plug in (not duplicate)
6. **Unknowns**  -  gaps requiring human input

Cite paths. Analysis only  -  no code changes.
'@ },
    @{ cat='analysis'; slug='requirements-traceability'; title='Requirements Traceability'; purpose='Map requirements to existing code, gaps, and verification methods.'; input=@('Requirements or user stories','{SCOPE}','{SOURCE_ROOT}'); output=@('Traceability matrix','Gap analysis','Recommended implementation order'); when='After scope approval  -  before implementation.'; deps='`planning/scope-definition`, `analysis/codebase-exploration`'; assistants='**Cursor**, **Claude**, **ChatGPT**, **Codex**.'; body=@'
You are a requirements analyst for {PROJECT_NAME}.

Requirements: {TASK_DESCRIPTION}
Scope: {SCOPE}

Deliver:
| Req ID | Requirement | Existing code | Gap | Verification |

Then: coverage summary, critical gaps (ordered), recommended implementation order.
'@ },
    @{ cat='analysis'; slug='change-impact'; title='Change Impact Analysis'; purpose='Assess blast radius of a proposed change across modules, APIs, data, and consumers.'; input=@('{TASK_DESCRIPTION}','{TARGET_MODULE}','{CONSTRAINTS}','{ARCHITECTURE_PATH} (optional)'); output=@('Direct and transitive impact map','Breaking change assessment','Migration flag','Affected test surface'); when='Before design, refactor, or merge of large change.'; deps='`analysis/codebase-exploration`'; assistants='**Cursor**, **Codex**, **Claude**.'; body=@'
You are a change-impact analyst for {PROJECT_NAME}.

Change: {TASK_DESCRIPTION}
Target: {TARGET_MODULE}
Constraints: {CONSTRAINTS}

Deliver:
1. **Direct impact**  -  files, modules, APIs
2. **Transitive impact**  -  downstream consumers
3. **Data impact**  -  schema/migration needed? (Y/N)
4. **Breaking change?** (Y/N) with compatibility options
5. **Test surface**  -  what to re-test
6. **Rollback complexity** (Low/Med/High)

Flag conflicts with {ARCHITECTURE_PATH} or approved ADRs.
'@ },
    @{ cat='analysis'; slug='technical-debt-review'; title='Technical Debt Review'; purpose='Assess technical debt in a bounded area and prioritize remediation.'; input=@('{TARGET_MODULE}','{CONSTRAINTS} or quality goals','Pain points (optional)'); output=@('Debt inventory with severity','Root cause analysis','Remediation options','Priority recommendations'); when='Tech-debt sprint, pre-refactor, or phase gate with observations.'; deps='`analysis/codebase-exploration`'; assistants='**Cursor**, **Claude**, **Codex**.'; body=@'
You are a technical debt reviewer for {PROJECT_NAME}.

Area: {TARGET_MODULE}
Goals: {CONSTRAINTS}

Deliver:
1. **Debt inventory**  -  Item | Type | Severity | Fix effort
2. **Root causes**
3. **Remediation options**  -  >=2 per high-severity item
4. **Top 3 priorities**
5. **Defer list**  -  with rationale

Analysis only. No code changes.
'@ },

    @{ cat='architecture'; slug='system-design-brief'; title='System Design Brief'; purpose='Produce high-level design: boundaries, components, data flow, and non-goals.'; input=@('{SCOPE}','{CONSTRAINTS}','{ARCHITECTURE_PATH}','Impact analysis (optional)'); output=@('Design brief','Mermaid component diagram','Data flow description','Non-goals','ADR candidates'); when='New capability; extend-vs-build decision.'; deps='`planning/scope-definition`, `analysis/change-impact` (recommended)'; assistants='**ChatGPT**, **Claude**, **Gemini**.'; body=@'
You are a system designer for {PROJECT_NAME}.

Design for: {SCOPE}
Constraints: {CONSTRAINTS}

Honor {ARCHITECTURE_PATH} and {CONSTITUTION_PATH} if provided.

Deliver:
1. **Problem statement**
2. **Solution**  -  components and responsibilities
3. **Diagram**  -  mermaid components (inward dependencies)
4. **Data flow**
5. **Non-goals**
6. **Alternatives**  -  trade-off table
7. **ADR required?** (Y/N) topics

No implementation code.
'@ },
    @{ cat='architecture'; slug='adr-authoring'; title='ADR Authoring'; purpose='Draft an Architecture Decision Record for a structural choice.'; input=@('{TASK_DESCRIPTION}','{CONSTRAINTS}','{ADR_INDEX_PATH} template','Design brief (optional)'); output=@('Complete ADR draft (Status: Proposed)','Alternatives and consequences'); when='Structural change; new port; storage or boundary decision.'; deps='`architecture/system-design-brief`'; assistants='**ChatGPT**, **Claude**, **Gemini**.'; body=@'
You are an ADR author for {PROJECT_NAME}.

Decision: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}
Template: {ADR_INDEX_PATH}

Deliver full ADR: Context, Problem, Constraints, Alternatives (>=2), Decision, Consequences, Compliance with {ARCHITECTURE_PATH}.

Status MUST be **Proposed**. Owner approves separately.
'@ },
    @{ cat='architecture'; slug='interface-contract'; title='Interface Contract Design'; purpose='Define a stable API, port, or event contract between components.'; input=@('{TARGET_MODULE} boundary','{TASK_DESCRIPTION}','{CONSTRAINTS}','Compatibility requirements'); output=@('Contract specification','Versioning rules','Error model','Examples'); when='New public API, port, or integration boundary.'; deps='`architecture/system-design-brief`'; assistants='**ChatGPT**, **Claude**, **Cursor**.'; body=@'
You are an interface designer for {PROJECT_NAME}.

Boundary: {TARGET_MODULE}
Purpose: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}

Deliver: operations/methods, types, errors, versioning (additive-only), examples, non-responsibilities.

Optimize for testability and adapter swap.
'@ },
    @{ cat='architecture'; slug='compliance-check'; title='Architecture Compliance Check'; purpose='Verify design complies with architecture law and approved decisions.'; input=@('Design brief or change summary','{ARCHITECTURE_PATH}','{ADR_INDEX_PATH}'); output=@('Compliance table','Violations','Verdict: PROCEED | PROCEED WITH CHANGES | BLOCKED'); when='After design brief  -  before implementation gate.'; deps='`architecture/system-design-brief`, `{ARCHITECTURE_PATH}`'; assistants='**Claude**, **ChatGPT**, **Cursor**.'; body=@'
You are an architecture compliance reviewer for {PROJECT_NAME}.

Under review: {TASK_DESCRIPTION}

Evaluate against {ARCHITECTURE_PATH} and approved ADRs at {ADR_INDEX_PATH}.

| Rule | Compliant (Y/N) | Evidence | Fix if N |

**Verdict:** PROCEED | PROCEED WITH CHANGES | BLOCKED
List owner-level blockers.
'@ },

    @{ cat='implementation'; slug='pre-implementation-gate'; title='Pre-Implementation Gate'; purpose='Gate before any code: extend vs build, ADR status, compatibility.'; input=@('{TASK_DESCRIPTION}','{GOVERNANCE_ROOT}','{ADR_INDEX_PATH}','{ARCHITECTURE_PATH}','{SOURCE_ROOT}'); output=@('Extend vs new module decision','ADR gate status','Compatibility confirmation','Go/no-go'); when='Every implementation task  -  after design and before first code change.'; deps='`architecture/compliance-check`, approved ADR if structural'; assistants='**Cursor**, **Codex**, **OpenHands**, **Claude**.'; body=@'
You are an implementation gatekeeper for {PROJECT_NAME}.

Task: {TASK_DESCRIPTION}

Before any code:
1. Read approved ADRs at {ADR_INDEX_PATH}
2. Read {ARCHITECTURE_PATH}
3. Search {SOURCE_ROOT} for existing extension points
4. Answer: extend existing vs new module?
5. Verify backward compatibility
6. Verify future-phase compatibility

Deliver: **Go** | **No-go** with blockers. If No-go, recommend `architecture/adr-authoring` or `operations/escalation`.

Do not write code until **Go**.
'@ },
    @{ cat='implementation'; slug='incremental-delivery'; title='Incremental Delivery'; purpose='Plan safe step-by-step implementation with commit-sized increments.'; input=@('Approved design','Milestones from `planning/work-breakdown`','{TARGET_MODULE}'); output=@('Commit sequence','Per-step verification','Rollback per step'); when='Multi-commit or multi-PR feature implementation.'; deps='`implementation/pre-implementation-gate` (Go)'; assistants='**Cursor**, **Codex**, **OpenHands**, **Claude**.'; body=@'
You are an incremental delivery planner for {PROJECT_NAME}.

Implement: {SCOPE}
Target: {TARGET_MODULE}

Deliver commit plan:
| Step | Change | Verify | Rollback |

Each step must leave the system in a working state. Tests should pass after every step.
'@ },
    @{ cat='implementation'; slug='safe-refactoring'; title='Safe Refactoring'; purpose='Refactor internal structure without changing observable behavior.'; input=@('{TARGET_MODULE}','Refactoring goal','{CONSTRAINTS}'); output=@('Refactoring plan','Test harness requirements','Behavior parity checks'); when='Internal quality work; no feature scope change.'; deps='`analysis/change-impact`, `implementation/pre-implementation-gate`'; assistants='**Cursor**, **Codex**, **OpenHands**.'; body=@'
You are a safe refactoring assistant for {PROJECT_NAME}.

Refactor: {TARGET_MODULE}
Goal: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}

Deliver:
1. **Behavior parity definition**  -  what must not change
2. **Steps**  -  small, testable increments
3. **Tests to add/run** before each step
4. **Stop conditions**

No feature additions. No API breaks without explicit approval.
'@ },
    @{ cat='implementation'; slug='boundary-wiring'; title='Boundary Wiring'; purpose='Wire new adapters or services at composition root without layer violations.'; input=@('Port interface','Adapter implementation','Composition root location in {SOURCE_ROOT}'); output=@('Wiring plan','Dependency injection points','Feature flag strategy (if any)'); when='New port adapter; swapping implementations.'; deps='`implementation/pre-implementation-gate`, `architecture/interface-contract`'; assistants='**Cursor**, **Codex**, **OpenHands**.'; body=@'
You are a composition-root wiring assistant for {PROJECT_NAME}.

Wire: {TASK_DESCRIPTION}
Module: {TARGET_MODULE}
Source: {SOURCE_ROOT}

Deliver:
1. **Injection points**  -  where interfaces meet implementations
2. **Wiring diagram**  -  mermaid
3. **Env/config flags** (if needed)
4. **What NOT to wire**  -  layer violations to avoid

Follow dependency direction in {ARCHITECTURE_PATH}.
'@ },

    @{ cat='migration'; slug='schema-migration-plan'; title='Schema Migration Plan'; purpose='Plan forward DDL changes with ordering, idempotency, and environment rollout.'; input=@('Schema change description','Current schema reference','{ENVIRONMENT} targets'); output=@('Forward migration steps','Ordering dependencies','Idempotency notes','Verification queries'); when='Any DDL change  -  before writing migration scripts.'; deps='`analysis/change-impact`, `implementation/pre-implementation-gate`'; assistants='**Cursor**, **Codex**, **Claude**, **ChatGPT**.'; body=@'
You are a schema migration planner for {PROJECT_NAME}.

Change: {TASK_DESCRIPTION}
Environments: {ENVIRONMENT}

Deliver:
1. **Forward steps**  -  ordered DDL
2. **Dependencies**  -  what must run first
3. **Idempotency**  -  safe re-run behavior
4. **Verification**  -  SQL or checks post-migrate
5. **Downtime**  -  required? (Y/N)

Pair with `migration/rollback-strategy`.
'@ },
    @{ cat='migration'; slug='data-migration-plan'; title='Data Migration Plan'; purpose='Plan backfill, transform, or repartition of existing data.'; input=@('Data change description','Volume estimates','{ENVIRONMENT}'); output=@('Backfill strategy','Batching and throttling','Integrity checks','Resume semantics'); when='Data movement, backfill, or transform required.'; deps='`migration/schema-migration-plan` (if DDL involved)'; assistants='**Cursor**, **Codex**, **Claude**.'; body=@'
You are a data migration planner for {PROJECT_NAME}.

Migration: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Deliver:
1. **Strategy**  -  online vs offline, batch size
2. **Ordering**  -  schema before data
3. **Integrity checks**  -  counts, checksums, samples
4. **Resume**  -  checkpoint and idempotency
5. **Estimated duration**  -  assumptions stated
'@ },
    @{ cat='migration'; slug='rollback-strategy'; title='Migration Rollback Strategy'; purpose='Define reversal steps for failed or aborted migrations.'; input=@('Forward migration plan','{BASELINE_VERSION}','RTO/RPO requirements (optional)'); output=@('Rollback steps','Data loss boundaries','When rollback is unsafe'); when='With every schema or data migration  -  before production apply.'; deps='`migration/schema-migration-plan` or `migration/data-migration-plan`'; assistants='**Claude**, **ChatGPT**, **Cursor**.'; body=@'
You are a migration rollback planner for {PROJECT_NAME}.

Forward plan: {TASK_DESCRIPTION}
Baseline: {BASELINE_VERSION}

Deliver:
1. **Rollback steps**  -  reverse order
2. **Data loss boundary**  -  what cannot be restored
3. **Unsafe to rollback**  -  conditions
4. **Verification** after rollback
5. **Communication**  -  who to notify
'@ },
    @{ cat='migration'; slug='zero-downtime-cutover'; title='Zero-Downtime Cutover'; purpose='Plan production cutover with dual-write, feature flags, or blue-green steps.'; input=@('Migration plans','Traffic and SLA constraints','{ENVIRONMENT}=production'); output=@('Cutover phases','Traffic shift steps','Abort criteria'); when='Live system migration requiring continuous availability.'; deps='`migration/schema-migration-plan`, `migration/data-migration-plan`, `migration/rollback-strategy`'; assistants='**Claude**, **ChatGPT**, **Cursor** (with deploy context).'; body=@'
You are a zero-downtime cutover planner for {PROJECT_NAME}.

Migration: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}

Deliver:
1. **Phases**  -  expand, dual-write, cutover, contract
2. **Traffic steps**  -  % rollout
3. **Abort criteria**  -  automatic and manual
4. **Monitoring**  -  metrics to watch
5. **Rollback trigger**  -  link to rollback plan
'@ },

    @{ cat='testing'; slug='test-strategy'; title='Test Strategy'; purpose='Define overall verification approach for a feature or phase.'; input=@('{SCOPE}','{CONSTRAINTS}','Quality goals','Existing test layout in {SOURCE_ROOT}'); output=@('Test pyramid allocation','Coverage targets','Environments','Entry/exit criteria'); when='Feature or phase start  -  parallel with implementation planning.'; deps='`planning/scope-definition`, `implementation/pre-implementation-gate`'; assistants='**Cursor**, **Claude**, **ChatGPT**, **Codex**.'; body=@'
You are a test strategist for {PROJECT_NAME}.

Scope: {SCOPE}
Constraints: {CONSTRAINTS}

Deliver:
1. **Pyramid**  -  unit / integration / E2E split
2. **Coverage goals**  -  per layer
3. **Fixtures and environments**
4. **Entry/exit criteria** for merge and release
5. **Out of scope**  -  what we will not test and why
'@ },
    @{ cat='testing'; slug='unit-test-design'; title='Unit Test Design'; purpose='Design unit tests, mocks, and cases for a module.'; input=@('{TARGET_MODULE}','Public interface or behavior list','Edge cases'); output=@('Test case table','Mock boundaries','Fixtures needed'); when='Per module  -  during or immediately after implementation.'; deps='`testing/test-strategy`, `architecture/interface-contract`'; assistants='**Cursor**, **Codex**, **OpenHands**.'; body=@'
You are a unit test designer for {PROJECT_NAME}.

Module: {TARGET_MODULE}
Behavior: {TASK_DESCRIPTION}

Deliver:
| Case | Input | Expected | Mock? |

Plus: setup/teardown, pure vs impure boundaries, flaky risk notes.
'@ },
    @{ cat='testing'; slug='integration-test-design'; title='Integration Test Design'; purpose='Design cross-boundary tests for APIs, adapters, and persistence.'; input=@('Boundaries to test','{ENVIRONMENT}','Test data requirements'); output=@('Integration scenario list','Setup and teardown','Contract assertions'); when='API, adapter, or persistence work.'; deps='`testing/test-strategy`, `architecture/interface-contract`'; assistants='**Cursor**, **Codex**, **OpenHands**.'; body=@'
You are an integration test designer for {PROJECT_NAME}.

Boundaries: {TARGET_MODULE}
Task: {TASK_DESCRIPTION}

Deliver scenarios:
| # | Scenario | Setup | Action | Assert | Cleanup |

Include failure paths and timeout behavior.
'@ },
    @{ cat='testing'; slug='regression-verification'; title='Regression Verification'; purpose='Prove existing behavior unchanged after a change.'; input=@('Change summary','{BASELINE_VERSION}','Test commands or CI pipeline'); output=@('Regression checklist','Pass/fail evidence template','Residual risk'); when='Pre-merge and pre-release.'; deps='`testing/test-strategy`, `analysis/change-impact`'; assistants='**Cursor**, **Codex**, **OpenHands**, **Claude**.'; body=@'
You are a regression verifier for {PROJECT_NAME}.

Change: {TASK_DESCRIPTION}
Baseline: {BASELINE_VERSION}

Deliver:
1. **Suites to run**  -  ordered
2. **Critical paths**  -  manual if needed
3. **Evidence template**  -  command, result, date
4. **Residual risk**  -  what was not re-tested

Verdict template: PASS | PASS WITH GAPS | FAIL
'@ },

    @{ cat='review'; slug='code-review'; title='Code Review'; purpose='Structured review of a change set for correctness, design, and maintainability.'; input=@('Diff or PR description','{ARCHITECTURE_PATH}','Review checklist (optional)'); output=@('Findings by severity','Required changes','Optional improvements','Approve recommendation'); when='Before merge  -  author or reviewer initiated.'; deps='`testing/regression-verification` (author should run first)'; assistants='**Cursor**, **Claude**, **Codex**, **ChatGPT**, **Gemini**.'; body=@'
You are a code reviewer for {PROJECT_NAME}.

Change: {TASK_DESCRIPTION}

Review for: correctness, layering per {ARCHITECTURE_PATH}, tests, security, naming, dead code.

Deliver:
| Severity | File/area | Finding | Suggested fix |

**Recommendation:** Approve | Request changes | Block
Block only for correctness, security, or architecture violations.
'@ },
    @{ cat='review'; slug='security-review'; title='Security Review'; purpose='Security-focused review: auth, data exposure, injection, secrets.'; input=@('Change or feature description','Threat model hints','{CONSTRAINTS}'); output=@('Threat table','Findings by severity','Remediation'); when='Auth, PII, new endpoints, or dependency upgrades.'; deps='`review/code-review` (can run in parallel)'; assistants='**Claude**, **ChatGPT**, **Cursor**.'; body=@'
You are a security reviewer for {PROJECT_NAME}.

Scope: {TASK_DESCRIPTION}
Constraints: {CONSTRAINTS}

Deliver:
1. **Assets and threats**  -  table
2. **Findings**  -  Critical / High / Medium / Low
3. **Remediation**  -  per finding
4. **Residual risk**

Apply OWASP-minded analysis. No exploitation steps.
'@ },
    @{ cat='review'; slug='quality-gate'; title='Quality Gate'; purpose='Formal pass/fail gate aggregating tests, review, and compliance.'; input=@('Phase or release scope','Evidence from tests and reviews','{GOVERNANCE_ROOT} checklists'); output=@('Gate checklist results','Verdict: PASS | PASS WITH OBSERVATIONS | REWORK | BLOCKER','Observations log'); when='Phase end, release candidate, or major merge.'; deps='`testing/regression-verification`, `review/code-review`, `architecture/compliance-check`'; assistants='**Claude**, **ChatGPT**; human owner for final verdict.'; body=@'
You are a quality gate assessor for {PROJECT_NAME}.

Scope: {SCOPE}

Aggregate evidence from tests, reviews, and {GOVERNANCE_ROOT} checklists.

Deliver:
- Checklist with pass/fail per item
- **Verdict:** PASS | PASS WITH OBSERVATIONS | REWORK | BLOCKER
- Observations (non-blocking debt)
- Explicit list of what owner must sign

Assistants MUST NOT self-approve BLOCKER resolution.
'@ },
    @{ cat='review'; slug='design-review'; title='Design Review'; purpose='Review design brief before implementation for gaps and risks.'; input=@('Design brief from `architecture/system-design-brief`','{ARCHITECTURE_PATH}','Stakeholder concerns'); output=@('Review comments','Required design changes','Approval recommendation'); when='After design brief  -  before pre-implementation gate.'; deps='`architecture/system-design-brief`'; assistants='**ChatGPT**, **Claude**, **Gemini**.'; body=@'
You are a design reviewer for {PROJECT_NAME}.

Design under review: {TASK_DESCRIPTION}

Evaluate: completeness, scalability, operability, testability, alignment with {ARCHITECTURE_PATH}.

Deliver: strengths, gaps, risks, required changes.
**Recommendation:** Approve design | Revise | Reject
'@ },

    @{ cat='documentation'; slug='api-reference-update'; title='API Reference Update'; purpose='Update public API documentation to match implemented contracts.'; input=@('Contract spec or OpenAPI','Change diff','Consumer documentation location'); output=@('Updated reference sections','Breaking change callouts','Examples'); when='After API or contract change  -  before or with release.'; deps='`architecture/interface-contract`, `implementation/incremental-delivery`'; assistants='**ChatGPT**, **Claude**, **Cursor**, **Gemini**.'; body=@'
You are an API documentation author for {PROJECT_NAME}.

Update docs for: {TASK_DESCRIPTION}

Deliver:
1. **Endpoint/operation docs**  -  params, responses, errors
2. **Breaking changes**  -  migration notes
3. **Examples**  -  request/response
4. **Deprecation notices** if any

Match implemented behavior exactly. Flag doc-code drift.
'@ },
    @{ cat='documentation'; slug='changelog-authoring'; title='Changelog Authoring'; purpose='Produce user-facing changelog entries for a release.'; input=@('Merged changes since {BASELINE_VERSION}','Audience (internal/external)','Semver bump type'); output=@('Changelog sections (Added/Changed/Fixed/Deprecated/Removed)','Upgrade notes'); when='Release preparation.'; deps='`release/version-coordination`'; assistants='**ChatGPT**, **Claude**, **Gemini**, **Cursor**.'; body=@'
You are a changelog author for {PROJECT_NAME}.

Since: {BASELINE_VERSION}
Audience: external users unless stated otherwise.

Deliver Keep a Changelog format:
## [version] - date
### Added / Changed / Fixed / Deprecated / Removed
### Upgrade notes  -  breaking changes and actions
'@ },
    @{ cat='documentation'; slug='runbook-authoring'; title='Runbook Authoring'; purpose='Document operational procedures: deploy, rollback, diagnose.'; input=@('Procedure to document','{ENVIRONMENT}','Tools and access required'); output=@('Step-by-step runbook','Prerequisites','Verification','Escalation'); when='New operational surface, on-call procedure, or incident follow-up.'; deps='`release/deployment-checklist` (for deploy runbooks)'; assistants='**ChatGPT**, **Claude**, **Gemini**.'; body=@'
You are a runbook author for {PROJECT_NAME}.

Document: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Deliver:
1. **Purpose and scope**
2. **Prerequisites**  -  access, tools
3. **Steps**  -  numbered, verifiable
4. **Verification**  -  success criteria
5. **Rollback / escalation**
'@ },
    @{ cat='documentation'; slug='session-handoff'; title='Session Handoff'; purpose='Preserve continuity between AI sessions or contributors.'; input=@('Work completed','Work in progress','Blockers','Next steps'); output=@('Handoff summary','File/state pointers','Recommended next prompt'); when='End of session, phase slice, or contributor change.'; deps='Any active work stream'; assistants='**All**  -  ChatGPT, Claude, Cursor, Codex, Gemini, OpenHands.'; body=@'
You are producing a session handoff for {PROJECT_NAME}.

Completed: {TASK_DESCRIPTION}
In progress: (describe)
Blockers: (list)

Deliver:
1. **Summary**  -  3 - 5 sentences
2. **Artifacts**  -  branches, PRs, docs touched
3. **State**  -  tests, migrations, flags
4. **Next steps**  -  ordered, with prompt IDs
5. **Do not redo**  -  decisions already made

Optimize for the next assistant with zero prior context.
'@ },

    @{ cat='release'; slug='readiness-assessment'; title='Release Readiness Assessment'; purpose='Ship/no-ship decision based on quality, docs, and risk.'; input=@('Release scope','{BASELINE_VERSION}','Gate evidence'); output=@('Readiness checklist','Ship recommendation','Release blockers'); when='Before tagging or deploying a release.'; deps='`review/quality-gate`, `testing/regression-verification`, `documentation/changelog-authoring`'; assistants='**Claude**, **ChatGPT**; owner decides ship.'; body=@'
You are a release readiness assessor for {PROJECT_NAME}.

Release: {SCOPE}
Baseline: {BASELINE_VERSION}

Check: tests, docs, migrations applied, rollback plan, monitoring, changelog.

**Recommendation:** Ship | Ship with conditions | Do not ship
List blockers with owners.
'@ },
    @{ cat='release'; slug='deployment-checklist'; title='Deployment Checklist'; purpose='Ordered deploy steps with verification for a target environment.'; input=@('{ENVIRONMENT}','Deploy artifact or version','Runbook reference'); output=@('Pre-deploy checklist','Deploy steps','Post-deploy verification'); when='Deploy day  -  after readiness assessment.'; deps='`release/readiness-assessment`'; assistants='**Claude**, **ChatGPT**, **OpenHands** (if automated deploy).'; body=@'
You are a deployment checklist author for {PROJECT_NAME}.

Deploy: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Deliver:
**Pre-deploy** | **Deploy** | **Post-deploy**  -  each with owner and verification.
Include abort criteria and rollback invocation point.
'@ },
    @{ cat='release'; slug='version-coordination'; title='Version Coordination'; purpose='Plan semantic version bump, tagging, and dependency alignment.'; input=@('Change set since {BASELINE_VERSION}','Semver policy','Dependent packages'); output=@('Recommended version','Tag name','Dependency bump list'); when='Release branch cut or tag preparation.'; deps='`documentation/changelog-authoring` (parallel)'; assistants='**ChatGPT**, **Claude**, **Cursor**.'; body=@'
You are a version coordinator for {PROJECT_NAME}.

Changes: {TASK_DESCRIPTION}
Baseline: {BASELINE_VERSION}

Recommend: MAJOR.MINOR.PATCH with semver rationale.
List packages/services requiring coordinated bumps.
'@ },
    @{ cat='release'; slug='post-release-verification'; title='Post-Release Verification'; purpose='Smoke test and monitor production after deploy.'; input=@('Deployed version','{ENVIRONMENT}=production','Critical user journeys'); output=@('Smoke test results template','Metrics to watch','Incident threshold'); when='Immediately after production deploy.'; deps='`release/deployment-checklist`'; assistants='**Cursor**, **OpenHands**, **Claude**.'; body=@'
You are a post-release verifier for {PROJECT_NAME}.

Version deployed: {BASELINE_VERSION}
Environment: {ENVIRONMENT}

Deliver:
1. **Smoke tests**  -  journey | steps | expected
2. **Metrics**  -  15m / 1h watch list
3. **Thresholds**  -  when to rollback
4. **Sign-off template**
'@ },

    @{ cat='operations'; slug='session-start'; title='Session Start'; purpose='Open every AI session: read governance, confirm task, state constraints.'; input=@('{PROJECT_NAME}','{GOVERNANCE_ROOT}','{CONSTITUTION_PATH}','{TASK_DESCRIPTION}'); output=@('Governance acknowledgment','Task restatement','Planned prompt chain'); when='Every new chat or agent session  -  first action.'; deps='None  -  entry point'; assistants='**All**  -  ChatGPT, Claude, Cursor, Codex, Gemini, OpenHands.'; body=@'
You are an AI engineering assistant for {PROJECT_NAME}.

Session start:
1. Read governance at {GOVERNANCE_ROOT}  -  start with {CONSTITUTION_PATH}
2. Restate {TASK_DESCRIPTION} in your own words
3. List constraints you will honor
4. Propose which prompt IDs you will run and in what order
5. Ask clarifying questions before code or design changes

Do not implement until pre-implementation gate passes (if coding task).
'@ },
    @{ cat='operations'; slug='incident-triage'; title='Incident Triage'; purpose='Initial structured response to a production incident.'; input=@('Incident symptoms','{ENVIRONMENT}','Timeline','Recent changes'); output=@('Severity assessment','Hypothesis list','Immediate mitigation steps','Communication draft'); when='Production incident declared or suspected.'; deps='`operations/session-start`'; assistants='**Claude**, **ChatGPT**, **Cursor** (with logs), **OpenHands**.'; body=@'
You are an incident triage assistant for {PROJECT_NAME}.

Incident: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Deliver:
1. **Severity** (SEV1 - 4) with rationale
2. **Customer impact**
3. **Top 3 hypotheses**  -  ordered
4. **Immediate actions**  -  mitigate first
5. **Stakeholder comms**  -  draft message
6. **Next prompt**  -  likely `operations/production-debug`

Do not destructive actions without explicit approval.
'@ },
    @{ cat='operations'; slug='production-debug'; title='Production Debug'; purpose='Diagnose a live issue using logs, metrics, and recent changes.'; input=@('Incident context from triage','Log/metric excerpts','{BASELINE_VERSION} deploy info'); output=@('Root cause analysis (hypothesis)','Evidence chain','Fix recommendation','Verification plan'); when='After incident triage  -  during active incident.'; deps='`operations/incident-triage`'; assistants='**Cursor**, **Claude**, **OpenHands**.'; body=@'
You are a production debug assistant for {PROJECT_NAME}.

Problem: {TASK_DESCRIPTION}
Environment: {ENVIRONMENT}

Analyze evidence. Deliver:
1. **Timeline**  -  events leading to failure
2. **Root cause hypothesis**  -  with confidence level
3. **Supporting evidence**
4. **Fix options**  -  hotfix vs rollback
5. **Verification** after fix

Separate facts from assumptions.
'@ },
    @{ cat='operations'; slug='escalation'; title='Escalation'; purpose='Halt work and escalate when blocked by governance, safety, or ambiguity.'; input=@('Blocker description','Prompts already run','{GOVERNANCE_ROOT} conflict (if any)'); output=@('Escalation summary','Options for owner','Recommended decision'); when='ADR not approved, constitution conflict, breaking change, or unresolvable ambiguity.'; deps='Any gate prompt that returns No-go or BLOCKED'; assistants='**All**.'; body=@'
You are escalating a blocker for {PROJECT_NAME}.

Blocker: {TASK_DESCRIPTION}
Context: {CONSTRAINTS}

Deliver:
1. **What is blocked**  -  one sentence
2. **Why automation cannot proceed**  -  governance, safety, ambiguity
3. **Options**  -  >=2 with trade-offs
4. **Recommended path**  -  for owner decision
5. **What resumes after approval**

HALT implementation until owner responds.
'@ }
)

foreach ($p in $all) { Write-Prompt $p }

# Category READMEs
$cats = @{
    planning = 'Before work is scheduled  -  scope, milestones, dependencies, risks.'
    analysis = 'Before design or change  -  exploration, traceability, impact, debt.'
    architecture = 'Design and structural decisions  -  briefs, ADRs, contracts, compliance.'
    implementation = 'During coding  -  gates, increments, refactoring, wiring.'
    migration = 'Schema and data changes  -  forward plan, rollback, cutover.'
    testing = 'Verification  -  strategy, unit, integration, regression.'
    review = 'Quality gates  -  code, security, design, formal gate.'
    documentation = 'Knowledge capture  -  API docs, changelog, runbooks, handoff.'
    release = 'Shipping  -  readiness, deploy, version, post-release.'
    operations = 'Runtime and continuity  -  session start, incidents, escalation.'
}

foreach ($cat in $cats.Keys) {
    $dir = Join-Path $base $cat
    $files = Get-ChildItem $dir -Filter '*.md' | Sort-Object Name
    $rows = ($files | ForEach-Object { "| [$($_.BaseName)]($($_.Name)) | See file |" }) -join "`n"
    @"
# $($cat.Substring(0,1).ToUpper() + $cat.Substring(1)) Prompts

**Purpose:** $($cats[$cat])

**Catalog:** [PROMPT-LIBRARY.md](../PROMPT-LIBRARY.md)  
**Schema:** [SCHEMA.md](../SCHEMA.md)

---

## Prompts

| ID | File | Purpose |
|----|------|---------|
$rows

---

*Repository-agnostic. Replace ``{PLACEHOLDERS}`` before use.*
"@ | Set-Content (Join-Path $dir 'README.md') -Encoding utf8
}

Write-Host "Generated $($all.Count) prompts in $($cats.Count) categories"
