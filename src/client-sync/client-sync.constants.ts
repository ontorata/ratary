import type { ClientPlatformProfile } from './client-sync.types.js';

/** Known AI client platforms for multi-client sync (ADR-042). */
export const KNOWN_CLIENT_PLATFORMS: ClientPlatformProfile[] = [
  { id: 'cursor', displayName: 'Cursor', supportsIncrementalPull: true },
  { id: 'claude', displayName: 'Claude', supportsIncrementalPull: true },
  { id: 'chatgpt', displayName: 'ChatGPT', supportsIncrementalPull: true },
  { id: 'gemini', displayName: 'Gemini', supportsIncrementalPull: true },
  { id: 'codex', displayName: 'Codex', supportsIncrementalPull: true },
  { id: 'qwen', displayName: 'Qwen', supportsIncrementalPull: true },
  { id: 'openhands', displayName: 'OpenHands', supportsIncrementalPull: true },
  { id: 'continue', displayName: 'Continue', supportsIncrementalPull: true },
  { id: 'mcp', displayName: 'MCP Server', supportsIncrementalPull: true },
];

export const DEFAULT_SYNC_PULL_LIMIT = 100;
