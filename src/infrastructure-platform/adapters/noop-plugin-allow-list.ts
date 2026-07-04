import type { IPluginAllowList } from '../ports/iplugin-allow-list.port.js';

/** Allow-all when control plane allow-list is not configured. */
export class NoOpPluginAllowList implements IPluginAllowList {
  async isAllowed(_organizationId: string, _pluginId: string): Promise<boolean> {
    return true;
  }

  async listAllowed(_organizationId: string): Promise<string[]> {
    return [];
  }

  async allow(_organizationId: string, _pluginId: string): Promise<void> {
    // intentionally empty
  }

  async deny(_organizationId: string, _pluginId: string): Promise<void> {
    // intentionally empty
  }
}
