import { describe, it, expect } from 'vitest';
import { ContextBuilder } from '../../src/memory/context-builder.js';
import type { ScoredMemory } from '../../src/memory/ranker.js';
import type { Memory } from '../../src/types/memory.js';

const baseMemory = (overrides: Partial<Memory> = {}): Memory => ({
  id: '00000000-0000-4000-8000-000000000001',
  codename: 'NOTE-0001',
  slug: 'note',
  title: 'Test Memory',
  project: 'ai-brain',
  content: 'A'.repeat(500),
  summary: 'Short summary',
  keywords: [],
  category: '',
  memoryType: 'note',
  importance: 80,
  language: 'id',
  notes: '',
  tags: [],
  favorite: false,
  archived: false,
  ownerId: 'owner',
  projectId: 'ai-brain',
  level: 'note',
  lastAccessed: null,
  accessCount: 0,
  embeddingId: null,
  objectKey: null,
  semanticHash: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  ...overrides,
});

const scored = (memory: Memory, score = 50): ScoredMemory => ({
  ...memory,
  relevanceScore: score,
});

describe('ContextBuilder', () => {
  const builder = new ContextBuilder();

  it('should include codename and respect char budget', () => {
    const memories = [
      scored(baseMemory({ codename: 'NOTE-0042', title: 'Handoff' })),
      scored(baseMemory({ id: '00000000-0000-4000-8000-000000000002', codename: 'NOTE-0043' })),
    ];

    const context = builder.build(memories, { maxChars: 200 });
    expect(context).toContain('[NOTE-0042]');
    expect(context.length).toBeLessThanOrEqual(200);
  });

  it('should build xml format', () => {
    const context = builder.build([scored(baseMemory())], { format: 'xml', maxChars: 1000 });
    expect(context).toContain('<memory_context>');
    expect(context).toContain('codename="NOTE-0001"');
  });
});
