import type { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from '../types/errors.js';
import { hasPermission, resolveRequiredPermission } from './permissions.js';

export function createPermissionMiddleware() {
  return async function enforcePermissions(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const required = resolveRequiredPermission(request.method, request.url);
    if (!required) return;

    const user = request.user;
    if (!user) return;

    if (!hasPermission(user.permissions, required)) {
      throw new ForbiddenError(`Missing required permission: ${required}`);
    }
  };
}
