import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { getAuthSecret } from './crypto.js';
import { UnauthorizedError } from '../types/errors.js';

const TOKEN_PREFIX = 'rat1';
const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const KEY_SALT = 'ratary-studio-token-v1';

function deriveTokenKey(): Buffer {
  return scryptSync(getAuthSecret(), KEY_SALT, 32);
}

/** Opaque encrypted bearer — payload not readable without AUTH_SECRET (anti-sniffing at rest). */
export function isEncryptedStudioToken(token: string): boolean {
  return token.startsWith(`${TOKEN_PREFIX}.`);
}

export function encryptStudioToken(jwt: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, deriveTokenKey(), iv);
  const encrypted = Buffer.concat([cipher.update(jwt, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${TOKEN_PREFIX}.${iv.toString('base64url')}.${encrypted.toString('base64url')}.${tag.toString('base64url')}`;
}

export function decryptStudioToken(token: string): string {
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== TOKEN_PREFIX) {
    throw new UnauthorizedError('Invalid encrypted token');
  }
  try {
    const iv = Buffer.from(parts[1], 'base64url');
    const encrypted = Buffer.from(parts[2], 'base64url');
    const tag = Buffer.from(parts[3], 'base64url');
    const decipher = createDecipheriv(ALGO, deriveTokenKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch {
    throw new UnauthorizedError('Invalid encrypted token');
  }
}

export function resolveBearerJwt(token: string): string | null {
  if (isEncryptedStudioToken(token)) {
    return decryptStudioToken(token);
  }
  const parts = token.split('.');
  if (parts.length === 3 && parts.every((p) => p.length > 0)) {
    return token;
  }
  return null;
}
