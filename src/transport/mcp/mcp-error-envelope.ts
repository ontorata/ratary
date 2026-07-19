import { toTransportError } from '../shared/transport-errors.js';
import type { McpToolName } from '../../capabilities/mcp-tool-names.js';
import { isRetryableTool } from './mcp-tool-retry-classification.js';

/**
 * PI-B MCP error contract — the wire shape clients parse from tool errors.
 * The envelope is intentionally minimal: `retryable` encodes the client
 * guidance (bounded-backoff retry for reads; never blind-retry writes).
 */
export interface McpToolErrorEnvelope {
  error: string;
  retryable: boolean;
}

/** Tool result shape as accepted by the MCP SDK for error outcomes. */
export interface McpToolErrorResult {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
  [key: string]: unknown;
}

/**
 * Deterministic failures (4xx: validation, not-found, auth, conflict, quota)
 * are never retryable regardless of tool class — retrying identical bad input
 * cannot succeed. Only transient/unknown failures (5xx) on idempotent read
 * tools are safe to blind-retry.
 */
export function computeRetryable(toolName: McpToolName, statusCode: number): boolean {
  if (statusCode >= 400 && statusCode < 500) return false;
  return isRetryableTool(toolName);
}

export function toMcpToolErrorEnvelope(toolName: McpToolName, error: unknown): McpToolErrorEnvelope {
  const payload = toTransportError(error);
  return {
    error: payload.message,
    retryable: computeRetryable(toolName, payload.statusCode),
  };
}

/** Converts any tool-handler failure into a structured `{error, retryable}` result. */
export function toMcpToolErrorResult(toolName: McpToolName, error: unknown): McpToolErrorResult {
  const envelope = toMcpToolErrorEnvelope(toolName, error);
  return {
    content: [{ type: 'text', text: JSON.stringify(envelope) }],
    isError: true,
  };
}
