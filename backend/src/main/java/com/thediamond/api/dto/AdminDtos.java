package com.thediamond.api.dto;

import jakarta.validation.constraints.Size;

public final class AdminDtos {

    private AdminDtos() {}

    /** Optional reason (used for the notification email; profiles have no persisted reject state). */
    public record ModerationDecision(@Size(max = 500) String reason) {}

    public record StatsResponse(
            long creators,
            long brands,
            long activeCampaigns,
            long applications
    ) {}
}
