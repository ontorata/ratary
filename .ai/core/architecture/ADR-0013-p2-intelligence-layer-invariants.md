# ADR-0013 — P2 Intelligence Layer Architectural Invariants

| Field | Value |
|-------|-------|
| **Status** | **Intended Architectural Foundation** |
| **Proposed** | 2026-07-11 |
| **Date** | 2026-07-11 |
| **Baseline** | `org-memory-p2-e-complete` (Ontory `4f8e2f2` · ai-brain `dc26a3d`) |
| **Related** | ADR-0012 (Streaming & Execution Lifecycle) |
| **Deciders** | Engineering (documented architectural principles) |
| **Host repo** | `ontory` (runtime + observability) · `ai-brain` (governance) |
| **Scope** | P2-E through P2-I (Intelligence evolution series) |
| **Supersedes** | None — establishes new constraints |

---

## Scope of Applicability

**This ADR governs the intelligence architecture introduced after P2-E.**

It does not retroactively redefine historical implementation decisions made prior to P2-E unless explicitly stated by a subsequent ADR.

**Scope boundaries:**
- ✅ **Applies to:** P2-E (Observation) through P2-I (possible future Autonomous Execution)
- ❌ **Does NOT apply to:** P2-A through P2-D (pre-intelligence phases)
- ✅ **Foundation:** P2-E implementation (`org-memory-p2-e-complete` @ `4f8e2f2`)

**Temporal constraint:** Architectural decisions made in P2-A through P2-D remain governed by their original context and ADRs (e.g., ADR-0012 for streaming). This ADR introduces new constraints for intelligence evolution only.

---

## Context

P2-D established the frozen streaming execution contract (ADR-0012). P2-E added the first intelligence capability: **StreamIntelligenceLayer** (observation).

The observation layer succeeded because it maintained strict architectural boundaries:
- Runtime execution remained unchanged
- Provider adapters untouched
- Intelligence failures isolated from streaming
- Observer pattern (non-blocking, disposable)

Future intelligence phases (P2-F Analysis, P2-G Recommendation, P2-H Decision Support, possible P2-I Autonomous Execution) will build on P2-E's observation foundation.

**Risk:** Without explicit architectural invariants, future phases may:
- Introduce coupling between intelligence and runtime execution
- Make runtime availability depend on intelligence layer health
- Add latency to streaming execution
- Lock implementation to specific analysis engines
- Break the clean separation established in P2-E

**This ADR establishes non-negotiable architectural constraints for all P2 intelligence phases.**

---

## Decision

### Four Architectural Invariants (Non-Negotiable)

All P2 intelligence phases (P2-E through P2-I) MUST preserve these invariants:

---

### Invariant 1: Observation is Immutable

**Statement:** Once `StreamObservation` contract is published, it becomes immutable.

**Rules:**
- ✅ Consumers MAY be added (new analysis layers)
- ✅ New fields MAY be added (additive, optional, version-compatible)
- ❌ Existing fields MUST NOT be removed
- ❌ Existing field types MUST NOT change (breaking change)
- ❌ Field semantics MUST NOT change

**Rationale:**
Observation contract is the foundation for all intelligence layers. Breaking changes cascade through every analysis layer built on top.

**Architecture:**
```
StreamObservation (contract - immutable)
        │
        ├──► P2-F: Analysis
        ├──► P2-G: Recommendation
        ├──► P2-H: Decision Support
        └──► P2-I: Autonomous Execution
```

**Evolution strategy:**
- Additive only: `StreamObservation` may gain optional fields
- Versioning: new observation versions via new types (e.g., `StreamObservationV2`)
- Deprecation: old versions remain supported (no forced migration)

**Verification:**
- Git diff: StreamObservation interface unchanged or additive-only
- Type tests: existing consumers compile without changes
- Conformance: new fields marked optional with defaults

---

### Invariant 2: Intelligence is Disposable

**Statement:** Intelligence layers MUST be disable-able without affecting runtime execution.

**Rules:**
- ✅ Streaming continues when intelligence disabled
- ✅ Observation remains available when intelligence disabled
- ✅ Runtime behavior unchanged when intelligence disabled
- ❌ Runtime MUST NOT depend on intelligence availability
- ❌ Execution MUST NOT fail when intelligence fails

**Rationale:**
Intelligence is enhancement, not dependency. System availability cannot depend on intelligence layer health.

**Architecture:**
```
Streaming Runtime (core - always available)
        │
        ▼
Observation (P2-E - always available)
        │
        ├── Intelligence: disabled   → streaming continues
        ├── Intelligence: enabled    → streaming continues
        ├── Intelligence: upgraded   → streaming continues
        └── Intelligence: replaced   → streaming continues
```

**Implementation:**
- Feature flags: intelligence layers behind runtime toggles
- Circuit breakers: intelligence failures don't propagate
- Graceful degradation: missing intelligence = no-op, not error

