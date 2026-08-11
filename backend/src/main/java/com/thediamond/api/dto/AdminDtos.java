package com.thediamond.api.dto;

import com.thediamond.api.dto.ListingDtos.ListingSummary;
import com.thediamond.api.dto.ProfileDtos.ProfileResponse;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class AdminDtos {

    private AdminDtos() {}

    /** Reason shown to the seller when a listing is rejected. */
    public record ModerationDecision(@Size(max = 500) String reason) {}

    public record StatsResponse(
            long users,
            long activeListings,
            long pendingListings,
            long deals
    ) {}

    public record AdminUser(
            Long id,
            String email,
            String role,
            boolean banned,
            Instant createdAt
    ) {}

    /** Full picture of one member for the admin user view. */
    public record AdminUserDetail(
            Long userId,
            String email,
            String role,
            boolean banned,
            boolean emailVerified,
            Instant createdAt,
            ProfileResponse profile,
            List<ListingSummary> listings
    ) {}
}
