package com.thediamond.listing;

import com.thediamond.api.dto.ListingDtos.ListingDetail;
import com.thediamond.api.dto.ListingDtos.ListingRequest;
import com.thediamond.api.dto.ListingDtos.ListingSummary;
import com.thediamond.api.dto.ListingDtos.MyListingItem;
import com.thediamond.api.dto.ListingDtos.SellerCard;
import com.thediamond.domain.Deal;
import com.thediamond.domain.DealStatus;
import com.thediamond.domain.Listing;
import com.thediamond.domain.ListingStatus;
import com.thediamond.domain.User;
import com.thediamond.domain.UserProfile;
import com.thediamond.error.ApiException;
import com.thediamond.notify.InAppNotificationService;
import com.thediamond.notify.NotificationService;
import com.thediamond.profile.Mappers;
import com.thediamond.repo.DealRepository;
import com.thediamond.repo.FavoriteRepository;
import com.thediamond.repo.ListingRepository;
import com.thediamond.repo.UserProfileRepository;
import com.thediamond.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
public class ListingService {

    /** Statuses the seller may still edit. ACTIVE edits send the listing back to review. */
    private static final Set<ListingStatus> EDITABLE =
            EnumSet.of(ListingStatus.DRAFT, ListingStatus.REJECTED, ListingStatus.ACTIVE);

    private final ListingRepository listings;
    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final DealRepository deals;
    private final FavoriteRepository favorites;
    private final NotificationService email;
    private final InAppNotificationService inApp;

    public ListingService(ListingRepository listings, UserRepository users, UserProfileRepository profiles,
                          DealRepository deals, FavoriteRepository favorites,
                          NotificationService email, InAppNotificationService inApp) {
        this.listings = listings;
        this.users = users;
        this.profiles = profiles;
        this.deals = deals;
        this.favorites = favorites;
        this.email = email;
        this.inApp = inApp;
    }

    // ---------- Catalog ----------

    @Transactional(readOnly = true)
    public List<ListingSummary> catalog(ListingSpecs.Filters filters) {
        return listings.findAll(ListingSpecs.active(filters)).stream()
                .map(Mappers::toSummary)
                .toList();
    }

    @Transactional
    public ListingDetail detail(Long viewerId, Long listingId) {
        Listing l = listings.findById(listingId)
                .orElseThrow(() -> ApiException.notFound("Объявление не найдено"));
        boolean mine = l.getSeller().getId().equals(viewerId);
        // Only the seller (and admins, via their own endpoint) may open a listing
        // that isn't live yet.
        if (!mine && l.getStatus() != ListingStatus.ACTIVE && l.getStatus() != ListingStatus.SOLD) {
            throw ApiException.notFound("Объявление не найдено");
        }
        if (!mine && l.getStatus() == ListingStatus.ACTIVE) {
            l.setViews(l.getViews() + 1);
            listings.save(l);
        }

        Deal myDeal = deals.findByListingIdAndBuyerId(listingId, viewerId).orElse(null);
        boolean revealPhone = mine || (myDeal != null && myDeal.getStatus() == DealStatus.ACCEPTED);

        String blockReason = requestBlockReason(l, mine, myDeal);
        return new ListingDetail(
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
                l.getStatus().name(),
                l.getViews(),
                l.getCreatedAt(),
                Mappers.imageUrls(l),
                sellerCard(l.getSeller(), revealPhone),
                mine,
                favorites.existsByUserIdAndListingId(viewerId, listingId),
                myDeal == null ? null : myDeal.getStatus().name(),
                blockReason == null,
                blockReason
        );
    }

    /** Null = the viewer may send a purchase request. */
    private String requestBlockReason(Listing l, boolean mine, Deal myDeal) {
        if (mine) return "Это ваше объявление";
        if (l.getStatus() == ListingStatus.SOLD) return "Телефон уже продан";
        if (l.getStatus() != ListingStatus.ACTIVE) return "Объявление недоступно";
        if (myDeal != null) {
            return switch (myDeal.getStatus()) {
                case REQUESTED -> "Заявка уже отправлена — ждём ответа продавца";
                case ACCEPTED -> "Продавец принял вашу заявку";
                case COMPLETED -> "Сделка уже завершена";
                case DECLINED -> "Продавец отклонил вашу заявку";
                case CANCELLED -> "Вы отменили заявку";
            };
        }
        return null;
    }

    private SellerCard sellerCard(User seller, boolean revealPhone) {
        UserProfile p = profiles.findByUserId(seller.getId()).orElse(null);
        long active = listings.findBySellerIdOrderByCreatedAtDesc(seller.getId()).stream()
                .filter(x -> x.getStatus() == ListingStatus.ACTIVE)
                .count();
        return new SellerCard(
                seller.getId(),
                p == null ? "Продавец" : p.getDisplayName(),
                p == null ? null : p.getAvatarUrl(),
                p == null ? null : p.getCity(),
                revealPhone && p != null ? p.getPhone() : null,
                seller.getCreatedAt(),
                active
        );
    }

