import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../../src/services/create-memory-service.js';
import { MemoryRelationRepository } from '../../src/repositories/memory-relation.repository.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { createContextService } from '../../src/memory/create-context-service.js';
import { createGraphService } from '../../src/services/graph.service.js';
import { createMcpServer } from '../../src/mcp/server.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');

const EXPECTED_TOOLS = [
  'save_memory',
  'update_memory',
  'delete_memory',
  'get_memory',
  'get_memory_by_codename',
  'search_memory',
  'get_context',
  'build_prompt',
  'list_projects',
  'list_tags',
  'link_memories',
  'list_relations',
  'toggle_favorite',
  'archive_memory',
  'get_graph_capabilities',
  'traverse_relations',
] as const;

describe('MCP tools', () => {
  let mockDb: MockD1Client;
  let client: Client;

  beforeEach(async () => {
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    const repository = new MemoryRepository(mockDb);
    const relationRepository = new MemoryRelationRepository(mockDb);
    const memoryService = createMemoryService(mockDb, repository);
    const relationService = createMemoryRelationService(mockDb, repository, relationRepository);
    const contextService = createContextService(repository);
    const graphService = createGraphService(mockDb, repository);
    const server = createMcpServer(memoryService, relationService, contextService, graphService);

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);

    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    resetD1Client();
  });

  it('registers all expected tools', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name).sort();
    expect(names).toEqual([...EXPECTED_TOOLS].sort());
  });

  it('runs save → get → search → delete flow', async () => {
    const saved = await client.callTool({
      name: 'save_memory',
      arguments: {
        title: 'MCP Test',
        content: 'MCP integration content',
        project: 'phase3',
        tags: ['mcp'],
      },
    });
    expect(saved.isError).not.toBe(true);
    const savedBody = JSON.parse((saved.content as [{ text: string }])[0].text) as {
      id: string;
      codename: string;
    };
    expect(savedBody.id).toBeDefined();
    expect(savedBody.codename).toBeDefined();

    const got = await client.callTool({
      name: 'get_memory',
      arguments: { id: savedBody.id },
    });
    expect(got.isError).not.toBe(true);

    const byCodename = await client.callTool({
      name: 'get_memory_by_codename',
      arguments: { codename: savedBody.codename },
    });
    expect(byCodename.isError).not.toBe(true);

    const search = await client.callTool({
      name: 'search_memory',
      arguments: { q: 'MCP', limit: 5 },
    });
    expect(search.isError).not.toBe(true);

    const projects = await client.callTool({ name: 'list_projects', arguments: {} });
    const tags = await client.callTool({ name: 'list_tags', arguments: {} });
    expect(projects.isError).not.toBe(true);
    expect(tags.isError).not.toBe(true);

    const favorited = await client.callTool({
      name: 'toggle_favorite',
      arguments: { id: savedBody.id },
    });
    expect(favorited.isError).not.toBe(true);

    const archived = await client.callTool({
      name: 'archive_memory',
      arguments: { id: savedBody.id },
    });
    expect(archived.isError).not.toBe(true);

    const deleted = await client.callTool({
      name: 'delete_memory',
      arguments: { id: savedBody.id },
    });
    expect(deleted.isError).not.toBe(true);
  });

  it('runs get_context and build_prompt', async () => {
    await client.callTool({
      name: 'save_memory',
      arguments: {
        title: 'Context MCP test',
        content: 'Memory intelligence context body',
        project: 'ai-brain',
        tags: ['context'],
      },
    });

    const context = await client.callTool({
      name: 'get_context',
      arguments: { query: 'intelligence', limit: 5 },
    });
    expect(context.isError).not.toBe(true);
    const contextBody = JSON.parse((context.content as [{ text: string }])[0].text) as {
      context: string;
    };
    expect(contextBody.context).toContain('Relevant Memory Context');

    const prompt = await client.callTool({
      name: 'build_prompt',
      arguments: { task: 'Summarize context', query: 'intelligence' },
    });
    expect(prompt.isError).not.toBe(true);
    const promptBody = JSON.parse((prompt.content as [{ text: string }])[0].text) as {
      system: string;
      user: string;
    };
    expect(promptBody.system).toBeTruthy();
    expect(promptBody.user).toContain('Summarize context');
  });
});
