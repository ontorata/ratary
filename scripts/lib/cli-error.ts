import { ZodError } from 'zod';

/** Safe CLI error text — avoids Node inspect crashes on ZodError / exotic causes. */
export function formatScriptError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues
      .map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`)
      .join('; ');
  }

  if (error instanceof Error) {
    const extra = error as Error & { cause?: unknown; code?: string };
    let message = `${extra.name}: ${extra.message}`;
    if (extra.code) {
      message += ` [${extra.code}]`;
    }
    if (extra.cause instanceof Error) {
      message += ` | cause: ${extra.cause.message}`;
    } else if (extra.cause !== undefined) {
      message += ` | cause: ${String(extra.cause)}`;
    }
    return message;
  }

  return String(error);
}
