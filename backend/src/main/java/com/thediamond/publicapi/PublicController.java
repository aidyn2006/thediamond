package com.thediamond.publicapi;

import com.thediamond.api.dto.ListingDtos.ListingSummary;
import com.thediamond.api.dto.ListingDtos.PublicListing;
import com.thediamond.api.dto.ListingDtos.PublicSeller;
import com.thediamond.api.dto.ListingDtos.SellerRef;
import com.thediamond.domain.Listing;
import com.thediamond.domain.ListingStatus;
import com.thediamond.domain.PhoneBrand;
import com.thediamond.domain.PhoneCondition;
import com.thediamond.domain.UserProfile;
import com.thediamond.error.ApiException;
import com.thediamond.listing.ListingSpecs;
import com.thediamond.profile.Mappers;
import com.thediamond.repo.ListingRepository;
import com.thediamond.repo.UserProfileRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Unauthenticated, public-facing endpoints (see SecurityConfig permitAll on
 * /api/public/**). This is the SEO surface: catalog, listing pages, seller pages
 * and the sitemap all read from here. Never exposes a phone number.
 */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ListingRepository listings;
    private final UserProfileRepository profiles;

    public PublicController(ListingRepository listings, UserProfileRepository profiles) {
        this.listings = listings;
        this.profiles = profiles;
    }

    @GetMapping("/listings")
    @Transactional(readOnly = true)
    public List<ListingSummary> catalog(@RequestParam(required = false) PhoneBrand brand,
                                        @RequestParam(required = false) PhoneCondition condition,
                                        @RequestParam(required = false) String city,
                                        @RequestParam(required = false) Integer minPrice,
                                        @RequestParam(required = false) Integer maxPrice,
                                        @RequestParam(required = false) Integer minStorage,
                                        @RequestParam(required = false) String q) {
        var filters = new ListingSpecs.Filters(brand, condition, city, minPrice, maxPrice, minStorage, q);
        return listings.findAll(ListingSpecs.active(filters)).stream()
                .map(Mappers::toSummary)
                .toList();
    }

    @GetMapping("/listings/{id}")
    @Transactional(readOnly = true)
    public PublicListing listing(@PathVariable Long id) {
        Listing l = listings.findById(id)
                .filter(x -> x.getStatus() == ListingStatus.ACTIVE || x.getStatus() == ListingStatus.SOLD)
                .orElseThrow(() -> ApiException.notFound("Объявление не найдено"));
        String sellerName = profiles.findByUserId(l.getSeller().getId())
                .map(UserProfile::getDisplayName)
                .orElse("Продавец");
        return Mappers.toPublicListing(l, sellerName);
    }

    /**
     * Sellers worth putting in the sitemap — those with at least one active listing.
     * {@code updatedAt} is their newest listing, which is what makes the page change.
     */
    @GetMapping("/sellers")
    @Transactional(readOnly = true)
    public List<SellerRef> sellers() {
        Map<Long, Instant> newestListing = new LinkedHashMap<>();
        // Listings arrive newest-first, so the first hit per seller is the freshest.
        for (Listing l : listings.findByStatusOrderByCreatedAtDesc(ListingStatus.ACTIVE)) {
            newestListing.putIfAbsent(l.getSeller().getId(), l.getCreatedAt());
        }
        return newestListing.entrySet().stream()
                .map(e -> new SellerRef(e.getKey(), e.getValue()))
                .toList();
    }

    @GetMapping("/sellers/{id}")
    @Transactional(readOnly = true)
    public PublicSeller seller(@PathVariable Long id) {
        UserProfile p = profiles.findByUserId(id)
                .orElseThrow(() -> ApiException.notFound("Продавец не найден"));
        List<ListingSummary> active = listings.findBySellerIdOrderByCreatedAtDesc(id).stream()
                .filter(l -> l.getStatus() == ListingStatus.ACTIVE)
                .map(Mappers::toSummary)
                .toList();
        return new PublicSeller(
                id,
                p.getDisplayName(),
                p.getAvatarUrl(),
                p.getCity(),
                p.getAbout(),
                p.getUser().getCreatedAt(),
                active
        );
    }
}
