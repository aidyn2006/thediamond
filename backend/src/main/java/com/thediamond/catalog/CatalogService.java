package com.thediamond.catalog;

import com.thediamond.api.dto.ProfileDtos.CreatorProfileResponse;
import com.thediamond.api.dto.ProfileDtos.PublicCreatorProfile;
import com.thediamond.domain.ApplicationStatus;
import com.thediamond.domain.BrandProfile;
import com.thediamond.domain.Category;
import com.thediamond.domain.CreatorProfile;
import com.thediamond.error.ApiException;
import com.thediamond.profile.Mappers;
import com.thediamond.repo.ApplicationRepository;
import com.thediamond.repo.BrandProfileRepository;
import com.thediamond.repo.CreatorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class CatalogService {

    /** Statuses that mean "the brand engaged this creator" -> reveal telegram. */
    private static final Set<ApplicationStatus> ACCEPTED_ONWARD = Set.of(
            ApplicationStatus.ACCEPTED, ApplicationStatus.SUBMITTED,
            ApplicationStatus.APPROVED, ApplicationStatus.REJECTED);

    private final CreatorProfileRepository creators;
    private final BrandProfileRepository brands;
    private final ApplicationRepository applications;

    public CatalogService(CreatorProfileRepository creators, BrandProfileRepository brands,
                          ApplicationRepository applications) {
        this.creators = creators;
        this.brands = brands;
        this.applications = applications;
    }

    @Transactional(readOnly = true)
    public List<CreatorProfileResponse> list(Category category, String city) {
        String c = city == null ? null : city.trim();
        return creators.findByApprovedOrderByCreatedAtDesc(true).stream()
                .filter(p -> category == null || p.getCategories().contains(category))
                .filter(p -> c == null || c.isEmpty() || p.getCity().equalsIgnoreCase(c))
                .map(p -> Mappers.toCreatorResponse(p, false))
                .toList();
    }

    /** Same filtering as {@link #list}, but mapped to the unauthenticated public card
     *  (no email/telegram) — used by the public catalog and the sitemap. */
    @Transactional(readOnly = true)
    public List<PublicCreatorProfile> publicList(Category category, String city) {
        String c = city == null ? null : city.trim();
        return creators.findByApprovedOrderByCreatedAtDesc(true).stream()
                .filter(p -> category == null || p.getCategories().contains(category))
                .filter(p -> c == null || c.isEmpty() || p.getCity().equalsIgnoreCase(c))
                .map(Mappers::toPublicCreator)
                .toList();
    }

    @Transactional(readOnly = true)
    public CreatorProfileResponse detail(Long brandUserId, Long creatorId) {
        CreatorProfile creator = creators.findById(creatorId)
                .orElseThrow(() -> ApiException.notFound("Креатор не найден"));
        if (!creator.isApproved()) {
            throw ApiException.notFound("Креатор не найден");
        }
        BrandProfile brand = brands.findByUserId(brandUserId).orElse(null);
        boolean revealTelegram = brand != null && applications
                .existsByCreator_IdAndCampaign_Brand_IdAndStatusIn(creatorId, brand.getId(), ACCEPTED_ONWARD);
        return Mappers.toCreatorResponse(creator, revealTelegram);
    }
}
