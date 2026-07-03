# 00 — Constitution

**Status:** Immutable.  
**Amendment authority:** Project owner only.  
**Audience:** AI assistants and human maintainers.  
**Precedence:** Highest. All project documents inherit from this constitution and must not contradict it.

---

# Purpose

Establish the permanent governing law of the AI Brain project.

Define non-negotiable philosophy, architectural law, and decision hierarchy that remain valid across phases, storage engines, vendors, and AI tooling generations.

Ensure every change advances a coherent long-term system rather than a disposable phase-local solution.

Provide AI assistants a single authoritative source when instructions, tools, or models conflict.

---

# Scope

## Covered

- Project philosophy and system identity
- Architectural principles and Clean Architecture boundaries
- SOLID obligations as enforceable rules
- Backward compatibility and extensibility law
- Multi-tenancy and isolation requirements
- AI-first design obligations
- Long-term maintainability constraints
- Forbidden practices
- Decision hierarchy among documents and instructions

## Not Covered

- Repository layout, module names, or technology choices → [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md); live metrics → [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md)
- Session workflow, analysis templates, quality gate commands → [05-WORKFLOW.md](../workflow/05-WORKFLOW.md)
- Active phase scope and deliverables → [../../TASK_PROMPT.md](../../TASK_PROMPT.md)
- Structural decision content and lifecycle → [../adr/POLICY.md](../../../docs/adr/POLICY.md), [adr/](../../../docs/adr/)
- End-user onboarding and operations → [../PANDUAN.md](../../docs/PANDUAN.md)
- Implementation-specific layer tables and canonical module registry → [11-AI-RULES.md](../../core/ai-rules/11-AI-RULES.md)

---

# Principles

## Project philosophy

1. **System, not snapshot** — The project is a multi-phase platform. Each phase is a milestone, not a destination.

2. **Capability stack** — The system evolves through ordered capabilities: memory, knowledge enrichment, embedding, vector retrieval, graph, reasoning, planning, execution, multi-agent coordination. This repository owns the memory foundation; higher capabilities integrate at defined boundaries.

3. **Boundary discipline** — External runtimes (agents, planners, executors) interact through stable protocols. Reasoning and orchestration logic do not belong inside the memory foundation.

4. **Replaceability** — Storage, inference, vector, object, and graph backends are interchangeable. Application logic does not hard-bind to a vendor or engine.

5. **Owner sovereignty** — Structural direction and breaking changes require explicit owner authority. AI assistants implement; they do not redefine architecture.

## Architectural principles

6. **Inward dependencies** — Source code dependencies point toward policy and domain rules. Infrastructure depends on abstractions, not the reverse.

7. **Layer separation** — Transport, application orchestration, domain logic, and persistence are distinct. No layer performs another layer's responsibility.

8. **Single canonical owner** — Every concern has one authoritative module. Extend it; never fork parallel implementations.

9. **Composition at the root** — Concrete adapters are wired at application bootstrap. Inner layers depend on interfaces only.

10. **Pure domain cores** — Ranking, scoring, normalization, and transformation without I/O are isolated from orchestration and persistence.

## SOLID

11. **Single Responsibility** — A module changes for one reason. Split when reasons multiply.

12. **Open/Closed** — Extend behavior through new adapters, ports, and additive contracts. Do not modify stable contracts to add unrelated behavior.

13. **Liskov Substitution** — Every adapter honoring a port must be substitutable without altering application correctness or scope semantics.

14. **Interface Segregation** — Ports are narrow. Consumers depend only on the operations they use. Split bloated interfaces before implementation.

15. **Dependency Inversion** — High-level policy depends on abstractions. Low-level detail implements abstractions. No high-level module imports vendor SDKs directly.

## Clean Architecture

16. **Policy at the center** — Business rules and orchestration are independent of UI, protocol, database, and framework.

