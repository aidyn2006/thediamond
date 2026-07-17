package com.thediamond.profile;

import com.thediamond.api.dto.ProfileDtos.BrandProfileResponse;
import com.thediamond.api.dto.ProfileDtos.CreatorProfileResponse;
import com.thediamond.api.dto.ProfileDtos.PublicCreatorListItem;
import com.thediamond.api.dto.ProfileDtos.PublicCreatorProfile;
import com.thediamond.api.dto.ProfileDtos.SocialLink;
import com.thediamond.api.dto.SocialProofDtos.SocialProofResponse;
import com.thediamond.domain.BrandProfile;
import com.thediamond.domain.Category;
import com.thediamond.domain.CreatorProfile;

import java.util.ArrayList;
import java.util.List;

public final class Mappers {

    private Mappers() {}

    public static CreatorProfileResponse toCreatorResponse(CreatorProfile p, boolean includeTelegram) {
        return toCreatorResponse(p, includeTelegram, null);
    }

    public static CreatorProfileResponse toCreatorResponse(CreatorProfile p, boolean includeTelegram,
                                                           SocialProofResponse socialProof) {
        List<SocialLink> socials = new ArrayList<>();
        if (p.getInstagramUrl() != null) socials.add(new SocialLink("INSTAGRAM", p.getInstagramUrl(), p.getInstagramFollowers()));
        if (p.getTiktokUrl() != null) socials.add(new SocialLink("TIKTOK", p.getTiktokUrl(), p.getTiktokFollowers()));
        if (p.getThreadsUrl() != null) socials.add(new SocialLink("THREADS", p.getThreadsUrl(), p.getThreadsFollowers()));
        if (p.getYoutubeUrl() != null) socials.add(new SocialLink("YOUTUBE", p.getYoutubeUrl(), p.getYoutubeFollowers()));

        List<Category> cats = p.getCategories().stream().sorted().toList();

        return new CreatorProfileResponse(
                p.getId(),
                p.getUser().getEmail(),
                p.getName(),
                p.getUsername(),
                p.getAvatarUrl(),
                p.getBio(),
                p.getCity(),
                p.getBirthDate(),
                cats,
                socials,
                p.getTotalFollowers(),
                includeTelegram ? p.getTelegramUrl() : null,
                p.isApproved(),
                socialProof
        );
    }

    public static PublicCreatorProfile toPublicCreator(CreatorProfile p) {
        List<SocialLink> socials = new ArrayList<>();
        if (p.getInstagramUrl() != null) socials.add(new SocialLink("INSTAGRAM", p.getInstagramUrl(), p.getInstagramFollowers()));
        if (p.getTiktokUrl() != null) socials.add(new SocialLink("TIKTOK", p.getTiktokUrl(), p.getTiktokFollowers()));
        if (p.getThreadsUrl() != null) socials.add(new SocialLink("THREADS", p.getThreadsUrl(), p.getThreadsFollowers()));
        if (p.getYoutubeUrl() != null) socials.add(new SocialLink("YOUTUBE", p.getYoutubeUrl(), p.getYoutubeFollowers()));
        return new PublicCreatorProfile(
                p.getId(),
                p.getName(),
                p.getUsername(),
                p.getAvatarUrl(),
                p.getBio(),
                p.getCity(),
                p.getCategories().stream().sorted().toList(),
                socials,
                p.getTotalFollowers()
        );
    }

    public static PublicCreatorListItem toPublicCreatorListItem(CreatorProfile p) {
        return new PublicCreatorListItem(p.getId(), p.getUsername(), p.getCreatedAt());
    }

    public static BrandProfileResponse toBrandResponse(BrandProfile b) {
        return new BrandProfileResponse(
                b.getId(),
                b.getUser().getEmail(),
                b.getCompanyName(),
                b.getBin(),
                b.getWebsite(),
                b.getPhone(),
                b.getContactName(),
                b.isApproved()
        );
    }
}
