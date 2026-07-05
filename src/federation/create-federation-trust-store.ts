import type { Env } from '../config/env.js';
import type { IFederationTrustStore } from './ports/ifederation-trust-store.port.js';
import type { IFederationRegistry } from './ports/ifederation-registry.port.js';
import { NoOpFederationTrustStore } from './adapters/noop-federation-trust-store.adapter.js';
import { RegistryFederationTrustStore } from './adapters/registry-federation-trust-store.adapter.js';
import { FileFederationTrustStore } from './adapters/file-federation-trust-store.adapter.js';

/** Resolves federation trust store — strict registry in production when provider is noop. */
export function createFederationTrustStore(
  env: Env,
  registry: IFederationRegistry,
): IFederationTrustStore {
  if (env.FEDERATION_TRUST_PROVIDER === 'file') {
    if (!env.FEDERATION_TRUST_FILE_PATH) {
      throw new Error('FEDERATION_TRUST_FILE_PATH is required when FEDERATION_TRUST_PROVIDER=file');
    }
    return new FileFederationTrustStore(env.FEDERATION_TRUST_FILE_PATH);
  }

  if (env.FEDERATION_TRUST_PROVIDER === 'registry') {
    return new RegistryFederationTrustStore(registry);
  }

  if (env.NODE_ENV === 'production') {
    return new RegistryFederationTrustStore(registry);
  }

  return new NoOpFederationTrustStore();
}
