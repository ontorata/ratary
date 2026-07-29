import { createHash } from 'node:crypto';

/** Deterministic UUID from owner + stable key (I1: identity does not drift across re-index). */
export function stableCodeId(ownerId: string, stableKey: string): string {
  const digest = createHash('sha256').update(`${ownerId}\0${stableKey}`).digest();
  digest[6] = (digest[6]! & 0x0f) | 0x40;
  digest[8] = (digest[8]! & 0x3f) | 0x80;
  const hex = digest.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
