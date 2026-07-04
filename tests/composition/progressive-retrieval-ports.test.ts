import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createProgressiveRetrievalPorts } from '../../src/composition/create-progressive-retrieval-ports.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';

describe('createProgressiveRetrievalPorts (Phase 6.5)', () => {
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

  it('wires default policy and deployment flags from env', () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'false');
    vi.stubEnv('GRAPH_RETRIEVAL', 'false');
    vi.stubEnv('RETRIEVAL_POLICY_VERSION', '1');
    resetEnvCache();

    const ports = createProgressiveRetrievalPorts(getEnv());
    expect(ports.policy).toBeDefined();
    expect(ports.deployment.hybridRetrieval).toBe(false);
    expect(ports.deployment.graphRetrieval).toBe(false);

    const plan = ports.policy.resolve({}, 3, ports.deployment);
    expect(plan.policyVersion).toBe('1');
    expect(plan.stagesApplied).toEqual(['metadata', 'summary']);
  });

  it('reflects hybrid and graph flags in deployment capabilities', () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'true');
    vi.stubEnv('GRAPH_RETRIEVAL', 'true');
    resetEnvCache();

    const ports = createProgressiveRetrievalPorts(getEnv());
    expect(ports.deployment.hybridRetrieval).toBe(true);
    expect(ports.deployment.graphRetrieval).toBe(true);

    const plan = ports.policy.resolve({}, 2, ports.deployment);
    expect(plan.stagesApplied).toContain('vector');
    expect(plan.stagesApplied).toContain('graph');
    expect(plan.stagesApplied).toContain('relations');
  });

  it('selects legacy policy when RETRIEVAL_POLICY=legacy', () => {
    vi.stubEnv('RETRIEVAL_POLICY', 'legacy');
    resetEnvCache();

    const ports = createProgressiveRetrievalPorts(getEnv());
    const plan = ports.policy.resolve({ limit: 8 }, 4, ports.deployment);
    expect(plan.policyVersion).toBe('legacy');
  });

  it('selects adaptive policy when RETRIEVAL_POLICY=adaptive', () => {
    vi.stubEnv('RETRIEVAL_POLICY', 'adaptive');
    resetEnvCache();

    const ports = createProgressiveRetrievalPorts(getEnv());
    const plan = ports.policy.resolve({}, 2, ports.deployment);
    expect(plan.policyVersion).toBe('adaptive-1');
  });
});
