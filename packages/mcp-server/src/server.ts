#!/usr/bin/env node
/**
 * Remote MCP server — thin proxy to REST API via @ratary/sdk.
 * Configure: AI_BRAIN_BASE_URL, AI_BRAIN_API_KEY, optional AI_BRAIN_WORKSPACE_ID
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AiBrainClient } from '@ratary/sdk';
import { createToolHandlers } from './tools.js';

const baseUrl = process.env.AI_BRAIN_BASE_URL ?? 'http://localhost:3000';
const apiKey = process.env.AI_BRAIN_API_KEY ?? process.env.API_KEY;

if (!apiKey) {
  console.error('AI_BRAIN_API_KEY is required');
  process.exit(1);
}

const client = new AiBrainClient({
  baseUrl,
  apiKey,
  workspaceId: process.env.AI_BRAIN_WORKSPACE_ID,
});

const handlers = createToolHandlers(client);

const server = new Server(
  { name: 'ai-brain-remote', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

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
