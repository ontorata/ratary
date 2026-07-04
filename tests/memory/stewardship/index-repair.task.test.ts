import { describe, it, expect, vi } from 'vitest';
import { IndexRepairTask } from '../../../src/memory/stewardship/tasks/index-repair.task.js';
import type { SearchGraphOrchestrator } from '../../../src/search-graph-platform/services/search-graph-orchestrator.js';

describe('IndexRepairTask', () => {
  const scope = { ownerId: 'owner-index' };

  it('skips when search graph platform is disabled', async () => {
    const orchestrator = {
      syncSearch: vi.fn(),
      syncGraph: vi.fn(),
    } as unknown as SearchGraphOrchestrator;
    const task = new IndexRepairTask(orchestrator, false);

    const result = await task.run({ scope, dryRun: true, now: new Date() });

    expect(result.status).toBe('skipped');
    expect(orchestrator.syncSearch).not.toHaveBeenCalled();
  });

  it('syncs meilisearch and neo4j incrementally', async () => {
    const orchestrator = {
      syncSearch: vi.fn(async () => ({
        id: 'run-1',
        target: 'meilisearch',
        mode: 'incremental',
        status: 'completed',
        stats: { scanned: 10, applied: 8, skipped: 2, failed: 0, dryRun: false },
        startedAt: '',
      })),
      syncGraph: vi.fn(async () => ({
        id: 'run-2',
        target: 'neo4j',
        mode: 'incremental',
        status: 'completed',
        stats: { scanned: 5, applied: 4, skipped: 1, failed: 0, dryRun: false },
        startedAt: '',
      })),
    } as unknown as SearchGraphOrchestrator;
    const task = new IndexRepairTask(orchestrator, true);

    const result = await task.run({ scope, dryRun: false, now: new Date() });

    expect(result.status).toBe('ok');
    expect(result.scanned).toBe(15);
    expect(result.changed).toBe(12);
    expect(orchestrator.syncSearch).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'incremental', ownerId: scope.ownerId }),
    );
  });

  it('reports error when a target sync fails but continues', async () => {
    const orchestrator = {
      syncSearch: vi.fn(async () => {
        throw new Error('meilisearch down');
      }),
      syncGraph: vi.fn(async () => ({
        id: 'run-2',
        target: 'neo4j',
        mode: 'incremental',
        status: 'completed',
        stats: { scanned: 2, applied: 1, skipped: 0, failed: 0, dryRun: true },
        startedAt: '',
      })),
    } as unknown as SearchGraphOrchestrator;
    const task = new IndexRepairTask(orchestrator, true);

    const result = await task.run({ scope, dryRun: true, now: new Date() });

    expect(result.status).toBe('error');
    expect(result.findings.join(' ')).toMatch(/meilisearch down/);
    expect(result.scanned).toBe(2);
  });
});
