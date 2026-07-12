package com.thediamond.campaign;

import com.thediamond.api.dto.CampaignDtos.*;
import com.thediamond.domain.*;
import com.thediamond.error.ApiException;
import com.thediamond.repo.ApplicationRepository;
import com.thediamond.repo.BrandProfileRepository;
import com.thediamond.repo.CampaignRepository;
import com.thediamond.repo.CreatorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

@Service
public class CampaignService {

    private final CampaignRepository campaigns;
    private final BrandProfileRepository brands;
    private final CreatorProfileRepository creators;
    private final ApplicationRepository applications;

    public CampaignService(CampaignRepository campaigns, BrandProfileRepository brands,
                           CreatorProfileRepository creators, ApplicationRepository applications) {
        this.campaigns = campaigns;
        this.brands = brands;
        this.creators = creators;
        this.applications = applications;
    }

    // ---------- Creator feed ----------

    /** Lazily closes ACTIVE campaigns whose deadline has passed (no scheduler in v1.0). */
    @Transactional
    public void closeExpiredActive() {
        LocalDate today = LocalDate.now();
        for (Campaign c : campaigns.findByStatusOrderByCreatedAtDesc(CampaignStatus.ACTIVE)) {
            if (c.getDeadline().isBefore(today)) {
                c.setStatus(CampaignStatus.CLOSED);
                campaigns.save(c);
            }
        }
    }

    @Transactional
    public List<CampaignFeedItem> feed(Long userId, String search, Category category, Platform platform) {
        closeExpiredActive();
        CreatorProfile creator = creators.findByUserId(userId).orElse(null);
        String q = search == null ? null : search.trim().toLowerCase();

        return campaigns.findByStatusOrderByCreatedAtDesc(CampaignStatus.ACTIVE).stream()
                .filter(c -> q == null || q.isEmpty() || c.getTitle().toLowerCase().contains(q))
                .filter(c -> category == null || c.getCategory() == category)
                .filter(c -> platform == null || c.getPlatforms().contains(platform))
                .map(c -> {
                    String myStatus = null;
                    if (creator != null) {
                        myStatus = applications.findByCampaignIdAndCreatorId(c.getId(), creator.getId())
                                .map(a -> a.getStatus().name()).orElse(null);
                    }
                    return new CampaignFeedItem(toSummary(c), myStatus);
                })
                .toList();
    }

    @Transactional
    public CampaignDetail creatorDetail(Long userId, Long campaignId) {
        closeExpiredActive();
        Campaign c = campaigns.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Кампания не найдена"));
        // creators only ever see campaigns that are (or were) public
        if (c.getStatus() == CampaignStatus.DRAFT || c.getStatus() == CampaignStatus.PENDING_REVIEW
                || c.getStatus() == CampaignStatus.REJECTED) {
            throw ApiException.notFound("Кампания не найдена");
        }
        CreatorProfile creator = creators.findByUserId(userId).orElse(null);
        String myStatus = null;
        if (creator != null) {
            myStatus = applications.findByCampaignIdAndCreatorId(c.getId(), creator.getId())
                    .map(a -> a.getStatus().name()).orElse(null);
        }

        int slots = slotsLeft(c);
        String block = null;
        if (myStatus != null) block = "Вы уже откликнулись на эту кампанию";
        else if (c.getStatus() != CampaignStatus.ACTIVE) block = "Приём откликов завершён";
        else if (c.getDeadline().isBefore(LocalDate.now())) block = "Дедлайн прошёл";
        else if (slots <= 0) block = "Мест больше нет";
        boolean canApply = block == null;

        return new CampaignDetail(
                c.getId(), c.getTitle(), c.getBrand().getCompanyName(), c.getCategory(),
                c.getPlatforms().stream().sorted().toList(),
                c.getRewardPerCreator(), c.getCreatorsNeeded(), slots,
                c.getDeadline(), c.getStatus().name(), c.getCreatedAt(),
                c.getDescription(), c.getRequirements(),
                (long) c.getRewardPerCreator() * c.getCreatorsNeeded(),
                myStatus, canApply, block);
    }

    // ---------- Brand ----------

    @Transactional
    public CampaignFull create(Long userId, CampaignRequest req, boolean submit) {
        BrandProfile brand = requireBrand(userId);
        Campaign c = new Campaign();
        c.setBrand(brand);
        apply(c, req);
        c.setStatus(submit ? CampaignStatus.PENDING_REVIEW : CampaignStatus.DRAFT);
        campaigns.save(c);
        return toFull(c);
    }

