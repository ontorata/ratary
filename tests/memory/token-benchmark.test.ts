import { describe, it, expect } from 'vitest';
import { estimateTokens, reductionPercent } from '../../src/memory/token-estimate.js';
import { ContextBuilder } from '../../src/memory/context-builder.js';
import { generateSummary } from '../../src/knowledge/summary.generator.js';
import type { ScoredMemory } from '../../src/memory/ranker.js';
import type { Memory } from '../../src/types/memory.js';

function scoredMemory(content: string, index: number): ScoredMemory {
  const memory: Memory = {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    codename: `NOTE-${String(index).padStart(4, '0')}`,
    slug: `note-${index}`,
    title: `Note ${index}`,
    project: 'ai-brain',
    content,
    summary: generateSummary(content),
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 80,
    language: 'en',
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
  };
  return { ...memory, relevanceScore: 100 - index };
}

describe('context token benchmark', () => {
  it('summary-only should cut tokens by at least 85% vs naive dump', () => {
    const content =
      '# Auth\nJWT middleware and scope rules.\n' +
      'Detail line with jwt scope ownerId.\n'.repeat(120);
    const memories = Array.from({ length: 20 }, (_, i) => scoredMemory(content, i + 1));
    const naive = memories.map((m) => `${m.title}\n${m.content}`).join('\n\n');
    const context = new ContextBuilder().build(memories, { includeSummaryOnly: true });

    const saved = reductionPercent(estimateTokens(naive), estimateTokens(context));
    expect(saved).toBeGreaterThanOrEqual(85);
  });

  it('codename index should reach at least 90% savings on large fixtures', () => {
    const content = 'word '.repeat(400);
    const memories = Array.from({ length: 20 }, (_, i) => scoredMemory(content, i + 1));
    const naive = memories.map((m) => `${m.title}\n${m.content}`).join('\n\n');
    const index = memories.map((m) => `- ${m.codename}: ${m.title}`).join('\n');

    const saved = reductionPercent(estimateTokens(naive), estimateTokens(index));
    expect(saved).toBeGreaterThanOrEqual(90);
  });
});
