import { describe, it, expect } from 'vitest';
import { ProjectCooccurrenceSource } from '../../src/inference/sources/project-cooccurrence-source.js';
import type { Memory } from '../../src/types/memory.js';

function memory(id: string, project: string): Memory {
  return {
    id,
    codename: `NOTE-${id}`,
    slug: `note-${id}`,
    title: `Memory ${id}`,
    project,
    projectId: project,
    content: 'content',
    summary: 'summary',
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'id',
    notes: '',
    tags: [],
    favorite: false,
    archived: false,
    ownerId: 'owner-1',
    level: 'note',
    lastAccessed: null,
    accessCount: 0,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  };
}

describe('ProjectCooccurrenceSource', () => {
  const source = new ProjectCooccurrenceSource();

  it('infers related edges for memories in the same project', () => {
    const candidates = source.infer({ ownerId: 'owner-1' }, [
      memory('m1', 'ai-brain'),
      memory('m2', 'ai-brain'),
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].relation).toBe('related');
    expect(candidates[0].inferenceSource).toBe('project');
  });
});
