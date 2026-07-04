import { describe, it, expect } from 'vitest';
import { backfillContentOffload } from '../../scripts/lib/content-offload-backfill.js';
import { InlineObjectStorage } from '../../src/infrastructure/storage/inline-object-storage.adapter.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('backfillContentOffload', () => {
  it('dry-run counts large memories without object_key', async () => {
    const sql = new MockD1Client();
    const ownerId = 'owner-1';
    const largeContent = 'x'.repeat(9000);

    const now = new Date().toISOString();
    await sql.execute(`INSERT INTO memories VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      'mem-1',
      'Title',
      'proj',
      largeContent,
      'sum',
      '[]',
      0,
      0,
      ownerId,
      now,
      now,
      null,
      null,
      '[]',
      '',
      'note',
      50,
      'id',
      '',
      '',
      'note',
      null,
      0,
      null,
      null,
      null,
      null,
      null,
    ]);

    const result = await backfillContentOffload({
      source: sql,
      objectStorage: new InlineObjectStorage(),
      minBytes: 8192,
      ownerId,
      batchSize: 10,
      dryRun: true,
    });

    expect(result.scanned).toBe(1);
    expect(result.offloaded).toBe(1);
  });
});
