import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextService } from '../../src/memory/context.service.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository } from '../helpers/sql-test-harness.js';
import type { IMemoryAccessAuditor } from '../../src/ports/audit/imemory-access-auditor.port.js';

describe('ContextService', () => {
  let service: ContextService;
  let repository: MemoryRepository;
  const ownerId = 'owner-context';

  beforeEach(() => {
    const mockDb = new MockD1Client();
    repository = createTestMemoryRepository(mockDb);
    service = new ContextService(repository);
  });

  async function seed(title: string, content: string): Promise<void> {
    await repository.insert({
      title,
      project: 'mangroveapps',
      content,
      summary: `${title} summary`,
      tags: ['hydration'],
      keywords: ['hydration'],
      category: '',
      memoryType: 'note',
      importance: 80,
      language: 'id',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      favorite: false,
      ownerId,
    });
  }

  it('should build context and record access', async () => {
    await seed('Hydration handoff', 'Fix hydration bug in chat component');

    const result = await service.buildContext(
      { ownerId },
      { query: 'hydration', projectId: 'mangroveapps', limit: 5 },
    );

    expect(result.context).toContain('Hydration handoff');
    expect(result.memories.length).toBeGreaterThan(0);

    const updated = await repository.findById(result.memories[0].id, ownerId);
    expect(updated?.accessCount).toBe(1);
    expect(updated?.lastAccessed).toBeTruthy();
  });

  it('should build full prompt', async () => {
    await seed('Architecture note', 'Document engine overview');

    const result = await service.buildPrompt(
      { ownerId },
      { task: 'Summarize architecture', query: 'architecture', limit: 3 },
    );

    expect(result.system).toBeTruthy();
    expect(result.user).toContain('Summarize architecture');
    expect(result.context).toContain('Architecture note');
  });

  it('should hydrate full body when includeSummaryOnly is false', async () => {
    const bodyMarker = 'FULL_BODY_HYDRATION_MARKER';
    await repository.insert({
      title: 'Hydration body test',
      project: 'mangroveapps',
      content: 'x'.repeat(400) + bodyMarker,
      summary: 'short summary only',
      tags: ['hydration'],
      keywords: ['hydration'],
      category: '',
      memoryType: 'note',
      importance: 80,
      language: 'id',
      notes: '',
      codename: `NOTE-${Math.random().toString(16).slice(2, 6)}`,
      slug: 'hydration-body-test',
      favorite: false,
      ownerId,
    });

    const lean = await service.buildContext(
      { ownerId },
      { query: 'Hydration body', limit: 5, context: { includeSummaryOnly: true } },
    );
    expect(lean.context).not.toContain(bodyMarker);

    const rich = await service.buildContext(
      { ownerId },
      { query: 'Hydration body', limit: 5, context: { includeSummaryOnly: false } },
    );
    expect(rich.context).toContain(bodyMarker);
  });

  it('should emit memory access audit entries when auditor is wired', async () => {
    await seed('Audit target', 'Content for audit trail');

    const recordAccess = vi.fn().mockResolvedValue(undefined);
    const auditor: IMemoryAccessAuditor = { recordAccess };
    const auditedService = new ContextService(repository, undefined, auditor);

    await auditedService.buildContext({ ownerId }, { query: 'audit', limit: 5 });

    expect(recordAccess).toHaveBeenCalled();
    expect(recordAccess.mock.calls[0][0]).toMatchObject({
      ownerId,
      source: 'context.build',
    });
  });
});
