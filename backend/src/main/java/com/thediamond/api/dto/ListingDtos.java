package com.thediamond.api.dto;

import com.thediamond.domain.PhoneBrand;
import com.thediamond.domain.PhoneCondition;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.List;

public final class ListingDtos {

    private ListingDtos() {}

    public record ListingRequest(
            @NotNull(message = "Выберите бренд") PhoneBrand brand,
            @NotBlank(message = "Укажите модель") @Size(max = 120) String model,
            @NotNull(message = "Укажите память") @Positive(message = "Больше нуля") Integer storageGb,
            @PositiveOrZero(message = "Не может быть отрицательным") Integer ramGb,
            @Size(max = 40) String color,
            @NotNull(message = "Выберите состояние") PhoneCondition condition,
            @Min(value = 1, message = "От 1 до 100") @Max(value = 100, message = "От 1 до 100") Integer batteryHealth,
            @NotNull(message = "Укажите цену") @Positive(message = "Больше нуля") Integer price,
            @NotBlank(message = "Укажите город") @Size(max = 80) String city,
            @NotBlank(message = "Опишите телефон") @Size(max = 3000) String description,
            @Size(max = 10, message = "До 10 фотографий") List<@Size(max = 500) String> images
    ) {}

    /** Card in the catalog / "мои объявления" grid. */
    public record ListingSummary(
            Long id,
            String title,
            PhoneBrand brand,
            String model,
            Integer storageGb,
            PhoneCondition condition,
            Integer batteryHealth,
            int price,
            String city,
            String coverUrl,
            String status,
            int views,
            Instant createdAt
    ) {}

    /** Seller's own row: card + how many buyers are waiting. */
    public record MyListingItem(
            ListingSummary listing,
            long dealRequests,
            long favorites,
            String rejectReason
    ) {}

    /** Full listing page. Seller contacts are filled only when the viewer may see them. */
    public record ListingDetail(
            Long id,
            String title,
            PhoneBrand brand,
            String model,
            Integer storageGb,
            Integer ramGb,
            String color,
            PhoneCondition condition,
            Integer batteryHealth,
            int price,
            String city,
            String description,
            String status,
            int views,
            Instant createdAt,
            List<String> images,
            SellerCard seller,
            boolean isMine,
            boolean favorite,
            String myDealStatus,
            boolean canRequest,
            String requestBlockReason
    ) {}

    /** Seller block on the listing page. {@code phone} is null until the deal is accepted. */
    public record SellerCard(
            Long id,
            String displayName,
            String avatarUrl,
            String city,
            String phone,
            Instant memberSince,
            long activeListings
    ) {}

    /** Unauthenticated card — no seller contacts, used by the public catalog and sitemap. */
    public record PublicListing(
            Long id,
            String title,
            PhoneBrand brand,
            String model,
            Integer storageGb,
            Integer ramGb,
            String color,
            PhoneCondition condition,
            Integer batteryHealth,
            int price,
            String city,
            String description,
            List<String> images,
            String sellerName,
            Long sellerId,
            Instant createdAt
    ) {}

    /** Sitemap row: a seller worth indexing + when their catalog last changed. */
    public record SellerRef(Long id, Instant updatedAt) {}

    /** Public seller page: profile head + their active listings. */
    public record PublicSeller(
            Long id,
            String displayName,
            String avatarUrl,
            String city,
            String about,
            Instant memberSince,
            List<ListingSummary> listings
    ) {}
}
