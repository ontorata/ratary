import type { PluginManifest } from '../types/plugin.types.js';
import type {
  IPluginManifestValidator,
  ManifestValidationResult,
} from '../ports/iplugin-manifest-validator.port.js';

const PLUGIN_TYPES = new Set(['storage', 'embedding', 'vector', 'graph', 'llm']);

export interface SchemaPluginManifestValidatorOptions {
  requireSignature?: boolean;
}

/** JSON schema validation for plugin manifests (ADR-035). */
export class SchemaPluginManifestValidator implements IPluginManifestValidator {
  constructor(private readonly options: SchemaPluginManifestValidatorOptions = {}) {}

  validate(manifest: PluginManifest): ManifestValidationResult {
    const errors: string[] = [];

    if (!manifest.id?.trim()) errors.push('id is required');
    if (!manifest.version?.trim()) errors.push('version is required');
    if (!manifest.displayName?.trim()) errors.push('displayName is required');
    if (!manifest.type || !PLUGIN_TYPES.has(manifest.type)) {
      errors.push('type must be storage|embedding|vector|graph|llm');
    }
    if (!manifest.implements?.trim()) errors.push('implements is required');

    if (this.options.requireSignature && !manifest.signature?.trim()) {
      errors.push('signature is required');
    }

    if (manifest.signature && manifest.signature.length < 8) {
      errors.push('signature is invalid');
    }

    return { valid: errors.length === 0, errors };
  }
}

/** Permissive validator for env-only mode. */
export class NoOpPluginManifestValidator implements IPluginManifestValidator {
  validate(_manifest: PluginManifest): ManifestValidationResult {
    return { valid: true, errors: [] };
  }
}
