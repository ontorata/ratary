import { describe, it, expect } from 'vitest';
import { SchemaPluginManifestValidator } from '../../src/infrastructure-platform/adapters/schema-plugin-manifest-validator.js';
import type { PluginManifest } from '../../src/infrastructure-platform/types/plugin.types.js';

const validManifest: PluginManifest = {
  id: 'storage-d1',
  version: '1.0.0',
  type: 'storage',
  displayName: 'D1 Storage',
  description: 'Test',
  implements: 'ISqlDatabase',
};

describe('SchemaPluginManifestValidator', () => {
  it('accepts a valid manifest', () => {
    const validator = new SchemaPluginManifestValidator();
    const result = validator.validate(validManifest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects manifest with missing id', () => {
    const validator = new SchemaPluginManifestValidator();
    const result = validator.validate({ ...validManifest, id: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('rejects invalid plugin type', () => {
    const validator = new SchemaPluginManifestValidator();
    const result = validator.validate({ ...validManifest, type: 'agent' as PluginManifest['type'] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('type'))).toBe(true);
  });

  it('requires signature when PLUGIN_SIGNATURE_REQUIRED=true', () => {
    const validator = new SchemaPluginManifestValidator({ requireSignature: true });
    const result = validator.validate(validManifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('signature'))).toBe(true);
  });

  it('accepts manifest with signature when required', () => {
    const validator = new SchemaPluginManifestValidator({ requireSignature: true });
    const result = validator.validate({
      ...validManifest,
      signature: 'deadbeefcafebabe',
    });
    expect(result.valid).toBe(true);
  });
});
