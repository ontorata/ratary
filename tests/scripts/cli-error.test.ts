import { describe, it, expect } from 'vitest';
import { ZodError, z } from 'zod';
import { formatScriptError } from '../../scripts/lib/cli-error.js';

describe('formatScriptError', () => {
  it('should format ZodError without throwing', () => {
    const schema = z.object({ summary: z.string().max(300) });
    let caught: unknown;
    try {
      schema.parse({ summary: 'x'.repeat(301) });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ZodError);
    const formatted = formatScriptError(caught);
    expect(formatted).toContain('summary');
    expect(formatted).toContain('300');
  });

  it('should format standard Error', () => {
    expect(formatScriptError(new Error('boom'))).toBe('Error: boom');
  });
});
