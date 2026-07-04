import { describe, it, expect } from 'vitest';
import { MemoryStewardshipOrchestrator } from '../../../src/memory/stewardship/memory-stewardship-orchestrator.js';
import { InMemoryStewardshipRunStore } from '../../../src/memory/stewardship/in-memory-stewardship-run-store.js';
import type {
  IMaintenanceTask,
  MaintenanceContext,
  MaintenanceTaskResult,
} from '../../../src/memory/stewardship/imaintenance-task.interface.js';
import type { StewardshipStage } from '../../../src/memory/stewardship/stewardship.types.js';

function task(
  id: string,
  stage: StewardshipStage,
  opts: {
    changed?: number;
    scanned?: number;
    throws?: boolean;
    onRun?: (ctx: MaintenanceContext) => void;
  } = {},
): IMaintenanceTask {
  return {
    id,
    stage,
    async run(ctx): Promise<MaintenanceTaskResult> {
      opts.onRun?.(ctx);
      if (opts.throws) throw new Error(`boom:${id}`);
      return {
        taskId: id,
        stage,
        status: 'ok',
        scanned: opts.scanned ?? 0,
        changed: opts.changed ?? 0,
        findings: [id],
      };
    },
  };
}

const scope = { ownerId: 'owner-steward' };

describe('MemoryStewardshipOrchestrator (Phase 04.7)', () => {
  it('runs tasks in fixed stage order regardless of registration order', async () => {
    const orchestrator = new MemoryStewardshipOrchestrator([
      task('c', 'retrieval-optimization'),
      task('a', 'metadata-repair'),
      task('b', 'merge-compress'),
    ]);

    const report = await orchestrator.run(scope);
    expect(report.tasks.map((t) => t.stage)).toEqual([
      'metadata-repair',
      'merge-compress',
      'retrieval-optimization',
    ]);
  });

  it('defaults to dry-run and propagates it to task context', async () => {
    let seenDryRun: boolean | undefined;
    const orchestrator = new MemoryStewardshipOrchestrator([
      task('a', 'metadata-repair', { onRun: (ctx) => (seenDryRun = ctx.dryRun) }),
    ]);

    const report = await orchestrator.run(scope);
    expect(seenDryRun).toBe(true);
    expect(report.dryRun).toBe(true);
  });

  it('isolates a failing task and still completes the pipeline', async () => {
    const orchestrator = new MemoryStewardshipOrchestrator([
      task('a', 'metadata-repair'),
      task('b', 'merge-compress', { throws: true }),
      task('c', 'embedding-repair', { changed: 2, scanned: 5 }),
    ]);

    const report = await orchestrator.run(scope, { dryRun: false });
    const failed = report.tasks.find((t) => t.taskId === 'b');
    expect(failed?.status).toBe('error');
    expect(failed?.error).toContain('boom:b');
    expect(report.hadErrors).toBe(true);
    expect(report.tasks.find((t) => t.taskId === 'c')?.status).toBe('ok');
    expect(report.totalChanged).toBe(2);
    expect(report.totalScanned).toBe(5);
  });

  it('persists the run to the store', async () => {
    const runStore = new InMemoryStewardshipRunStore();
    const orchestrator = new MemoryStewardshipOrchestrator([task('a', 'metadata-repair')], {
      runStore,
    });

    const report = await orchestrator.run(scope);
    const latest = await runStore.latest('owner-steward');
    expect(latest?.runId).toBe(report.runId);
    expect((await runStore.list('owner-steward')).length).toBe(1);
  });
});
