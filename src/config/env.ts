import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

/** Always load repo-root `.env` — MCP/Cursor may run with a different cwd. */
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
loadDotenv({ path: resolve(projectRoot, '.env'), quiet: true });

import { z } from 'zod';
import {
  DEFAULT_GRAPH_MAX_DEPTH,
  DEFAULT_GRAPH_MAX_DEPTH_MVP,
  DEFAULT_GRAPH_MAX_NEIGHBORS,
  DEFAULT_GRAPH_SEED_CAP,
} from '../graph/graph.config.js';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

    // Cloudflare D1 credentials
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required'),
    D1_DATABASE_ID: z.string().min(1, 'D1_DATABASE_ID is required'),
    D1_API_TOKEN: z.string().min(1, 'D1_API_TOKEN is required'),

    // Identity layer — HMAC secret for hashing API keys (min 32 chars)
    AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters').optional(),

    // Embedding layer (Phase 5)
    EMBEDDING_PROVIDER: z.enum(['noop', 'openai']).default('noop'),
    EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
    EMBEDDING_API_KEY: z.string().optional(),
    EMBEDDING_BASE_URL: z.string().default('https://api.openai.com/v1'),
    EMBEDDING_BATCH_SIZE: z.coerce.number().int().positive().default(32),
    EMBEDDING_MAX_RETRIES: z.coerce.number().int().positive().default(3),

    // Hybrid retrieval (Phase 6)
    HYBRID_RETRIEVAL: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),

    // Graph retrieval (Phase 8) — ADR-006 Appendix C
    GRAPH_RETRIEVAL: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    GRAPH_MAX_DEPTH: z.coerce
      .number()
      .int()
      .min(1)
      .max(DEFAULT_GRAPH_MAX_DEPTH_MVP)
      .default(DEFAULT_GRAPH_MAX_DEPTH),
    GRAPH_SEED_CAP: z.coerce.number().int().positive().default(DEFAULT_GRAPH_SEED_CAP),
    GRAPH_MAX_NEIGHBORS: z.coerce.number().int().positive().default(DEFAULT_GRAPH_MAX_NEIGHBORS),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.AUTH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['AUTH_SECRET'],
        message: 'AUTH_SECRET is required in production',
      });
    }

    if (env.EMBEDDING_PROVIDER === 'openai' && !env.EMBEDDING_API_KEY) {
      ctx.addIssue({
        code: 'custom',
        path: ['EMBEDDING_API_KEY'],
        message: 'EMBEDDING_API_KEY is required when EMBEDDING_PROVIDER=openai',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function resetEnvCache(): void {
  cachedEnv = null;
}
