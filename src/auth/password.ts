import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { getAuthSecret } from './crypto.js';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

/** Server-side pepper — stolen DB hashes cannot be cracked without AUTH_SECRET. */
function applyPepper(plaintext: string): string {
  return createHmac('sha256', getAuthSecret()).update(`studio-pw-v1:${plaintext}`).digest();
}

function scryptHash(input: Buffer, salt: Buffer): Buffer {
  return scryptSync(input, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
}

/** Hash password for auth_accounts (peppered scrypt). */
export function hashPassword(plaintext: string): string {
  const salt = randomBytes(SALT_LEN);
  const derived = scryptHash(applyPepper(plaintext), salt);
  return `scrypt-v2$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

/** Constant-time password verify (supports legacy scrypt-v1 and peppered v2). */
export function verifyPassword(plaintext: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3) return false;

  const [version, saltB64, hashB64] = parts;
  if (version !== 'scrypt' && version !== 'scrypt-v2') return false;

  try {
    const salt = Buffer.from(saltB64, 'base64url');
    const expected = Buffer.from(hashB64, 'base64url');
    const input = version === 'scrypt-v2' ? applyPepper(plaintext) : Buffer.from(plaintext, 'utf8');
    const derived = scryptHash(input, salt);
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
