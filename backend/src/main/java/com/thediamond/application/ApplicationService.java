package com.thediamond.application;

import com.thediamond.api.dto.ApplicationDtos.BrandApplication;
import com.thediamond.api.dto.ApplicationDtos.MyApplication;
import com.thediamond.campaign.CampaignService;
import com.thediamond.domain.*;
import com.thediamond.error.ApiException;
import com.thediamond.profile.Mappers;
import com.thediamond.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applications;
    private final CampaignRepository campaigns;
    private final CreatorProfileRepository creators;
    private final BrandProfileRepository brands;
    private final CampaignService campaignService;
    private final com.thediamond.notify.NotificationService notifier;

    public ApplicationService(ApplicationRepository applications, CampaignRepository campaigns,
                              CreatorProfileRepository creators, BrandProfileRepository brands,
                              CampaignService campaignService,
                              com.thediamond.notify.NotificationService notifier) {
        this.applications = applications;
        this.campaigns = campaigns;
        this.creators = creators;
        this.brands = brands;
        this.campaignService = campaignService;
        this.notifier = notifier;
    }

    // ---------- Creator ----------

    @Transactional
    public MyApplication apply(Long userId, Long campaignId) {
        CreatorProfile creator = requireCreator(userId);
        Campaign c = campaigns.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Кампания не найдена"));

        if (c.getStatus() != CampaignStatus.ACTIVE) {
            throw ApiException.badRequest("NOT_ACTIVE", "Приём откликов завершён");
        }
        if (c.getDeadline().isBefore(LocalDate.now())) {
            throw ApiException.badRequest("DEADLINE_PASSED", "Дедлайн прошёл");
        }
        if (campaignService.slotsLeft(c) <= 0) {
            throw ApiException.badRequest("NO_SLOTS", "Мест больше нет");
        }
        if (applications.existsByCampaignIdAndCreatorId(campaignId, creator.getId())) {
            throw ApiException.conflict("ALREADY_APPLIED", "Вы уже откликнулись на эту кампанию");
        }

        Application a = new Application();
        a.setCampaign(c);
        a.setCreator(creator);
        a.setStatus(ApplicationStatus.APPLIED);
        applications.save(a);
        notifier.newApplication(c.getBrand().getUser().getEmail(), creator.getName(), c.getTitle());
        return toMyApplication(a);
    }

    @Transactional(readOnly = true)
    public List<MyApplication> myApplications(Long userId) {
        CreatorProfile creator = requireCreator(userId);
        return applications.findByCreatorIdOrderByAppliedAtDesc(creator.getId()).stream()
                .map(this::toMyApplication)
                .toList();
    }

    // ---------- Brand ----------

    @Transactional(readOnly = true)
    public List<BrandApplication> listForCampaign(Long userId, Long campaignId) {
        Campaign c = requireOwnedCampaign(userId, campaignId);
        return applications.findByCampaignIdOrderByAppliedAtDesc(c.getId()).stream()
                .map(this::toBrandApplication)
                .toList();
    }

    @Transactional
    public BrandApplication accept(Long userId, Long applicationId) {
        Application a = requireOwnedApplication(userId, applicationId);
        if (a.getStatus() != ApplicationStatus.APPLIED) {
            throw ApiException.badRequest("BAD_STATE", "Отклик уже обработан");
        }
        if (campaignService.slotsLeft(a.getCampaign()) <= 0) {
            throw ApiException.badRequest("NO_SLOTS", "Все места уже заняты");
        }
        a.setStatus(ApplicationStatus.ACCEPTED);
        a.setReviewedAt(Instant.now());
        applications.save(a);
        notifier.applicationAccepted(a.getCreator().getUser().getEmail(), a.getCampaign().getTitle());
        return toBrandApplication(a);
    }

    @Transactional
    public BrandApplication decline(Long userId, Long applicationId) {
        Application a = requireOwnedApplication(userId, applicationId);
        if (a.getStatus() != ApplicationStatus.APPLIED) {
            throw ApiException.badRequest("BAD_STATE", "Отклик уже обработан");
        }
        a.setStatus(ApplicationStatus.DECLINED);
        a.setReviewedAt(Instant.now());
        applications.save(a);
        return toBrandApplication(a);
    }

    // ---------- Work submission & review (stage 5) ----------

    @Transactional
    public MyApplication submitWork(Long userId, Long applicationId, String url) {
        CreatorProfile creator = requireCreator(userId);
        Application a = applications.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Отклик не найден"));
        if (!a.getCreator().getId().equals(creator.getId())) {
            throw ApiException.forbidden("Это не ваш отклик");
        }
        boolean firstSubmit = a.getStatus() == ApplicationStatus.ACCEPTED;
        boolean resubmit = a.getStatus() == ApplicationStatus.REJECTED && !a.isResubmitUsed();
        if (!firstSubmit && !resubmit) {
            throw ApiException.badRequest("BAD_STATE", "Сейчас работу сдать нельзя");
        }
        a.setSubmissionUrl(url.trim());
        a.setStatus(ApplicationStatus.SUBMITTED);
        a.setSubmittedAt(Instant.now());
        a.setRejectReason(null);
        if (resubmit) a.setResubmitUsed(true);
        applications.save(a);
        return toMyApplication(a);
    }

    @Transactional
    public BrandApplication approveWork(Long userId, Long applicationId) {
        Application a = requireOwnedApplication(userId, applicationId);
        if (a.getStatus() != ApplicationStatus.SUBMITTED) {
            throw ApiException.badRequest("BAD_STATE", "Работа не на проверке");
        }
        a.setStatus(ApplicationStatus.APPROVED);
        a.setReviewedAt(Instant.now());
        applications.save(a);
        notifier.workApproved(a.getCreator().getUser().getEmail(), a.getCampaign().getTitle());
        return toBrandApplication(a);
    }

    @Transactional
    public BrandApplication rejectWork(Long userId, Long applicationId, String reason) {
        Application a = requireOwnedApplication(userId, applicationId);
        if (a.getStatus() != ApplicationStatus.SUBMITTED) {
            throw ApiException.badRequest("BAD_STATE", "Работа не на проверке");
        }
        if (reason == null || reason.isBlank()) {
            throw ApiException.badRequest("REASON_REQUIRED", "Укажите причину");
        }
        a.setStatus(ApplicationStatus.REJECTED);
        a.setRejectReason(reason.trim());
        a.setReviewedAt(Instant.now());
        applications.save(a);
        notifier.workRejected(a.getCreator().getUser().getEmail(), a.getCampaign().getTitle(), reason.trim());
        return toBrandApplication(a);
    }

    // ---------- helpers ----------

    private CreatorProfile requireCreator(Long userId) {
        return creators.findByUserId(userId)
                .orElseThrow(() -> ApiException.forbidden("Сначала заполните профиль"));
    }

    private Campaign requireOwnedCampaign(Long userId, Long campaignId) {
        Campaign c = campaigns.findById(campaignId)
                .orElseThrow(() -> ApiException.notFound("Кампания не найдена"));
        BrandProfile brand = brands.findByUserId(userId)
                .orElseThrow(() -> ApiException.forbidden("Профиль компании не найден"));
        if (!c.getBrand().getId().equals(brand.getId())) {
            throw ApiException.forbidden("Это не ваша кампания");
        }
        return c;
    }

    private Application requireOwnedApplication(Long userId, Long applicationId) {
        Application a = applications.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Отклик не найден"));
        BrandProfile brand = brands.findByUserId(userId)
                .orElseThrow(() -> ApiException.forbidden("Профиль компании не найден"));
        if (!a.getCampaign().getBrand().getId().equals(brand.getId())) {
            throw ApiException.forbidden("Это не ваш отклик");
        }
        return a;
    }

    private MyApplication toMyApplication(Application a) {
        return new MyApplication(
                a.getId(), a.getStatus().name(), a.getSubmissionUrl(), a.getRejectReason(),
                a.isResubmitUsed(), a.getAppliedAt(),
                campaignService.toSummary(a.getCampaign()));
    }

    private BrandApplication toBrandApplication(Application a) {
        return new BrandApplication(
                a.getId(), a.getStatus().name(), a.getSubmissionUrl(), a.getRejectReason(),
                a.isResubmitUsed(), a.getAppliedAt(), a.getSubmittedAt(),
                Mappers.toCreatorResponse(a.getCreator(), true));
    }
}
