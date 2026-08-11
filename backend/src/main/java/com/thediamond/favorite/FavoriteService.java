package com.thediamond.favorite;

import com.thediamond.api.dto.ListingDtos.ListingSummary;
import com.thediamond.domain.Favorite;
import com.thediamond.domain.Listing;
import com.thediamond.domain.ListingStatus;
import com.thediamond.error.ApiException;
import com.thediamond.profile.Mappers;
import com.thediamond.repo.FavoriteRepository;
import com.thediamond.repo.ListingRepository;
import com.thediamond.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favorites;
    private final ListingRepository listings;
    private final UserRepository users;

    public FavoriteService(FavoriteRepository favorites, ListingRepository listings, UserRepository users) {
        this.favorites = favorites;
        this.listings = listings;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<ListingSummary> list(Long userId) {
        return favorites.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(Favorite::getListing)
                .map(Mappers::toSummary)
                .toList();
    }

    /** Idempotent: adding an already-favourited listing is a no-op, not an error. */
    @Transactional
    public void add(Long userId, Long listingId) {
        if (favorites.existsByUserIdAndListingId(userId, listingId)) return;
        Listing l = listings.findById(listingId)
                .orElseThrow(() -> ApiException.notFound("Объявление не найдено"));
        if (l.getStatus() != ListingStatus.ACTIVE) {
            throw ApiException.badRequest("NOT_ACTIVE", "Объявление недоступно");
        }
        Favorite f = new Favorite();
        f.setUser(users.findById(userId).orElseThrow(() -> ApiException.notFound("Пользователь не найден")));
        f.setListing(l);
        favorites.save(f);
    }

    @Transactional
    public void remove(Long userId, Long listingId) {
        favorites.findByUserIdAndListingId(userId, listingId).ifPresent(favorites::delete);
    }
}
