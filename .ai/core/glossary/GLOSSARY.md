# Glossary

**Status:** Permanent canonical vocabulary.  
**Audience:** Every AI assistant and human maintainer.  
**Authority:** Subordinate to [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md).  
**Rule:** This file is the **only** authoritative definition for project concepts. Other documents MUST use these terms and MUST NOT redefine them.

---

# Purpose

Unify vocabulary across AI tools, sessions, and phases.

Remove ambiguous or overlapping terms so every assistant interprets the same concept identically.

Support future phases without introducing parallel synonyms.

---

# Synonym policy

| Deprecated or ambiguous | Canonical term | Notes |
|-------------------------|----------------|-------|
| Second brain, knowledge base (generic) | **Memory Foundation** | Product identity |
| Hybrid RAG, semantic search (generic) | **Hybrid Retrieval** | When SQL + vector merge |
| RAG (alone) | **Context Assembly** or **Retrieval** | Specify which pipeline |
| Memory Manager, Knowledge Manager, Universal Repository | **Canonical Owner** | Never name parallel managers |
| Query, lookup (unspecified) | **Search** or **Retrieval** | Never use without qualifier |
| Tenant (unspecified) | **Owner Scope** or **Workspace** | Match security boundary |
| Row, record (in prose) | **Memory** | The atomic knowledge unit |
| User ID (in security prose) | **Owner** or **Identity** | Owner = scope anchor |
| `*V2` class | **Extension** via port or adapter | Forbidden pattern name |
| Snapshot doc, live architecture doc | **Structural Law** vs **Operational Snapshot** | See terms below |

When a document uses a deprecated synonym, treat the canonical term as authoritative.

---

# Terms

## Access Channel

**Definition:** A stable entry path through which an external client invokes memory capabilities.

**Purpose:** Distinguish how clients reach the system without merging orchestration logic per channel.

**Used By:** Transport layer, application services, agent runtimes.

**Related Terms:** Public Contract, Memory Foundation, Composition Root.

**Examples:** A browser client uses one channel; an AI coding tool uses another. Both reach the same application services.

**Future Extension:** Additional channels remain additive if they delegate to existing services.

---

## Access Tracking

**Definition:** Recording that a memory was selected or surfaced during context assembly.

**Purpose:** Support relevance feedback, consolidation signals, and usage analytics without storing reasoning state.

**Used By:** Context Assembly pipeline, consolidation jobs.

**Related Terms:** Memory, Context Assembly, Consolidation.

**Examples:** After ranking, each chosen memory is marked as accessed for the owning scope.

**Future Extension:** Batch or deferred tracking; workspace-level aggregates.

---

## Adapter

**Definition:** A replaceable implementation that fulfills a port contract for a specific engine or vendor.

**Purpose:** Keep domain logic independent of storage, inference, or identity backends.

**Used By:** Composition Root, Persistence layer, Embedding domain.

**Related Terms:** Port, Composition Root, Replaceability.

**Examples:** A metadata adapter for one database engine; an inference adapter for one embedding vendor.

**Future Extension:** New adapters per engine without changing application services.

---

## Additive Change

**Definition:** An evolution that adds fields, ports, tools, or behaviors without removing or breaking existing contracts.

**Purpose:** Preserve backward compatibility across phases.

**Used By:** Roadmap, ADR policy, Public Contract governance.

**Related Terms:** Backward Compatibility, Phased Migration, Public Contract.

**Examples:** A new optional scope field on a request; a new retrieval source in a composite.

**Future Extension:** Major version only when owner explicitly approves breakage.

---

## ADR (Architecture Decision Record)

**Definition:** An immutable document that records a structural decision, its context, alternatives, and consequences.

**Purpose:** Lock architectural choices before implementation and prevent silent drift.

**Used By:** Decision Hierarchy, Phase gates, extension planning.

**Related Terms:** Structural Law, Decision Hierarchy, Proposed ADR.

**Examples:** Hybrid retrieval merge strategy; workspace identity contract.

**Future Extension:** New ADRs per port family or boundary change; status lifecycle only (not decision text edits).

---

## Agent

**Definition:** A non-human actor that reads or writes memory within a workspace on behalf of an owner.

**Purpose:** Attribute actions to AI clients separately from human or service identities.

**Used By:** Multi-AI phase, Scope Resolver, audit (future).

**Related Terms:** Owner, Workspace, Access Channel, Agent Runtime.

**Examples:** A coding assistant registered as an agent in a shared team workspace.

**Future Extension:** Agent registry, conflict reconciliation, actor attribution on writes.

---

## Agent Runtime

**Definition:** External software that performs reasoning, planning, or execution outside the Memory Foundation.

**Purpose:** Draw a hard boundary: this repository stores and retrieves memory; it does not run agent loops.

**Used By:** Capability Stack, Constitution, Phase 7+ roadmap.

