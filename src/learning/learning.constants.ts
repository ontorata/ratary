/** Minimum feedback events before ranking snapshot is produced. */
export const LEARNING_MIN_FEEDBACK_EVENTS = 3;

/** Bounded multipliers applied to retrieval weights — Constitution-safe adaptation. */
export const LEARNING_WEIGHT_MULTIPLIER_MIN = 0.8;
export const LEARNING_WEIGHT_MULTIPLIER_MAX = 1.2;

export const LEARNING_DEFAULT_EVENT_BATCH = 500;
