import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createKnowledgeFabricPorts } from '../../src/composition/create-knowledge-fabric-ports.js';
import { createMemoryService } from '../../src/services/create-memory-service.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { createKnowledgeFabricPorts } from '../../src/composition/create-knowledge-fabric-ports.js';

describe('Knowledge fabric ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when KNOWLEDGE_FABRIC_ENABLED=false', () => {
    vi.stubEnv('KNOWLEDGE_FABRIC_ENABLED', 'false');
    resetEnvCache();
    const sql = new MockD1Client();
    const memoryService = createMemoryService(sql, new MemoryRepository(sql));
    const ports = createKnowledgeFabricPorts(sql, getEnv(), memoryService);
    expect(ports.enabled).toBe(false);
  });

  it('returns enabled ports when KNOWLEDGE_FABRIC_ENABLED=true', () => {
    vi.stubEnv('KNOWLEDGE_FABRIC_ENABLED', 'true');
    vi.stubEnv(
      'KNOWLEDGE_FABRIC_CATALOG_JSON',
      JSON.stringify({
        notion: [
          {
            externalId: 'n1',
            title: 'Doc',
            body: 'Content',
            updatedAt: '2026-07-04T00:00:00.000Z',
            metadata: {},
          },
        ],
      }),
    );
    resetEnvCache();
    const sql = new MockD1Client();
    const memoryService = createMemoryService(sql, new MemoryRepository(sql));
    const ports = createKnowledgeFabricPorts(sql, getEnv(), memoryService);
    expect(ports.enabled).toBe(true);
    const connectors = ports.orchestrator.listConnectors();
    expect(connectors.find((c) => c.id === 'notion')?.configured).toBe(true);
  });
});