**Related Terms:** Memory Foundation, Access Channel, MCP Layer.

**Examples:** An external planner that calls memory tools to fetch context then acts elsewhere.

**Future Extension:** None inside this repository — integration stays at protocol boundaries.

---

## Async Enrichment

**Definition:** Enhancing a memory with derived data outside the synchronous create-or-update path.

**Purpose:** Keep interactive writes fast while allowing heavy work (embeddings, intelligence fields) in jobs.

**Used By:** Embedding domain, backfill jobs, consolidation.

**Related Terms:** Backfill, Embedding, Memory.

**Examples:** Vectors generated after save via a scheduled job, not during save.

**Future Extension:** Additional enrichment types (graph indexing, summarization refresh).

---

## Auth Domain

**Definition:** The capability area that resolves identity, enforces permissions, and records security-relevant events.

**Purpose:** Separate who may act from what memory operations do.

**Used By:** Every scoped operation, Access Channels, Owner Scope.

**Related Terms:** Identity, Permission, Owner, Isolation.

**Examples:** Verifying credentials before a search; denying write without permission.

**Future Extension:** Workspace RBAC, organization policy, expanded audit.

---

## Backfill

**Definition:** A batch process that applies missing derived data to existing memories.

**Purpose:** Migrate or catch up enrichment without blocking live traffic.

**Used By:** Embedding phase, intelligence metadata, consolidation prep.

**Related Terms:** Async Enrichment, Embedding, Operational Snapshot.

**Examples:** Generating vectors for memories saved before embedding existed.

**Future Extension:** Graph index backfill, scope migration backfill.

---

## Backward Compatibility

**Definition:** Obligation that existing clients and data remain valid after a change unless the owner approves breakage.

**Purpose:** Protect production users and multi-phase evolution.

**Used By:** Constitution, ADR constraints, Public Contract.

**Related Terms:** Additive Change, Phased Migration, Public Contract.

**Examples:** Solo `ownerId` scope continues to work when workspace fields appear.

**Future Extension:** Deprecation windows; explicit major versions.

---

## Candidate

**Definition:** A memory shortlisted for ranking before final selection into a bounded result set.

**Purpose:** Separate broad discovery from scored, capped output in retrieval and search.

**Used By:** Retrieval, Search, Hybrid Retrieval, Ranking.

**Related Terms:** Retrieval Candidate Source, Ranking, Context Budget.

**Examples:** Up to N memories gathered from lexical or vector sources before fusion.

**Future Extension:** Graph-sourced candidates; per-source caps.

---

## Canonical Owner

**Definition:** The single authoritative module responsible for one concern in the codebase.

**Purpose:** Prevent duplicate logic, parallel hierarchies, and conflicting implementations.

**Used By:** AI Rules, Constitution, Decision Framework.

**Related Terms:** Extension over Rewrite, Port, Memory Domain.

**Examples:** One service owns CRUD orchestration; one engine owns pure ranking math.

**Future Extension:** New concerns get one owner at introduction — never a `V2` parallel.

---

## Capability Stack

**Definition:** The ordered progression of system abilities from durable memory through embedding, retrieval, graph, and external agent integration.

**Purpose:** Frame phase planning and forbid premature higher-layer logic in the foundation.

**Used By:** Roadmap, Constitution, Architecture.

**Related Terms:** Phase, Memory Foundation, Agent Runtime.

**Examples:** Memory → Knowledge → Embedding → Vector Retrieval → Graph → Agent Runtime.

**Future Extension:** Enterprise and multi-AI layers atop workspace scope.

---

## Codename

**Definition:** A short human-memorable identifier assigned to a memory within an owner scope.

**Purpose:** Fast reference in tools and UI without exposing internal identifiers.

**Used By:** Knowledge domain, Search, Retrieval filters.

**Related Terms:** Slug, Knowledge Metadata, Memory.

**Examples:** `auth-jwt-phase3` as a codename for a design note.

**Future Extension:** Workspace-unique codenames; agent-suggested codenames with validation.

---

## Composition Root

**Definition:** The sole location where concrete adapters are wired to ports and services are constructed.

**Purpose:** Enforce dependency inversion — inner layers never choose implementations.

**Used By:** Application bootstrap, batch jobs, MCP and REST entrypoints.

**Related Terms:** Adapter, Port, Inward Dependencies.

**Examples:** Wiring metadata store, embedding store, and retrieval sources at startup.

**Future Extension:** Additional roots only for new entrypoints (jobs, workers) — same wiring rules.

---

## Consolidation

**Definition:** A maintenance process that merges, archives, or compacts related memories according to policy.

**Purpose:** Reduce noise and preserve important knowledge without deleting user data by default.

**Used By:** Operational jobs, long-term memory hygiene.

