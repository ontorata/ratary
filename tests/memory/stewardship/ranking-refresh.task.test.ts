import { describe, it, expect, vi } from 'vitest';
import { RankingRefreshTask } from '../../../src/memory/stewardship/tasks/ranking-refresh.task.js';
import type { ILearningOrchestrator } from '../../../src/learning/ilearning-orchestrator.interface.js';

describe('RankingRefreshTask', () => {
  const scope = { ownerId: 'owner-ranking' };

  it('skips when learning engine is disabled', async () => {
    const orchestrator = { run: vi.fn() } as unknown as ILearningOrchestrator;
    const task = new RankingRefreshTask(orchestrator, false);

    const result = await task.run({ scope, dryRun: true, now: new Date() });

    expect(result.status).toBe('skipped');
    expect(orchestrator.run).not.toHaveBeenCalled();
  });

  it('delegates to learning orchestrator', async () => {
    const orchestrator: ILearningOrchestrator = {
      run: vi.fn(async () => ({
        ownerId: scope.ownerId,
        dryRun: false,
        eventsProcessed: 7,
        analytics: {
          totalEvents: 7,
          unprocessedEvents: 0,
          eventsByType: {},
          helpfulFeedbackCount: 2,
          notHelpfulFeedbackCount: 0,
        },
        rankingSnapshot: {
          snapshotId: 'snap-1',
          ownerId: scope.ownerId,
          version: 1,
          retrievalWeightMultipliers: {},
          createdAt: '2026-07-04T00:00:00.000Z',
        },
        recommendationsGenerated: 0,
        patternsDiscovered: 0,
      })),
    };
    const task = new RankingRefreshTask(orchestrator, true);

    const result = await task.run({ scope, dryRun: false, now: new Date() });

    expect(result.status).toBe('ok');
    expect(result.changed).toBe(1);
    expect(result.findings.join(' ')).toMatch(/snap-1/);
  });
});
