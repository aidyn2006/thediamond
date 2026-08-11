package com.thediamond.profile;

import com.thediamond.api.dto.ListingDtos.ListingSummary;
import com.thediamond.api.dto.ListingDtos.PublicListing;
import com.thediamond.api.dto.ProfileDtos.ProfileResponse;
import com.thediamond.domain.Listing;
import com.thediamond.domain.ListingImage;
import com.thediamond.domain.UserProfile;

import java.util.List;

public final class Mappers {

    private Mappers() {}

    public static ProfileResponse toProfileResponse(UserProfile p) {
        return new ProfileResponse(
                p.getId(),
                p.getUser().getEmail(),
                p.getDisplayName(),
                p.getPhone(),
                p.getCity(),
                p.getAvatarUrl(),
                p.getAbout(),
                p.getCreatedAt()
        );
    }

    public static ListingSummary toSummary(Listing l) {
        return new ListingSummary(
                l.getId(),
                l.getTitle(),
                l.getBrand(),
                l.getModel(),
                l.getStorageGb(),
                l.getCondition(),
                l.getBatteryHealth(),
                l.getPrice(),
                l.getCity(),
                l.getCoverUrl(),
                l.getStatus().name(),
                l.getViews(),
                l.getCreatedAt()
        );
    }

    public static List<String> imageUrls(Listing l) {
        return l.getImages().stream().map(ListingImage::getUrl).toList();
    }

    /** Public card — no seller phone, no moderation fields. */
    public static PublicListing toPublicListing(Listing l, String sellerName) {
        return new PublicListing(
                l.getId(),
                l.getTitle(),
                l.getBrand(),
                l.getModel(),
                l.getStorageGb(),
                l.getRamGb(),
                l.getColor(),
                l.getCondition(),
                l.getBatteryHealth(),
                l.getPrice(),
                l.getCity(),
                l.getDescription(),
                imageUrls(l),
                sellerName,
                l.getSeller().getId(),
                l.getCreatedAt()
        );
    }
}
