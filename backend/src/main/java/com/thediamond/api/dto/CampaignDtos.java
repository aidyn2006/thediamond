package com.thediamond.api.dto;

import com.thediamond.domain.Category;
import com.thediamond.domain.Platform;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public final class CampaignDtos {

    private CampaignDtos() {}

    public record CampaignRequest(
            @NotBlank(message = "Введите название") @Size(max = 200) String title,
            @NotBlank(message = "Опишите задачу") @Size(max = 3000) String description,
            @NotEmpty(message = "Выберите хотя бы одну площадку") Set<Platform> platforms,
            @NotNull(message = "Выберите категорию") Category category,
            @NotNull(message = "Укажите вознаграждение") @Positive(message = "Больше нуля") Integer rewardPerCreator,
            @NotNull(message = "Сколько нужно креаторов?") @Positive(message = "Больше нуля") Integer creatorsNeeded,
            @NotNull(message = "Укажите дедлайн") @Future(message = "Дата в будущем") LocalDate deadline,
            @NotBlank(message = "Опишите требования") @Size(max = 3000) String requirements
    ) {}

    public record CampaignSummary(
            Long id,
            String title,
            String brandName,
            Category category,
            List<Platform> platforms,
            int rewardPerCreator,
            int creatorsNeeded,
            int slotsLeft,
            LocalDate deadline,
            String status,
            Instant createdAt
    ) {}

    public record CampaignCounters(
            long applications,
            long accepted,
            long submitted,
            long approved
    ) {}

    /** Brand dashboard row: summary + counters. */
    public record BrandCampaignItem(
            CampaignSummary campaign,
            CampaignCounters counters
    ) {}

    /** Feed row for creators: summary + this creator's application status (nullable). */
    public record CampaignFeedItem(
            CampaignSummary campaign,
            String myApplicationStatus
    ) {}

    /** Creator-facing detail: full info + apply availability. */
    public record CampaignDetail(
            Long id,
            String title,
            String brandName,
            Category category,
            List<Platform> platforms,
            int rewardPerCreator,
            int creatorsNeeded,
            int slotsLeft,
            LocalDate deadline,
            String status,
            Instant createdAt,
            String description,
            String requirements,
            long budget,
            String myApplicationStatus,
            boolean canApply,
            String applyBlockReason
    ) {}

    /** Full campaign — brand's own detail / edit prefill / admin moderation view. */
    public record CampaignFull(
            Long id,
            String title,
            String brandName,
            Category category,
            List<Platform> platforms,
            int rewardPerCreator,
            int creatorsNeeded,
            int slotsLeft,
            LocalDate deadline,
            String status,
            Instant createdAt,
            String description,
            String requirements,
            String rejectReason,
            long budget
    ) {}
}
