import { getEnv } from '../../config/index.js';
import { RestTransportServer, type RestTransportOptions } from '../rest/rest-transport-server.js';
import { TransportRegistry } from './transport-registry.js';

export interface StartTransportsOptions {
  rest?: RestTransportOptions;
}

/**
 * Composition root for transport servers (ADR-027 Phase 10.5).
 * Always starts REST; starts gRPC only when GRPC_ENABLED=true. The gRPC module
 * is dynamically imported so `@grpc/grpc-js` is not loaded on the default path.
 */
export async function startTransports(
  options: StartTransportsOptions = {},
): Promise<TransportRegistry> {
  const env = getEnv();
  const registry = new TransportRegistry();

  registry.register(new RestTransportServer(options.rest));

  if (env.GRPC_ENABLED) {
    const { GrpcTransportServer } = await import('../grpc/grpc-server.js');
    registry.register(new GrpcTransportServer());
  }

  await registry.startAll();
  return registry;
}
