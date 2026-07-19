import { describe, expect, it } from 'vitest';
import { MCP_TOOL_NAMES } from '../../src/capabilities/mcp-tool-names.js';
import {
  MCP_TOOL_RETRYABLE,
  isRetryableTool,
} from '../../src/transport/mcp/mcp-tool-retry-classification.js';

describe('MCP tool retryable classification (PI-B)', () => {
  it('classifies every canonical tool — no gaps, no strays', () => {
    const classified = Object.keys(MCP_TOOL_RETRYABLE).sort();
    expect(classified).toEqual([...MCP_TOOL_NAMES].sort());
  });

  it('locks run_stewardship as retryable:false (owner decision B1)', () => {
    expect(isRetryableTool('run_stewardship')).toBe(false);
  });

  it('never marks a mutating tool retryable', () => {
    const mutations = [
      'save_memory',
      'update_memory',
      'delete_memory',
      'link_memories',
      'toggle_favorite',
      'archive_memory',
      'register_agent',
      'submit_signal',
      'sync_push',
      'run_stewardship',
    ] as const;
    for (const tool of mutations) {
      expect(isRetryableTool(tool), tool).toBe(false);
    }
  });

  it('marks idempotent reads retryable', () => {
    const reads = [
      'search_memory',
      'get_memory',
      'get_memory_by_codename',
      'get_memory_by_path',
      'get_context',
      'list_projects',
      'traverse_relations',
      'sync_status',
      'get_capabilities',
    ] as const;
    for (const tool of reads) {
      expect(isRetryableTool(tool), tool).toBe(true);
    }
  });
});