**Related Terms:** Memory, Access Tracking, Archive (historical designs).

**Examples:** Combining duplicate notes after repeated imports; dry-run before apply.

**Future Extension:** Workspace-aware policies; agent-triggered consolidation proposals (external).

---

## Constitution

**Definition:** The immutable governing law of the project: philosophy, architectural principles, and non-negotiable constraints.

**Purpose:** Highest document authority for all assistants and maintainers.

**Used By:** Decision Hierarchy, every standard document.

**Related Terms:** Structural Law, Decision Hierarchy, ADR.

**Examples:** Inward dependencies rule; forbid agent reasoning inside the foundation.

**Future Extension:** Amendments only by project owner; concepts stable across decades.

---

## Context Assembly

**Definition:** Building a bounded text bundle from ranked memories for consumption by an external model.

**Purpose:** Deliver relevant memory within token or character limits for LLM use.

**Used By:** Memory domain pipeline, MCP context tools, Agent Runtime.

**Related Terms:** Retrieval, Ranking, Context Budget, Prompt Assembly.

**Examples:** Selecting top memories, trimming to budget, formatting for injection.

**Future Extension:** Multi-workspace context; citation metadata; source attribution per agent.

---

## Context Budget

**Definition:** The maximum size allowed for assembled context delivered to a consumer.

**Purpose:** Prevent unbounded payloads and enforce predictable retrieval cost.

**Used By:** Context Assembly, Retriever, Ranker.

**Related Terms:** Candidate, Ranking, Retrieval.

**Examples:** Character or token cap applied after ranking.

**Future Extension:** Per-agent or per-workspace budgets; dynamic budgets by model.

---

## Decision Hierarchy

**Definition:** The ordered sources of authority used to resolve conflicting instructions.

**Purpose:** Normalize decisions across AI tools and sessions.

**Used By:** AI Decision Framework, Constitution Index, every session.

**Related Terms:** Constitution, ADR, Structural Law, TASK_PROMPT.

**Examples:** Owner instruction beats roadmap; approved ADR beats implementation habit.

**Future Extension:** Stable ordering; new tiers inserted only by owner (rare).

---

## Domain Layer

**Definition:** The area of pure or orchestrated business rules independent of transport and storage mechanics.

**Purpose:** Keep policy and algorithms testable and reusable.

**Used By:** Memory, Knowledge, Search, Embedding domains.

**Related Terms:** Application Layer, Pure Domain Core, Port.

**Examples:** Ranking math; retrieval orchestration; metadata enrichment rules.

**Future Extension:** New domains (graph traversal policy) as ports, not transport leaks.

---

## Effective Scope

**Definition:** The fully resolved security and data boundary applied to one operation before any memory access.

**Purpose:** Guarantee every read and write is intentionally bounded.

**Used By:** Scope Resolver, repositories (via scope parameters), services.

**Related Terms:** Memory Scope, Owner Scope, Isolation.

**Examples:** Resolved owner (today); owner + workspace + agent (future).

**Future Extension:** Organization policy overlays; default workspace for solo users.

---

## Embedding

**Definition:** A numerical representation of memory text used for similarity comparison.

**Purpose:** Enable semantic retrieval beyond lexical matching.

**Used By:** Embedding domain, Vector Retrieval, Hybrid Retrieval.

**Related Terms:** Async Enrichment, Embedding Store, Vector Retrieval.

**Examples:** A vector derived from title plus body text for similarity search.

**Future Extension:** Multi-model embeddings; re-embed on model change via backfill.

---

## Embedding Domain

**Definition:** The capability area responsible for inference and storage of embeddings, separate from metadata persistence.

**Purpose:** Isolate vector concerns from memory CRUD and lexical search.

**Used By:** Phase 5+, Hybrid Retrieval, backfill jobs.

**Related Terms:** Embedding, Embedding Provider, Embedding Store, Async Enrichment.

**Examples:** Normalize text, hash content, run inference, persist vectors scoped by owner.

**Future Extension:** External vector engines; workspace-scoped vector partitions.

---

## Embedding Provider

**Definition:** The port that turns normalized text into embedding vectors.

**Purpose:** Swap inference vendors without changing orchestration.

**Used By:** Embedding domain, backfill jobs.

**Related Terms:** Port, Adapter, Embedding.

**Examples:** No-op provider for tests; vendor provider for production.

**Future Extension:** Local models, regional inference, cost-aware routing.

---

## Embedding Store

**Definition:** The port that persists vectors and answers similarity queries within owner scope.

**Purpose:** Separate vector persistence from metadata repository.

**Used By:** Vector Retrieval, Hybrid Retrieval, Embedding domain.

**Related Terms:** Embedding, Retrieval Candidate Source, Port.

**Examples:** Store vector with memory link; find nearest neighbors for one owner.

**Future Extension:** Dedicated vector engines; sharded stores at enterprise scale.

