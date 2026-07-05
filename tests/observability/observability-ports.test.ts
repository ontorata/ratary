import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { createObservabilityPorts } from '../../src/composition/create-observability-ports.js';

describe('Observability ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when OBSERVABILITY_PLATFORM=false', () => {
    vi.stubEnv('OBSERVABILITY_PLATFORM', 'false');
    resetEnvCache();
    const ports = createObservabilityPorts(getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.metricsExporter.exportPrometheusText()).toBe('');
  });

  it('returns enabled ports with metric catalog when OBSERVABILITY_PLATFORM=true', () => {
    vi.stubEnv('OBSERVABILITY_PLATFORM', 'true');
    vi.stubEnv('OBS_LOG_SHIPPER', 'none');
    resetEnvCache();
    const ports = createObservabilityPorts(getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.metricsExporter.listRegisteredMetrics().length).toBeGreaterThanOrEqual(10);
  });
});
