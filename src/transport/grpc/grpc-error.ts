import { status as GrpcStatus, type ServiceError } from '@grpc/grpc-js';
import { toTransportError } from '../shared/transport-errors.js';

function httpToGrpcStatus(statusCode: number): GrpcStatus {
  switch (statusCode) {
    case 400:
      return GrpcStatus.INVALID_ARGUMENT;
    case 401:
      return GrpcStatus.UNAUTHENTICATED;
    case 403:
      return GrpcStatus.PERMISSION_DENIED;
    case 404:
      return GrpcStatus.NOT_FOUND;
    case 409:
      return GrpcStatus.ALREADY_EXISTS;
    case 429:
      return GrpcStatus.RESOURCE_EXHAUSTED;
    default:
      return statusCode >= 500 ? GrpcStatus.INTERNAL : GrpcStatus.UNKNOWN;
  }
}

/** Maps a domain/application error to a gRPC ServiceError (ADR-027 Phase 10.5E). */
export function toGrpcError(error: unknown): ServiceError {
  const payload = toTransportError(error);
  return Object.assign(new Error(payload.message), {
    code: httpToGrpcStatus(payload.statusCode),
    details: payload.message,
    name: payload.code,
  }) as unknown as ServiceError;
}
