import type { PluginManifest } from '../types/plugin.types.js';

export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
}

/** Plugin manifest schema + optional signature validation (ADR-035). */
export interface IPluginManifestValidator {
  validate(manifest: PluginManifest): ManifestValidationResult;
}
