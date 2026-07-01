import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeService } from '../../src/knowledge/knowledge.service.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let mockDb: MockD1Client;
  const ownerId = 'knowledge-owner';

  beforeEach(() => {
    mockDb = new MockD1Client();
    service = new KnowledgeService(new MemoryRepository(mockDb));
  });

  it('should enrich create input with codename slug summary keywords', async () => {
    const enriched = await service.enrichForCreate(ownerId, {
      title: 'Fastify Auth',
      project: 'ai-brain',
      content: '# Auth\n\nJWT middleware setup',
      tags: ['auth', 'jwt'],
      memoryType: 'architecture',
      category: 'Development',
    });

    expect(enriched.codename).toMatch(/^ARCH-\d{4}$/);
    expect(enriched.slug).toBe('fastify-auth');
    expect(enriched.summary.length).toBeGreaterThan(0);
    expect(enriched.keywords).toContain('auth');
    expect(enriched.memoryType).toBe('architecture');
  });
});
