import { describe, it, expect } from 'vitest';
import { processSignalIngest } from '../../src/ingest/process-signal-ingest.js';
import { CompositeSignalNormalizer } from '../../src/ingest/composite-signal-normalizer.js';
import { DefaultSignalNormalizer } from '../../src/ingest/default-signal-normalizer.js';
import { InspectionOutcomeNormalizer } from '../../src/ingest/inspection-outcome-normalizer.js';
import { MemorySignalIngestor } from '../../src/ingest/memory-signal-ingestor.js';
import { LearningEventRecorder } from '../../src/learning/learning-event-recorder.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';
import { SqlMemorySignalStore } from '../../src/infrastructure/signals/sql-memory-signal-store.js';
import type { ILearningEventStore } from '../../src/learning/ilearning-event-store.port.js';
import type { LearningEvent } from '../../src/learning/learning.types.js';

describe('processSignalIngest inspection_outcome + learning (8.8A)', () => {
  it('records learning event when eventRecorder wired', async () => {
    const mockDb = new MockD1Client();
    const repository = createTestMemoryRepository(mockDb);
    const ownerId = 'owner-learn-inspect';
    const events: LearningEvent[] = [];
    const eventStore: ILearningEventStore = {
      append: async (event) => {
        events.push({ ...event, processed: false });
      },
      listUnprocessed: async () => events,
      markProcessed: async () => {},
    };

    const result = await processSignalIngest(
      { ownerId },
      {
        type: 'inspection_outcome',
        source: 'forge_inspect',
        severity: 'critical',
        category: 'adr',
        resolved: true,
        taskId: 'blueprint-task-2',
      },
      {
        normalizer: new CompositeSignalNormalizer([
          new DefaultSignalNormalizer(),
          new InspectionOutcomeNormalizer(),
        ]),
        ingestor: new MemorySignalIngestor(repository, new SqlMemorySignalStore(mockDb)),
        eventRecorder: new LearningEventRecorder(eventStore),
      },
    );

    expect(result.accepted).toBe(true);
    expect(events).toHaveLength(1);
    expect(events[0]?.eventType).toBe('signal.inspection_outcome');
  });
});