    @Transactional(readOnly = true)
    public List<BrandCampaignItem> listMine(Long userId) {
        BrandProfile brand = requireBrand(userId);
        return campaigns.findByBrandIdOrderByCreatedAtDesc(brand.getId()).stream()
                .map(c -> new BrandCampaignItem(toSummary(c), counters(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignFull getMine(Long userId, Long campaignId) {
        return toFull(requireOwned(userId, campaignId));
    }

    @Transactional
    public CampaignFull update(Long userId, Long campaignId, CampaignRequest req) {
        Campaign c = requireOwned(userId, campaignId);
        if (c.getStatus() != CampaignStatus.DRAFT && c.getStatus() != CampaignStatus.REJECTED) {
            throw ApiException.badRequest("NOT_EDITABLE", "Редактировать можно только черновик или отклонённую кампанию");
        }
        apply(c, req);
        campaigns.save(c);
        return toFull(c);
    }

    @Transactional
    public CampaignFull submit(Long userId, Long campaignId) {
        Campaign c = requireOwned(userId, campaignId);
        if (c.getStatus() != CampaignStatus.DRAFT && c.getStatus() != CampaignStatus.REJECTED) {
            throw ApiException.badRequest("BAD_STATE", "Отправить на модерацию можно черновик или отклонённую кампанию");
        }
        c.setStatus(CampaignStatus.PENDING_REVIEW);
        c.setRejectReason(null);
        campaigns.save(c);
        return toFull(c);
    }

    @Transactional
    public CampaignFull close(Long userId, Long campaignId) {
        Campaign c = requireOwned(userId, campaignId);
        if (c.getStatus() != CampaignStatus.ACTIVE) {
            throw ApiException.badRequest("BAD_STATE", "Закрыть можно только активную кампанию");
        }
        c.setStatus(CampaignStatus.CLOSED);
        campaigns.save(c);
        return toFull(c);
    }

    // ---------- Admin ----------

    @Transactional(readOnly = true)
    public List<CampaignFull> listForAdmin(String status) {
        List<Campaign> list;
        if (status != null && status.equalsIgnoreCase("pending")) {
            list = campaigns.findByStatusOrderByCreatedAtDesc(CampaignStatus.PENDING_REVIEW);
        } else {
            list = campaigns.findAll();
        }
        return list.stream().map(this::toFull).toList();
    }

    @Transactional
    public CampaignFull approve(Long campaignId) {
        Campaign c = campaigns.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Кампания не найдена"));
        if (c.getStatus() != CampaignStatus.PENDING_REVIEW) {
            throw ApiException.badRequest("BAD_STATE", "Одобрить можно только кампанию на модерации");
        }
        c.setStatus(CampaignStatus.ACTIVE);
        c.setRejectReason(null);
        campaigns.save(c);
        return toFull(c);
    }

    @Transactional
    public CampaignFull reject(Long campaignId, String reason) {
        Campaign c = campaigns.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Кампания не найдена"));
        if (c.getStatus() != CampaignStatus.PENDING_REVIEW) {
            throw ApiException.badRequest("BAD_STATE", "Отклонить можно только кампанию на модерации");
        }
        if (reason == null || reason.isBlank()) {
            throw ApiException.badRequest("REASON_REQUIRED", "Укажите причину отклонения");
        }
        c.setStatus(CampaignStatus.REJECTED);
        c.setRejectReason(reason.trim());
        campaigns.save(c);
        return toFull(c);
    }

    // ---------- helpers ----------

    private void apply(Campaign c, CampaignRequest req) {
        c.setTitle(req.title().trim());
        c.setDescription(req.description().trim());
        c.setPlatforms(new HashSet<>(req.platforms()));
        c.setCategory(req.category());
        c.setRewardPerCreator(req.rewardPerCreator());
        c.setCreatorsNeeded(req.creatorsNeeded());
        c.setDeadline(req.deadline());
        c.setRequirements(req.requirements().trim());
    }

    private BrandProfile requireBrand(Long userId) {
        return brands.findByUserId(userId)
                .orElseThrow(() -> ApiException.forbidden("Сначала заполните профиль компании"));
    }

    private Campaign requireOwned(Long userId, Long campaignId) {
        Campaign c = campaigns.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Кампания не найдена"));
        BrandProfile brand = requireBrand(userId);
        if (!c.getBrand().getId().equals(brand.getId())) {
            throw ApiException.forbidden("Это не ваша кампания");
        }
        return c;
    }

    public int slotsLeft(Campaign c) {
        long accepted = applications.countByCampaignIdAndStatus(c.getId(), ApplicationStatus.ACCEPTED);
        return Math.max(0, c.getCreatorsNeeded() - (int) accepted);
    }

    public CampaignCounters counters(Long campaignId) {
        long total = applications.countByCampaignId(campaignId);
        long accepted = applications.countByCampaignIdAndStatus(campaignId, ApplicationStatus.ACCEPTED);
        long submitted = applications.countByCampaignIdAndStatus(campaignId, ApplicationStatus.SUBMITTED);
        long approved = applications.countByCampaignIdAndStatus(campaignId, ApplicationStatus.APPROVED);
        return new CampaignCounters(total, accepted, submitted, approved);
    }

    public CampaignSummary toSummary(Campaign c) {
        return new CampaignSummary(
                c.getId(), c.getTitle(), c.getBrand().getCompanyName(), c.getCategory(),
                c.getPlatforms().stream().sorted().toList(),
                c.getRewardPerCreator(), c.getCreatorsNeeded(), slotsLeft(c),
                c.getDeadline(), c.getStatus().name(), c.getCreatedAt());
    }

    public CampaignFull toFull(Campaign c) {
        return new CampaignFull(
                c.getId(), c.getTitle(), c.getBrand().getCompanyName(), c.getCategory(),
                c.getPlatforms().stream().sorted().toList(),
                c.getRewardPerCreator(), c.getCreatorsNeeded(), slotsLeft(c),
                c.getDeadline(), c.getStatus().name(), c.getCreatedAt(),
                c.getDescription(), c.getRequirements(), c.getRejectReason(),
                (long) c.getRewardPerCreator() * c.getCreatorsNeeded());
    }
}
