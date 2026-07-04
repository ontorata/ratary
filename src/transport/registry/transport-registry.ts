import type { TransportSource } from '../shared/transport-context.types.js';
import type {
  ITransportRegistry,
  ITransportServer,
  TransportHealth,
} from './itransport-server.interface.js';

/**
 * Default transport registry (ADR-027 Phase 10.5).
 * Holds registered protocol servers and coordinates their lifecycle.
 * Contains no business logic — start/stop orchestration only.
 */
export class TransportRegistry implements ITransportRegistry {
  private readonly servers = new Map<TransportSource, ITransportServer>();

  register(server: ITransportServer): void {
    if (this.servers.has(server.protocol)) {
      throw new Error(`Transport already registered: ${server.protocol}`);
    }
    this.servers.set(server.protocol, server);
  }

  async startAll(): Promise<void> {
    for (const server of this.servers.values()) {
      await server.start();
    }
  }

  async stopAll(): Promise<void> {
    const stops = [...this.servers.values()].map(async (server) => {
      try {
        await server.stop();
      } catch {
        // best-effort shutdown — one failing transport must not block others
      }
    });
    await Promise.all(stops);
  }

  listActive(): TransportSource[] {
    return [...this.servers.values()]
      .filter((server) => server.health().status !== 'down')
      .map((server) => server.protocol);
  }

  health(): Record<TransportSource, TransportHealth> {
    const result = {} as Record<TransportSource, TransportHealth>;
    for (const [protocol, server] of this.servers) {
      result[protocol] = server.health();
    }
    return result;
  }
}
