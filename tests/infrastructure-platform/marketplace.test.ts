import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { LocalProviderMarketplace } from '../../src/infrastructure-platform/adapters/local-provider-marketplace.js';

describe('LocalProviderMarketplace', () => {
  it('loads catalog.json from repo', async () => {
    const marketplace = new LocalProviderMarketplace({
      catalogPath: join(process.cwd(), 'infrastructure', 'marketplace', 'catalog.json'),
    });
    const catalog = await marketplace.getCatalog();
    expect(catalog.catalogVersion).toBe('1.0.0');
    expect(catalog.entries.length).toBe(9);
  });

  it('returns entry by plugin id', async () => {
    const marketplace = new LocalProviderMarketplace({
      catalogPath: join(process.cwd(), 'infrastructure', 'marketplace', 'catalog.json'),
    });
    const entry = await marketplace.getEntry('embedding-openai');
    expect(entry?.displayName).toContain('OpenAI');
  });

  it('searches catalog by query', async () => {
    const marketplace = new LocalProviderMarketplace({
      catalogPath: join(process.cwd(), 'infrastructure', 'marketplace', 'catalog.json'),
    });
    const results = await marketplace.search('neo4j');
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('graph-neo4j');
  });
});
