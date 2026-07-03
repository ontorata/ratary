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

    // Cloudflare D1 credentials (required when SQL_PROVIDER=d1)
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1).optional(),
    D1_DATABASE_ID: z.string().min(1).optional(),
    D1_API_TOKEN: z.string().min(1).optional(),

    // PostgreSQL (required when SQL_PROVIDER=postgres) — ADR-009
    DATABASE_URL: z.string().url().optional(),

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

    // Platform infrastructure (Phase 10)
    SQL_PROVIDER: z.enum(['d1', 'postgres']).default('d1'),
    VECTOR_PROVIDER: z.enum(['d1', 'pgvector']).default('d1'),
    PGVECTOR_DATABASE_URL: z.string().url().optional(),
    OBJECT_STORAGE_PROVIDER: z.enum(['inline', 'r2', 's3']).default('inline'),
    R2_BUCKET_NAME: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    S3_BUCKET_NAME: z.string().min(1).optional(),
    S3_ACCESS_KEY_ID: z.string().min(1).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_REGION: z.string().min(1).optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_FORCE_PATH_STYLE: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    CACHE_PROVIDER: z.enum(['none', 'memory', 'redis']).default('none'),
    REDIS_URL: z.string().url().optional(),
    REDIS_KEY_PREFIX: z.string().default('ai-brain:cache:'),
    EVENT_BUS_PROVIDER: z.enum(['none', 'noop', 'redis']).default('none'),
    REDIS_STREAM_PREFIX: z.string().default('ai-brain:events:'),
    REDIS_STREAM_CONSUMER_GROUP: z.string().default('ai-brain-consumers'),
    REDIS_STREAM_CONSUMER_NAME: z.string().default('ai-brain-worker'),
    ANALYTICS_PROVIDER: z.enum(['none', 'duckdb']).default('none'),
    DUCKDB_PATH: z.string().default(':memory:'),
    GRAPH_PROVIDER: z.enum(['d1', 'neo4j']).default('d1'),
    NEO4J_URI: z.string().url().optional(),
    NEO4J_USERNAME: z.string().min(1).optional(),
    NEO4J_PASSWORD: z.string().min(1).optional(),
    SEARCH_PROVIDER: z.enum(['sql', 'meilisearch']).default('sql'),
    MEILISEARCH_HOST: z.string().url().optional(),
    MEILISEARCH_API_KEY: z.string().optional(),
    MEILISEARCH_INDEX: z.string().min(1).optional(),
    OTEL_ENABLED: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    OTEL_SERVICE_NAME: z.string().default('ai-memory-cloud'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().default('http://127.0.0.1:4318/v1/traces'),
    ENTERPRISE_RBAC: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
    MEMORY_ACCESS_AUDIT: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
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

    if (env.SQL_PROVIDER === 'd1') {
      if (!env.CLOUDFLARE_ACCOUNT_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['CLOUDFLARE_ACCOUNT_ID'],
          message: 'CLOUDFLARE_ACCOUNT_ID is required when SQL_PROVIDER=d1',
        });
      }
      if (!env.D1_DATABASE_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['D1_DATABASE_ID'],
          message: 'D1_DATABASE_ID is required when SQL_PROVIDER=d1',
        });
      }
      if (!env.D1_API_TOKEN) {
        ctx.addIssue({
          code: 'custom',
          path: ['D1_API_TOKEN'],
          message: 'D1_API_TOKEN is required when SQL_PROVIDER=d1',
        });
      }
    }

    if (env.SQL_PROVIDER === 'postgres' && !env.DATABASE_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['DATABASE_URL'],
        message: 'DATABASE_URL is required when SQL_PROVIDER=postgres',
      });
    }

    if (env.OBJECT_STORAGE_PROVIDER === 'r2') {
      const accountId = env.R2_ACCOUNT_ID ?? env.CLOUDFLARE_ACCOUNT_ID;
      if (!accountId) {
        ctx.addIssue({
          code: 'custom',
          path: ['R2_ACCOUNT_ID'],
          message:
            'R2_ACCOUNT_ID or CLOUDFLARE_ACCOUNT_ID is required when OBJECT_STORAGE_PROVIDER=r2',
        });
      }
      if (!env.R2_BUCKET_NAME) {
        ctx.addIssue({
          code: 'custom',
          path: ['R2_BUCKET_NAME'],
          message: 'R2_BUCKET_NAME is required when OBJECT_STORAGE_PROVIDER=r2',
        });
      }
      if (!env.R2_ACCESS_KEY_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['R2_ACCESS_KEY_ID'],
          message: 'R2_ACCESS_KEY_ID is required when OBJECT_STORAGE_PROVIDER=r2',
        });
      }
      if (!env.R2_SECRET_ACCESS_KEY) {
        ctx.addIssue({
          code: 'custom',
          path: ['R2_SECRET_ACCESS_KEY'],
          message: 'R2_SECRET_ACCESS_KEY is required when OBJECT_STORAGE_PROVIDER=r2',
        });
      }
    }

    if (env.VECTOR_PROVIDER === 'pgvector' && !env.PGVECTOR_DATABASE_URL && !env.DATABASE_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['PGVECTOR_DATABASE_URL'],
        message: 'PGVECTOR_DATABASE_URL or DATABASE_URL is required when VECTOR_PROVIDER=pgvector',
      });
    }

    if (env.CACHE_PROVIDER === 'redis' && !env.REDIS_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['REDIS_URL'],
        message: 'REDIS_URL is required when CACHE_PROVIDER=redis',
      });
    }

    if (env.EVENT_BUS_PROVIDER === 'redis' && !env.REDIS_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['REDIS_URL'],
        message: 'REDIS_URL is required when EVENT_BUS_PROVIDER=redis',
      });
    }

    if (env.OBJECT_STORAGE_PROVIDER === 's3') {
      if (!env.S3_BUCKET_NAME) {
        ctx.addIssue({
          code: 'custom',
          path: ['S3_BUCKET_NAME'],
          message: 'S3_BUCKET_NAME is required when OBJECT_STORAGE_PROVIDER=s3',
        });
      }
      if (!env.S3_ACCESS_KEY_ID) {
        ctx.addIssue({
          code: 'custom',
          path: ['S3_ACCESS_KEY_ID'],
          message: 'S3_ACCESS_KEY_ID is required when OBJECT_STORAGE_PROVIDER=s3',
        });
      }
      if (!env.S3_SECRET_ACCESS_KEY) {
        ctx.addIssue({
          code: 'custom',
          path: ['S3_SECRET_ACCESS_KEY'],
          message: 'S3_SECRET_ACCESS_KEY is required when OBJECT_STORAGE_PROVIDER=s3',
        });
      }
      if (!env.S3_REGION) {
        ctx.addIssue({
          code: 'custom',
          path: ['S3_REGION'],
          message: 'S3_REGION is required when OBJECT_STORAGE_PROVIDER=s3',
        });
      }
    }

    if (env.GRAPH_PROVIDER === 'neo4j') {
      if (!env.NEO4J_URI) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEO4J_URI'],
          message: 'NEO4J_URI is required when GRAPH_PROVIDER=neo4j',
        });
      }
      if (!env.NEO4J_USERNAME) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEO4J_USERNAME'],
          message: 'NEO4J_USERNAME is required when GRAPH_PROVIDER=neo4j',
        });
      }
      if (!env.NEO4J_PASSWORD) {
        ctx.addIssue({
          code: 'custom',
          path: ['NEO4J_PASSWORD'],
          message: 'NEO4J_PASSWORD is required when GRAPH_PROVIDER=neo4j',
        });
      }
    }

    if (env.SEARCH_PROVIDER === 'meilisearch') {
      if (!env.MEILISEARCH_HOST) {
        ctx.addIssue({
          code: 'custom',
          path: ['MEILISEARCH_HOST'],
          message: 'MEILISEARCH_HOST is required when SEARCH_PROVIDER=meilisearch',
        });
      }
      if (!env.MEILISEARCH_INDEX) {
        ctx.addIssue({
          code: 'custom',
          path: ['MEILISEARCH_INDEX'],
          message: 'MEILISEARCH_INDEX is required when SEARCH_PROVIDER=meilisearch',
        });
      }
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
