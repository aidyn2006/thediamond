package com.thediamond.api.dto;

import com.thediamond.api.dto.ProfileDtos.BrandProfileResponse;
import com.thediamond.api.dto.ProfileDtos.CreatorProfileResponse;
import com.thediamond.api.dto.WalletDtos.WithdrawalItem;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

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

    public record AdminUser(
            Long id,
            String email,
            String role,
            boolean banned,
            Instant createdAt
    ) {}

    /** Full picture of one user for the admin profile view. */
    public record AdminUserDetail(
            Long userId,
            String email,
            String role,
            boolean banned,
            boolean emailVerified,
            Instant createdAt,
            long walletBalance,
            CreatorProfileResponse creator,
            BrandProfileResponse brand,
            List<WithdrawalItem> withdrawals
    ) {}
}