**Verification:**
- Integration tests: runtime tests pass with intelligence disabled
- Failure tests: intelligence crashes don't break streaming
- Performance tests: streaming latency unaffected by intelligence state

---

### Invariant 3: Runtime Never Waits

**Statement:** Runtime execution MUST NOT block on intelligence operations.

**Rules:**
- ✅ Intelligence consumes events asynchronously
- ✅ Stream delivery to client is immediate (no intelligence gate)
- ✅ Intelligence latency does NOT affect execution latency
- ❌ Runtime MUST NOT wait for analysis completion
- ❌ Intelligence MUST NOT be in critical execution path

**Rationale:**
Intelligence overhead cannot impact user-facing latency. Streaming performance must be independent of intelligence complexity.

**Forbidden architecture:**
```
❌ Blocking (FORBIDDEN):
Stream → Analyze → Continue → Client
         ↑
    (runtime waits)
```

**Required architecture:**
```
✅ Async (REQUIRED):
Stream ──┬──► Client (immediate)
         │
         └──► Observe → Analyze (async, non-blocking)
```

**Implementation:**
- Observer pattern: intelligence subscribes to events
- Fire-and-forget: runtime emits, doesn't wait
- Async processing: intelligence runs in background

**Verification:**
- Latency tests: P99 streaming latency independent of intelligence
- Load tests: high intelligence load doesn't slow streaming
- Profile: intelligence CPU/memory not in streaming hot path

---

### Invariant 4: Intelligence is Replaceable

**Statement:** Intelligence implementation MUST be swappable without runtime changes.

**Rules:**
- ✅ Runtime knows interface (e.g., `Observation`)
- ✅ Runtime ignores implementation (e.g., `HeuristicAnalyzer`, `MLAnalyzer`)
- ✅ Analysis engine MAY be replaced without runtime modification
- ❌ Runtime MUST NOT depend on specific analysis implementation
- ❌ Intelligence implementation MUST NOT leak into runtime contracts

**Rationale:**
Analysis approaches evolve (heuristics → statistics → ML → LLM). Runtime must be implementation-agnostic.

**Architecture:**
```
Runtime knows:     Observation (interface)
Runtime ignores:   ├── Heuristic Analyzer (impl 1)
                   ├── Statistical Model (impl 2)
                   ├── Rule Engine      (impl 3)
                   ├── ML Model         (impl 4)
                   └── LLM Analyzer     (impl 5)
```

**Implementation:**
- Dependency inversion: runtime depends on abstractions
- Plugin architecture: intelligence registered at startup
- Configuration: analysis engine selection external to runtime

**Verification:**
- Swap test: replace analyzer without runtime rebuild
- Interface test: runtime uses only observation contracts
- Isolation test: runtime tests pass without concrete analyzer

---

## Intelligence Evolution Path

Intelligence develops through phases, each preserving all previous invariants:

### P2-E: Observation (✅ COMPLETE — FROZEN)

**Capability:** Stream observation  
**Output:** `StreamObservation` (health, timing, quality signals)  
**Status:** Immutable baseline  
**Tag:** `org-memory-p2-e-complete` @ `4f8e2f2`

**Invariants preserved:**
- Runtime unchanged (ADR-0012 frozen)
- Observer disposable (failure-isolated)
- Non-blocking (async observation)
- Implementation-agnostic (observer pattern)

---

### P2-F: Analysis (Future)

**Capability:** Insight generation from observations  
**Output:** Patterns, anomalies, trends  
**Baseline:** Fork from `org-memory-p2-e-complete`

**Constraints:**
- ✅ Consume `StreamObservation` (read-only)
- ✅ Build analysis layer on top of observation
- ✅ Produce insights without modifying observation contract
- ❌ MUST NOT modify `StreamObservation` interface
- ❌ MUST NOT modify `StreamIntelligenceLayer` implementation
- ❌ MUST NOT become part of streaming execution path

**Invariants:**
- Observation immutable: P2-E contract frozen
- Intelligence disposable: analysis can be disabled
- Runtime never waits: analysis async
- Intelligence replaceable: analysis engine swappable

**Architecture:**
```
P2-D Streaming (frozen)
    ↓
P2-E Observation (frozen)
    ↓
P2-F Analysis (new scope)
    ↓
Insights (patterns, anomalies, trends)
```

---

### P2-G: Recommendation (Future)

**Capability:** Recommendation engine  
**Output:** Actionable recommendations from analysis  
**Baseline:** Fork from P2-F completion

**Constraints:**
- ✅ Build on P2-F insights
- ✅ Produce recommendations without execution coupling
- ❌ MUST NOT modify P2-E observation contract
- ❌ MUST NOT modify P2-F analysis interface
- ❌ MUST NOT execute actions (only recommend)

