#!/usr/bin/env node
import { AiBrainClient } from '@ratary/sdk';
import { runCli } from './cli.js';

function env(primary: string, legacy?: string): string | undefined {
  const value = process.env[primary]?.trim();
  if (value) return value;
  if (legacy) return process.env[legacy]?.trim() || undefined;
  return undefined;
}

const baseUrl = env('RATARY_BASE_URL', 'AI_BRAIN_BASE_URL') ?? 'http://localhost:9876';
const apiKey = env('RATARY_API_KEY', 'AI_BRAIN_API_KEY') ?? process.env.API_KEY?.trim();
const workspaceId = env('RATARY_WORKSPACE_ID', 'AI_BRAIN_WORKSPACE_ID');
const federationEnabled =
  env('RATARY_FEDERATION', 'AI_BRAIN_FEDERATION') === 'true' ||
  process.env.RATARY_FEDERATION === 'true' ||
  process.env.AI_BRAIN_FEDERATION === 'true';

if (!apiKey && process.argv[2] !== 'capabilities' && process.argv[2] !== 'ecosystem') {
  console.error('RATARY_API_KEY is required (legacy: AI_BRAIN_API_KEY or API_KEY).');
  process.exit(1);
}

const client = new AiBrainClient({
  baseUrl,
  apiKey,
  workspaceId,
  federation: federationEnabled,
});

runCli(client, process.argv.slice(2)).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
