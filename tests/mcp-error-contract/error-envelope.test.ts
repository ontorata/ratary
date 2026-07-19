import { describe, expect, it } from 'vitest';
import {
  computeRetryable,
  toMcpToolErrorEnvelope,
  toMcpToolErrorResult,
} from '../../src/transport/mcp/mcp-error-envelope.js';
import {
  DatabaseError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../src/types/errors.js';

describe('MCP error envelope (PI-B)', () => {
  it('transient failure on a read tool is retryable', () => {
    const envelope = toMcpToolErrorEnvelope('search_memory', new DatabaseError('D1 timeout'));
    expect(envelope).toEqual({ error: 'D1 timeout', retryable: true });
  });

  it('transient failure on a write tool is never retryable', () => {
    const envelope = toMcpToolErrorEnvelope('save_memory', new DatabaseError('D1 timeout'));
    expect(envelope).toEqual({ error: 'D1 timeout', retryable: false });
  });

  it('deterministic 4xx failures are non-retryable even on read tools', () => {
    expect(toMcpToolErrorEnvelope('get_memory', new NotFoundError('Memory')).retryable).toBe(false);
    expect(
      toMcpToolErrorEnvelope('search_memory', new ValidationError('bad query')).retryable,
    ).toBe(false);
    expect(toMcpToolErrorEnvelope('get_context', new UnauthorizedError()).retryable).toBe(false);
  });

  it('generic Error maps to 500 and follows tool class', () => {
    expect(toMcpToolErrorEnvelope('list_projects', new Error('boom')).retryable).toBe(true);
    expect(toMcpToolErrorEnvelope('link_memories', new Error('boom')).retryable).toBe(false);
  });

  it('non-Error throw produces a safe generic message', () => {
    const envelope = toMcpToolErrorEnvelope('get_capabilities', 'string throw');
    expect(envelope.error).toBe('An unexpected error occurred');
    expect(envelope.retryable).toBe(true);
  });

  it('tool result wraps the envelope as parseable JSON text with isError', () => {
    const result = toMcpToolErrorResult('run_stewardship', new Error('stage 3 failed'));
    expect(result.isError).toBe(true);
    expect(JSON.parse(result.content[0].text)).toEqual({
      error: 'stage 3 failed',
      retryable: false,
    });
  });

  it('computeRetryable boundary: 499 deterministic, 500 transient', () => {
    expect(computeRetryable('search_memory', 499)).toBe(false);
    expect(computeRetryable('search_memory', 500)).toBe(true);
  });
});
