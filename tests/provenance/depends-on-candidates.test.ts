/**
 * Phase 36 / ADR-069 T6 — depends_on candidates are findings-only.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { ProvenanceCandidatesTask } from '../../src/memory/stewardship/tasks/provenance-candidates.task.js';
import { createProvenancePorts } from '../../src/composition/create-provenance-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/env.js';
import { collectDependsOnProvenanceCandidates } from '../../src/knowledge/provenance/depends-on-candidates.js';
import { PROVENANCE_VERSION } from '../../src/types/provenance.js';

const OWNER = 'owner-candidates';

describe('collectDependsOnProvenanceCandidates (pure)', () => {
  it('emits caused_by suggestions with depends_on_candidate evidence, sorted by edge id', () => {
    const findings = collectDependsOnProvenanceCandidates([
      { id: 'b', sourceMemoryId: 's2', targetMemoryId: 't2', relation: 'depends_on' },
      { id: 'a', sourceMemoryId: 's1', targetMemoryId: 't1', relation: 'depends_on' },
      { id: 'c', sourceMemoryId: 's3', targetMemoryId: 't3', relation: 'related' },
    ]);
    expect(findings).toHaveLength(2);
    expect(findings.map((f) => f.dependsOnRelationId)).toEqual(['a', 'b']);
    expect(findings[0]?.evidence).toEqual({
      provenanceVersion: PROVENANCE_VERSION,
      rule: 'depends_on_candidate',
      matched: 'a',
    });
    expect(findings[0]?.suggestedRelation).toBe('caused_by');
  });
});

describe('ProvenanceCandidatesTask (ADR-069 D4)', () => {
  let db: SqliteMemoryDatabase;
  const TOUCHED = ['DECISION_PROVENANCE_ENABLED'] as const;
  const saved: Record<string, string | undefined> = {};

  beforeAll(async () => {
    for (const key of TOUCHED) {
      saved[key] = process.env[key];
    }
    db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    const memories = new MemoryRepository(db);
    const relations = new MemoryRelationRepository(db);
    for (const id of ['mem-a', 'mem-b']) {
      await memories.insert({
        id,
        title: id,
        project: 'ratary',
        content: `${id} body`,
        summary: '',
        tags: [],
        keywords: [],
        category: '',
        memoryType: 'note',
        importance: 50,
        language: 'en',
        notes: '',
        codename: id,
        slug: id,
        favorite: false,
        ownerId: OWNER,
      });
    }
    await relations.insert({
      sourceMemoryId: 'mem-a',
      targetMemoryId: 'mem-b',
      relation: 'depends_on',
      ownerId: OWNER,
    });
  });

  afterAll(() => {
    for (const key of TOUCHED) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    resetEnvCache();
    db?.close();
  });

  it('skips when flag off', async () => {
    delete process.env.DECISION_PROVENANCE_ENABLED;
    resetEnvCache();
    const task = new ProvenanceCandidatesTask(db, createProvenancePorts(db, getEnv()));
    const result = await task.run({
      scope: { ownerId: OWNER },
      dryRun: true,
      now: new Date('2026-07-20T00:00:00.000Z'),
    });
    expect(result.status).toBe('skipped');
    expect(result.changed).toBe(0);
  });

  it('findings-only when flag on — changed always 0 even without dryRun', async () => {
    process.env.DECISION_PROVENANCE_ENABLED = 'true';
    resetEnvCache();
    const task = new ProvenanceCandidatesTask(db, createProvenancePorts(db, getEnv()));
    const result = await task.run({
      scope: { ownerId: OWNER },
      dryRun: false,
      now: new Date('2026-07-20T00:00:00.000Z'),
    });
    expect(result.status).toBe('ok');
    expect(result.changed).toBe(0);
    expect(result.scanned).toBe(1);
    expect(result.findings.some((f) => f.includes('findings-only'))).toBe(true);

    const causedBy = await db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM memory_relations WHERE owner_id = ? AND relation = 'caused_by'`,
      [OWNER],
    );
    expect(causedBy[0]?.count ?? 0).toBe(0);
  });
});
