import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSync } from '@grpc/proto-loader';
import {
  credentials,
  loadPackageDefinition,
  Metadata,
  type Client,
  type ServiceError,
} from '@grpc/grpc-js';

const PROTO_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/transport/grpc/proto/ontorata/ratary/v1/ratary.proto',
);

const LOADER_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
} as const;

interface GrpcV1Clients {
  MemoryService: new (target: string, creds: ReturnType<typeof credentials.createInsecure>) => Client;
  SearchService: new (target: string, creds: ReturnType<typeof credentials.createInsecure>) => Client;
  ContextService: new (target: string, creds: ReturnType<typeof credentials.createInsecure>) => Client;
  HealthService: new (target: string, creds: ReturnType<typeof credentials.createInsecure>) => Client;
}

function loadV1Constructors(): GrpcV1Clients {
  const packageDefinition = loadSync(PROTO_PATH, LOADER_OPTIONS);
  const loaded = loadPackageDefinition(packageDefinition) as {
    ontorata: { ratary: { v1: GrpcV1Clients } };
  };
  return loaded.ontorata.ratary.v1;
}

export interface GrpcE2eHarness {
  memory: Client;
  search: Client;
  context: Client;
  health: Client;
  metadata: Metadata;
  close: () => void;
}

/** Real @grpc/grpc-js clients for integration tests (D105-01). */
export function createGrpcE2eHarness(port: number, ownerId: string): GrpcE2eHarness {
  const v1 = loadV1Constructors();
  const target = `127.0.0.1:${port}`;
  const creds = credentials.createInsecure();
  const metadata = new Metadata();
  metadata.set('owner-id', ownerId);

  const memory = new v1.MemoryService(target, creds);
  const search = new v1.SearchService(target, creds);
  const context = new v1.ContextService(target, creds);
  const health = new v1.HealthService(target, creds);

  return {
    memory,
    search,
    context,
    health,
    metadata,
    close: () => {
      memory.close();
      search.close();
      context.close();
      health.close();
    },
  };
}

export function grpcUnary<TResponse>(
  client: Client,
  method: string,
  request: unknown,
  metadata: Metadata,
): Promise<TResponse> {
  const fn = (client as Record<string, CallableFunction>)[method];
  if (typeof fn !== 'function') {
    throw new Error(`Missing gRPC client method: ${method}`);
  }

  return new Promise<TResponse>((resolve, reject) => {
    fn.call(client, request, metadata, (error: ServiceError | null, response: TResponse) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

export interface StreamedContextChunk {
  kind: string;
  payload: string;
}

export function grpcServerStream<TChunk>(
  client: Client,
  method: string,
  request: unknown,
  metadata: Metadata,
): Promise<TChunk[]> {
  const fn = (client as Record<string, CallableFunction>)[method];
  if (typeof fn !== 'function') {
    throw new Error(`Missing gRPC client method: ${method}`);
  }

  return new Promise<TChunk[]>((resolve, reject) => {
    const stream = fn.call(client, request, metadata) as NodeJS.ReadableStream;
    const chunks: TChunk[] = [];
    stream.on('data', (chunk: TChunk) => chunks.push(chunk));
    stream.on('end', () => resolve(chunks));
    stream.on('error', (error: Error) => reject(error));
  });
}
