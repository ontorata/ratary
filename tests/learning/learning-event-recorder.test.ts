import { describe, it, expect } from 'vitest';
import { LearningEventRecorder } from '../../src/learning/learning-event-recorder.js';
import type { ILearningEventStore } from '../../src/learning/ilearning-event-store.port.js';
import type { LearningEvent } from '../../src/learning/learning.types.js';

describe('LearningEventRecorder (8.8A)', () => {
  it('records signal.inspection_outcome for accepted inspection signals', async () => {
    const events: LearningEvent[] = [];
    const store: ILearningEventStore = {
      append: async (event) => {
        events.push({ ...event, processed: false });
      },
      listUnprocessed: async () => events.filter((e) => !e.processed),
      markProcessed: async () => {},
    };

    const recorder = new LearningEventRecorder(store);
    await recorder.recordFromSignal(
      { ownerId: 'owner-1', workspaceId: 'ws-1' },
      {
        signalId: 'sig-1',
        signalType: 'inspection_outcome',
        ownerId: 'owner-1',
        payload: {
          kind: 'inspection_outcome',
          source: 'forge_inspect',
          severity: 'major',
          category: 'testing',
          resolved: true,
        },
        observedAt: '2026-07-05T00:00:00.000Z',
      },
      { accepted: true, duplicate: false, appliedDelta: 0 },
    );

    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe('signal.inspection_outcome');
    expect(events[0]?.payload).toMatchObject({
      signalId: 'sig-1',
      severity: 'major',
      category: 'testing',
      resolved: true,
    });
  });

  it('skips duplicate or rejected ingest results', async () => {
    let appendCount = 0;
    const store: ILearningEventStore = {
      append: async () => {
        appendCount++;
      },
      listUnprocessed: async () => [],
      markProcessed: async () => {},
    };

    const recorder = new LearningEventRecorder(store);
    await recorder.recordFromSignal(
      { ownerId: 'owner-1' },
      {
        signalId: 'sig-2',
        signalType: 'inspection_outcome',
        ownerId: 'owner-1',
        observedAt: new Date().toISOString(),
      },
      { accepted: false, duplicate: true },
    );

    expect(appendCount).toBe(0);
  });
});
