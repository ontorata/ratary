# ADR-031: Developer Platform — SDK, CLI, and Remote MCP (Phase 16)

**Status:** Implemented  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Ratary exposes REST, MCP stdio, and (Phase 13) gRPC. External developers and enterprise teams need **typed client libraries**, CLI, installable MCP server, and starter templates — without duplicating business logic inside clients.

Phase 7.5 placed `@ratary/client` **outside** core repo as principle; Phase 16 **formalizes** a **developer platform monorepo slice** (`packages/`) generated from OpenAPI/proto SSOT.

## Problem

- Manual curl/SDK glue per language → drift from API.
- CLI and Dashboard risk reimplementing memory logic.
- MCP stdio-only limits remote/hosted deployments.
- No OpenAPI/SDK generator pipeline in governance.

## Constraints

- **Zero business logic** in SDK/CLI — thin HTTP/gRPC/MCP clients only.
- Server `MemoryService` **unchanged**.
- Generated code from OpenAPI + proto; hand-written code = transport wrapper only.
- Breaking REST v1 forbidden.

## Decision

**Adopt Option A — `packages/` developer platform:**

1. OpenAPI Generator + proto gen pipeline (CI).
2. SDK languages: TypeScript, Go, Python, Java, Rust, C#, PHP (minimal surface: memory, context, search, capabilities).
3. `@ratary/cli` uses TypeScript SDK.
4. Dashboard (optional SPA in `apps/dashboard/`) uses TypeScript SDK only.
5. `@ratary/mcp-server` — installable npm; remote MCP over HTTP/SSE (Phase 13); delegates to SDK.
6. Starter templates + examples repo folder.

SDK **calls server** — never embeds ranking, retrieval, or SQL.

## Rollback

Remove `packages/` from release — server unaffected.

## References

- ADR-025, Phase 13, Phase 15