---

## Extension over Rewrite

**Definition:** The principle of adding adapters, ports, or methods instead of replacing stable modules with parallel versions.

**Purpose:** Avoid `*V2` drift and preserve tested contracts.

**Used By:** Constitution, AI Rules, ADR decisions.

**Related Terms:** Canonical Owner, Port, Additive Change.

**Examples:** New retrieval source adapter instead of RetrieverV2.

**Future Extension:** Permanent invariant across all phases.

---

## Extension Point

**Definition:** A documented seam where new behavior plugs in without modifying core orchestration.

**Purpose:** Phase-proof architecture — Phase 6+ additions wire in, not rewrite.

**Used By:** Architecture, ADRs, Roadmap.

**Related Terms:** Port, Composite Retrieval Source, Capability Stack.

**Examples:** Retrieval candidate source slot; graph provider slot; content store slot.

**Future Extension:** One extension point per swappable concern; ADR when boundary moves.

---

## Graph Domain

**Definition:** The future capability area for traversing relationships beyond flat memory-to-memory edges.

**Purpose:** Support multi-hop discovery while keeping flat relations for CRUD.

**Used By:** Phase 8 roadmap, Hybrid Retrieval (future source).

**Related Terms:** Relation, Graph Provider, Retrieval Candidate Source.

**Examples:** Neighborhood expansion from a seed memory for candidates.

**Future Extension:** External graph engines; workspace-scoped subgraphs.

---

## Graph Provider

**Definition:** The future port for graph traversal and advanced edge operations.

**Purpose:** Keep traversal logic out of metadata repositories and domain services.

**Used By:** Graph domain, future retrieval sources.

**Related Terms:** Relation, Port, Graph Domain.

**Examples:** Return memory identifiers reachable within N hops.

**Future Extension:** Path finding, weighted edges, agent-specific subgraph views.

---

## Hybrid Retrieval

**Definition:** Retrieval that merges candidates from multiple sources (e.g., lexical and vector) under one cap and ranking policy.

**Purpose:** Improve context quality without duplicating retrieval pipelines.

**Used By:** Phase 6, Composite Retrieval Source, Ranking.

**Related Terms:** Retrieval, Candidate, Retrieval Candidate Source, Vector Retrieval.

**Examples:** SQL candidates plus vector neighbors deduped by memory identity then ranked.

**Future Extension:** Graph source added to composite; per-source weights.

---

## Identity

**Definition:** A verified actor credential that maps to an owner and permissions.

**Purpose:** Authenticate Access Channel requests before scope resolution.

**Used By:** Auth domain, Owner, Permission.

**Related Terms:** Owner, Auth Domain, Scope Resolver.

**Examples:** API key identity, token identity, federated identity.

**Future Extension:** Agent identities; organization SSO; workspace membership.

---

## Inward Dependencies

**Definition:** The rule that source dependencies point toward policy and abstractions, never outward toward frameworks or engines.

**Purpose:** Preserve testability and replaceability.

**Used By:** Clean Architecture, Layer architecture, Constitution.

**Related Terms:** Port, Adapter, Domain Layer.

**Examples:** Services depend on reader port interfaces, not concrete stores.

**Future Extension:** Permanent structural invariant.

---

## Isolation

**Definition:** Guarantee that one scope cannot observe or mutate another scope's data.

**Purpose:** Security and privacy default for personal and team deployments.

**Used By:** Owner Scope, repositories, Auth domain.

**Related Terms:** Effective Scope, Cross-Scope Semantics, Memory Scope.

**Examples:** Cross-owner request receives same not-found as missing memory.

**Future Extension:** Workspace and organization boundaries with identical semantics.

---

## Knowledge Domain

**Definition:** The capability area that enriches memories with structured metadata and relations.

**Purpose:** Separate descriptive metadata from raw memory body and persistence.

**Used By:** Memory create/update flow, Search, Retrieval filters.

**Related Terms:** Knowledge Metadata, Codename, Slug, Relation.

**Examples:** Generate summary, keywords, category on save.

**Future Extension:** Richer relation types; graph-backed metadata hints.

---

## Knowledge Metadata

**Definition:** Derived descriptive fields attached to a memory (not the primary body text).

**Purpose:** Improve search, retrieval filtering, and human browse without re-parsing content each time.

**Used By:** Knowledge domain, Search, Ranking.

**Related Terms:** Codename, Slug, Semantic Hash, Memory.

**Examples:** Summary, keywords, importance, memory type, category.

**Future Extension:** Agent-authored metadata with validation; workspace taxonomies.

---

## MCP Layer

**Definition:** The protocol access surface that exposes memory capabilities as tools to AI clients over stdio transport.

**Purpose:** First-class AI integration parallel to REST without duplicating business logic.

**Used By:** Agent Runtime, Access Channel, Composition Root.

