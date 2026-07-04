import type { CapabilityFlags } from './capability-manifest.types.js';

/** Client declaration for capability negotiation (D7.5-03). */
export interface ClientCapabilityRequest {
  protocolVersion?: string;
  clientInfo?: {
    name: string;
    version: string;
  };
  requiredCapabilities?: string[];
  preferredCapabilities?: string[];
  transports?: string[];
}

export interface CapabilityMatchGroups {
  required: string[];
  preferred: string[];
  transports: string[];
}

export interface CapabilityNegotiationResult {
  compatible: boolean;
  negotiatedProtocolVersion: string;
  serverProtocolVersion: string;
  supportedProtocolVersions: readonly string[];
  matched: CapabilityMatchGroups;
  missing: CapabilityMatchGroups;
  /** Server capability flags that are enabled on this deployment. */
  serverEnabledCapabilities: Array<keyof CapabilityFlags & string>;
  capabilitiesUrl: string;
  negotiateUrl: string;
  clientInfo?: ClientCapabilityRequest['clientInfo'];
  timestamp: string;
}

export interface BuildCapabilityNegotiationOptions {
  capabilitiesUrl?: string;
  negotiateUrl?: string;
}
