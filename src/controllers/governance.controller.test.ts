import { describe, expect, it } from 'vitest';
import { createGovernanceController } from './governance.controller.js';
import { getMemoryGovernanceManifest } from '../memory/governance/index.js';
import { InMemoryStewardshipRunStore } from '../memory/stewardship/in-memory-stewardship-run-store.js';
import { InMemoryGovernanceExceptionStore } from '../memory/governance/in-memory-governance-exception-store.js';
import type { StewardshipRunReport } from '../memory/stewardship/imemory-stewardship-orchestrator.interface.js';

function mockReply() {
  const reply = {
    statusCode: 200,
    payload: undefined as unknown,
    status(code: number) {
      reply.statusCode = code;
      return reply;
    },
    send(body?: unknown) {
      reply.payload = body;
      return reply;
    },
  };
  return reply;
}

function createController() {
  return createGovernanceController({
    runStore: new InMemoryStewardshipRunStore(),
    exceptionStore: new InMemoryGovernanceExceptionStore(),
  });
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
    const controller = createController();
    const reply = mockReply();
    await controller.getManifest({} as never, reply as never);
    expect(reply.payload).toEqual(getMemoryGovernanceManifest());
  });

  it('lists stewardship runs scoped to owner', async () => {
    const runStore = new InMemoryStewardshipRunStore();
    await runStore.save(sampleRun('owner-a', 'run-a'));
    await runStore.save(sampleRun('owner-b', 'run-b'));

    const controller = createGovernanceController({
      runStore,
      exceptionStore: new InMemoryGovernanceExceptionStore(),
    });
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
    const runStore = new InMemoryStewardshipRunStore();
    await runStore.save(sampleRun('owner-a', 'run-a'));

    const controller = createGovernanceController({
      runStore,
      exceptionStore: new InMemoryGovernanceExceptionStore(),
    });
    const reply = mockReply();
    await controller.getStewardshipRun(
      { user: { ownerId: 'owner-a' }, params: { runId: 'run-a' } } as never,
      reply as never,
    );

    const body = reply.payload as { run: StewardshipRunReport };
    expect(body.run.runId).toBe('run-a');
  });

  it('does not leak runs across owners', async () => {
    const runStore = new InMemoryStewardshipRunStore();
    await runStore.save(sampleRun('owner-a', 'run-a'));

    const controller = createGovernanceController({
      runStore,
      exceptionStore: new InMemoryGovernanceExceptionStore(),
    });
    await expect(
      controller.getStewardshipRun(
        { user: { ownerId: 'owner-b' }, params: { runId: 'run-a' } } as never,
        mockReply() as never,
      ),
    ).rejects.toThrow('StewardshipRun');
  });

  it('creates pending governance exception request', async () => {
    const controller = createController();
    const reply = mockReply();
    await controller.createGovernanceExceptionRequest(
      {
        user: { ownerId: 'owner-a' },
        body: {
          exceptionClass: 'ops_maintenance',
          rationale: 'Documented maintenance window',
        },
      } as never,
      reply as never,
    );

    expect(reply.statusCode).toBe(201);
    const body = reply.payload as { exception: { status: string; ownerId: string } };
    expect(body.exception.status).toBe('pending');
    expect(body.exception.ownerId).toBe('owner-a');
  });

  it('lists exceptions scoped to owner', async () => {
    const exceptionStore = new InMemoryGovernanceExceptionStore();
    await exceptionStore.create({
      ownerId: 'owner-a',
      exceptionClass: 'decay_protection',
      rationale: 'A',
      requestedBy: 'owner-a',
    });
    await exceptionStore.create({
      ownerId: 'owner-b',
      exceptionClass: 'decay_protection',
      rationale: 'B',
      requestedBy: 'owner-b',
    });

    const controller = createGovernanceController({
      runStore: new InMemoryStewardshipRunStore(),
      exceptionStore,
    });
    const reply = mockReply();
    await controller.listGovernanceExceptions(
      { user: { ownerId: 'owner-a' }, query: {} } as never,
      reply as never,
    );

    const body = reply.payload as { exceptions: Array<{ ownerId: string }> };
    expect(body.exceptions).toHaveLength(1);
    expect(body.exceptions[0]?.ownerId).toBe('owner-a');
  });

  it('does not leak exceptions across owners', async () => {
    const exceptionStore = new InMemoryGovernanceExceptionStore();
    const created = await exceptionStore.create({
      ownerId: 'owner-a',
      exceptionClass: 'feature_flag_off',
      rationale: 'Flag review',
      requestedBy: 'owner-a',
    });

    const controller = createGovernanceController({
      runStore: new InMemoryStewardshipRunStore(),
      exceptionStore,
    });
    await expect(
      controller.getGovernanceException(
        { user: { ownerId: 'owner-b' }, params: { exceptionId: created.exceptionId } } as never,
        mockReply() as never,
      ),
    ).rejects.toThrow('GovernanceException');
  });
});
