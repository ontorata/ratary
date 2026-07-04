export type PluginType = 'storage' | 'embedding' | 'vector' | 'graph' | 'llm';

export type PluginStatus = 'registered' | 'enabled' | 'disabled';

export interface PluginManifest {
  id: string;
  version: string;
  type: PluginType;
  displayName: string;
  description?: string;
  implements: string;
  configSchema?: Record<string, unknown>;
  compatibility?: {
    minProtocolVersion?: string;
    regions?: string[];
  };
  signature?: string;
  envAdapterKey?: string;
  envAdapterValue?: string;
}

export interface RegisteredPlugin {
  manifest: PluginManifest;
  status: PluginStatus;
  registeredAt: string;
  updatedAt: string;
  enabledAt?: string;
}

export interface PluginTypeSummary {
  type: PluginType;
  activePluginId: string;
  availablePluginIds: string[];
  envFallback: string;
}
