import { describe, it, expect, beforeEach } from 'vitest';
import { RelationInferenceOrchestrator } from '../../src/inference/relation-inference-orchestrator.js';
import { DefaultRelationScoringPolicy } from '../../src/inference/default-relation-scoring-policy.js';
import { ProjectCooccurrenceSource } from '../../src/inference/sources/project-cooccurrence-source.js';
import type { IMemoryReader } from '../../src/repositories/memory.repository.interface.js';
import type { IMemoryRelationRepository } from '../../src/repositories/memory-relation.repository.interface.js';
import type { Memory } from '../../src/types/memory.js';

describe('RelationInferenceOrchestrator', () => {
  let upsertCalls: number;

  const memories: Memory[] = [
    {
      id: '00000000-0000-4000-8000-000000000001',
      codename: 'NOTE-0001',
      slug: 'one',
      title: 'One',
      project: 'p',
      projectId: 'p',
      content: 'c',
      summary: 's',
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      tags: ['tag-a'],
      favorite: false,
      archived: false,
      ownerId: 'owner-1',
      level: 'note',
      lastAccessed: null,
      accessCount: 0,
      embeddingId: null,
      objectKey: null,
      semanticHash: null,
      createdAt: '2026-07-04T00:00:00.000Z',
      updatedAt: '2026-07-04T00:00:00.000Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      codename: 'NOTE-0002',
      slug: 'two',
      title: 'Two',
      project: 'p',
      projectId: 'p',
      content: 'c',
      summary: 's',
      keywords: [],
      category: '',
      memoryType: 'note',
      importance: 50,
      language: 'id',
      notes: '',
      tags: ['tag-a'],
      favorite: false,
      archived: false,
      ownerId: 'owner-1',
      level: 'note',
      lastAccessed: null,
      accessCount: 0,
      embeddingId: null,
      objectKey: null,
      semanticHash: null,
      createdAt: '2026-07-04T01:00:00.000Z',
      updatedAt: '2026-07-04T01:00:00.000Z',
    },
  ];

  const memoryReader: IMemoryReader = {
    findAllByOwner: async () => memories,
  } as IMemoryReader;

  const relationRepository: IMemoryRelationRepository = {
    upsertInferred: async () => {
      upsertCalls++;
      return 'created';
    },
  } as IMemoryRelationRepository;

  beforeEach(() => {
    upsertCalls = 0;
  });

  it('dry-run finds candidates without upserting', async () => {
    const orchestrator = new RelationInferenceOrchestrator({
      memoryReader,
      relationRepository,
      scoringPolicy: new DefaultRelationScoringPolicy(),
      sources: [new ProjectCooccurrenceSource()],
    });

    const report = await orchestrator.run({ ownerId: 'owner-1' }, { dryRun: true });
    expect(report.candidatesFound).toBeGreaterThan(0);
    expect(upsertCalls).toBe(0);
  });

  it('execute upserts inferred relations', async () => {
    const orchestrator = new RelationInferenceOrchestrator({
      memoryReader,
      relationRepository,
      scoringPolicy: new DefaultRelationScoringPolicy(),
      sources: [new ProjectCooccurrenceSource()],
    });

    const report = await orchestrator.run({ ownerId: 'owner-1' }, { dryRun: false });
    expect(report.relationsCreated).toBeGreaterThan(0);
    expect(upsertCalls).toBeGreaterThan(0);
  });
});
