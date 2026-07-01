import type { D1Client } from '../db/d1-client.js';
import { IdentityRepository } from './identity.repository.js';
import { AuditRepository } from './audit.repository.js';
import { SettingsRepository } from './settings.repository.js';
import { AuditService } from './audit.service.js';
import { IdentityService } from './identity.service.js';
import { AuthService } from './auth.service.js';
import { ApiKeyProvider, JwtProvider, OAuthProvider } from './providers/index.js';
import { createAuthenticateMiddleware } from './auth.middleware.js';

export interface AuthLayer {
  authService: AuthService;
  identityService: IdentityService;
  auditService: AuditService;
  authenticate: ReturnType<typeof createAuthenticateMiddleware>;
}

export function createAuthLayer(db: D1Client): AuthLayer {
  const identityRepository = new IdentityRepository(db);
  const auditRepository = new AuditRepository(db);
  const settingsRepository = new SettingsRepository(db);

  const auditService = new AuditService(auditRepository);

  const identityService = new IdentityService(
    db,
    identityRepository,
    settingsRepository,
  );

  const providers = [
    new ApiKeyProvider(identityRepository),
    new JwtProvider(),
    new OAuthProvider(),
  ];

  const authService = new AuthService(providers, identityRepository);
  const authenticate = createAuthenticateMiddleware(authService);

  return { authService, identityService, auditService, authenticate };
}

export * from './auth.types.js';
