import type { PluginManifest, PluginType, RegisteredPlugin } from '../types/plugin.types.js';

export interface RegisterPluginInput {
  manifest: PluginManifest;
  skipValidation?: boolean;
}

/** Plugin registry — register/enable/disable provider adapters (ADR-035). */
export interface IPluginRegistry {
  register(input: RegisterPluginInput): Promise<RegisteredPlugin>;
  enable(pluginId: string): Promise<RegisteredPlugin>;
  disable(pluginId: string): Promise<RegisteredPlugin>;
  get(pluginId: string): Promise<RegisteredPlugin | null>;
  list(): Promise<RegisteredPlugin[]>;
  listByType(type: PluginType): Promise<RegisteredPlugin[]>;
  getActivePluginId(type: PluginType): Promise<string>;
  bootstrapFromEnv(): Promise<void>;
}
