import { describe, expect, it } from 'vitest';
import { createGovernanceController } from './governance.controller.js';
import { getMemoryGovernanceManifest } from '../memory/governance/index.js';
import { InMemoryStewardshipRunStore } from '../memory/stewardship/in-memory-stewardship-run-store.js';
import type { StewardshipRunReport } from '../memory/stewardship/imemory-stewardship-orchestrator.interface.js';

function mockReply() {
  const reply = {
    payload: undefined as unknown,
    send(body?: unknown) {
      reply.payload = body;
      return reply;
    },
  };
  return reply;
}

const sampleRun = (ownerId: string, runId: string): StewardshipRunReport => ({
  runId,
  ownerId,
  dryRun: true,
  startedAt: '2026-08-01T10:00:00.000Z',
  finishedAt: '2026-08-01T10:00:05.000Z',
  durationMs: 5000,
  tasks: [],
  totalScanned: 3,
  totalChanged: 0,
  hadErrors: false,
});

describe('GovernanceController', () => {
  it('returns memory governance manifest', async () => {
    const controller = createGovernanceController(new InMemoryStewardshipRunStore());
    const reply = mockReply();
    await controller.getManifest({} as never, reply as never);
    expect(reply.payload).toEqual(getMemoryGovernanceManifest());
  });

  it('lists stewardship runs scoped to owner', async () => {
    const store = new InMemoryStewardshipRunStore();
    await store.save(sampleRun('owner-a', 'run-a'));
    await store.save(sampleRun('owner-b', 'run-b'));

    const controller = createGovernanceController(store);
    const reply = mockReply();
    await controller.listStewardshipRuns(
      { user: { ownerId: 'owner-a' }, query: {} } as never,
      reply as never,
    );

    const body = reply.payload as { runs: StewardshipRunReport[] };
    expect(body.runs).toHaveLength(1);
    expect(body.runs[0]?.runId).toBe('run-a');
  });

  it('returns run detail for matching owner', async () => {
    const store = new InMemoryStewardshipRunStore();
    await store.save(sampleRun('owner-a', 'run-a'));

    const controller = createGovernanceController(store);
    const reply = mockReply();
    await controller.getStewardshipRun(
      { user: { ownerId: 'owner-a' }, params: { runId: 'run-a' } } as never,
      reply as never,
    );

    const body = reply.payload as { run: StewardshipRunReport };
    expect(body.run.runId).toBe('run-a');
  });

  it('does not leak runs across owners', async () => {
    const store = new InMemoryStewardshipRunStore();
    await store.save(sampleRun('owner-a', 'run-a'));

    const controller = createGovernanceController(store);
    await expect(
      controller.getStewardshipRun(
        { user: { ownerId: 'owner-b' }, params: { runId: 'run-a' } } as never,
        mockReply() as never,
      ),
    ).rejects.toThrow('StewardshipRun');
  });
});