**Related Terms:** Access Channel, Public Contract, Memory Foundation.

**Examples:** Tools to save memory, search, and fetch assembled context.

**Future Extension:** Additive tools only; same services underneath.

---

## Memory

**Definition:** The atomic unit of durable knowledge stored by the system for an owner (and future workspace).

**Purpose:** Single countable entity for CRUD, search, retrieval, and backup.

**Used By:** All domains, Capability Stack, Roadmap.

**Related Terms:** Knowledge Metadata, Owner Scope, Content Body.

**Examples:** A design decision note; a snippet; an imported document chunk.

**Future Extension:** Object-stored large bodies; version history; agent attribution.

---

## Memory Domain

**Definition:** The capability area owning durable memory lifecycle, backup, retrieval pipeline, and context assembly.

**Purpose:** Central orchestration of memory operations separate from transport and raw persistence.

**Used By:** Application services, MCP tools, REST controllers.

**Related Terms:** Memory, Context Assembly, Retrieval, Canonical Owner.

**Examples:** Create with enrichment; delete with vector cleanup; build context for LLM.

**Future Extension:** Unchanged service names — scope and ports extend per ADR.

---

## Memory Foundation

**Definition:** This repository's scope: durable memory, knowledge metadata, retrieval, authorization, and protocol access — not agent reasoning.

**Purpose:** Clarify system identity versus external agent runtimes.

**Used By:** Constitution, Capability Stack, Roadmap.

**Related Terms:** Agent Runtime, Capability Stack, Access Channel.

**Examples:** Stores coding notes and serves them to Cursor; does not plan multi-step tasks.

**Future Extension:** Boundary remains — higher capabilities integrate externally.

---

## Memory Scope

**Definition:** The data structure carrying resolved scope fields passed into every memory operation.

**Purpose:** Thread consistent isolation context through services and ports.

**Used By:** All memory services, repositories, stores.

**Related Terms:** Effective Scope, Owner Scope, Scope Resolver.

**Examples:** Today: owner identifier required. Future: optional workspace and agent fields.

**Future Extension:** Additive fields per ADR-002 contract; resolver populates before use.

---

## Object Key

**Definition:** An opaque pointer from a memory to externally stored large content.

**Purpose:** Keep metadata lean while offloading bulky bodies to object storage.

**Used By:** Content Store (future), Memory domain, backup/export.

**Related Terms:** Content Body, Content Store, Memory.

**Examples:** Memory row holds key; full markdown lives in object store.

**Future Extension:** Workspace-prefixed key layout; migration from inline content.

---

## Content Body

**Definition:** The primary human-readable text (or binary) payload of a memory.

**Purpose:** Distinguish raw content from metadata and embeddings.

**Used By:** CRUD, Context Assembly, Embedding inference input.

**Related Terms:** Knowledge Metadata, Object Key, Content Store.

**Examples:** Markdown notes; pasted code; imported article text.

**Future Extension:** Stored inline or via Object Key per scale ADR.

---

## Content Store

**Definition:** The future port for reading and writing large content blobs outside metadata storage.

**Purpose:** Replaceable blob backends without rewriting memory orchestration.

**Used By:** Memory domain (future), backup, export.

**Related Terms:** Object Key, Port, Content Body.

**Examples:** Upload body on save; fetch body on full read or export.

**Future Extension:** R2, S3, MinIO adapters; async dual-write during migration.

---

## Operational Snapshot

**Definition:** A mutable document capturing live metrics, debt, deployment facts, and current phase pointer.

**Purpose:** Separate evolving status from permanent structural law.

**Used By:** Phase status doc, maintainers, session context.

**Related Terms:** Structural Law, Roadmap, TASK_PROMPT.

**Examples:** Test count, active blocker, known debt items.

**Future Extension:** Updated on gate PASS or release — never holds layer definitions.

---

## Organization

**Definition:** The top-level enterprise tenant for billing, policy, and residency (future).

**Purpose:** Anchor multi-workspace enterprise deployments.

**Used By:** Phase 10 roadmap, Scope contract.

**Related Terms:** Workspace, Owner, Effective Scope.

**Examples:** A company account containing multiple team workspaces.

**Future Extension:** SSO, org-wide audit, data residency rules.

---

## Owner

**Definition:** The identity anchor that owns credentials and default scope for memory operations.

**Purpose:** Solo-user and service-account model today; parent of agents in multi-AI future.

**Used By:** Owner Scope, Auth domain, Memory Scope.

**Related Terms:** Identity, Agent, Workspace.

**Examples:** One human's personal brain; one automation service account.

**Future Extension:** Owner coexists with workspace — not replaced by workspace-only model.

---

## Owner Scope

**Definition:** The isolation boundary keyed by owner identifier for all memory operations today.

