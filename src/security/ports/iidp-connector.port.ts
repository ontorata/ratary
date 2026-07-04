/** IdP connector descriptor — Azure AD, Okta, Keycloak, Google Workspace (Phase 17). */
export type IdpProviderId = 'azure-ad' | 'okta' | 'keycloak' | 'google-workspace';

export interface IdpConnectorDescriptor {
  readonly id: IdpProviderId;
  readonly displayName: string;
  readonly protocol: 'oidc' | 'saml' | 'ldap';
  readonly configured: boolean;
}

export interface IIdpConnectorRegistry {
  listProviders(): Promise<IdpConnectorDescriptor[]>;
  getProvider(id: IdpProviderId): Promise<IdpConnectorDescriptor | null>;
}
