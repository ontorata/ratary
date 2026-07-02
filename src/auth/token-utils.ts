import type { AuthContext } from './auth.types.js';

export function extractBearerToken(ctx: AuthContext): string | null {
  const authHeader = ctx.headers.authorization;
  const apiKeyHeader = ctx.headers['x-api-key'];

  if (typeof apiKeyHeader === 'string' && apiKeyHeader.length > 0) {
    return apiKeyHeader;
  }

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export function isJwtFormat(value: string): boolean {
  const parts = value.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}
