import type { D1Client } from '../db/d1-client.js';

export const SETTINGS_KEYS = {
  BOOTSTRAP_COMPLETED: 'bootstrap.completed',
} as const;

export class SettingsRepository {
  constructor(private readonly db: D1Client) {}

  async get(key: string): Promise<string | null> {
    const rows = await this.db.query<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key],
    );
    return rows[0]?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.db.execute(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, value],
    );
  }

  async isBootstrapCompleted(): Promise<boolean> {
    const value = await this.get(SETTINGS_KEYS.BOOTSTRAP_COMPLETED);
    return value === 'true';
  }
}
