package com.thediamond.domain;

/**
 * REQUESTED -> ACCEPTED (seller shares contacts) -> COMPLETED.
 * DECLINED by the seller, CANCELLED by the buyer.
 */
public enum DealStatus {
    REQUESTED, ACCEPTED, DECLINED, COMPLETED, CANCELLED
}