**Purpose:** Mandatory scoping rule — no unscoped reads or writes.

**Used By:** Every repository and store operation, Constitution.

**Related Terms:** Memory Scope, Isolation, Effective Scope.

**Examples:** All queries filtered by owner; MCP configured with one owner per process.

**Future Extension:** Supplemented by workspace scope — owner remains valid for personal use.

---

## Permission

**Definition:** A named capability grant checked before a memory operation proceeds.

**Purpose:** Enforce least privilege on read and write paths.

**Used By:** Auth domain, Access Channels, services.

**Related Terms:** Identity, Auth Domain, Owner.

**Examples:** Read permission for search and context; write permission for save and update.

**Future Extension:** Workspace RBAC; organization admin roles.

---

## Phase

**Definition:** A bounded milestone delivering a coherent capability increment on the Capability Stack.

**Purpose:** Sequence work without treating any phase as the final system.

**Used By:** Roadmap, TASK_PROMPT, Phase Gate.

**Related Terms:** Capability Stack, Phase Gate, Operational Snapshot.

**Examples:** Phase 5 delivers embedding; Phase 6 delivers hybrid retrieval.

**Future Extension:** Phases 11+ follow same gate and ADR discipline.

---

## Phase Gate

**Definition:** A formal PASS/FAIL checkpoint before declaring a phase complete or starting the next.

**Purpose:** Prevent false completion and undocumented debt accumulation.

**Used By:** Governance playbooks, Roadmap, Operational Snapshot.

**Related Terms:** Phase, Quality Gate, Operational Snapshot.

**Examples:** Checklist evidence archived under phase folder before roadmap ✅.

**Future Extension:** Same process for every phase; artifacts in `.ai/phases/`.

---

## Phased Migration

**Definition:** Schema and contract evolution pattern: add, backfill, index, then deprecate — never destructive shortcuts.

**Purpose:** Protect user data during capability upgrades.

**Used By:** Constitution, ADR migration sections, Embedding rollout.

**Related Terms:** Backfill, Additive Change, Backward Compatibility.

**Examples:** Add link column → backfill vectors → enable hybrid retrieval flag.

**Future Extension:** Applies to workspace columns, object keys, graph indexes.

---

## Port

**Definition:** A narrow interface contract describing what a capability needs, not how it is implemented.

**Purpose:** Dependency inversion and engine replaceability.

**Used By:** Every swappable concern — persistence, embedding, retrieval, graph, content.

**Related Terms:** Adapter, Composition Root, Extension Point.

**Examples:** Reader port for scoped reads; candidate source port for retrieval.

**Future Extension:** Split bloated ports before new adapters (interface segregation).

---

## Project

**Definition:** A logical label grouping memories within a workspace for filtering and organization.

**Purpose:** User-facing grouping — not a security boundary.

**Used By:** Knowledge metadata, Search filters, Retrieval filters.

**Related Terms:** Workspace, Memory, Codename.

**Examples:** Tag memories under `ai-brain` project for one product effort.

**Future Extension:** Project hierarchies; cross-project search within workspace.

---

## Prompt Assembly

**Definition:** Formatting ranked memory content into the final deliverable structure for an external consumer.

**Purpose:** Last step of Context Assembly before handoff to agent or model.

**Used By:** Context Assembly pipeline, MCP context tools.

**Related Terms:** Context Assembly, Context Budget, Ranking.

**Examples:** Ordered sections with titles and excerpts within budget.

**Future Extension:** Template variants per agent or tool; citation blocks.

---

## Proposed ADR

**Definition:** An ADR whose decision is recorded but not yet approved for implementation.

**Purpose:** Block coding on structural bets until owner marks Approved.

**Used By:** TASK_PROMPT gates, Phase 6 blocker, Decision Framework.

**Related Terms:** ADR, Approved ADR, Implemented ADR.

**Examples:** Hybrid retrieval ADR remains Proposed until owner approval.

**Future Extension:** Status transitions only — decision text preserved.

---

## Public Contract

**Definition:** The client-observable surface — fields, tools, behaviors — that external consumers depend on.

**Purpose:** Define what requires owner approval to break.

**Used By:** Constitution, MCP layer, backward compatibility policy.

**Related Terms:** Additive Change, Access Channel, Backward Compatibility.

**Examples:** Tool schemas exposed to AI clients; response field names in API payloads.

**Future Extension:** Versioned contracts if major breakage approved.

---

## Pure Domain Core

**Definition:** Logic that transforms data without input/output side effects — scoring, normalization, validation rules.

**Purpose:** Testability and prohibition of hidden persistence in algorithms.

**Used By:** Search ranking engine, knowledge generators, fusion modules.

**Related Terms:** Domain Layer, Ranking, Inward Dependencies.

**Examples:** Compute relevance score from in-memory candidate list only.

**Future Extension:** Hybrid fusion as pure module; graph score blending.

