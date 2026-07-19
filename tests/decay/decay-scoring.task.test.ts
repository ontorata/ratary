import { describe, expect, it } from 'vitest';
import { DecayScoringTask } from '../../src/memory/stewardship/index.js';
import { DEFAULT_DECAY_WEIGHTS } from '../../src/memory/decay/index.js';
import type { Memory } from '../../src/types/memory.js';
import type { MaintenanceContext } from '../../src/memory/stewardship/index.js';

const NOW = new Date('2026-07-19T00:00:00.000Z');
const OWNER = 'owner-1';

function memory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: 'mem-1',
    title: 'a memory',
    project: 'ratary',
    content: '',
    summary: '',
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'en',
    notes: '',
    tags: [],
    codename: 'NOTE-0001',
    slug: 'a-memory',
    favorite: false,
    archived: false,
    ownerId: OWNER,
    projectId: 'ratary',
    level: 'note',
    lastAccessed: null,
    accessCount: 0,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    lifecycleState: null,
    aliases: [],
    sourcePath: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  } as Memory;
}

interface AppliedResult {
  id: string;
  score: number;
  signalsJson: string;
  computedAt: string;
  lifecycleState: string;
}

function makeTask(memories: Memory[], enabled: boolean, degrees = new Map<string, number>()) {
  const applied: AppliedResult[] = [];
  const reader = {
    findAllByOwner: async () => memories,
  };
  const writer = {
    applyDecayResult: async (
      id: string,
      _ownerId: string,
      data: { score: number; signalsJson: string; computedAt: string; lifecycleState: string },
    ) => {
      applied.push({ id, ...data });
    },
  };
  const relations = {
    countDegreeByOwner: async () => degrees,
  };
  const task = new DecayScoringTask(
    reader as never,
    writer,
    relations,
    {
      enabled,
      halfLifeDays: 30,
      archiveFloor: 0.05,
      retentionDays: 90,
      weights: DEFAULT_DECAY_WEIGHTS,
    },
  );
  return { task, applied };
}

function ctx(dryRun: boolean): MaintenanceContext {
  return { scope: { ownerId: OWNER }, dryRun, now: NOW } as MaintenanceContext;
}

describe('DecayScoringTask (stage #10)', () => {
  it('is skipped when DECAY_SCORING_ENABLED=false (freeze default)', async () => {
    const { task, applied } = makeTask([memory()], false);
    const result = await task.run(ctx(false));
    expect(result.status).toBe('skipped');
    expect(result.changed).toBe(0);
    expect(applied).toHaveLength(0);
    expect(result.findings[0]).toContain('DECAY_SCORING_ENABLED=false');
  });

  it('dry-run scans but never mutates', async () => {
    const { task, applied } = makeTask([memory()], true);
    const result = await task.run(ctx(true));
    expect(result.status).toBe('ok');
    expect(result.scanned).toBe(1);
    expect(result.changed).toBe(0);
    expect(applied).toHaveLength(0);
  });

  it('apply mode persists score, signals, and lifecycle state', async () => {
    const { task, applied } = makeTask([memory()], true);
    const result = await task.run(ctx(false));
    expect(result.changed).toBe(1);
    expect(applied).toHaveLength(1);
    expect(applied[0].id).toBe('mem-1');
    expect(applied[0].score).toBeGreaterThan(0);
    expect(applied[0].computedAt).toBe(NOW.toISOString());
    expect(JSON.parse(applied[0].signalsJson)).toHaveProperty('relevance');
  });

  it('archives an old unprotected orphan but never a protected memory', async () => {
    const oldOrphan = memory({
      id: 'orphan',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      importance: 10,
    });
    const protectedOld = memory({
      id: 'protected',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      importance: 10,
      favorite: true,
    });
    const { task, applied } = makeTask([oldOrphan, protectedOld], true);
    await task.run(ctx(false));

    const byId = new Map(applied.map((a) => [a.id, a]));
    expect(byId.get('orphan')?.lifecycleState).toBe('archived');
    expect(byId.get('protected')?.lifecycleState).toBe('active');
    expect(byId.get('protected')?.score).toBe(1);
  });

  it('does not archive an old memory that still has relations', async () => {
    const oldHub = memory({
      id: 'hub',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      importance: 10,
    });
    const { task, applied } = makeTask([oldHub], true, new Map([['hub', 3]]));
    await task.run(ctx(false));
    expect(applied[0].lifecycleState).not.toBe('archived');
  });

  it('skips already-archived memories', async () => {
    const { task, applied } = makeTask([memory({ archived: true })], true);
    const result = await task.run(ctx(false));
    expect(result.scanned).toBe(0);
    expect(applied).toHaveLength(0);
  });

  it('reports intended transitions in dry-run findings', async () => {
    const oldOrphan = memory({
      id: 'orphan',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      importance: 10,
    });
    const { task } = makeTask([oldOrphan], true);
    const result = await task.run(ctx(true));
    const transitions = result.findings.find((f) => f.startsWith('transitions'));
    expect(transitions).toContain('(intended)');
    expect(transitions).toContain('active->archived:1');
  });
});
