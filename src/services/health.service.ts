import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  checks: {
    database: 'ok' | 'error';
  };
}

export class HealthService {
  constructor(private readonly db: ISqlDatabase) {}

  async check(): Promise<HealthStatus> {
    const database = await this.pingDatabase();

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      service: 'ai-memory-cloud',
      timestamp: new Date().toISOString(),
      checks: { database },
    };
  }

  private async pingDatabase(): Promise<'ok' | 'error'> {
    try {
      const rows = await this.db.query<{ ok: number }>('SELECT 1 AS ok');
      return rows[0]?.ok === 1 ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }
}
