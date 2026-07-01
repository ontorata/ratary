import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../types/errors.js';

export async function errorHandlerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler(
    (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
      if (error instanceof ZodError) {
        const validationError = new ValidationError('Validation failed', error.flatten());
        return reply.status(validationError.statusCode).send({
          error: validationError.code,
          message: validationError.message,
          details: validationError.details,
        });
      }

      if (error instanceof AppError) {
        request.log.warn({ err: error, code: error.code }, error.message);
        return reply.status(error.statusCode).send({
          error: error.code,
          message: error.message,
          ...(error instanceof ValidationError && error.details
            ? { details: error.details }
            : {}),
        });
      }

      request.log.error({ err: error }, 'Unhandled error');
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      });
    },
  );
}
