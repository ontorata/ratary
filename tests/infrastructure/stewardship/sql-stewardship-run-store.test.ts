import { describe, it, expect, beforeEach } from 'vitest';
import { SqlStewardshipRunStore } from '../../../src/infrastructure/stewardship/sql-stewardship-run-store.js';
import { MockD1Client } from '../../helpers/mock-d1.js';
import { asSqlDatabase } from '../../helpers/sql-test-harness.js';
import { migrateExtensionTracksPhase7 } from '../../../src/db/migrations.js';
import type { StewardshipRunReport } from '../../../src/memory/stewardship/imemory-stewardship-orchestrator.interface.js';

function sampleReport(ownerId: string, runId: string): StewardshipRunReport {
  return {
    runId,
    ownerId,
    dryRun: true,
    startedAt: '2026-07-04T00:00:00.000Z',
    finishedAt: '2026-07-04T00:00:01.000Z',
    durationMs: 1000,
    tasks: [],
    totalScanned: 3,
    totalChanged: 0,
    hadErrors: false,
  };
}

describe('SqlStewardshipRunStore', () => {
  let store: SqlStewardshipRunStore;

  beforeEach(async () => {
    const mockDb = new MockD1Client();
    const sql = asSqlDatabase(mockDb);
    await migrateExtensionTracksPhase7(sql);
    store = new SqlStewardshipRunStore(sql);
  });

  it('persists and lists runs per owner', async () => {
    await store.save(sampleReport('owner-a', 'run-1'));
    await store.save({ ...sampleReport('owner-a', 'run-2'), startedAt: '2026-07-04T00:00:02.000Z' });
    await store.save(sampleReport('owner-b', 'run-3'));

    const listA = await store.list('owner-a');
    expect(listA).toHaveLength(2);
    expect(listA.map((r) => r.runId)).toContain('run-1');

    const latest = await store.latest('owner-a');
    expect(latest?.runId).toBe('run-2');
  });
});
