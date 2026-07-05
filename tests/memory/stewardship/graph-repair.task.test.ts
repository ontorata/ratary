import { describe, it, expect, vi } from 'vitest';
import { GraphRepairTask } from '../../../src/memory/stewardship/tasks/graph-repair.task.js';
import type { IRelationInferenceOrchestrator } from '../../../src/inference/irelation-inference-orchestrator.interface.js';

describe('GraphRepairTask', () => {
  const scope = { ownerId: 'owner-graph' };

  it('skips when relation inference is disabled', async () => {
    const orchestrator = { run: vi.fn() } as unknown as IRelationInferenceOrchestrator;
    const task = new GraphRepairTask(orchestrator, false);

    const result = await task.run({ scope, dryRun: true, now: new Date() });

    expect(result.status).toBe('skipped');
    expect(result.stage).toBe('graph-repair');
    expect(orchestrator.run).not.toHaveBeenCalled();
  });

  it('delegates to relation inference orchestrator and maps report', async () => {
    const orchestrator: IRelationInferenceOrchestrator = {
      run: vi.fn(async () => ({
        ownerId: scope.ownerId,
        dryRun: true,
        candidatesFound: 4,
        relationsCreated: 2,
        relationsUpdated: 1,
        relationsSkippedManual: 0,
        bySource: { shared_tag: 4 },
      })),
    };
    const task = new GraphRepairTask(orchestrator, true);

    const result = await task.run({ scope, dryRun: true, now: new Date() });

    expect(orchestrator.run).toHaveBeenCalledWith(scope, { dryRun: true, projectId: undefined });
    expect(result.status).toBe('ok');
    expect(result.scanned).toBe(4);
    expect(result.changed).toBe(0);
    expect(result.findings.join(' ')).toMatch(/candidates: 4/);
  });

  it('counts mutations only when not dry-run', async () => {
    const orchestrator: IRelationInferenceOrchestrator = {
      run: vi.fn(async (_scope, options) => ({
        ownerId: scope.ownerId,
        dryRun: options.dryRun,
        candidatesFound: 3,
        relationsCreated: 2,
        relationsUpdated: 1,
        relationsSkippedManual: 0,
        bySource: {},
      })),
    };
    const task = new GraphRepairTask(orchestrator, true);

    const result = await task.run({ scope, dryRun: false, now: new Date() });

    expect(result.changed).toBe(3);
  });
});
