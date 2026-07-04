import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import type { SignalIngestDeps } from '../ingest/process-signal-ingest.js';
import { processSignalIngest } from '../ingest/process-signal-ingest.js';

export function createSignalsController(
  scopeResolver: IScopeResolver,
  ingestDeps: SignalIngestDeps,
) {
  return {
    async ingest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const result = await processSignalIngest(scope, request.body, ingestDeps);
      reply.send(result);
    },
  };
}

export type SignalsController = ReturnType<typeof createSignalsController>;
