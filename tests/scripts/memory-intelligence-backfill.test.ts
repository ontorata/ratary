import { describe, it, expect } from 'vitest';
import { buildIntelligenceBackfillPatch } from '../../scripts/lib/memory-intelligence-backfill.js';

describe('memory-intelligence-backfill', () => {
  it('should derive project_id and semantic_hash from memory fields', () => {
    const patch = buildIntelligenceBackfillPatch({
      title: 'Hydration Fix',
      summary: 'Fix SSR hydration',
      content: 'Details about hydration mismatch in chat',
      project: 'MangroveApps',
    });

    expect(patch.projectId).toBe('mangroveapps');
    expect(patch.level).toBe('note');
    expect(patch.semanticHash).toHaveLength(64);
  });
});