17. **Use cases orchestrate** — Application services coordinate ports. They do not embed transport or persistence mechanics.

18. **Gateways are adapters** — HTTP handlers, protocol tools, and repository implementations are outer-layer adapters mapping external models to internal models.

19. **No leakage** — Framework request objects, raw query results, and vendor response types do not propagate inward.

## Backward compatibility

20. **Stable public surface** — Published REST fields, protocol tool schemas, and client-observable behavior remain compatible unless the owner explicitly approves breakage.

21. **Additive first** — New columns, fields, endpoints, tools, and ports precede removal or rename.

22. **Phased migration** — Schema evolution follows add → backfill → index → deprecate. User data is never destroyed as a migration shortcut.

## Extensibility

23. **Port before implementation** — Capabilities expected to vary across phase or deployment are defined as interfaces before adapters exist.

24. **Three-phase horizon** — A design must remain valid through at least the next three planned capability phases. Forced rewrite implies missing abstraction or missing ADR.

25. **Extension over rewrite** — Prefer new adapters and additive methods on approved ports over new `*V2` types or parallel class hierarchies.

## Multi-tenancy

26. **Scope by identity** — Every read, write, search, delete, and retrieval operation is bound to an owner or tenant identifier. Unscoped access is forbidden.

27. **Isolation default** — Cross-scope access returns the same not-found semantics as missing data. Never leak existence across scopes.

28. **Future-ready contract** — Scope models may expand (workspace, agent, organization). Current implementations honor the narrowest active contract without blocking additive scope fields.

## AI-first architecture

29. **Machine-readable governance** — Rules are explicit, structured, and versioned. Ambiguity is a defect.

30. **Protocol-native access** — AI clients consume memory through stable tool and API contracts designed for programmatic use, not incidental human UI.

31. **Deterministic boundaries** — AI assistants operate inside documented layers and task scope. They do not invent parallel architecture in conversation.

32. **Context efficiency** — Retrieval, ranking, and context assembly produce bounded, relevant payloads. Dumping unbounded state is forbidden.

33. **Assistant interchangeability** — Any model or agent following this constitution must produce equivalent architectural decisions for the same task.

## Long-term maintainability

34. **Document hierarchy** — Constitution defines law; architecture defines structure; ADRs define structural decisions; task prompts define active work.

35. **No deferred lies** — Placeholders, stubs, TODO markers, and FIXME markers are not acceptable deliverables.

36. **Evidence-based completion** — Finished work is verified by automated tests and defined quality gates, not by narrative claim.

37. **Minimal blast radius** — Changes are small, single-concern, and reversible where structurally possible.

---

# Standards

## System identity

- This repository is the **memory and knowledge foundation** of AI Brain.
- It provides durable storage, retrieval, enrichment, authorization, and protocol access.
- It does not host agent reasoning, task planning, or autonomous execution loops.

## Layer law

| Layer | Responsibility | Prohibited |
|-------|----------------|------------|
| Edge / transport | Validation, auth hooks, rate limits, response mapping | Business rules, persistence |
| Application | Orchestration, use-case rules, port coordination | Transport types, raw persistence |
| Domain logic | Pure computation on in-memory structures | I/O, framework, persistence |
| Persistence | Storage access, mapping, scoped queries | Business rules, transport |
| Composition root | Adapter instantiation and wiring | Business rules |

Dependency direction: **Edge → Application → Domain ← Persistence**. Persistence implements ports defined inward.

## Port families

The following concerns must remain behind ports when swap is anticipated:

- Metadata persistence
- Embedding inference
- Vector storage and similarity search
- Large object/blob storage
- Graph traversal
- External identity providers

Metadata persistence must not absorb vector, blob, or graph concerns.

## Data law

- Migrations are idempotent.
- User memories are archived, not destroyed, unless an approved ADR and explicit task authorize deletion.
- Async heavy work (embedding, bulk backfill) does not block synchronous CRUD paths unless an approved ADR states otherwise.
- Content hashing enables idempotent reprocessing.

