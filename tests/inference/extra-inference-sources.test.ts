import { describe, it, expect } from 'vitest';
import { SemanticSimilaritySource } from '../../src/inference/sources/semantic-similarity-source.js';
import { ConversationCooccurrenceSource } from '../../src/inference/sources/conversation-cooccurrence-source.js';
import { DependencySource } from '../../src/inference/sources/dependency-source.js';
import type { Memory } from '../../src/types/memory.js';

function memory(partial: Partial<Memory> & Pick<Memory, 'id' | 'title'>): Memory {
  const now = new Date().toISOString();
  return {
    id: partial.id,
    title: partial.title,
    project: partial.project ?? '',
    projectId: partial.projectId ?? '',
    content: partial.content ?? '',
    summary: partial.summary ?? '',
    tags: partial.tags ?? [],
    keywords: partial.keywords ?? [],
    favorite: partial.favorite ?? false,
    archived: partial.archived ?? false,
    ownerId: partial.ownerId ?? 'owner-1',
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    codename: partial.codename ?? null,
    slug: partial.slug ?? null,
    category: partial.category ?? '',
    memoryType: partial.memoryType ?? 'note',
    importance: partial.importance ?? 50,
    language: partial.language ?? 'en',
    notes: partial.notes ?? '',
    level: partial.level ?? 'note',
    lastAccessed: partial.lastAccessed ?? null,
    accessCount: partial.accessCount ?? 0,
    embeddingId: partial.embeddingId ?? null,
    objectKey: partial.objectKey ?? null,
    semanticHash: partial.semanticHash ?? null,
    workspaceId: partial.workspaceId ?? null,
    lastModifiedByAgentId: partial.lastModifiedByAgentId ?? null,
    lifecycleState: partial.lifecycleState ?? 'active',
  };
}

describe('Extra inference sources (Phase 8.7)', () => {
  const scope = { ownerId: 'owner-1' };

  it('semantic similarity links overlapping titles', () => {
    const source = new SemanticSimilaritySource();
    const candidates = source.infer(scope, [
      memory({ id: 'a', title: 'Hybrid retrieval merge policy' }),
      memory({ id: 'b', title: 'Hybrid retrieval ranking policy' }),
    ]);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]?.inferenceSource).toBe('semantic_similarity');
  });

  it('conversation source links same project within window', () => {
    const now = new Date().toISOString();
    const source = new ConversationCooccurrenceSource();
    const candidates = source.infer(scope, [
      memory({ id: 'a', title: 'A', project: 'phase-8', createdAt: now }),
      memory({ id: 'b', title: 'B', project: 'phase-8', createdAt: now }),
    ]);
    expect(candidates.length).toBe(1);
    expect(candidates[0]?.inferenceSource).toBe('conversation');
  });

  it('dependency source resolves depends:codename tags', () => {
    const source = new DependencySource();
    const candidates = source.infer(scope, [
      memory({ id: 'base', title: 'Base', codename: 'ADR-001' }),
      memory({ id: 'dep', title: 'Dependent', tags: ['depends:ADR-001'] }),
    ]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.relation).toBe('depends_on');
    expect(candidates[0]?.targetMemoryId).toBe('base');
  });
});
