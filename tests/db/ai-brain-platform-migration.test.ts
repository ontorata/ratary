import { describe, it, expect } from 'vitest';
import { migrateAiBrainPlatformPhase1 } from '../../src/db/migrations.js';

class RecordingD1Client {
  readonly statements: string[] = [];

  async query<T = Record<string, unknown>>(): Promise<T[]> {
    return [];
  }

  async execute(sql: string): Promise<{ results: unknown[]; success: boolean }> {
    this.statements.push(sql.trim());
    return { results: [], success: true };
  }
}

describe('migrateAiBrainPlatformPhase1', () => {
  it('creates Phase 24 platform webhook table', async () => {
    const client = new RecordingD1Client();
    await migrateAiBrainPlatformPhase1(client);
    expect(client.statements.join('\n')).toContain('platform_webhook_subscriptions');
  });
});
