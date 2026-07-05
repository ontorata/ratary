import { createPublicKey, verify, type KeyObject } from 'node:crypto';
import type { PluginManifest } from '../types/plugin.types.js';

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

/** Parse comma-separated base64 raw Ed25519 public keys (32 bytes each). */
export function parseTrustedPublicKeys(raw: string | undefined): Buffer[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((encoded) => {
      const key = Buffer.from(encoded, 'base64');
      if (key.length !== 32) {
        throw new Error(`Invalid Ed25519 public key length: expected 32 bytes, got ${key.length}`);
      }
      return key;
    });
}

/** Stable JSON payload for signing — excludes `signature`. */
export function canonicalPluginManifestPayload(manifest: PluginManifest): Buffer {
  const { signature: _ignored, ...unsigned } = manifest;
  const sortedKeys = Object.keys(unsigned).sort() as (keyof typeof unsigned)[];
  const sorted: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    sorted[key as string] = unsigned[key];
  }
  return Buffer.from(JSON.stringify(sorted), 'utf8');
}

export function ed25519PublicKeyFromRaw(raw: Buffer): KeyObject {
  if (raw.length !== 32) {
    throw new Error('Ed25519 public key must be 32 bytes');
  }
  return createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, raw]),
    format: 'der',
    type: 'spki',
  });
}

export function exportRawPublicKeyBase64(publicKey: KeyObject): string {
  const der = publicKey.export({ format: 'der', type: 'spki' }) as Buffer;
  return der.subarray(der.length - 32).toString('base64');
}

export function verifyPluginManifestSignature(
  manifest: PluginManifest,
  trustedPublicKeys: Buffer[],
): { valid: boolean; error?: string } {
  const signatureRaw = manifest.signature?.trim();
  if (!signatureRaw) {
    return { valid: false, error: 'signature is required' };
  }

  let signature: Buffer;
  try {
    signature = Buffer.from(signatureRaw, 'base64');
  } catch {
    return { valid: false, error: 'signature must be base64-encoded Ed25519' };
  }

  if (signature.length !== 64) {
    return { valid: false, error: 'signature must be 64-byte Ed25519 (base64)' };
  }

  if (trustedPublicKeys.length === 0) {
    return {
      valid: false,
      error: 'PLUGIN_TRUSTED_PUBLIC_KEYS must be configured for signature verification',
    };
  }

  const payload = canonicalPluginManifestPayload(manifest);
  for (const rawKey of trustedPublicKeys) {
    try {
      const publicKey = ed25519PublicKeyFromRaw(rawKey);
      if (verify(null, payload, publicKey, signature)) {
        return { valid: true };
      }
    } catch {
      // try next trusted key
    }
  }

  return { valid: false, error: 'signature verification failed' };
}
