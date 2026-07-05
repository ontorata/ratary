import type { PluginManifest } from '../types/plugin.types.js';
import type {
  IPluginManifestValidator,
  ManifestValidationResult,
} from '../ports/iplugin-manifest-validator.port.js';
import {
  SchemaPluginManifestValidator,
  type SchemaPluginManifestValidatorOptions,
} from './schema-plugin-manifest-validator.js';
import { verifyPluginManifestSignature } from './plugin-manifest-signing.js';

export interface SignedPluginManifestValidatorOptions extends SchemaPluginManifestValidatorOptions {
  trustedPublicKeys?: Buffer[];
}

/**
 * Schema validation plus optional Ed25519 manifest signature verification (ADR-035 D20-01).
 * Crypto verify runs when PLUGIN_SIGNATURE_REQUIRED=true or trusted public keys are configured.
 */
export class SignedPluginManifestValidator implements IPluginManifestValidator {
  private readonly schema: SchemaPluginManifestValidator;

  constructor(private readonly options: SignedPluginManifestValidatorOptions = {}) {
    this.schema = new SchemaPluginManifestValidator({
      requireSignature: options.requireSignature,
    });
  }

  validate(manifest: PluginManifest): ManifestValidationResult {
    const schemaResult = this.schema.validate(manifest);
    if (!schemaResult.valid) {
      return schemaResult;
    }

    const trustedKeys = this.options.trustedPublicKeys ?? [];
    const shouldVerifyCrypto =
      Boolean(this.options.requireSignature) || trustedKeys.length > 0;

    if (!shouldVerifyCrypto) {
      return schemaResult;
    }

    const cryptoResult = verifyPluginManifestSignature(manifest, trustedKeys);
    if (!cryptoResult.valid) {
      return {
        valid: false,
        errors: [cryptoResult.error ?? 'signature verification failed'],
      };
    }

    return { valid: true, errors: [] };
  }
}
