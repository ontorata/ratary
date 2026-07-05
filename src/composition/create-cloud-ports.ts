import type { Env } from '../config/env.js';
import type { IdentityService } from '../auth/identity.service.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IEventConsumer } from '../events/ievent-consumer.interface.js';
import type { FederationNodeDescriptor } from '../federation/types/federation-node.descriptor.js';
import {
  ControlPlaneService,
  NoOpCloudProvisioner,
  NoOpControlPlane,
  NoOpDisasterRecovery,
  NoOpUsageMeter,
  ManualCloudProvisioner,
  LocalDisasterRecovery,
  UsageMeterEventConsumer,
  type IControlPlane,
  type IDisasterRecovery,
  type IUsageMeter,
  type ICloudProvisioner,
} from '../cloud/index.js';
import { SqlRegionRegistry } from '../infrastructure/cloud/sql-region-registry.js';
import { SqlTenantMetadataStore } from '../infrastructure/cloud/sql-tenant-metadata-store.js';
import { SqlUsageMeter } from '../infrastructure/cloud/sql-usage-meter.js';
import { InMemoryUsageMeter } from '../cloud/adapters/in-memory-usage-meter.js';
import type { MemoryScope } from '../types/memory-scope.js';

export interface CloudPorts {
  enabled: boolean;
  usageMeterEnabled: boolean;
  drEnabled: boolean;
  controlPlane: IControlPlane;
  usageMeter: IUsageMeter;
  disasterRecovery: IDisasterRecovery;
  cloudProvisioner: ICloudProvisioner;
  eventConsumers: IEventConsumer[];
}

export type BackupExportFn = (scope: MemoryScope) => Promise<{ memories: unknown[] }>;

function parsePeerList(raw: string | undefined): FederationNodeDescriptor[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as FederationNodeDescriptor[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Composition root for Phase 18 cloud platform (ADR-033).
 * Gated by CONTROL_PLANE_ENABLED — default off preserves pre-Phase-18 behavior.
 */
export function createCloudPorts(
  sql: ISqlDatabase,
  env: Env,
  deps?: {
    identityService?: IdentityService;
    exportBackup?: BackupExportFn;
  },
): CloudPorts {
  const noop: CloudPorts = {
    enabled: false,
    usageMeterEnabled: false,
    drEnabled: false,
    controlPlane: new NoOpControlPlane(),
    usageMeter: new NoOpUsageMeter(),
    disasterRecovery: new NoOpDisasterRecovery(),
    cloudProvisioner: new NoOpCloudProvisioner(),
    eventConsumers: [],
  };

  if (!env.CONTROL_PLANE_ENABLED) {
    return noop;
  }

  const regionRegistry = new SqlRegionRegistry(sql);
  const tenantStore = new SqlTenantMetadataStore(sql);

  const cloudProvisioner =
    env.CLOUD_PROVISIONER === 'manual' ? new ManualCloudProvisioner() : new NoOpCloudProvisioner();

  void regionRegistry.ensureDefaultRegion(env.CLOUD_DEFAULT_REGION, 'Default Region');

  const controlPlane = new ControlPlaneService(
    tenantStore,
    regionRegistry,
    deps?.identityService ?? null,
    cloudProvisioner,
    {
      defaultRegionCode: env.CLOUD_DEFAULT_REGION,
      federationEnabled: env.FEDERATION_ENABLED,
      localNodeId: env.FEDERATION_NODE_ID,
      federationPeers: parsePeerList(env.FEDERATION_PEERS_JSON),
    },
  );

  const usageMeter: IUsageMeter =
    env.USAGE_METER_ENABLED && env.USAGE_METER_STORE === 'sql'
      ? new SqlUsageMeter(sql)
      : env.USAGE_METER_ENABLED
        ? new InMemoryUsageMeter()
        : new NoOpUsageMeter();

  const eventConsumers: IEventConsumer[] = [];
  if (env.USAGE_METER_ENABLED && !(usageMeter instanceof NoOpUsageMeter)) {
    eventConsumers.push(new UsageMeterEventConsumer(usageMeter));
  }

  const exportBackup = deps?.exportBackup ?? (async () => ({ memories: [] }));

  const disasterRecovery: IDisasterRecovery = env.DR_PLATFORM_ENABLED
    ? new LocalDisasterRecovery(sql, regionRegistry, exportBackup)
    : new NoOpDisasterRecovery();

  return {
    enabled: true,
    usageMeterEnabled: env.USAGE_METER_ENABLED,
    drEnabled: env.DR_PLATFORM_ENABLED,
    controlPlane,
    usageMeter,
    disasterRecovery,
    cloudProvisioner,
    eventConsumers,
  };
}
