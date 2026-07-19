export {
  DECAY_SIGNAL_NAMES,
  DEFAULT_SIGNAL_FLOOR,
  computeDecaySignals,
} from './decay-signals.js';
export type {
  DecaySignalName,
  DecaySignals,
  DecaySignalInput,
  DecaySignalConfig,
} from './decay-signals.js';
export {
  DEFAULT_DECAY_WEIGHTS,
  parseDecayWeights,
  combineSignals,
} from './decay-score.js';
export type { DecayWeights } from './decay-score.js';
export {
  GOVERNANCE_PROTECTED_TAGS,
  CORE_IMPORTANCE_THRESHOLD,
  isProtectedMemory,
} from './protection-policy.js';
export type { ProtectionInput } from './protection-policy.js';
export { nextLifecycleState, isWithinRetentionWindow } from './lifecycle-policy.js';
export type { LifecyclePolicyConfig, LifecycleContext } from './lifecycle-policy.js';
