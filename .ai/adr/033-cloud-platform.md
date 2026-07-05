# ADR-033: Cloud Platform — Multi-Region, Control Plane, Metering (Phase 18)

**Status:** Implemented  
**Date:** 2026-07-04  
**Deciders:** Project owner  

---

## Context

Phase 14 federation enables cross-node knowledge exchange. Enterprise cloud deployments need **workspace provisioning**, multi-region topology, control plane vs data plane separation, usage metering, subscription scope, DR backup/restore — provider-agnostic.

## Problem

- No control plane API for tenant/workspace lifecycle at scale.
- Metering/billing scope undefined.
- DR runbooks not platformized.

## Constraints

- Control plane orchestrates **metadata** — data plane remains MemoryService + ports.
- No cloud vendor lock-in — `ICloudProvisioner` port with adapters.
- Tenant isolation = existing scope model extended, not rewritten.

## Decision

1. `IControlPlane` port — workspace provisioning, API key lifecycle, region assignment.
2. `IUsageMeter` port — event-driven (Phase 12) metrics for billing export.
3. `IDisasterRecovery` port — backup/restore orchestration (uses existing backup + federation).
4. Reference adapters: manual config, K8s hook, Terraform output consumer (not TF in repo).

Data plane **unchanged**.

## Rollback

`CONTROL_PLANE_ENABLED=false`.

## Implementation

See [Phase 18 IMPLEMENTATION](../phases/18-cloud-platform/IMPLEMENTATION.md).

## References

- ADR-008, Phase 14, Phase 18 DESIGN
