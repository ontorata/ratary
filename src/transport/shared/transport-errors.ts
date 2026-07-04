import { AppError, ValidationError } from '../../types/errors.js';

/** Protocol-agnostic error payload for REST, MCP, and gRPC mappers. */
export interface TransportErrorPayload {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

export function fromAppError(error: AppError): TransportErrorPayload {
  const payload: TransportErrorPayload = {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
  };

  if (error instanceof ValidationError && error.details !== undefined) {
    payload.details = error.details;
  }

  return payload;
}

/** Maps domain/application errors to a transport-neutral shape. */
export function toTransportError(error: unknown): TransportErrorPayload {
  if (error instanceof AppError) {
    return fromAppError(error);
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}
