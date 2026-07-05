import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IScopeResolver } from '../scope/iscope-resolver.interface.js';
import type { Env } from '../config/env.js';
import { resolveMemoryScopeFromRequest } from '../scope/resolve-request-scope.js';
import { createCompressionPorts } from '../composition/create-compression-ports.js';

export interface CompressAdminBody {
  dryRun?: boolean;
  project?: string;
}

export function createCompressionAdminController(
  scopeResolver: IScopeResolver,
  sql: ISqlDatabase,
  env: Env,
) {
  return {
    async compress(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const scope = await resolveMemoryScopeFromRequest(request, scopeResolver);
      const body = (request.body ?? {}) as CompressAdminBody;
      const { runner } = createCompressionPorts(sql, env);
      const report = await runner.run(scope, {
        dryRun: body.dryRun ?? true,
        projectId: body.project,
      });
      reply.send(report);
    },
  };
}

export type CompressionAdminController = ReturnType<typeof createCompressionAdminController>;
