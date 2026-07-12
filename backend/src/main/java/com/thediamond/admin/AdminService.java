package com.thediamond.admin;

import com.thediamond.api.dto.AdminDtos.AdminUser;
import com.thediamond.api.dto.AdminDtos.StatsResponse;
import com.thediamond.api.dto.ProfileDtos.BrandProfileResponse;
import com.thediamond.api.dto.ProfileDtos.CreatorProfileResponse;
import com.thediamond.domain.BrandProfile;
import com.thediamond.domain.CampaignStatus;
import com.thediamond.domain.CreatorProfile;
import com.thediamond.error.ApiException;
import com.thediamond.profile.Mappers;
import com.thediamond.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final CreatorProfileRepository creators;
    private final BrandProfileRepository brands;
    private final CampaignRepository campaigns;
    private final ApplicationRepository applications;
    private final UserRepository users;
    private final com.thediamond.notify.NotificationService notifier;

    public AdminService(CreatorProfileRepository creators, BrandProfileRepository brands,
                        CampaignRepository campaigns, ApplicationRepository applications,
                        UserRepository users, com.thediamond.notify.NotificationService notifier) {
        this.creators = creators;
        this.brands = brands;
        this.campaigns = campaigns;
        this.applications = applications;
        this.users = users;
        this.notifier = notifier;
    }

    // ---------- Users ----------

    @Transactional(readOnly = true)
    public List<AdminUser> listUsers(String search) {
        List<com.thediamond.domain.User> list = (search == null || search.isBlank())
                ? users.findAllByOrderByCreatedAtDesc()
                : users.findByEmailContainingIgnoreCaseOrderByCreatedAtDesc(search.trim());
        return list.stream()
                .map(u -> new AdminUser(u.getId(), u.getEmail(), u.getRole().name(), u.isBanned(), u.getCreatedAt()))
                .toList();
    }

    @Transactional
    public AdminUser setBan(Long id, boolean banned) {
        com.thediamond.domain.User u = users.findById(id)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        if (u.getRole() == com.thediamond.domain.Role.ADMIN) {
            throw ApiException.badRequest("CANNOT_BAN_ADMIN", "Администратора нельзя заблокировать");
        }
        u.setBanned(banned);
        users.save(u);
        return new AdminUser(u.getId(), u.getEmail(), u.getRole().name(), u.isBanned(), u.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<CreatorProfileResponse> listCreators(String status) {
        List<CreatorProfile> list = switch (normalize(status)) {
            case "pending" -> creators.findByApprovedOrderByCreatedAtDesc(false);
            case "approved" -> creators.findByApprovedOrderByCreatedAtDesc(true);
            default -> creators.findAllByOrderByCreatedAtDesc();
        };
        return list.stream().map(c -> Mappers.toCreatorResponse(c, true)).toList();
    }

    @Transactional(readOnly = true)
    public List<BrandProfileResponse> listBrands(String status) {
        List<BrandProfile> list = switch (normalize(status)) {
            case "pending" -> brands.findByApprovedOrderByCreatedAtDesc(false);
            case "approved" -> brands.findByApprovedOrderByCreatedAtDesc(true);
            default -> brands.findAllByOrderByCreatedAtDesc();
        };
        return list.stream().map(Mappers::toBrandResponse).toList();
    }

    @Transactional
    public CreatorProfileResponse setCreatorApproval(Long id, boolean approved) {
        CreatorProfile c = creators.findById(id)
                .orElseThrow(() -> ApiException.notFound("Профиль креатора не найден"));
        c.setApproved(approved);
        creators.save(c);
        if (approved) notifier.creatorProfileApproved(c.getUser().getEmail());
        return Mappers.toCreatorResponse(c, true);
    }

    @Transactional
    public BrandProfileResponse setBrandApproval(Long id, boolean approved) {
        BrandProfile b = brands.findById(id)
                .orElseThrow(() -> ApiException.notFound("Профиль бренда не найден"));
        b.setApproved(approved);
        brands.save(b);
        if (approved) notifier.brandProfileApproved(b.getUser().getEmail());
        return Mappers.toBrandResponse(b);
    }

    @Transactional(readOnly = true)
    public StatsResponse stats() {
        return new StatsResponse(
                creators.count(),
                brands.count(),
                campaigns.countByStatus(CampaignStatus.ACTIVE),
                applications.count()
        );
    }

    private static String normalize(String status) {
        return status == null ? "all" : status.toLowerCase();
    }
}
