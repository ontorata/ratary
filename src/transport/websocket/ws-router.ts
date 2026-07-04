import type { WebSocket } from 'ws';
import { getEnv } from '../../config/index.js';
import type { TransportHandlers } from '../shared/handlers/create-transport-handlers.js';
import {
  buildTransportContextFromRestRequest,
  resolveMemoryScopeFromTransportContext,
} from '../shared/resolve-transport-scope.js';
import type { IScopeResolver } from '../../scope/iscope-resolver.interface.js';
import type { AuthUser } from '../../auth/auth.types.js';
import type { TransportContext } from '../shared/transport-context.types.js';
import { toTransportError } from '../shared/transport-errors.js';
import type {
  WsRequestEnvelope,
  WsResponseEnvelope,
  WsStreamChunkEnvelope,
} from './ws-message.envelope.js';
import type { IStreamPublisher } from '../shared/streaming/istream-publisher.interface.js';
import type { ContextChunk } from '../shared/streaming/context-chunk.types.js';

export interface WsRouterDeps {
  handlers: TransportHandlers;
  scopeResolver: IScopeResolver;
}

function wsContext(user: AuthUser | null, requestId: string): TransportContext {
  return {
    requestId,
    ownerId: user?.ownerId ?? '',
    auth: user,
    source: 'websocket',
  };
}

class WebSocketStreamPublisher implements IStreamPublisher<ContextChunk> {
  constructor(
    private readonly socket: WebSocket,
    private readonly requestId: string,
  ) {}

  async publish(chunk: ContextChunk): Promise<void> {
    const envelope: WsStreamChunkEnvelope = {
      id: this.requestId,
      op: 'context.stream',
      chunk,
      done: chunk.type === 'done',
    };
    this.socket.send(JSON.stringify(envelope));
  }

  async close(_reason?: string): Promise<void> {
    // terminal chunk already sent with done=true
  }
}

export function createWsRouter(deps: WsRouterDeps) {
  return async function handleMessage(
    socket: WebSocket,
    raw: string,
    user: AuthUser | null,
  ): Promise<void> {
    let envelope: WsRequestEnvelope;
    try {
      envelope = JSON.parse(raw) as WsRequestEnvelope;
    } catch {
      socket.send(
        JSON.stringify({
          id: 'unknown',
          ok: false,
          error: { code: 'INVALID_JSON', message: 'Invalid JSON envelope' },
        } satisfies WsResponseEnvelope),
      );
      return;
    }

    const ctx = wsContext(user, envelope.id);

    const respond = (response: WsResponseEnvelope): void => {
      socket.send(JSON.stringify(response));
    };

    try {
      switch (envelope.op) {
        case 'memory.search': {
          const payload = envelope.payload as {
            q?: string;
            project?: string;
            limit?: number;
          };
          const result = await deps.handlers.memory.search.handle(ctx, {
            q: payload.q,
            project: payload.project,
            limit: payload.limit ?? 50,
            offset: 0,
            archived: false,
          });
          respond({ id: envelope.id, ok: true, payload: result });
          break;
        }
        case 'context.build': {
          const payload = envelope.payload as Parameters<
            typeof deps.handlers.context.buildContext.handle
          >[1];
          const result = await deps.handlers.context.buildContext.handle(ctx, payload);
          respond({ id: envelope.id, ok: true, payload: result });
          break;
        }
        case 'context.stream': {
          const payload = envelope.payload as Parameters<
            typeof deps.handlers.context.streamContext.handle
          >[1];
          const { publisher: _ignored, ...request } = payload;
          await deps.handlers.context.streamContext.handle(ctx, {
            ...request,
            publisher: new WebSocketStreamPublisher(socket, envelope.id),
          });
          break;
        }
        case 'subscribe.events': {
          const env = getEnv();
          if (!env.EVENT_CONSUMERS_ENABLED) {
            respond({
              id: envelope.id,
              ok: false,
              error: { code: 'NOT_ENABLED', message: 'Event consumers are disabled' },
            });
            break;
          }
          respond({
            id: envelope.id,
            ok: false,
            error: {
              code: 'NOT_IMPLEMENTED',
              message: 'WebSocket event subscription stub — wire Phase 12 bus in a follow-up',
            },
          });
          break;
        }
        default:
          respond({
            id: envelope.id,
            ok: false,
            error: { code: 'UNKNOWN_OP', message: `Unknown operation: ${envelope.op}` },
          });
      }
    } catch (error) {
      const mapped = toTransportError(error);
      respond({
        id: envelope.id,
        ok: false,
        error: { code: mapped.code, message: mapped.message },
      });
    }
  };
}

export { resolveMemoryScopeFromTransportContext, buildTransportContextFromRestRequest };
