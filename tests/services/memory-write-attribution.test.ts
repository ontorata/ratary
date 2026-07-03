import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { KnowledgeService } from '../../src/knowledge/knowledge.service.js';
import { SearchService } from '../../src/search/search.service.js';
import { MemoryService } from '../../src/services/memory.service.js';
import { D1AgentIdentity } from '../../src/agent/d1-agent-identity.js';
import { AcceptSyncManager } from '../../src/sync/accept-sync-manager.js';
import { AuditRepository } from '../../src/auth/audit.repository.js';
import type { ISyncManager } from '../../src/sync/isync-manager.interface.js';
import { MockD1Client } from '../helpers/mock-d1.js';

describe('MemoryService write attribution and sync', () => {
  let mockDb: MockD1Client;
  let service: MemoryService;
  let syncManager: ISyncManager;

  beforeEach(async () => {
    mockDb = new MockD1Client();
    await mockDb.execute(
      `INSERT INTO workspaces (id, owner_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['ws-1', 'owner-a', 'Default', 'default', '2026-07-03T00:00:00.000Z'],
    );
    await mockDb.execute(
      `INSERT INTO agents (id, workspace_id, owner_id, name, client_id, agent_type, metadata, created_at, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        'agent-1',
        'ws-1',
        'owner-a',
        'Cursor',
        null,
        'mcp',
        '{}',
        '2026-07-03T00:00:00.000Z',
      ],
    );

    const repository = new MemoryRepository(mockDb);
    const knowledge = new KnowledgeService(repository);
    const search = new SearchService(repository);
    syncManager = new AcceptSyncManager(mockDb, new AuditRepository(mockDb));
    const agentIdentity = new D1AgentIdentity(mockDb);
    service = new MemoryService(repository, knowledge, search, undefined, syncManager, agentIdentity);
  });

  it('should persist last_modified_by_agent_id on create when agent resolves', async () => {
    const memory = await service.createMemory(
      { ownerId: 'owner-a', workspaceId: 'ws-1', agentId: 'agent-1' },
      {
        title: 'Attributed memory',
        content: 'body',
        project: 'p',
        summary: '',
        tags: [],
        favorite: false,
      },
    );

    expect(mockDb.getMemory(memory.id)?.last_modified_by_agent_id).toBe('agent-1');
  });

  it('should call sync manager on update and delete', async () => {
    const reconcile = vi.spyOn(syncManager, 'reconcileWrite');
    const created = await service.createMemory(
      { ownerId: 'owner-a', workspaceId: 'ws-1' },
      {
        title: 'Sync test',
        content: 'body',
        project: 'p',
        summary: '',
        tags: [],
        favorite: false,
      },
    );

    reconcile.mockClear();

    await service.updateMemory(
      { ownerId: 'owner-a', workspaceId: 'ws-1', agentId: 'agent-1' },
      created.id,
      { title: 'Updated' },
    );
    expect(reconcile).toHaveBeenCalledWith(
      expect.objectContaining({ memoryId: created.id, operation: 'update' }),
    );
    expect(mockDb.getMemory(created.id)?.last_modified_by_agent_id).toBe('agent-1');

    reconcile.mockClear();
    await service.deleteMemory({ ownerId: 'owner-a', workspaceId: 'ws-1' }, created.id);
    expect(reconcile).toHaveBeenCalledWith(
      expect.objectContaining({ memoryId: created.id, operation: 'delete' }),
    );
  });
});
