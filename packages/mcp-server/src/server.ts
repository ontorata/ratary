#!/usr/bin/env node
/**
 * Remote MCP server — thin proxy to REST API via @ratary/sdk.
 * Configure: RATARY_BASE_URL, RATARY_API_KEY, optional RATARY_WORKSPACE_ID
 * (legacy AI_BRAIN_* env names still accepted)
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { AiBrainClient } from '@ratary/sdk';
import { createToolHandlers } from './tools.js';
import { resolveRataryClientConfig } from './env.js';

const { baseUrl, apiKey, workspaceId } = resolveRataryClientConfig();

if (!apiKey) {
  console.error('RATARY_API_KEY is required (legacy: AI_BRAIN_API_KEY or API_KEY)');
  process.exit(1);
}

const client = new AiBrainClient({
  baseUrl,
  apiKey,
  workspaceId,
});

const handlers = createToolHandlers(client);

const server = new Server({ name: 'ratary', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: handlers.definitions,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const result = await handlers.call(request.params.name, request.params.arguments ?? {});
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
