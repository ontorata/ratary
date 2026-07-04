import { describe, it, expect } from 'vitest';
import { DefaultInspectionPatternMiner } from '../../src/learning/inspection/default-inspection-pattern-miner.js';
import type { LearningEvent } from '../../src/learning/learning.types.js';

function inspectionEvent(
  partial: Partial<LearningEvent> & { payload: Record<string, unknown> },
): LearningEvent {
  return {
    id: partial.id ?? crypto.randomUUID(),
    ownerId: partial.ownerId ?? 'owner-1',
    workspaceId: partial.workspaceId,
    eventType: 'signal.inspection_outcome',
    payload: partial.payload,
    processed: false,
    createdAt: partial.createdAt ?? '2026-07-05T00:00:00.000Z',
  };
}

describe('DefaultInspectionPatternMiner (8.8B)', () => {
  const miner = new DefaultInspectionPatternMiner();

  it('aggregates three resolved major events into one pattern', () => {
    const events = [1, 2, 3].map((n) =>
      inspectionEvent({
        id: `event-${n}`,
        payload: {
          signalId: `sig-${n}`,
          severity: 'major',
          category: 'testing',
          resolved: true,
          diffScope: { paths: ['src/ingest/'] },
        },
      }),
    );

    const candidates = miner.mine({ ownerId: 'owner-1' }, events);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.evidenceCount).toBe(3);
    expect(candidates[0]?.category).toBe('testing');
  });

  it('ignores unresolved and minor-only batches', () => {
    const events = [
      inspectionEvent({
        payload: { severity: 'major', category: 'adr', resolved: false, diffScope: {} },
      }),
      inspectionEvent({
        payload: { severity: 'major', category: 'adr', resolved: true, diffScope: {} },
      }),
    ];
    expect(miner.mine({ ownerId: 'owner-1' }, events)).toHaveLength(0);
  });
});
