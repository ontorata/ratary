import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createGlobalIntelligencePorts } from '../../src/composition/create-global-intelligence-ports.js';
import { InMemoryUsageMeter } from '../../src/cloud/adapters/in-memory-usage-meter.js';

describe('Global intelligence ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false', () => {
    vi.stubEnv('GLOBAL_INTELLIGENCE_PLATFORM_ENABLED', 'false');
    resetEnvCache();
    const ports = createGlobalIntelligencePorts(new MockD1Client(), getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.telemetryConsumer).toBeNull();
  });

  it('returns enabled ports with telemetry consumer when flag is on', () => {
    vi.stubEnv('GLOBAL_INTELLIGENCE_PLATFORM_ENABLED', 'true');
    resetEnvCache();
    const ports = createGlobalIntelligencePorts(new MockD1Client(), getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.telemetryConsumer?.name).toBe('intelligence-telemetry');
  });

  it('wires Phase 18 usage meter into analytics when enabled', async () => {
    vi.stubEnv('GLOBAL_INTELLIGENCE_PLATFORM_ENABLED', 'true');
    resetEnvCache();
    const meter = new InMemoryUsageMeter();
    const ports = createGlobalIntelligencePorts(new MockD1Client(), getEnv(), undefined, {
      usageMeter: meter,
      usageMeterEnabled: true,
    });

    const scope = { ownerId: 'owner-meter' };
    const window = {
      from: new Date(Date.now() - 86400000).toISOString(),
      to: new Date(Date.now() + 86400000).toISOString(),
    };
    await meter.recordUsage({
      ownerId: scope.ownerId,
      metricType: 'embedding.request',
      quantity: 4,
      occurredAt: new Date().toISOString(),
    });

    const report = await ports.analyticsService.cost(scope, window);
    expect(report.source).toBe('meter');
    expect(report.modelInvocations).toBe(4);
  });
});
