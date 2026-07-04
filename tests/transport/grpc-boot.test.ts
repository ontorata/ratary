import { describe, it, expect, afterEach, vi } from 'vitest';
import { setD1Client, resetD1Client } from '../../src/db/index.js';
import { resetEnvCache } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { GrpcTransportServer } from '../../src/transport/grpc/grpc-server.js';

vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
vi.stubEnv('D1_DATABASE_ID', 'test-database');
vi.stubEnv('D1_API_TOKEN', 'test-token');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('GRPC_ENABLED', 'true');
vi.stubEnv('GRPC_PORT', '0');

describe('GrpcTransportServer boot (Phase 10.5E)', () => {
  let server: GrpcTransportServer | null = null;

  afterEach(async () => {
    if (server) {
      await server.stop();
      server = null;
    }
    resetD1Client();
    resetEnvCache();
  });

  it('binds an insecure listener and reports healthy, then shuts down', async () => {
    resetEnvCache();
    resetD1Client();
    setD1Client(new MockD1Client());

    server = new GrpcTransportServer();
    await server.start();

    const health = server.health();
    expect(health.status).toBe('ok');
    expect(health.details?.protoVersion).toBe('v1');
    expect(server.protocol).toBe('grpc');

    await server.stop();
    expect(server.health().status).toBe('down');
    server = null;
  });
});
