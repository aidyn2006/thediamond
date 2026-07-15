package com.thediamond.domain;

public enum WalletTransactionType {
    /** One-time 500₸ "advertise TheDiamond" reward. */
    REWARD,
    /** Payout for an approved campaign work. */
    CAMPAIGN_PAYOUT,
    /** Debit when a withdrawal request is created (funds held). */
    WITHDRAWAL,
    /** Credit back when a withdrawal is rejected. */
    REFUND,
    /** Manual admin adjustment. */
    ADJUSTMENT
}
