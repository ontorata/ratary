import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSync } from '@grpc/proto-loader';
import { loadPackageDefinition, type ServiceDefinition } from '@grpc/grpc-js';

export interface AiBrainServiceCtor {
  service: ServiceDefinition;
}

export interface AiBrainProtoV1 {
  MemoryService: AiBrainServiceCtor;
  SearchService: AiBrainServiceCtor;
  ContextService: AiBrainServiceCtor;
  HealthService: AiBrainServiceCtor;
}

interface LoadedProto {
  ontorata: { ratary: { v1: AiBrainProtoV1 } };
}

const PROTO_RELATIVE_PATH = 'proto/ontorata/ratary/v1/ratary.proto';

/** Loads the `ontorata.ratary.v1` package definition (ADR-027 Phase 10.5E). */
export function loadAiBrainProto(): AiBrainProtoV1 {
  const here = dirname(fileURLToPath(import.meta.url));
  const protoPath = resolve(here, PROTO_RELATIVE_PATH);

  const packageDefinition = loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const loaded = loadPackageDefinition(packageDefinition) as unknown as LoadedProto;
  return loaded.ontorata.ratary.v1;
}
