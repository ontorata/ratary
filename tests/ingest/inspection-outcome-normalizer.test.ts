import { describe, it, expect } from 'vitest';
import { InspectionOutcomeNormalizer } from '../../src/ingest/inspection-outcome-normalizer.js';
import { DefaultSignalNormalizer } from '../../src/ingest/default-signal-normalizer.js';
import { CompositeSignalNormalizer } from '../../src/ingest/composite-signal-normalizer.js';

const ctx = { ownerId: 'owner-inspect', workspaceId: 'ws-1' };

describe('InspectionOutcomeNormalizer (8.8A)', () => {
  const normalizer = new InspectionOutcomeNormalizer();

  it('accepts resolved major inspection outcome', () => {
    const signal = normalizer.normalize(
      {
        type: 'inspection_outcome',
        source: 'forge_inspect',
        taskId: 'task-3',
        severity: 'major',
        category: 'testing',
        resolved: true,
        diffScope: { paths: ['src/ingest/'] },
      },
      ctx,
    );

    expect(signal).not.toBeNull();
    expect(signal?.signalType).toBe('inspection_outcome');
    expect(signal?.ownerId).toBe('owner-inspect');
    expect(signal?.payload).toMatchObject({
      kind: 'inspection_outcome',
      source: 'forge_inspect',
      severity: 'major',
      category: 'testing',
      resolved: true,
      diffScope: { paths: ['src/ingest/'] },
    });
    expect(signal?.memoryId).toBeUndefined();
  });

  it('accepts constitutional critical outcomes', () => {
    const signal = normalizer.normalize(
      {
        type: 'inspection_outcome',
        source: 'mcp',
        severity: 'constitutional',
        category: 'boundary',
        resolved: false,
      },
      ctx,
    );

    expect(signal?.payload).toMatchObject({ severity: 'constitutional', resolved: false });
  });

  it('rejects invalid type and missing severity', () => {
    expect(normalizer.normalize({ type: 'explicit_feedback' }, ctx)).toBeNull();
    expect(
      normalizer.normalize(
        { type: 'inspection_outcome', source: 'ci', category: 'adr', resolved: true },
        ctx,
      ),
    ).toBeNull();
  });

  it('preserves optional signalId for idempotency', () => {
    const signalId = crypto.randomUUID();
    const signal = normalizer.normalize(
      {
        type: 'inspection_outcome',
        source: 'rest',
        severity: 'critical',
        category: 'security',
        resolved: true,
        signalId,
      },
      ctx,
    );
    expect(signal?.signalId).toBe(signalId);
  });
});

describe('CompositeSignalNormalizer', () => {
  const composite = new CompositeSignalNormalizer([
    new DefaultSignalNormalizer(),
    new InspectionOutcomeNormalizer(),
  ]);

  it('delegates explicit_feedback to first normalizer', () => {
    const memoryId = crypto.randomUUID();
    const signal = composite.normalize(
      { type: 'explicit_feedback', memoryId, value: 'helpful' },
      ctx,
    );
    expect(signal?.signalType).toBe('explicit_feedback');
    expect(signal?.memoryId).toBe(memoryId);
  });

  it('delegates inspection_outcome to second normalizer', () => {
    const signal = composite.normalize(
      {
        type: 'inspection_outcome',
        source: 'forge_inspect',
        severity: 'major',
        category: 'adr',
        resolved: true,
      },
      ctx,
    );
    expect(signal?.signalType).toBe('inspection_outcome');
  });
});
