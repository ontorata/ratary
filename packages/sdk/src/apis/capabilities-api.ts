import type { IApiClient } from '../ports/iapi-client.js';
import type { CapabilityManifest } from '../types.js';

export class CapabilitiesApi {
  constructor(private readonly client: IApiClient) {}

  async get(): Promise<CapabilityManifest> {
    return this.client.request({ method: 'GET', path: '/capabilities', auth: false });
  }
}
