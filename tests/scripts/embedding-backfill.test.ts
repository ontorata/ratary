import { describe, it, expect } from 'vitest';
import { parseEmbeddingBackfillArgs } from '../../scripts/lib/embedding-backfill.js';

describe('parseEmbeddingBackfillArgs', () => {
  it('should default to dry-run without --execute', () => {
    const cli = parseEmbeddingBackfillArgs(['node', 'script.ts']);
    expect(cli.dryRun).toBe(true);
    expect(cli.batchSize).toBe(32);
    expect(cli.forceReembed).toBe(false);
  });

  it('should parse execute, owner, force, batch, and project flags', () => {
    const cli = parseEmbeddingBackfillArgs([
      'node',
      'script.ts',
      '--execute',
      '--owner=owner-a',
      '--force',
      '--batch-size=16',
      '--project=ai-brain',
    ]);

    expect(cli).toEqual({
      dryRun: false,
      ownerId: 'owner-a',
      forceReembed: true,
      batchSize: 16,
      projectId: 'ai-brain',
    });
  });

  it('should fall back to default batch size for invalid values', () => {
    const cli = parseEmbeddingBackfillArgs(['node', 'script.ts', '--batch-size=0']);
    expect(cli.batchSize).toBe(32);
  });
});
