/**
 * SQL-level contract for applyDecayResult (PI-A, D2 archive semantics):
 *
 * - lifecycle ARCHIVED also sets the `archived` column, so the memory
 *   actually leaves default retrieval/list paths (reversible archive).
 * - non-archived lifecycle values never touch the `archived` column.
 * - `updated_at` is never modified by a decay pass.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { SqliteMemoryDatabase } from '../identity/helpers/sqlite-memory-db.js';
import { runSchemaMigrations } from '../../src/db/migrations.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import type { Memory } from '../../src/types/memory.js';

const OWNER = 'owner-decay-sql';

describe('applyDecayResult SQL semantics', () => {
  let repo: MemoryRepository;
  let mem: Memory;

  beforeEach(async () => {
    const db = new SqliteMemoryDatabase();
    await runSchemaMigrations(db, 'sqlite');
    repo = new MemoryRepository(db);
    mem = await repo.insert({
      title: 'decay sql subject',
      project: 'ratary',
      content: 'decay sql subject body',
      summary: '',
      tags: [],
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 10,
      language: 'en',
      notes: '',
      codename: 'NOTE-9001',
      slug: 'decay-sql-subject',
      favorite: false,
      ownerId: OWNER,
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  async function apply(lifecycleState: string): Promise<void> {
    await repo.applyDecayResult(mem.id, OWNER, {
      score: 0.02,
      signalsJson: '{}',
      computedAt: '2026-07-19T00:00:00.000Z',
      lifecycleState,
    });
  }

  it('lifecycle ARCHIVED sets the archived flag and removes the memory from default listing', async () => {
    await apply('archived');

    const row = await repo.findById(mem.id, OWNER);
    expect(row?.archived).toBe(true);
    expect(row?.lifecycleState).toBe('archived');

    const listed = await repo.findAll({ ownerId: OWNER, limit: 10, offset: 0 });
    expect(listed.memories.map((m) => m.id)).not.toContain(mem.id);
  });

  it('non-archived lifecycle transitions never touch the archived flag', async () => {
    for (const state of ['active', 'dormant', 'fading']) {
      await apply(state);
      const row = await repo.findById(mem.id, OWNER);
      expect(row?.archived).toBe(false);
      expect(row?.lifecycleState).toBe(state);
    }
  });

  it('decay writes never modify updated_at', async () => {
    await apply('archived');
    const row = await repo.findById(mem.id, OWNER);
    expect(row?.updatedAt).toBe(mem.updatedAt);
  });
});
