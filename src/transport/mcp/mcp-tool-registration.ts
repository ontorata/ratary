import type { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodRawShapeCompat } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import type { McpToolName } from '../../capabilities/mcp-tool-names.js';
import { toMcpToolErrorResult } from './mcp-error-envelope.js';

/**
 * PI-B error contract — registers a tool with its handler wrapped so any
 * throw becomes a structured `{error, retryable}` tool result instead of the
 * SDK's raw `error.message` text. Success paths pass through untouched.
 *
 * Taking `name` as McpToolName also enforces at compile time that every
 * registered tool exists in the canonical MCP_TOOL_NAMES list (and therefore
 * has a retryable classification).
 */
export function registerContractTool<Args extends ZodRawShapeCompat>(
  server: McpServer,
  name: McpToolName,
  description: string,
  shape: Args,
  handler: ToolCallback<Args>,
): void {
  const wrapped = (async (args: unknown, extra: unknown) => {
    try {
      return await (handler as (a: unknown, e: unknown) => Promise<unknown>)(args, extra);
    } catch (error) {
      return toMcpToolErrorResult(name, error);
    }
  }) as ToolCallback<Args>;

  server.tool(name, description, shape, wrapped);
}

/**
 * Pre-handler failures (unknown tool, disabled tool, zod argument validation)
 * are caught inside the SDK before our wrapper runs and routed through the
 * server's `createToolError(message)`. This override makes those failures
 * speak the same envelope. They are all deterministic — retrying identical
 * input cannot succeed — so `retryable` is always `false` here.
 *
 * `createToolError` is a regular (TS-private) method on the SDK's McpServer;
 * a fitness test in tests/mcp-error-contract pins this seam so an SDK upgrade
 * that removes or bypasses it fails loudly instead of silently reverting to
 * raw-text errors.
 */
export function applyPreHandlerErrorContract(server: McpServer): void {
  const seam = server as unknown as {
    createToolError: (message: string) => unknown;
  };
  seam.createToolError = (message: string) => ({
    content: [{ type: 'text', text: JSON.stringify({ error: message, retryable: false }) }],
    isError: true,
  });
}