---

## Quality Gate

**Definition:** The required automated verification chain before merge or completion claims.

**Purpose:** Objective evidence over assistant assertion.

**Used By:** AI Rules, Workflow, Review checklist.

**Related Terms:** Phase Gate, Review Checklist.

**Examples:** Lint, format check, typecheck, tests — stop on first failure.

**Future Extension:** Additional gates (security scan) via workflow update — same concept.

---

## Ranking

**Definition:** Ordering candidates by relevance signals for a given query or context request.

**Purpose:** Turn broad candidates into a prioritized list before pagination or budget trim.

**Used By:** Search, Retrieval, Hybrid Retrieval.

**Related Terms:** Candidate, Relevance Score, Pure Domain Core.

**Examples:** Weight title match higher than body match; blend lexical and vector scores.

**Future Extension:** Learned weights; per-workspace ranking profiles.

---

## Relation

**Definition:** A directed edge linking two memories within scope (flat, not a full graph engine).

**Purpose:** Express dependencies and references before graph traversal exists.

**Used By:** Knowledge domain, future Graph Domain.

**Related Terms:** Graph Domain, Memory, Knowledge Metadata.

**Examples:** Memory A references Memory B as prerequisite.

**Future Extension:** Traversal via Graph Provider; richer edge types.

---

## Relevance Score

**Definition:** A numeric signal expressing how well a candidate matches the current search or retrieval intent.

**Purpose:** Feed Ranking with comparable values across sources.

**Used By:** Ranking, Search, Hybrid Retrieval.

**Related Terms:** Ranking, Candidate, Pure Domain Core.

**Examples:** Higher score for title keyword hit than footer mention.

**Future Extension:** Normalized cross-source scores for fusion.

---

## Replaceability

**Definition:** Design property that any infrastructure backend can be swapped via ports without rewriting domain logic.

**Purpose:** Long-term vendor independence.

**Used By:** Constitution, Architecture principles, ADRs.

**Related Terms:** Port, Adapter, Embedding Store.

**Examples:** Move vectors from one store engine to another with adapter swap.

**Future Extension:** Applies to metadata DB, object store, graph engine, identity providers.

---

## Retrieval

**Definition:** The bounded pipeline that gathers candidates for LLM context — distinct from paginated Search.

**Purpose:** Optimize for context quality under a cap, not human browse pages.

**Used By:** Memory domain, Context Assembly, Hybrid Retrieval.

**Related Terms:** Search, Retriever (role name in registry only — concept is Retrieval), Candidate.

**Examples:** Fetch top candidates for a prompt, rank, apply context budget.

**Future Extension:** Multi-source composite; graph-augmented candidates.

**Synonym policy:** Do not say "search" when meaning Retrieval.

---

## Retrieval Candidate Source

**Definition:** The port that supplies bounded memory candidates for the Retrieval pipeline.

**Purpose:** Plug lexical, vector, or graph discovery without changing Retriever orchestration.

**Used By:** Retrieval, Hybrid Retrieval, Composite Retrieval Source.

**Related Terms:** Candidate, Port, Vector Retrieval.

**Examples:** Lexical source today; vector source in Phase 6.

**Future Extension:** Graph source; per-source configuration in composite.

---

## Composite Retrieval Source

**Definition:** A retrieval candidate source that merges multiple sources, deduplicates by memory identity, and applies a shared cap.

**Purpose:** Enable Hybrid Retrieval without changing Retriever or Context Assembly.

**Used By:** Phase 6, Hybrid Retrieval, ADR-001 decision.

**Related Terms:** Retrieval Candidate Source, Hybrid Retrieval, Candidate.

**Examples:** Lexical plus vector lists merged to one deduped set before ranking.

**Future Extension:** Configurable merge policy; source priority weights.

---

## Review Checklist

**Definition:** A pre-merge pass/fail list verifying standards compliance.

**Purpose:** Catch layer violations and missing docs before merge.

**Used By:** Workflow release stage, AI assistants before PR.

**Related Terms:** Quality Gate, Documentation Standard, Phase Gate.

**Examples:** Confirm layer placement, tests added, operational snapshot updated if needed.

**Future Extension:** Phase-specific checklist items appended — core checklist stable.

---

## Roadmap

**Definition:** The living plan of phases 1–10 with dependencies, risks, and architecture evolution narrative.

**Purpose:** Strategic direction — not active task scope.

**Used By:** Phase planning, Decision Framework, Operational Snapshot pointer.

**Related Terms:** Phase, Capability Stack, TASK_PROMPT.

**Examples:** Phase 6 blocked until hybrid ADR approved.

**Future Extension:** Phases 11+ rows; status sync with gates.

---

## Scope Resolver

**Definition:** The future component that translates authenticated context into a fully populated Memory Scope.

