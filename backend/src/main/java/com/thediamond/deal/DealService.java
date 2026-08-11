package com.thediamond.deal;

import com.thediamond.api.dto.DealDtos.DealItem;
import com.thediamond.api.dto.DealDtos.DealRequest;
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
import com.thediamond.repo.ListingRepository;
import com.thediamond.repo.UserProfileRepository;
import com.thediamond.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Purchase requests. No money moves through the platform: accepting a request
 * exchanges phone numbers, and the two sides settle offline.
 */
@Service
public class DealService {

    private final DealRepository deals;
    private final ListingRepository listings;
    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final NotificationService email;
    private final InAppNotificationService inApp;

    public DealService(DealRepository deals, ListingRepository listings, UserRepository users,
                       UserProfileRepository profiles, NotificationService email,
                       InAppNotificationService inApp) {
        this.deals = deals;
        this.listings = listings;
        this.users = users;
        this.profiles = profiles;
        this.email = email;
        this.inApp = inApp;
    }

    @Transactional
    public DealItem request(Long buyerId, DealRequest req) {
        Listing l = listings.findById(req.listingId())
                .orElseThrow(() -> ApiException.notFound("Объявление не найдено"));
        if (l.getSeller().getId().equals(buyerId)) {
            throw ApiException.badRequest("OWN_LISTING", "Нельзя купить свой же телефон");
        }
        if (l.getStatus() != ListingStatus.ACTIVE) {
            throw ApiException.badRequest("NOT_ACTIVE", "Объявление недоступно");
        }
        if (deals.findByListingIdAndBuyerId(l.getId(), buyerId).isPresent()) {
            throw ApiException.conflict("ALREADY_REQUESTED", "Вы уже отправляли заявку по этому объявлению");
        }
        // A buyer with no phone number is useless to the seller.
        UserProfile buyerProfile = profiles.findByUserId(buyerId)
                .orElseThrow(() -> ApiException.badRequest("PROFILE_REQUIRED",
                        "Заполните профиль — продавцу нужен ваш телефон для связи"));
        User buyer = users.findById(buyerId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));

        Deal d = new Deal();
        d.setListing(l);
        d.setBuyer(buyer);
        d.setStatus(DealStatus.REQUESTED);
        d.setMessage(blankToNull(req.message()));
        deals.save(d);

        email.newDealRequest(l.getSeller().getEmail(), buyerProfile.getDisplayName(), l.getTitle());
        inApp.send(l.getSeller().getId(), "Новая заявка на покупку",
                buyerProfile.getDisplayName() + " хочет купить «" + l.getTitle() + "».");
        return toItem(d, buyerId);
    }

    @Transactional(readOnly = true)
    public List<DealItem> myPurchases(Long userId) {
        return deals.findByBuyerIdOrderByCreatedAtDesc(userId).stream()
                .map(d -> toItem(d, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DealItem> mySales(Long userId) {
        return deals.findByListing_SellerIdOrderByCreatedAtDesc(userId).stream()
                .map(d -> toItem(d, userId))
                .toList();
    }

    @Transactional
    public DealItem accept(Long sellerId, Long dealId) {
        Deal d = asSeller(sellerId, dealId);
        requireStatus(d, DealStatus.REQUESTED);
        d.setStatus(DealStatus.ACCEPTED);
        touch(d);

        UserProfile sellerProfile = profiles.findByUserId(sellerId).orElse(null);
        email.dealAccepted(d.getBuyer().getEmail(), d.getListing().getTitle(),
                sellerProfile == null ? null : sellerProfile.getPhone());
        inApp.send(d.getBuyer().getId(), "Продавец принял заявку",
                "«" + d.getListing().getTitle() + "» — телефон продавца теперь виден в разделе «Сделки».");
        return toItem(d, sellerId);
    }

    @Transactional
    public DealItem decline(Long sellerId, Long dealId, String reason) {
        Deal d = asSeller(sellerId, dealId);
        requireStatus(d, DealStatus.REQUESTED);
        d.setStatus(DealStatus.DECLINED);
        touch(d);

        email.dealDeclined(d.getBuyer().getEmail(), d.getListing().getTitle(), reason);
        inApp.send(d.getBuyer().getId(), "Заявку отклонили",
                "«" + d.getListing().getTitle() + "»"
                        + (reason != null && !reason.isBlank() ? ". Причина: " + reason : ""));
        return toItem(d, sellerId);
    }

    /** Seller confirms the phone actually changed hands; the listing becomes SOLD. */
    @Transactional
    public DealItem complete(Long sellerId, Long dealId) {
        Deal d = asSeller(sellerId, dealId);
        requireStatus(d, DealStatus.ACCEPTED);
        d.setStatus(DealStatus.COMPLETED);
        touch(d);

        Listing l = d.getListing();
        if (l.getStatus() != ListingStatus.SOLD) {
            l.setStatus(ListingStatus.SOLD);
            l.setSoldAt(Instant.now());
            l.setUpdatedAt(Instant.now());
            listings.save(l);
        }
        inApp.send(d.getBuyer().getId(), "Сделка завершена",
                "Продавец подтвердил продажу «" + l.getTitle() + "». Удачной покупки!");
        return toItem(d, sellerId);
    }

    @Transactional
    public DealItem cancel(Long buyerId, Long dealId) {
        Deal d = deals.findById(dealId).orElseThrow(() -> ApiException.notFound("Сделка не найдена"));
        if (!d.getBuyer().getId().equals(buyerId)) {
            throw ApiException.forbidden("Это не ваша заявка");
        }
        if (d.getStatus() == DealStatus.COMPLETED) {
            throw ApiException.badRequest("ALREADY_COMPLETED", "Завершённую сделку нельзя отменить");
        }
        d.setStatus(DealStatus.CANCELLED);
        touch(d);
        inApp.send(d.getListing().getSeller().getId(), "Покупатель отменил заявку",
                "«" + d.getListing().getTitle() + "»");
        return toItem(d, buyerId);
    }

    // ---------- helpers ----------

    private Deal asSeller(Long sellerId, Long dealId) {
        Deal d = deals.findById(dealId).orElseThrow(() -> ApiException.notFound("Сделка не найдена"));
        if (!d.getListing().getSeller().getId().equals(sellerId)) {
            throw ApiException.forbidden("Это не ваше объявление");
        }
        return d;
    }

    private void requireStatus(Deal d, DealStatus expected) {
        if (d.getStatus() != expected) {
            throw ApiException.badRequest("WRONG_STATUS", "Действие недоступно для текущего статуса заявки");
        }
    }

    private void touch(Deal d) {
        d.setUpdatedAt(Instant.now());
        deals.save(d);
    }

    /**
     * Contacts are mutual and only after ACCEPTED: the buyer sees the seller's phone
     * and vice versa. Before that both sides stay anonymous.
     */
    private DealItem toItem(Deal d, Long viewerId) {
        boolean iAmSeller = d.getListing().getSeller().getId().equals(viewerId);
        User counterpart = iAmSeller ? d.getBuyer() : d.getListing().getSeller();
        UserProfile cp = profiles.findByUserId(counterpart.getId()).orElse(null);
        boolean reveal = d.getStatus() == DealStatus.ACCEPTED || d.getStatus() == DealStatus.COMPLETED;

        return new DealItem(
                d.getId(),
                Mappers.toSummary(d.getListing()),
                d.getStatus().name(),
                d.getMessage(),
                cp == null ? "Пользователь" : cp.getDisplayName(),
                reveal && cp != null ? cp.getPhone() : null,
                counterpart.getId(),
                iAmSeller,
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
