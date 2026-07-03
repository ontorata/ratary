import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createTestMemoryRepository, createTestRelationRepository, asSqlDatabase } from '../helpers/sql-test-harness.js';
import {
  createMemoryService,
  createMemoryRelationService,
} from '../../src/services/create-memory-service.js';
import { createContextService } from '../../src/memory/create-context-service.js';
import { createGraphService } from '../../src/services/graph.service.js';
import { DefaultScopeResolver } from '../../src/scope/default-scope-resolver.js';
import { D1AgentIdentity } from '../../src/agent/d1-agent-identity.js';
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
  'list_workspaces',
  'list_agents',
  'register_agent',
] as const;

describe('MCP tools', () => {
  let mockDb: MockD1Client;
  let client: Client;

  beforeEach(async () => {
    resetD1Client();
    mockDb = new MockD1Client();
    setD1Client(mockDb);

    const sql = asSqlDatabase(mockDb);
    const repository = createTestMemoryRepository(mockDb);
    const relationRepository = createTestRelationRepository(mockDb);
    const memoryService = createMemoryService(sql, repository);
    const relationService = createMemoryRelationService(sql, repository, relationRepository);
    const contextService = createContextService(repository, { sql });
    const graphService = createGraphService(sql, repository);
    const scopeResolver = new DefaultScopeResolver(sql);
    const agentIdentity = new D1AgentIdentity(sql);
    const server = createMcpServer(
      memoryService,
      relationService,
      contextService,
      graphService,
      scopeResolver,
      agentIdentity,
      sql,
    );

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

  it('runs list_workspaces, register_agent, and list_agents', async () => {
    const listed = await client.callTool({ name: 'list_workspaces', arguments: {} });
    expect(listed.isError).not.toBe(true);
    const listedBody = JSON.parse((listed.content as [{ text: string }])[0].text) as {
      workspaces: Array<{ slug: string }>;
    };
    expect(listedBody.workspaces.some((w) => w.slug === 'default')).toBe(true);

    const registered = await client.callTool({
      name: 'register_agent',
      arguments: { name: 'MCP Test Agent', agent_type: 'mcp' },
    });
    expect(registered.isError).not.toBe(true);
    const agent = JSON.parse((registered.content as [{ text: string }])[0].text) as { id: string };

    const agents = await client.callTool({ name: 'list_agents', arguments: {} });
    expect(agents.isError).not.toBe(true);
    const agentsBody = JSON.parse((agents.content as [{ text: string }])[0].text) as {
      agents: Array<{ id: string }>;
    };
    expect(agentsBody.agents.some((a) => a.id === agent.id)).toBe(true);
  });
});
