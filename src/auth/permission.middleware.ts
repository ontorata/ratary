import type { FastifyReply, FastifyRequest } from 'fastify';
import { evaluateRestAuthorization } from './authorization-boundary.js';

export function createPermissionMiddleware() {
  return async function enforcePermissions(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const user = request.user;
    if (!user) return;

    evaluateRestAuthorization(user, request.method, request.url);
  };
}
