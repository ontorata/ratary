import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';

export interface AuthAccountRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  owner_id: string;
  identity_id: string;
  created_at: string;
  last_login_at: string | null;
  active: number;
}

export interface AuthAccount {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  ownerId: string;
  identityId: string;
  createdAt: string;
  lastLoginAt: string | null;
  active: boolean;
}

function mapRow(row: AuthAccountRow): AuthAccount {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    ownerId: row.owner_id,
    identityId: row.identity_id,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    active: row.active === 1,
  };
}

/** Email/password credentials — one row per tenant (isolated owner_id). */
export class AccountRepository {
  constructor(private readonly db: ISqlDatabase) {}

  async findByEmail(email: string): Promise<AuthAccount | null> {
    const rows = await this.db.query<AuthAccountRow>(
      'SELECT * FROM auth_accounts WHERE email = ? AND active = 1',
      [email.toLowerCase()],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findById(id: string): Promise<AuthAccount | null> {
    const rows = await this.db.query<AuthAccountRow>(
      'SELECT * FROM auth_accounts WHERE id = ? AND active = 1',
      [id],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async insert(account: {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    ownerId: string;
    identityId: string;
    createdAt: string;
  }): Promise<AuthAccount> {
    await this.db.execute(
      `INSERT INTO auth_accounts (
        id, email, password_hash, display_name, owner_id, identity_id, created_at, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        account.id,
        account.email.toLowerCase(),
        account.passwordHash,
        account.displayName,
        account.ownerId,
        account.identityId,
        account.createdAt,
      ],
    );
    const created = await this.findById(account.id);
    if (!created) throw new Error('Failed to load auth account after insert');
    return created;
  }

  async touchLogin(id: string, at: string): Promise<void> {
    await this.db.execute('UPDATE auth_accounts SET last_login_at = ? WHERE id = ?', [at, id]);
  }
}
