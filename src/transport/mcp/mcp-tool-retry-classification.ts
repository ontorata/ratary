import type { McpToolName } from '../../capabilities/mcp-tool-names.js';

/**
 * PI-B error contract — per-tool retryable classification.
 *
 * `retryable` is a CLIENT-BEHAVIOR HINT, not a reflection of current
 * implementation idempotency (owner decision B1): `true` only for idempotent
 * reads that are safe to blind-retry with short bounded backoff; `false` for
 * every mutation, where a silent success followed by a retry creates
 * duplicates or double-applies maintenance.
 *
 * `run_stewardship` is `false` (B1): one execution may consist of
 * partially-succeeded sub-stages, and automatic retry risks running
 * maintenance twice if the implementation changes later.
 *
 * The record is exhaustive over MCP_TOOL_NAMES — adding a tool without
 * classifying it is a compile error.
 */
export const MCP_TOOL_RETRYABLE = {
  // Writes / mutations — never blind-retry on ambiguous timeout.
  save_memory: false,
  update_memory: false,
  delete_memory: false,
  link_memories: false,
  toggle_favorite: false,
  archive_memory: false,
  register_agent: false,
  submit_signal: false,
  sync_push: false,
  run_stewardship: false,

  // Idempotent reads — safe to retry with short bounded backoff.
  // negotiate_capabilities is a pure computation (no persistence) — idempotent.
  negotiate_capabilities: true,
  get_memory: true,
  get_memory_by_codename: true,
  search_memory: true,
  get_memory_by_path: true,
  get_context: true,
  build_prompt: true,
  list_projects: true,
  list_tags: true,
  list_relations: true,
  get_graph_capabilities: true,
  traverse_relations: true,
  list_workspaces: true,
  list_agents: true,
  get_capabilities: true,
  get_compression_status: true,
  sync_pull: true,
  sync_status: true,
} as const satisfies Record<McpToolName, boolean>;

export function isRetryableTool(name: McpToolName): boolean {
  return MCP_TOOL_RETRYABLE[name];
}