## Contract law

- Public contracts are additive by default.
- Field removal, rename, or semantic change requires owner approval.
- Protocol tools and REST endpoints share application logic; logic is not duplicated in tool handlers.

## Multi-tenancy law

- Scope identifier is mandatory on all mutating and querying persistence operations.
- Authorization decisions occur in designated identity modules.
- Repositories enforce scope; they do not interpret policy.

## AI-first law

- Every implementation session begins by reading this constitution and subordinate governing documents.
- Task scope is defined in the active task prompt; assistants do not expand scope autonomously.
- Outputs intended for models (context, prompts, retrieval results) are bounded by configuration, not unbounded queries.

---

# Required

1. Treat this document as immutable unless the project owner publishes an amendment.
2. Advance the capability stack without blocking future phases.
3. Apply SOLID and Clean Architecture on every change.
4. Preserve public contract compatibility unless owner approves breakage.
5. Scope all data access to owner or tenant identity.
6. Define or use ports for swappable infrastructure.
7. Wire concrete implementations only at the composition root.
8. Record structural decisions in an ADR before implementation.
9. Stop and request clarification when requirements conflict with this constitution.
10. Deliver verified, tested changes with no TODO, FIXME, or stub code.
11. Maintain document hierarchy integrity; subordinate documents link upward, never override upward.
12. Design for assistant interchangeability: rules must be objective and testable.

---

# Forbidden

1. **Architecture violations**
   - Reversing dependency direction
   - Bypassing layers
   - Business logic in persistence or transport layers
   - SQL or vendor calls outside persistence adapters

2. **Duplication and fork**
   - Parallel `*V2` classes or managers duplicating canonical modules
   - Copying orchestration logic into protocol tool handlers
   - Second ranking or retrieval pipeline without ADR

3. **Binding and shortcut**
   - Designs that assume a single storage engine when ports exist
   - Synchronous inference on CRUD hot paths when async backfill is mandated
   - Vector or similarity logic inside metadata repositories

4. **Contract breakage**
   - Removing or renaming public fields without owner approval
   - Breaking protocol tool schemas
   - Cross-scope data leakage or enumeration

5. **Scope and authority**
   - Implementing proposed ADRs before approval
   - Structural change without ADR
   - Expanding task scope without owner approval
   - Chat instructions overriding this constitution

6. **Quality defects**
   - TODO, FIXME, stub, or dead code in deliverables
   - Decreasing test coverage
   - Skipping quality gates
   - Committing secrets or credentials

7. **System boundary violations**
   - Agent reasoning, planning, or execution logic inside the memory foundation
   - God-modules merging unrelated concerns without ADR

8. **Data destruction**
   - Hard-deleting user memories as a default migration strategy
   - Non-idempotent migrations

---

# Decision Rules

## Document hierarchy

When documents or instructions conflict, apply this order:

| Priority | Source | Role |
|----------|--------|------|
| 1 | Explicit owner instruction (current session) | Overrides when stated |
| 2 | **00-CONSTITUTION.md** (this document) | Immutable law |
| 3 | [13-AI-DECISION-FRAMEWORK.md](../../core/decision-framework/13-AI-DECISION-FRAMEWORK.md) | Decision procedure |
| 4 | [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) | Structural law |
| 5 | Approved ADRs | Structural decisions |
| 6 | [01-05-WORKFLOW.md](01-05-WORKFLOW.md) through [09-ROADMAP.md](../roadmap/09-ROADMAP.md) | Domain standards and roadmap |
| 7 | [11-AI-RULES.md](../../core/ai-rules/11-AI-RULES.md) | Module registry |
| 8 | [10-PHASE-STATUS.md](../../core/architecture/10-PHASE-STATUS.md) | Operational snapshot |
| 9 | [../../TASK_PROMPT.md](../../TASK_PROMPT.md) | Active scoped work |
| 10 | Conversational or tool-default suggestions | Lowest authority |

