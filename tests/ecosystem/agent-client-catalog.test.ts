import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AGENT_CLIENT_PROFILES,
  DefaultAgentClientCatalog,
  deploymentProtocolFlagsFromEnv,
} from '../../src/ecosystem/index.js';
import { AGENT_CLIENT_TYPES } from '../../src/ecosystem/types/agent-client-type.js';
import { AgentEcosystemManifestBuilder } from '../../src/ecosystem/builders/agent-ecosystem-manifest-builder.js';
import { resetEnvCache, getEnv } from '../../src/config/index.js';

describe('Agent client catalog', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('registers at least 8 named client profiles', async () => {
    const catalog = new DefaultAgentClientCatalog(getEnv());
    const profiles = await catalog.listProfiles();
    expect(profiles.length).toBeGreaterThanOrEqual(8);
    expect(profiles.length).toBe(AGENT_CLIENT_PROFILES.length);
  });

  it('covers all SSOT client types', async () => {
    const catalog = new DefaultAgentClientCatalog(getEnv());
    for (const clientType of AGENT_CLIENT_TYPES) {
      const profile = await catalog.getProfile(clientType);
      expect(profile?.clientType).toBe(clientType);
    }
  });

  it('Cursor profile recommends mcp-stdio', async () => {
    const catalog = new DefaultAgentClientCatalog(getEnv());
    const cursor = await catalog.getProfile('cursor');
    expect(cursor?.primaryProtocol).toBe('mcp-stdio');
    expect(cursor?.supportedProtocols).toContain('mcp-stdio');
  });

  it('filters grpc when GRPC_ENABLED=false', () => {
    vi.stubEnv('GRPC_ENABLED', 'false');
    resetEnvCache();
    const catalog = new DefaultAgentClientCatalog(getEnv());
    const flags = deploymentProtocolFlagsFromEnv(getEnv());
    const compatible = catalog.listCompatibleProfilesSync(flags);
    for (const profile of compatible) {
      expect(profile.supportedProtocols).not.toContain('grpc');
    }
  });

  it('includes grpc when GRPC_ENABLED=true', async () => {
    vi.stubEnv('GRPC_ENABLED', 'true');
    resetEnvCache();
    const catalog = new DefaultAgentClientCatalog(getEnv());
    const openai = await catalog.getProfile('openai-api');
    expect(openai?.supportedProtocols).toContain('grpc');
  });
});

describe('AgentEcosystemManifestBuilder', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('builds workspace-scoped memory cloud manifest', () => {
    const manifest = new AgentEcosystemManifestBuilder(getEnv()).buildSync();
    expect(manifest.memoryCloud.sharedModel).toBe('workspace-scoped');
    expect(manifest.clients.length).toBeGreaterThanOrEqual(8);
    expect(manifest.agentIdentity.mcpTools).toContain('register_agent');
    expect(manifest.externalRuntimes.sdkLocation).toBe('external');
  });
});
