import { describe, it, expect, vi } from 'vitest';
import { LocalStewardshipScheduler } from '../../src/jobs/local-stewardship-scheduler.js';
import type { IMemoryStewardshipOrchestrator } from '../../src/memory/stewardship/imemory-stewardship-orchestrator.interface.js';

describe('LocalStewardshipScheduler', () => {
  it('runs orchestrator and returns run id', async () => {
    const orchestrator: IMemoryStewardshipOrchestrator = {
      run: vi.fn(async () => ({
        runId: 'scheduled-run-1',
        ownerId: 'owner-sched',
        dryRun: true,
        startedAt: '',
        finishedAt: '',
        durationMs: 1,
        tasks: [],
        totalScanned: 0,
        totalChanged: 0,
        hadErrors: false,
      })),
    };
    const scheduler = new LocalStewardshipScheduler(orchestrator);

    const runId = await scheduler.enqueue({ ownerId: 'owner-sched' }, { dryRun: true });

    expect(runId).toBe('scheduled-run-1');
    expect(orchestrator.run).toHaveBeenCalledOnce();
  });
});
