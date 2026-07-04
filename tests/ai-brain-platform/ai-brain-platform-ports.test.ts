import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createAiBrainPlatformPorts } from '../../src/composition/create-ai-brain-platform-ports.js';

describe('AI Brain platform ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when AI_BRAIN_PLATFORM_ENABLED=false', () => {
    vi.stubEnv('AI_BRAIN_PLATFORM_ENABLED', 'false');
    resetEnvCache();
    const ports = createAiBrainPlatformPorts(new MockD1Client(), getEnv());
    expect(ports.enabled).toBe(false);
    expect(ports.webhookConsumer).toBeNull();
  });

  it('returns enabled ports with webhook consumer when webhooks enabled', () => {
    vi.stubEnv('AI_BRAIN_PLATFORM_ENABLED', 'true');
    vi.stubEnv('PLATFORM_WEBHOOKS_ENABLED', 'true');
    resetEnvCache();
    const ports = createAiBrainPlatformPorts(new MockD1Client(), getEnv());
    expect(ports.enabled).toBe(true);
    expect(ports.webhookConsumer?.name).toBe('webhook-delivery');
  });
});
