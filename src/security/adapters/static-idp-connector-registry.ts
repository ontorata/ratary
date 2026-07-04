import type {
  IdpConnectorDescriptor,
  IdpProviderId,
  IIdpConnectorRegistry,
} from '../ports/iidp-connector.port.js';
import type { Env } from '../../config/env.js';

const BASE_PROVIDERS: IdpConnectorDescriptor[] = [
  { id: 'azure-ad', displayName: 'Azure AD', protocol: 'oidc', configured: false },
  { id: 'okta', displayName: 'Okta', protocol: 'oidc', configured: false },
  { id: 'keycloak', displayName: 'Keycloak', protocol: 'oidc', configured: false },
  { id: 'google-workspace', displayName: 'Google Workspace', protocol: 'oidc', configured: false },
];

export class StaticIdpConnectorRegistry implements IIdpConnectorRegistry {
  constructor(private readonly env: Env) {}

  async listProviders(): Promise<IdpConnectorDescriptor[]> {
    return BASE_PROVIDERS.map((provider) => ({
      ...provider,
      configured: this.isConfigured(provider.id),
    }));
  }

  async getProvider(id: IdpProviderId): Promise<IdpConnectorDescriptor | null> {
    const base = BASE_PROVIDERS.find((p) => p.id === id);
    if (!base) return null;
    return { ...base, configured: this.isConfigured(id) };
  }

  private isConfigured(id: IdpProviderId): boolean {
    if (!this.env.SSO_ENABLED) return false;
    if (id === 'azure-ad') return Boolean(this.env.OIDC_ISSUER_URL?.includes('microsoft'));
    if (id === 'okta') return Boolean(this.env.OIDC_ISSUER_URL?.includes('okta'));
    if (id === 'keycloak') return Boolean(this.env.OIDC_ISSUER_URL?.includes('keycloak'));
    if (id === 'google-workspace') {
      return Boolean(this.env.OIDC_ISSUER_URL?.includes('google'));
    }
    return Boolean(this.env.OIDC_ISSUER_URL);
  }
}
