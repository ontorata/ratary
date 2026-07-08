import type { FastifyReply, FastifyRequest } from 'fastify';
import { evaluatePermissionForRequest } from './permission-context.js';

export function createPermissionMiddleware() {
  return async function enforcePermissions(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const user = request.user;
    if (!user) return;

    evaluatePermissionForRequest(user, request.method, request.url);
  };
}
