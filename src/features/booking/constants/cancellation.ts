/** Flat fee when cancelling a refundable fare (per fare-paying passenger). */
export const CANCELLATION_FEE_REFUNDABLE_PER_PASSENGER = 40;

/** Minimum fee applied on refundable cancellations (absolute). */
export const CANCELLATION_FEE_REFUNDABLE_MINIMUM = 25;

/**
 * Non-refundable fares forfeit the base fare; ancillaries may still refund
 * partially. This rate is the share of ancillary costs retained as fee.
 */
export const CANCELLATION_ANCILLARY_RETENTION_RATE = 0.25;
