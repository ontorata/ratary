import { describe, it, expect } from 'vitest';
import { generateKeyPairSync, sign } from 'node:crypto';
import { SignedPluginManifestValidator } from '../../src/infrastructure-platform/adapters/signed-plugin-manifest-validator.js';
import {
  canonicalPluginManifestPayload,
  exportRawPublicKeyBase64,
} from '../../src/infrastructure-platform/adapters/plugin-manifest-signing.js';
import type { PluginManifest } from '../../src/infrastructure-platform/types/plugin.types.js';

const baseManifest: PluginManifest = {
  id: 'storage-d1',
  version: '1.0.0',
  type: 'storage',
  displayName: 'D1 Storage',
  implements: 'ISqlDatabase',
};

describe('SignedPluginManifestValidator', () => {
  it('skips crypto when signature not required and no trusted keys', () => {
    const validator = new SignedPluginManifestValidator();
    const result = validator.validate(baseManifest);
    expect(result.valid).toBe(true);
  });

  it('verifies Ed25519 when trusted keys configured', () => {
    const { publicKey, privateKey } = generateKeyPairSync('ed25519');
    const trusted = [Buffer.from(exportRawPublicKeyBase64(publicKey), 'base64')];
    const payload = canonicalPluginManifestPayload(baseManifest);
    const signature = sign(null, payload, privateKey).toString('base64');

    const validator = new SignedPluginManifestValidator({ trustedPublicKeys: trusted });
    const result = validator.validate({ ...baseManifest, signature });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid signature when requireSignature=true', () => {
    const validator = new SignedPluginManifestValidator({ requireSignature: true });
    const result = validator.validate({
      ...baseManifest,
      signature: Buffer.alloc(64).toString('base64'),
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('PLUGIN_TRUSTED_PUBLIC_KEYS'))).toBe(true);
  });
});