    // ---------- Seller's own listings ----------

    @Transactional(readOnly = true)
    public List<MyListingItem> mine(Long sellerId) {
        return listings.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(l -> new MyListingItem(
                        Mappers.toSummary(l),
                        deals.countByListingIdAndStatus(l.getId(), DealStatus.REQUESTED),
                        favorites.countByListingId(l.getId()),
                        l.getRejectReason()))
                .toList();
    }

    @Transactional
    public ListingSummary create(Long sellerId, ListingRequest req) {
        User seller = users.findById(sellerId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        requireProfile(sellerId);

        Listing l = new Listing();
        l.setSeller(seller);
        apply(l, req);
        // Straight to moderation — a draft nobody submits is just noise.
        l.setStatus(ListingStatus.PENDING_REVIEW);
        listings.save(l);
        return Mappers.toSummary(l);
    }

    @Transactional
    public ListingSummary update(Long sellerId, Long listingId, ListingRequest req) {
        Listing l = own(sellerId, listingId);
        if (!EDITABLE.contains(l.getStatus())) {
            throw ApiException.badRequest("NOT_EDITABLE", "Это объявление больше нельзя редактировать");
        }
        apply(l, req);
        // Any edit re-enters moderation, otherwise an approved listing could be
        // swapped for something else after the fact.
        l.setStatus(ListingStatus.PENDING_REVIEW);
        l.setRejectReason(null);
        listings.save(l);
        return Mappers.toSummary(l);
    }

    @Transactional
    public void archive(Long sellerId, Long listingId) {
        Listing l = own(sellerId, listingId);
        l.setStatus(ListingStatus.ARCHIVED);
        l.setUpdatedAt(Instant.now());
        listings.save(l);
    }

    @Transactional
    public ListingSummary markSold(Long sellerId, Long listingId) {
        Listing l = own(sellerId, listingId);
        if (l.getStatus() != ListingStatus.ACTIVE) {
            throw ApiException.badRequest("NOT_ACTIVE", "Продать можно только активное объявление");
        }
        l.setStatus(ListingStatus.SOLD);
        l.setSoldAt(Instant.now());
        l.setUpdatedAt(Instant.now());
        listings.save(l);

        // Everyone still waiting for an answer learns the phone is gone.
        deals.findByListingIdOrderByCreatedAtDesc(listingId).stream()
                .filter(d -> d.getStatus() == DealStatus.REQUESTED)
                .forEach(d -> {
                    d.setStatus(DealStatus.DECLINED);
                    d.setUpdatedAt(Instant.now());
                    deals.save(d);
                    inApp.send(d.getBuyer().getId(), "Телефон продан",
                            "«" + l.getTitle() + "» продан другому покупателю.");
                });
        return Mappers.toSummary(l);
    }

    // ---------- Moderation (called by AdminService) ----------

    @Transactional
    public ListingSummary moderate(Long listingId, boolean approved, String reason) {
        Listing l = listings.findById(listingId)
                .orElseThrow(() -> ApiException.notFound("Объявление не найдено"));
        l.setStatus(approved ? ListingStatus.ACTIVE : ListingStatus.REJECTED);
        l.setRejectReason(approved ? null : reason);
        l.setUpdatedAt(Instant.now());
        listings.save(l);

        String to = l.getSeller().getEmail();
        if (approved) {
            email.listingApproved(to, l.getTitle());
            inApp.send(l.getSeller().getId(), "Объявление опубликовано",
                    "«" + l.getTitle() + "» прошло модерацию и видно покупателям.");
        } else {
            email.listingRejected(to, l.getTitle(), reason);
            inApp.send(l.getSeller().getId(), "Объявление отклонено",
                    (reason != null && !reason.isBlank() ? "Причина: " + reason + ". " : "")
                            + "Отредактируйте и отправьте снова.");
        }
        return Mappers.toSummary(l);
    }

    // ---------- helpers ----------

    private Listing own(Long sellerId, Long listingId) {
        return listings.findByIdAndSellerId(listingId, sellerId)
                .orElseThrow(() -> ApiException.notFound("Объявление не найдено"));
    }

    private void requireProfile(Long userId) {
        if (profiles.findByUserId(userId).isEmpty()) {
            throw ApiException.badRequest("PROFILE_REQUIRED",
                    "Заполните профиль — покупателям нужен ваш телефон для связи");
        }
    }

    private void apply(Listing l, ListingRequest req) {
        l.setBrand(req.brand());
        l.setModel(req.model().trim());
        l.setStorageGb(req.storageGb());
        l.setRamGb(req.ramGb());
        l.setColor(blankToNull(req.color()));
        l.setCondition(req.condition());
        l.setBatteryHealth(req.batteryHealth());
        l.setPrice(req.price());
        l.setCity(req.city().trim());
        l.setDescription(req.description().trim());
        l.setUpdatedAt(Instant.now());

        l.getImages().clear();
        if (req.images() != null) {
            req.images().stream()
                    .filter(u -> u != null && !u.isBlank())
                    .forEach(u -> l.addImage(u.trim()));
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
