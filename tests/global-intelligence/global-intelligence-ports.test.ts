import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createGlobalIntelligencePorts } from '../../src/composition/create-global-intelligence-ports.js';

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
});
