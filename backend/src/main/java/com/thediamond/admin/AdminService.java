package com.thediamond.admin;

import com.thediamond.api.dto.AdminDtos.AdminUser;
import com.thediamond.api.dto.AdminDtos.AdminUserDetail;
import com.thediamond.api.dto.AdminDtos.StatsResponse;
import com.thediamond.api.dto.ListingDtos.ListingSummary;
import com.thediamond.api.dto.ProfileDtos.ProfileResponse;
import com.thediamond.domain.Listing;
import com.thediamond.domain.ListingStatus;
import com.thediamond.domain.Role;
import com.thediamond.domain.User;
import com.thediamond.error.ApiException;
import com.thediamond.listing.ListingService;
import com.thediamond.profile.Mappers;
import com.thediamond.repo.DealRepository;
import com.thediamond.repo.ListingRepository;
import com.thediamond.repo.UserProfileRepository;
import com.thediamond.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final ListingRepository listings;
    private final DealRepository deals;
    private final ListingService listingService;

    public AdminService(UserRepository users, UserProfileRepository profiles, ListingRepository listings,
                        DealRepository deals, ListingService listingService) {
        this.users = users;
        this.profiles = profiles;
        this.listings = listings;
        this.deals = deals;
        this.listingService = listingService;
    }

    // ---------- Users ----------

    @Transactional(readOnly = true)
    public List<AdminUser> listUsers(String search) {
        List<User> list = (search == null || search.isBlank())
                ? users.findAllByOrderByCreatedAtDesc()
                : users.findByEmailContainingIgnoreCaseOrderByCreatedAtDesc(search.trim());
        return list.stream().map(AdminService::toAdminUser).toList();
    }

    @Transactional
    public AdminUser setBan(Long id, boolean banned) {
        User u = users.findById(id).orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        if (u.getRole() == Role.ADMIN) {
            throw ApiException.badRequest("CANNOT_BAN_ADMIN", "Администратора нельзя заблокировать");
        }
        u.setBanned(banned);
        users.save(u);
        return toAdminUser(u);
    }

    @Transactional(readOnly = true)
    public AdminUserDetail userDetail(Long id) {
        User u = users.findById(id).orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        ProfileResponse profile = profiles.findByUserId(id).map(Mappers::toProfileResponse).orElse(null);
        List<ListingSummary> own = listings.findBySellerIdOrderByCreatedAtDesc(id).stream()
                .map(Mappers::toSummary)
                .toList();
        return new AdminUserDetail(u.getId(), u.getEmail(), u.getRole().name(), u.isBanned(),
                u.isEmailVerified(), u.getCreatedAt(), profile, own);
    }

    // ---------- Listing moderation ----------

    @Transactional(readOnly = true)
    public List<ListingSummary> listListings(String status) {
        List<Listing> list = switch (normalize(status)) {
            case "pending" -> listings.findByStatusOrderByCreatedAtDesc(ListingStatus.PENDING_REVIEW);
            case "active" -> listings.findByStatusOrderByCreatedAtDesc(ListingStatus.ACTIVE);
            case "rejected" -> listings.findByStatusOrderByCreatedAtDesc(ListingStatus.REJECTED);
            case "sold" -> listings.findByStatusOrderByCreatedAtDesc(ListingStatus.SOLD);
            default -> listings.findAllByOrderByCreatedAtDesc();
        };
        return list.stream().map(Mappers::toSummary).toList();
    }

    /** Approve or reject one listing; notifies the seller either way. */
    @Transactional
    public ListingSummary moderateListing(Long id, boolean approved, String reason) {
        return listingService.moderate(id, approved, reason);
    }

    @Transactional(readOnly = true)
    public StatsResponse stats() {
        return new StatsResponse(
                users.count(),
                listings.countByStatus(ListingStatus.ACTIVE),
                listings.countByStatus(ListingStatus.PENDING_REVIEW),
                deals.count()
        );
    }

    private static AdminUser toAdminUser(User u) {
        return new AdminUser(u.getId(), u.getEmail(), u.getRole().name(), u.isBanned(), u.getCreatedAt());
    }

    private static String normalize(String status) {
        return status == null ? "all" : status.toLowerCase();
    }
}
