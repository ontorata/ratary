import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createSearchGraphPorts } from '../../src/composition/create-search-graph-ports.js';

describe('Search graph ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when SEARCH_GRAPH_PLATFORM_ENABLED=false', () => {
    vi.stubEnv('SEARCH_GRAPH_PLATFORM_ENABLED', 'false');
    resetEnvCache();
    const ports = createSearchGraphPorts(new MockD1Client(), getEnv());
    expect(ports.enabled).toBe(false);
  });

  it('returns enabled ports when SEARCH_GRAPH_PLATFORM_ENABLED=true', () => {
    vi.stubEnv('SEARCH_GRAPH_PLATFORM_ENABLED', 'true');
    vi.stubEnv('MEILISEARCH_HOST', 'http://127.0.0.1:7700');
    vi.stubEnv('MEILISEARCH_INDEX', 'memories');
    resetEnvCache();
    const ports = createSearchGraphPorts(new MockD1Client(), getEnv());
    expect(ports.enabled).toBe(true);
  });
});
