#!/usr/bin/env node
import { AiBrainClient } from '@ai-brain/sdk';
import { runCli } from './cli.js';

const baseUrl = process.env.AI_BRAIN_BASE_URL ?? 'http://localhost:3000';
const apiKey = process.env.AI_BRAIN_API_KEY ?? process.env.API_KEY;
const workspaceId = process.env.AI_BRAIN_WORKSPACE_ID;

if (!apiKey && process.argv[2] !== 'capabilities' && process.argv[2] !== 'ecosystem') {
  console.error('AI_BRAIN_API_KEY (or API_KEY) is required for authenticated commands.');
  process.exit(1);
}

const client = new AiBrainClient({
  baseUrl,
  apiKey,
  workspaceId,
  federation: process.env.AI_BRAIN_FEDERATION === 'true',
});

runCli(client, process.argv.slice(2)).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
