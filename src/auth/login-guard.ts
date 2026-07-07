import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { ForbiddenError } from '../types/errors.js';
import { nowISO } from '../utils/memory-mapper.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

interface AttemptRow {
  email: string;
  failed_count: number;
  locked_until: string | null;
  last_attempt_at: string;
  last_ip: string | null;
}

/** Per-email lockout after repeated failed logins (credential stuffing mitigation). */
export class LoginGuard {
  constructor(private readonly db: ISqlDatabase) {}

  async assertNotLocked(email: string): Promise<void> {
    const row = await this.getRow(email);
    if (!row?.locked_until) return;
    if (new Date(row.locked_until) > new Date()) {
      throw new ForbiddenError('Account temporarily locked — try again later');
    }
    await this.reset(email);
  }

  async recordFailure(email: string, ip?: string): Promise<void> {
    const normalized = email.toLowerCase();
    const row = await this.getRow(normalized);
    const failed = (row?.failed_count ?? 0) + 1;
    const now = nowISO();
    const lockedUntil =
      failed >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString()
        : null;

    if (row) {
      await this.db.execute(
        `UPDATE auth_login_attempts
         SET failed_count = ?, locked_until = ?, last_attempt_at = ?, last_ip = ?
         WHERE email = ?`,
        [failed, lockedUntil, now, ip ?? row.last_ip, normalized],
      );
      return;
    }

    await this.db.execute(
      `INSERT INTO auth_login_attempts (email, failed_count, locked_until, last_attempt_at, last_ip)
       VALUES (?, ?, ?, ?, ?)`,
      [normalized, failed, lockedUntil, now, ip ?? null],
    );
  }

  async recordSuccess(email: string): Promise<void> {
    await this.reset(email.toLowerCase());
  }

  private async getRow(email: string): Promise<AttemptRow | null> {
    const rows = await this.db.query<AttemptRow>(
      'SELECT email, failed_count, locked_until, last_attempt_at, last_ip FROM auth_login_attempts WHERE email = ?',
      [email],
    );
    return rows[0] ?? null;
  }

  private async reset(email: string): Promise<void> {
    await this.db.execute('DELETE FROM auth_login_attempts WHERE email = ?', [email]);
  }
}

/** Small jitter so failed logins take similar time (timing-attack mitigation). */
export function authFailureDelay(): Promise<void> {
  const ms = 120 + Math.floor(Math.random() * 180);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
