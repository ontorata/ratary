import { describe, it, expect } from 'vitest';
import { migrateKnowledgeFabricPlatformPhase1 } from '../../src/db/migrations.js';

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

describe('migrateKnowledgeFabricPlatformPhase1', () => {
  it('creates Phase 23 knowledge fabric tables', async () => {
    const client = new RecordingD1Client();
    await migrateKnowledgeFabricPlatformPhase1(client);

    const joined = client.statements.join('\n');
    expect(joined).toContain('knowledge_fabric_ingest_runs');
    expect(joined).toContain('knowledge_fabric_connector_state');
    expect(joined).toContain('knowledge_fabric_external_refs');
  });
});
