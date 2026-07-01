import { config as loadDotenv } from 'dotenv';

loadDotenv({ quiet: true });

import { z } from 'zod';

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
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && !env.AUTH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['AUTH_SECRET'],
        message: 'AUTH_SECRET is required in production',
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