**Purpose:** Centralize scope rules when workspace and agent fields activate.

**Used By:** Auth + MCP bootstrap (future), Effective Scope.

**Related Terms:** Memory Scope, Identity, Workspace, Agent.

**Examples:** Map JWT claims plus optional workspace hint to effective scope.

**Future Extension:** Organization policy injection; default workspace for solo owners.

---

## Search

**Definition:** The paginated pipeline for human or API browse of memories by relevance — distinct from Retrieval.

**Purpose:** Support UI and API listing with pages, not LLM context caps.

**Used By:** Search domain, REST search endpoints, MCP search tools.

**Related Terms:** Retrieval, Ranking, Candidate.

**Examples:** Page 1 of 20 results sorted by relevance for a keyword.

**Future Extension:** Hybrid scores in ranking — still paginated, still not Retrieval.

**Synonym policy:** Do not say "retrieval" or "RAG" when meaning Search.

---

## Semantic Hash

**Definition:** A stable fingerprint of memory content used for change detection and skip logic in enrichment.

**Purpose:** Avoid redundant embedding or intelligence work when body unchanged.

**Used By:** Embedding domain, intelligence backfill.

**Related Terms:** Content Body, Async Enrichment, Knowledge Metadata.

**Examples:** Re-embed only when hash differs from stored hash.

**Future Extension:** Hash algorithm rotation via backfill policy.

---

## Slug

**Definition:** A URL-safe unique identifier for a memory within owner scope.

**Purpose:** Stable references in links and tools alongside codename.

**Used By:** Knowledge domain, Search, external integrations.

**Related Terms:** Codename, Knowledge Metadata, Memory.

**Examples:** `auth-jwt-phase3` slug derived from title rules.

**Future Extension:** Workspace-global slug uniqueness option.

---

## Structural Law

**Definition:** Permanent architecture rules: layers, ports, dependency direction, and extension points.

**Purpose:** Do not mix with live metrics — structure changes rarely and with ADR.

**Used By:** Architecture document, Constitution, Phase status (by reference only).

**Related Terms:** Operational Snapshot, ADR, Architecture.

**Examples:** Separate Search and Retrieval pipelines; inward dependencies.

**Future Extension:** Amended only with owner approval and ADR when boundary shifts.

---

## TASK_PROMPT

**Definition:** The single active scoped work document: current phase tasks and definition of done.

**Purpose:** Rotating operational focus — not permanent law.

**Used By:** Decision Hierarchy (low among governance, high for current work), sessions.

**Related Terms:** Phase, Roadmap, Task Template.

**Examples:** Phase 5 embedding tasks; replaced when Phase 6 starts.

**Future Extension:** One active file at repo root; history in archive or phase folders.

---

## Task Template

**Definition:** The blank form for authoring a new TASK_PROMPT when a phase begins.

**Purpose:** Consistent task structure across phases.

**Used By:** Roadmap phase transitions, Documentation standard.

**Related Terms:** TASK_PROMPT, Phase Gate.

**Examples:** Sections for requirements, constraints, ADR gates, deliverables.

**Future Extension:** Stable schema; optional phase-specific appendices in playbooks.

---

## Vector Retrieval

**Definition:** Discovery of memory candidates by embedding similarity within owner scope.

**Purpose:** Semantic recall complementing lexical Retrieval Candidate Source.

**Used By:** Hybrid Retrieval, Embedding Store, Phase 6.

**Related Terms:** Embedding, Retrieval Candidate Source, Hybrid Retrieval.

**Examples:** Nearest neighbors to query embedding become candidates.

**Future Extension:** Approximate search at scale; re-ranking with lexical signals.

---

## Workspace

**Definition:** The shared memory pool boundary for a team or product (future explicit; implicit default for solo users).

**Purpose:** Security boundary above project labels for multi-AI and enterprise.

**Used By:** ADR-002 contract, Phase 9–10, Scope Resolver.

**Related Terms:** Organization, Owner, Project, Agent.

**Examples:** Team workspace where multiple agents read/write shared memories.

**Future Extension:** RBAC, membership, workspace-scoped object keys and vectors.

---

# Cross references

| Document | Role |
|----------|------|
| [00-CONSTITUTION.md](../../core/constitution/00-CONSTITUTION.md) | Immutable law using these terms |
| [04-ARCHITECTURE.md](../../core/architecture/04-ARCHITECTURE.md) | Structural placement of domains and ports |
| [11-AI-RULES.md](../../core/ai-rules/11-AI-RULES.md) | Canonical module names (registry — not definitions) |
| [09-ROADMAP.md](../roadmap/09-ROADMAP.md) | Phase narratives |
| [../README.md](../../docs/README.md) | Documentation index |

---

*Amend terms only when a new concept is introduced or a synonym is retired. Owner approval for redefinitions that affect structural documents.*
