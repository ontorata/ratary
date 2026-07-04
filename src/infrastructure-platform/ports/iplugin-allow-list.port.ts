/** Tenant-scoped plugin allow-list — Phase 18 control plane hook (ADR-035). */
export interface IPluginAllowList {
  isAllowed(organizationId: string, pluginId: string): Promise<boolean>;
  listAllowed(organizationId: string): Promise<string[]>;
  allow(organizationId: string, pluginId: string): Promise<void>;
  deny(organizationId: string, pluginId: string): Promise<void>;
}
