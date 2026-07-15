package com.thediamond.api.dto;

import com.thediamond.domain.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class SocialProofDtos {

    private SocialProofDtos() {}

    public record SocialProofRequest(
            @NotNull(message = "Выберите площадку") Platform platform,
            @NotBlank(message = "Добавьте ссылку на публикацию") @Size(max = 500) String postUrl,
            @Size(max = 500) String screenshotUrl
    ) {}

    public record SocialProofResponse(
            Long id,
            String platform,
            String postUrl,
            String screenshotUrl,
            String verificationCode,
            String status,
            String rejectReason,
            Instant createdAt,
            Instant reviewedAt
    ) {}

    public record SocialProofState(
            String verificationCode,
            SocialProofResponse proof
    ) {}
}
