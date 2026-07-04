/** WebSocket JSON envelope — wire only, no business logic (ADR-028 Phase 13). */
export type WsOperation =
  | 'memory.create'
  | 'memory.search'
  | 'context.build'
  | 'context.stream'
  | 'subscribe.events';

export interface WsRequestEnvelope {
  readonly id: string;
  readonly op: WsOperation;
  readonly payload: unknown;
}

export interface WsResponseEnvelope {
  readonly id: string;
  readonly ok: boolean;
  readonly payload?: unknown;
  readonly error?: { code: string; message: string };
}

export interface WsStreamChunkEnvelope {
  readonly id: string;
  readonly op: 'context.stream';
  readonly chunk: unknown;
  readonly done?: boolean;
}
