package com.thediamond.domain;

/**
 * DRAFT -> PENDING_REVIEW -> ACTIVE (admin) -> SOLD | ARCHIVED.
 * REJECTED goes back to the seller, who edits and resubmits.
 */
public enum ListingStatus {
    DRAFT, PENDING_REVIEW, ACTIVE, SOLD, ARCHIVED, REJECTED
}
