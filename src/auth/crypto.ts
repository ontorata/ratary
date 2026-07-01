import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getEnv } from '../config/index.js';

const API_KEY_PREFIX = 'aic_';

export function getAuthSecret(): string {
  const env = getEnv();
  if (env.AUTH_SECRET) return env.AUTH_SECRET;
  if (env.NODE_ENV === 'test') {
    return 'test-auth-secret-minimum-32-characters!!';
  }
  throw new Error('AUTH_SECRET is required');
}

export function hashSecret(plaintext: string): string {
  return createHmac('sha256', getAuthSecret()).update(plaintext).digest('hex');
}

export function timingSafeCompareHash(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

export function generateApiKeyPlaintext(): string {
  return `${API_KEY_PREFIX}${randomBytes(32).toString('hex')}`;
}

export function isApiKeyFormat(value: string): boolean {
  return value.startsWith(API_KEY_PREFIX) && value.length > API_KEY_PREFIX.length + 16;
}