Full chain: [.ai/core/constitution/INDEX.md](../../core/constitution/INDEX.md)

Equal-priority conflict → stop and ask the owner.

## Change classification

| Change type | ADR required | Owner approval for contract break |
|-------------|--------------|-----------------------------------|
| Bug fix within existing boundaries | No | No |
| Additive field, endpoint, or tool | No | No |
| New port or layer boundary | Yes | No |
| Storage backend adoption | Yes | No |
| Public contract removal or rename | Yes | Yes |
| Multi-tenancy model change | Yes | Yes |

## Abstraction rule

| Condition | Action |
|-----------|--------|
| Backend may change within five-year horizon | Port required now |
| Behavior is pure and stable | Domain module without port |
| Cross-cutting new concern | ADR before port family |
| Change forces rewrite in next three phases | Stop; ADR before code |

## Compatibility rule

| Question | Required answer to proceed |
|----------|---------------------------|
| Does REST response remain parseable by existing clients? | Yes, or owner approved break |
| Do protocol tools retain required parameters? | Yes, or owner approved break |
| Is scope enforced on all new queries? | Yes |
| Can storage adapter be replaced without service rewrite? | Yes, when port exists |

## Ambiguity rule

| State | Action |
|-------|--------|
| Task conflicts with constitution | Stop; ask owner |
| Structural need without approved ADR | Write Proposed ADR; stop |
| Unsure if change is structural | Assume structural; analyze; ADR if needed |
| User asks for quick hack blocking future phase | Refuse; propose port-compliant alternative |

## AI assistant behavior

- Read governing documents before editing.
- Implement task prompt scope only.
- Produce analysis before code when impact crosses layers or contracts.
- Fail closed: no guesswork on architecture or scope.

---

# Examples

## Good

- Add optional response field; retain all existing fields; add integration test.
- Introduce vector store port; implement adapter; inject at composition root; ADR approved first.
- Backfill job runs dry-run by default; idempotent; scoped by owner identifier.
- Split reader/writer port interfaces per Interface Segregation; no behavior change.
- Archive memory instead of hard delete when user requests removal.

## Bad

- Add embedding call inside repository insert because "it is faster."
- Create `SearchServiceV2` instead of extending ranking configuration.
- Return different HTTP status for cross-owner access that reveals record existence.
- Merge vector SQL into metadata repository to avoid new adapter.
- Ship `// TODO: add tests later` on public contract change.
- Implement workspace schema because "multi-tenancy will need it" without approved ADR.
- Add agent planner loop inside memory service because "AI-first means agents everywhere."

---

# Checklist

## Session start

- [ ] This constitution read and accepted
- [ ] Subordinate documents read per task type
- [ ] Active task prompt identified
- [ ] Relevant ADR status verified

## Design validation

- [ ] Change advances capability stack without blocking future phases
- [ ] SOLID violations absent
- [ ] Clean Architecture layer boundaries preserved
- [ ] Ports used for swappable infrastructure
- [ ] Scope identifier enforced on all data paths
- [ ] Public contracts additive or owner-approved breaking
- [ ] No system-boundary violation (reasoning/planning inside foundation)

## Pre-merge validation

- [ ] ADR approved and referenced if structural
- [ ] No forbidden patterns present
- [ ] Tests verify changed behavior
- [ ] Quality gate passed
- [ ] Document hierarchy updated where required
- [ ] No secrets, TODO, FIXME, or stubs in diff

## Constitutional compliance

- [ ] Dependency direction inward
- [ ] Single canonical owner per concern
- [ ] Composition root wires adapters
- [ ] Three-phase horizon satisfied
- [ ] AI-first: rules followed without conversational override

---

*Amend only with explicit project owner approval. All subordinate documents inherit from this constitution.*
