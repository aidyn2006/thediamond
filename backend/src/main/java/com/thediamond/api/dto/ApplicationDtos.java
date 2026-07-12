package com.thediamond.api.dto;

import com.thediamond.api.dto.CampaignDtos.CampaignSummary;
import com.thediamond.api.dto.ProfileDtos.CreatorProfileResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ApplicationDtos {

    private ApplicationDtos() {}

    /** Creator's own application row (with campaign context). */
    public record MyApplication(
            Long id,
            String status,
            String submissionUrl,
            String rejectReason,
            boolean resubmitUsed,
            Instant appliedAt,
            CampaignSummary campaign
    ) {}

    /** Application as the brand sees it on the manage screen (with creator profile). */
    public record BrandApplication(
            Long id,
            String status,
            String submissionUrl,
            String rejectReason,
            boolean resubmitUsed,
            Instant appliedAt,
            Instant submittedAt,
            CreatorProfileResponse creator
    ) {}

    public record SubmitWorkRequest(
            @NotBlank(message = "Вставьте ссылку на публикацию") @Size(max = 500) String submissionUrl
    ) {}

    public record RejectWorkRequest(
            @NotBlank(message = "Укажите причину") @Size(max = 500) String reason
    ) {}
}
