import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import Fastify from 'fastify';
import { resetEnvCache } from '../../src/config/env.js';
import {
  openTelemetryFastifyPlugin,
  resetOpenTelemetryStateForTests,
} from '../../src/infrastructure/observability/opentelemetry/index.js';

describe('openTelemetryFastifyPlugin', () => {
  beforeEach(() => {
    resetEnvCache();
    resetOpenTelemetryStateForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('should attach and end span per request', async () => {
    const app = Fastify({ logger: false });
    await app.register(openTelemetryFastifyPlugin);

    app.get('/health', async () => ({ ok: true }));

    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
