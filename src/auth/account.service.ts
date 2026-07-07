import type { IdentityRepository } from './identity.repository.js';
import type { AccountRepository } from './account.repository.js';
import type { JwtService } from './jwt.service.js';
import { authFailureDelay, LoginGuard } from './login-guard.js';
import { hashPassword, verifyPassword } from './password.js';
import { encryptStudioToken } from './token-crypto.js';
import { generateId, nowISO } from '../utils/memory-mapper.js';
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from '../types/errors.js';
import { emitAuthEvent } from './events.js';
import { executeTransaction } from '../db/migrations.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { metadataToJson } from './identity.mapper.js';

const ACCESS_TOKEN_TTL_SEC = 28_800; // 8h

export interface RegisterAccountInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginAccountInput {
  email: string;
  password: string;
  clientIp?: string;
}

export interface AccountAuthResult {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  ownerId: string;
  identityId: string;
  email: string;
  displayName: string;
}

/**
 * Native email/password auth — each registration gets a dedicated owner_id + identity.
 * Memories and all tenant data are scoped to that owner_id (no cross-user mixing).
 */
export class AccountService {
  constructor(
    private readonly db: ISqlDatabase,
    private readonly accounts: AccountRepository,
    private readonly identities: IdentityRepository,
    private readonly jwtService: JwtService,
    private readonly guard: LoginGuard,
  ) {}

  async register(input: RegisterAccountInput): Promise<AccountAuthResult> {
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    if (!email || !email.includes('@')) {
      throw new ValidationError('Valid email is required');
    }
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const existing = await this.accounts.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const ownerId = generateId();
    const identityId = generateId();
    const accountId = generateId();
    const now = nowISO();
    const displayName = input.displayName?.trim() || email.split('@')[0] || 'User';
    const passwordHash = hashPassword(password);
    const metadata = metadataToJson({
      permissions: ['memory.read', 'memory.write'],
      email,
      displayName,
      authProvider: 'native',
    });

    await executeTransaction(this.db, [
      {
        sql: `INSERT INTO identities (
          id, type, name, secret_hash, owner_id, description, metadata,
          client_id, created_by, created_at, expires_at, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        params: [
          identityId,
          'jwt',
          `user:${email}`,
          null,
          ownerId,
          'Native email/password account',
          metadata,
          null,
          null,
          now,
          null,
        ],
      },
      {
        sql: `INSERT INTO auth_accounts (
          id, email, password_hash, display_name, owner_id, identity_id, created_at, active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        params: [accountId, email, passwordHash, displayName, ownerId, identityId, now],
      },
    ]);

    emitAuthEvent({
      event: 'identity.created',
      identityId,
      ownerId,
      clientId: null,
    });

    return this.issueSession({ identityId, ownerId, email, displayName });
  }

  async login(input: LoginAccountInput): Promise<AccountAuthResult> {
    const email = input.email.trim().toLowerCase();
    await this.guard.assertNotLocked(email);

    const account = await this.accounts.findByEmail(email);
    const valid = account && verifyPassword(input.password, account.passwordHash);

    if (!valid) {
      await authFailureDelay();
      await this.guard.recordFailure(email, input.clientIp);
      throw new UnauthorizedError('Invalid email or password');
    }

    const identity = await this.identities.findById(account!.identityId);
    if (!identity || !identity.active) {
      throw new ForbiddenError('Account is disabled');
    }

    await this.guard.recordSuccess(email);
    await this.accounts.touchLogin(account!.id, nowISO());

    return this.issueSession({
      identityId: account!.identityId,
      ownerId: account!.ownerId,
      email: account!.email,
      displayName: account!.displayName,
    });
  }

  private issueSession(input: {
    identityId: string;
    ownerId: string;
    email: string;
    displayName: string;
  }): AccountAuthResult {
    const signed = this.jwtService.sign({
      identityId: input.identityId,
      ownerId: input.ownerId,
      clientId: null,
      permissions: ['memory.read', 'memory.write'],
      expiresInSec: ACCESS_TOKEN_TTL_SEC,
      jti: generateId(),
      audience: 'studio',
      issuer: 'ratary',
    });
    const accessToken = encryptStudioToken(signed);

    return {
      accessToken,
      expiresIn: ACCESS_TOKEN_TTL_SEC,
      tokenType: 'Bearer',
      ownerId: input.ownerId,
      identityId: input.identityId,
      email: input.email,
      displayName: input.displayName,
    };
  }
}
