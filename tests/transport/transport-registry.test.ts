import { describe, it, expect } from 'vitest';
import { TransportRegistry } from '../../src/transport/registry/transport-registry.js';
import type {
  ITransportServer,
  TransportHealth,
} from '../../src/transport/registry/itransport-server.interface.js';
import type { TransportSource } from '../../src/transport/shared/transport-context.types.js';

function fakeServer(
  protocol: TransportSource,
  log: string[],
  opts: { healthy?: boolean } = {},
): ITransportServer {
  let started = false;
  return {
    protocol,
    async start() {
      started = true;
      log.push(`start:${protocol}`);
    },
    async stop() {
      started = false;
      log.push(`stop:${protocol}`);
    },
    health(): TransportHealth {
      if (opts.healthy === false) return { status: 'down' };
      return { status: started ? 'ok' : 'down' };
    },
  };
}

describe('TransportRegistry (Phase 10.5)', () => {
  it('starts and stops all registered servers', async () => {
    const log: string[] = [];
    const registry = new TransportRegistry();
    registry.register(fakeServer('rest', log));
    registry.register(fakeServer('grpc', log));

    await registry.startAll();
    expect(log).toEqual(['start:rest', 'start:grpc']);
    expect(registry.listActive().sort()).toEqual(['grpc', 'rest']);

    await registry.stopAll();
    expect(log).toContain('stop:rest');
    expect(log).toContain('stop:grpc');
  });

  it('rejects duplicate protocol registration', () => {
    const registry = new TransportRegistry();
    registry.register(fakeServer('rest', []));
    expect(() => registry.register(fakeServer('rest', []))).toThrow(/already registered/);
  });

  it('listActive excludes down servers and health reports per protocol', async () => {
    const registry = new TransportRegistry();
    registry.register(fakeServer('rest', []));
    registry.register(fakeServer('grpc', [], { healthy: false }));
    await registry.startAll();

    expect(registry.listActive()).toEqual(['rest']);
    expect(registry.health().rest.status).toBe('ok');
    expect(registry.health().grpc.status).toBe('down');
  });
});
