/** Canonical MCP tool registry — single source for manifest and contract tests. */
export const MCP_TOOL_NAMES = [
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
  'get_capabilities',
] as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[number];
