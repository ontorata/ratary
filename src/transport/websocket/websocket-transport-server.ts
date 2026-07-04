import { WebSocketServer, type WebSocket } from 'ws';
import type { Server } from 'node:http';
import { getEnv } from '../../config/index.js';
import type { ITransportServer, TransportHealth } from '../registry/itransport-server.interface.js';
import type { TransportHandlers } from '../shared/handlers/create-transport-handlers.js';
import type { IScopeResolver } from '../../scope/iscope-resolver.interface.js';
import type { AuthUser } from '../../auth/auth.types.js';
import { createWsRouter } from './ws-router.js';

export interface WebSocketTransportDeps {
  handlers: TransportHandlers;
  scopeResolver: IScopeResolver;
  /** Optional auth resolver — maps upgrade request headers to user. */
  authenticate?: (headers: Record<string, string | string[] | undefined>) => AuthUser | null;
}

/**
 * WebSocket protocol adapter (ADR-028 Phase 13C).
 * Attaches to an existing Node HTTP server (shared with Fastify REST).
 */
export class WebSocketTransportServer implements ITransportServer {
  readonly protocol = 'websocket' as const;
  private wss: WebSocketServer | null = null;

  constructor(
    private readonly httpServer: Server,
    private readonly deps: WebSocketTransportDeps,
  ) {}

  async start(): Promise<void> {
    if (this.wss) return;
    const env = getEnv();
    const path = env.WEBSOCKET_PATH;
    const handleMessage = createWsRouter(this.deps);

    this.wss = new WebSocketServer({ noServer: true });

    this.httpServer.on('upgrade', (request, socket, head) => {
      const url = request.url ?? '';
      if (!url.startsWith(path)) return;

      this.wss!.handleUpgrade(request, socket, head, (ws) => {
        this.wss!.emit('connection', ws, request);
      });
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      const user = this.deps.authenticate?.(request.headers) ?? null;

      ws.on('message', (data) => {
        void handleMessage(ws, data.toString(), user);
      });
    });
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve) => {
      if (!this.wss) {
        resolve();
        return;
      }
      this.wss.close(() => resolve());
    });
    this.wss = null;
  }

  health(): TransportHealth {
    return { status: this.wss ? 'ok' : 'down', details: { path: getEnv().WEBSOCKET_PATH } };
  }
}
