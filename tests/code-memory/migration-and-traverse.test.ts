/**
 * Phase 38 / ADR-070 — additive code_* migration + traverse when flag on.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { migrateCodeMemoryPhase1, runSchemaMigrations } from '../../src/db/migrations.js';
import {
  SqlCodeBridgeStore,
  SqlCodeEdgeStore,
  SqlCodeNodeStore,
} from '../../src/knowledge/code-memory/sql-code-memory-store.js';
import { extractTsJsCodeGraph } from '../../src/knowledge/code-memory/ts-api-indexer.js';
import { runCodeIndex } from '../../src/knowledge/code-memory/code-index-runner.js';
import { createCodeMemoryService } from '../../src/services/code-memory.service.js';
import { CODE_INDEXER_VERSION } from '../../src/types/code-memory.js';
import { bridgeCodeDocumentedBy } from '../../src/knowledge/code-memory/code-documented-by-bridge.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';

const OWNER = '00000000-0000-4000-8000-000000000038';

describe('code memory migration (ADR-070)', () => {
  let db: SqliteMemoryDatabase;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
  });

  afterAll(() => db?.close());

  it('creates code_* tables and unique indexes', async () => {
    const names = (
      await db.query<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name`,
      )
    ).map((r) => r.name);

    expect(names).toContain('code_nodes');
    expect(names).toContain('code_edges');
    expect(names).toContain('code_bridges');
    expect(names).toContain('code_index_runs');
    expect(names).toContain('idx_code_nodes_owner_stable');
    expect(names).toContain('idx_code_edges_natural');
    expect(names).toContain('idx_code_bridges_natural');
  });

  it('is idempotent', async () => {
    const before = await db.query(`SELECT type, name FROM sqlite_master ORDER BY type, name`);
    await migrateCodeMemoryPhase1(db);
    await runSchemaMigrations(db, 'sqlite');
    const after = await db.query(`SELECT type, name FROM sqlite_master ORDER BY type, name`);
    expect(after).toEqual(before);
  });
});

describe('ts-api indexer + traverse_code', () => {
  let db: SqliteMemoryDatabase;
  let fixtureRoot: string;

  beforeAll(async () => {
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    fixtureRoot = mkdtempSync(join(tmpdir(), 'ratary-code-mem-'));
    mkdirSync(join(fixtureRoot, 'src'));
    writeFileSync(
      join(fixtureRoot, 'src', 'sample.ts'),
      `export function greet(name: string): string {\n  return 'hi ' + name;\n}\n\nexport class Greeter {\n  say(): string { return greet('world'); }\n}\n`,
      'utf8',
    );
  });

  afterAll(() => db?.close());

  it('extracts deterministic nodes/edges (ts-api-1.0)', () => {
    const a = extractTsJsCodeGraph({
      ownerId: OWNER,
      repository: 'fixture/demo',
      rootDir: fixtureRoot,
      now: '2026-07-29T00:00:00.000Z',
    });
    const b = extractTsJsCodeGraph({
      ownerId: OWNER,
      repository: 'fixture/demo',
      rootDir: fixtureRoot,
      now: '2026-07-29T00:00:00.000Z',
    });
    expect(a.indexerVersion).toBe(CODE_INDEXER_VERSION);
    expect(a.stats.filesScanned).toBe(1);
    expect(a.nodes.map((n) => n.stableKey).sort()).toEqual(
      b.nodes.map((n) => n.stableKey).sort(),
    );
    expect(a.nodes.some((n) => n.kind === 'function' && n.displayName === 'greet')).toBe(true);
    expect(a.nodes.some((n) => n.kind === 'class' && n.displayName === 'Greeter')).toBe(true);
    expect(a.edges.some((e) => e.type === 'DECLARES')).toBe(true);
  });

  it('persists and traverses when ports enabled', async () => {
    const ports = {
      enabled: true as const,
      nodes: new SqlCodeNodeStore(db),
      edges: new SqlCodeEdgeStore(db),
      bridges: new SqlCodeBridgeStore(db),
    };
    const report = await runCodeIndex({
      ownerId: OWNER,
      repository: 'fixture/demo',
      rootDir: fixtureRoot,
      dryRun: false,
      ports,
      sql: db,
      now: '2026-07-29T00:00:00.000Z',
    });
    expect(report.enabled).toBe(true);
    expect(report.runId).toBeTruthy();

    const service = createCodeMemoryService(ports);
    const result = await service.traverse(OWNER, {
      stableKey: 'repo:fixture/demo',
      depth: 2,
    });
    expect(result.enabled).toBe(true);
    expect(result.nodeIds.length).toBeGreaterThan(1);
    expect(result.neighbors.length).toBeGreaterThan(0);
  });

  it('stewardship bridge links source_path memories without touching save path', async () => {
    const ports = {
      enabled: true as const,
      nodes: new SqlCodeNodeStore(db),
      edges: new SqlCodeEdgeStore(db),
      bridges: new SqlCodeBridgeStore(db),
    };
    const repo = new MemoryRepository(db);
    await repo.insert({
      title: 'docs sample.ts',
      project: 'ratary',
      content: 'documents sample',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'documentation',
      importance: 50,
      language: 'en',
      notes: '',
      codename: 'CM-DOC',
      slug: 'cm-doc-sample',
      favorite: false,
      ownerId: OWNER,
      sourcePath: 'src/sample.ts',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    const report = await bridgeCodeDocumentedBy({
      ownerId: OWNER,
      repository: 'fixture/demo',
      dryRun: false,
      ports,
      sql: db,
    });
    expect(report.created).toBeGreaterThanOrEqual(1);

    const file = await ports.nodes.getByStableKey(OWNER, 'file:fixture/demo:src/sample.ts');
    expect(file).not.toBeNull();
    const bridges = await ports.bridges.listByCodeNode(OWNER, file!.id, ['CODE_DOCUMENTED_BY']);
    expect(bridges.length).toBeGreaterThanOrEqual(1);
  });
});
