export function sendSuccess<T>(
  reply: import('fastify').FastifyReply,
  data: T,
  statusCode = 200,
): void {
  reply.status(statusCode).send({ success: true, data });
}

export function sendError(
  reply: import('fastify').FastifyReply,
  code: string,
  message: string,
  statusCode: number,
): void {
  reply.status(statusCode).send({
    success: false,
    error: { code, message },
  });
}
