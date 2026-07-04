import type { ErrorCodeDescriptor, RateLimitDescriptor } from './capability-manifest.types.js';

export const PROTOCOL_VERSION = '1.0.0';

/** Approximate token ceiling for context assembly (chars / 4 heuristic). */
export const MANIFEST_MAX_CONTEXT_TOKENS = 6_000;

/** Advisory inline content limit for manifest consumers. */
export const MANIFEST_MAX_MEMORY_CONTENT_BYTES = 1_048_576;

export const MANIFEST_MAX_RESULTS_PER_SEARCH = 100;

export const MANIFEST_MAX_RELATIONS_PER_MEMORY = 100;

export const STANDARD_ERROR_CODES: ErrorCodeDescriptor[] = [
  {
    code: 'VALIDATION_ERROR',
    httpStatus: 400,
    when: 'Zod/body validation failed (e.g. summary >300 chars)',
  },
  {
    code: 'UNAUTHORIZED',
    httpStatus: 401,
    when: 'Missing or invalid API key / JWT',
  },
  {
    code: 'FORBIDDEN',
    httpStatus: 403,
    when: 'Valid auth but insufficient permission or revoked identity',
  },
  {
    code: 'NOT_FOUND',
    httpStatus: 404,
    when: 'Memory/relation/workspace not found or cross-owner scope',
  },
  {
    code: 'SYNC_CONFLICT',
    httpStatus: 409,
    when: 'Multi-client sync rejected stale write (ADR-042)',
  },
  {
    code: 'DATABASE_ERROR',
    httpStatus: 500,
    when: 'D1/Postgres persistence failure',
  },
  {
    code: 'INTERNAL_ERROR',
    httpStatus: 500,
    when: 'Unhandled server error',
  },
];

export const STANDARD_RATE_LIMITS: RateLimitDescriptor[] = [
  {
    capabilityGroup: 'Auth bootstrap / identities',
    limit: '5/h bootstrap; 20/min create; 10/min rotate',
    scope: 'Per client IP',
    notes: 'REST @fastify/rate-limit; Redis when RATE_LIMIT_REDIS_URL set',
  },
  {
    capabilityGroup: 'Memory CRUD / search / context',
    limit: '100 req/min (design advisory)',
    scope: 'Per owner',
    notes: 'Not hard-limited on MCP stdio; REST global advisory',
  },
  {
    capabilityGroup: 'Graph traverse',
    limit: 'Same as memory',
    scope: 'Per owner',
    notes: 'Expensive BFS — keep depth ≤3',
  },
  {
    capabilityGroup: 'Backup import/export',
    limit: 'Same as memory',
    scope: 'Per owner',
    notes: 'Large payloads — respect maxMemoryContentBytes',
  },
  {
    capabilityGroup: 'Health / docs / capabilities',
    limit: 'Unlimited',
    scope: 'Public',
    notes: 'No auth on /health, /docs, /api/v1/capabilities',
  },
];
