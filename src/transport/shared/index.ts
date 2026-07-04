export type {
  GrpcTransportMetadata,
  TransportContext,
  TransportSource,
} from './transport-context.types.js';
export type { IApplicationHandler } from './iapplication-handler.interface.js';

export {
  buildTransportContextFromGrpcMetadata,
  buildTransportContextFromMcpEnv,
  buildTransportContextFromRestRequest,
  extractScopeHintsFromRequest,
  mcpScopeEnvFromProcess,
  resolveMemoryScopeFromRequest,
  resolveMemoryScopeFromTransportContext,
  resolveMcpMemoryScope,
  scopeHintsFromTransportContext,
  transportSourceLabel,
} from './resolve-transport-scope.js';

export { fromAppError, toTransportError } from './transport-errors.js';

export {
  createTransportHandlers,
  createMemoryHandlers,
  createContextHandlers,
  createCapabilitiesHandlers,
  createGraphHandlers,
  createRelationHandlers,
  type TransportHandlers,
  type TransportHandlerDeps,
  type MemoryHandlers,
  type ContextHandlers,
  type CapabilitiesHandlers,
  type GraphHandlers,
  type RelationHandlers,
} from './handlers/create-transport-handlers.js';

export { resolveHandlerScope } from './handlers/resolve-handler-scope.js';