**Invariants:** All four (inherited from P2-E)

---

### P2-H: Decision Support (Future)

**Capability:** Decision support system  
**Output:** Decision context, trade-offs, options  
**Baseline:** Fork from P2-G completion

**Constraints:**
- ✅ Support human decision-making
- ✅ Provide decision context from recommendations
- ❌ MUST NOT execute autonomous actions
- ❌ MUST NOT modify execution behavior

**Invariants:** All four (inherited from P2-E)

---

### P2-I: Autonomous Execution (Possible Future)

**Capability:** Automated action execution  
**Output:** System adjustments based on recommendations  
**Status:** Requires explicit governance approval

**Constraints:**
- ✅ Execute actions only with explicit owner approval
- ✅ Maintain execution path separation (actions via API, not inline)
- ❌ MUST NOT become part of streaming execution path
- ❌ MUST NOT break any of the four invariants

**Governance:**
- Blueprint required (explicit approval)
- Safety mechanisms (circuit breakers, rollback, audit)
- Human oversight (monitoring, kill switches)

**Invariants:** All four (inherited from P2-E) + additional safety constraints

---

## Consequences

### Positive

1. **Architectural Stability**
   - Clear boundaries between runtime and intelligence
   - Predictable evolution path
   - Reduced coupling risk

2. **System Reliability**
   - Intelligence failures isolated
   - Runtime availability independent
   - Streaming performance protected

3. **Implementation Flexibility**
   - Analysis engines swappable
   - Intelligence layers disposable
   - Evolution without disruption

4. **Governance Clarity**
   - Non-negotiable constraints explicit
   - Phase transitions well-defined
   - Audit trail preserved

### Negative

1. **Complexity**
   - Async patterns required
   - Interface discipline needed
   - More architectural layers

2. **Constraints**
   - Cannot take shortcuts (blocking intelligence)
   - Cannot couple tightly (runtime + intelligence)
   - Cannot break contracts (observation immutable)

### Neutral

1. **Evolution Cost**
   - Each phase requires isolation verification
   - Invariant compliance must be tested
   - Documentation overhead increased

---

## Verification Criteria

Every intelligence phase (P2-F onward) MUST pass these gates:

### Gate 1: Observation Immutability
- [ ] `StreamObservation` unchanged OR additive-only
- [ ] Existing consumers compile without changes
- [ ] Type tests pass (no breaking changes)

### Gate 2: Intelligence Disposability
- [ ] Runtime tests pass with intelligence disabled
- [ ] Streaming continues when intelligence crashes
- [ ] Feature flag: intelligence toggle works

### Gate 3: Runtime Never Waits
- [ ] P99 streaming latency unchanged
- [ ] Intelligence not in execution hot path
- [ ] Load tests: intelligence overhead isolated

### Gate 4: Intelligence Replaceability
- [ ] Analyzer swappable without runtime rebuild
- [ ] Runtime depends only on observation interface
- [ ] Multiple analyzer implementations supported

### Gate 5: Regression Prevention
- [ ] All P2-E tests remain green
- [ ] All previous phase tests remain green
- [ ] Zero breaking changes to frozen contracts

---

## Related Work

- **ADR-0012:** Streaming & Execution Lifecycle (P2-D baseline)
- **P2-E-ACCEPTANCE.md:** Observation layer acceptance evidence
- **NOTE-0023:** P2-E final closeout (Ratary handoff)

---

## References

- P2-E Implementation: `org-memory-p2-e-complete` @ `4f8e2f2`
- Evidence Package: `.ai/reviews/org-memory-dogfood/P2-E-ACCEPTANCE.md`
- Architectural Proof: `.ai/reviews/org-memory-dogfood/ontory-streaming-p2-e-intelligence-proof.md`

---

## Supersession Policy

This ADR is intended to serve as the architectural foundation for future P2 intelligence phases (P2-F through P2-I). Future phases should preserve these invariants unless explicitly superseded through the project's formal ADR and governance process.

Any superseding ADR MUST explain:

1. **Why the invariant is no longer sufficient**
   - Technical limitations discovered
   - Architectural evolution required
   - Performance constraints identified

2. **Impact on previous phases**
   - Which phases affected (P2-E, P2-F, etc.)
   - Breaking changes required
   - Migration complexity

3. **Migration strategy**
   - Backward compatibility plan
   - Deprecation timeline
   - Transition support

4. **Compatibility implications**
   - Consumer impact assessment
   - Runtime modification scope
   - Test coverage requirements

**Governance:** Supersession requires formal acceptance through the project's ADR governance process and comprehensive evidence package.

---

**Status:** Intended architectural foundation  
**Date:** 2026-07-11  
**Authority:** Documented architectural principles (P2-E implementation evidence)  
**Scope:** P2-E through P2-I (intelligence evolution phases)  
**Evolution:** Supersedable through formal ADR governance process
