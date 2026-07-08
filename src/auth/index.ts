import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { IdentityRepository } from './identity.repository.js';
import { ClientRepository } from './client.repository.js';
import { AuditRepository } from './audit.repository.js';
import { SettingsRepository } from './settings.repository.js';
import { AuditService } from './audit.service.js';
import { IdentityService } from './identity.service.js';
import { ClientService } from './client.service.js';
import { AuthService } from './auth.service.js';
import { JwtService } from './jwt.service.js';
import {
  ApiKeyProvider,
  JwtProvider,
  OAuthProvider,
  OidcAccessTokenProvider,
  StudioOidcAccessTokenProvider,
} from './providers/index.js';
import { createAuthenticateMiddleware } from './auth.middleware.js';
import { createPermissionMiddleware } from './permission.middleware.js';
import { createTenantContextMiddleware } from './tenant-context.middleware.js';
import { getEnv } from '../config/index.js';

export interface AuthLayer {
  authService: AuthService;
  identityService: IdentityService;
  clientService: ClientService;
  auditService: AuditService;
  jwtService: JwtService;
  authenticate: ReturnType<typeof createAuthenticateMiddleware>;
  resolveTenantContext: ReturnType<typeof createTenantContextMiddleware>;
  enforcePermissions: ReturnType<typeof createPermissionMiddleware>;
}

export function createAuthLayer(db: ISqlDatabase): AuthLayer {
  const identityRepository = new IdentityRepository(db);
  const clientRepository = new ClientRepository(db);
  const auditRepository = new AuditRepository(db);
  const settingsRepository = new SettingsRepository(db);
  const jwtService = new JwtService();

  const auditService = new AuditService(auditRepository);
  const clientService = new ClientService(clientRepository);

  const identityService = new IdentityService(
    db,
    identityRepository,
    settingsRepository,
    jwtService,
  );

  const env = getEnv();
  const providers = [
    new ApiKeyProvider(identityRepository),
    new OAuthProvider(identityRepository),
    ...(env.STUDIO_OIDC_ENABLED
      ? [new StudioOidcAccessTokenProvider({ env, identityRepository })]
      : []),
    ...(env.REMOTE_MCP_OAUTH_ENABLED ? [new OidcAccessTokenProvider({ env })] : []),
    new JwtProvider(jwtService, identityRepository),
  ];

  const authService = new AuthService(providers, identityRepository);
  const authenticate = createAuthenticateMiddleware(authService);
  const resolveTenantContext = createTenantContextMiddleware(db);
  const enforcePermissions = createPermissionMiddleware();

  return {
    authService,
    identityService,
    clientService,
    auditService,
    jwtService,
    authenticate,
    resolveTenantContext,
    enforcePermissions,
  };
}

export * from './auth.types.js';
