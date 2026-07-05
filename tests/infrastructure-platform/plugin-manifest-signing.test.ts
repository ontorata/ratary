import { describe, it, expect } from 'vitest';
import { generateKeyPairSync, sign } from 'node:crypto';
import {
  canonicalPluginManifestPayload,
  exportRawPublicKeyBase64,
  parseTrustedPublicKeys,
  verifyPluginManifestSignature,
} from '../../src/infrastructure-platform/adapters/plugin-manifest-signing.js';
import type { PluginManifest } from '../../src/infrastructure-platform/types/plugin.types.js';

const baseManifest: PluginManifest = {
  id: 'storage-d1',
  version: '1.0.0',
  type: 'storage',
  displayName: 'D1 Storage',
  description: 'Test',
  implements: 'ISqlDatabase',
};

function signManifest(
  manifest: PluginManifest,
  privateKey: ReturnType<typeof generateKeyPairSync>['privateKey'],
): PluginManifest {
  const payload = canonicalPluginManifestPayload(manifest);
  const signature = sign(null, payload, privateKey).toString('base64');
  return { ...manifest, signature };
}

describe('plugin-manifest-signing', () => {
  it('parses comma-separated trusted public keys', () => {
    const { publicKey } = generateKeyPairSync('ed25519');
    const encoded = exportRawPublicKeyBase64(publicKey);
    const keys = parseTrustedPublicKeys(`${encoded}, ${encoded}`);
    expect(keys).toHaveLength(2);
    expect(keys[0]?.equals(keys[1]!)).toBe(true);
  });

  it('verifies a valid Ed25519 signature', () => {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    const trusted = [Buffer.from(exportRawPublicKeyBase64(publicKey), 'base64')];
    const signed = signManifest(baseManifest, privateKey);

    const result = verifyPluginManifestSignature(signed, trusted);
    expect(result.valid).toBe(true);
  });

  it('rejects tampered manifest content', () => {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    const trusted = [Buffer.from(exportRawPublicKeyBase64(publicKey), 'base64')];
    const signed = signManifest(baseManifest, privateKey);
    signed.version = '9.9.9';

    const result = verifyPluginManifestSignature(signed, trusted);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('verification failed');
  });

  it('rejects when trusted keys are not configured', () => {
    const { privateKey } = generateKeyPairSync('ed25519');
    const signed = signManifest(baseManifest, privateKey);

    const result = verifyPluginManifestSignature(signed, []);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('PLUGIN_TRUSTED_PUBLIC_KEYS');
  });
});
