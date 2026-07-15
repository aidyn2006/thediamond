package com.thediamond.profile;

import com.thediamond.api.dto.SocialProofDtos.SocialProofRequest;
import com.thediamond.api.dto.SocialProofDtos.SocialProofResponse;
import com.thediamond.api.dto.SocialProofDtos.SocialProofState;
import com.thediamond.domain.CreatorProfile;
import com.thediamond.domain.CreatorSocialProof;
import com.thediamond.domain.Platform;
import com.thediamond.domain.SocialProofStatus;
import com.thediamond.error.ApiException;
import com.thediamond.repo.CreatorProfileRepository;
import com.thediamond.repo.CreatorSocialProofRepository;
import com.thediamond.wallet.WalletService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;

@Service
public class SocialProofService {

    private final CreatorProfileRepository creators;
    private final CreatorSocialProofRepository proofs;
    private final WalletService wallet;

    public SocialProofService(CreatorProfileRepository creators, CreatorSocialProofRepository proofs,
                              WalletService wallet) {
        this.creators = creators;
        this.proofs = proofs;
        this.wallet = wallet;
    }

    @Transactional(readOnly = true)
    public SocialProofState state(Long userId) {
        CreatorProfile creator = requireCreator(userId);
        return new SocialProofState(
                verificationCode(creator),
                proofs.findTopByCreatorIdOrderByCreatedAtDesc(creator.getId()).map(this::toResponse).orElse(null)
        );
    }

    @Transactional
    public SocialProofResponse submit(Long userId, SocialProofRequest req) {
        CreatorProfile creator = requireCreator(userId);
        validatePlatform(req.platform());

        String postUrl = req.postUrl().trim();
        if (!matchesPlatform(req.platform(), postUrl)) {
            throw ApiException.badRequest("SOCIAL_URL_PLATFORM", "Ссылка не похожа на выбранную площадку");
        }

        CreatorSocialProof proof = new CreatorSocialProof();
        proof.setCreator(creator);
        proof.setPlatform(req.platform());
        proof.setPostUrl(postUrl);
        proof.setScreenshotUrl(blankToNull(req.screenshotUrl()));
        proof.setVerificationCode(verificationCode(creator));

        if (proof.getScreenshotUrl() != null) {
            validateScreenshotUrl(proof.getScreenshotUrl());
            proof.setStatus(SocialProofStatus.AUTO_APPROVED);
            proof.setReviewedAt(Instant.now());
            creator.setApproved(true);
            creators.save(creator);
        } else {
            proof.setStatus(SocialProofStatus.PENDING);
        }

        proofs.save(proof);
        // Reward the one-time "advertise TheDiamond" task once the post is approved.
        if (proof.getStatus() == SocialProofStatus.AUTO_APPROVED) {
            wallet.creditAdvertiseReward(creator.getUser().getId(), proof.getPlatform());
        }
        return toResponse(proof);
    }

    @Transactional
    public void markLatest(CreatorProfile creator, boolean approved, String reason) {
        proofs.findTopByCreatorIdOrderByCreatedAtDesc(creator.getId()).ifPresent(proof -> {
            proof.setStatus(approved ? SocialProofStatus.APPROVED : SocialProofStatus.REJECTED);
            proof.setRejectReason(approved ? null : blankToNull(reason));
            proof.setReviewedAt(Instant.now());
            proofs.save(proof);
            if (approved) {
                wallet.creditAdvertiseReward(creator.getUser().getId(), proof.getPlatform());
            }
        });
    }

    @Transactional(readOnly = true)
    public SocialProofResponse latestForCreator(Long creatorId) {
        return proofs.findTopByCreatorIdOrderByCreatedAtDesc(creatorId).map(this::toResponse).orElse(null);
    }

    public SocialProofResponse toResponse(CreatorSocialProof proof) {
        return new SocialProofResponse(
                proof.getId(),
                proof.getPlatform().name(),
                proof.getPostUrl(),
                proof.getScreenshotUrl(),
                proof.getVerificationCode(),
                proof.getStatus().name(),
                proof.getRejectReason(),
                proof.getCreatedAt(),
                proof.getReviewedAt()
        );
    }

    private CreatorProfile requireCreator(Long userId) {
        return creators.findByUserId(userId)
                .orElseThrow(() -> ApiException.forbidden("Сначала заполните профиль"));
    }

    private String verificationCode(CreatorProfile creator) {
        long id = creator.getId() == null ? creator.getUser().getId() : creator.getId();
        String base = Long.toString(id, 36).toUpperCase(Locale.ROOT);
        return "TD-" + String.format("%4s", base).replace(' ', '0');
    }

    private void validatePlatform(Platform platform) {
        if (platform == Platform.YOUTUBE) {
            throw ApiException.badRequest("SOCIAL_PLATFORM", "Для подтверждения выберите Instagram, TikTok или Threads");
        }
    }

    private boolean matchesPlatform(Platform platform, String rawUrl) {
        String host;
        try {
            host = URI.create(rawUrl).getHost();
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("SOCIAL_URL", "Проверьте ссылку на публикацию");
        }
        if (host == null) {
            throw ApiException.badRequest("SOCIAL_URL", "Проверьте ссылку на публикацию");
        }
        host = host.toLowerCase(Locale.ROOT);
        Set<String> allowed = switch (platform) {
            case INSTAGRAM -> Set.of("instagram.com", "www.instagram.com");
            case TIKTOK -> Set.of("tiktok.com", "www.tiktok.com", "vm.tiktok.com");
            case THREADS -> Set.of("threads.net", "www.threads.net", "threads.com", "www.threads.com");
            case YOUTUBE -> Set.of();
        };
        return allowed.contains(host);
    }

    private void validateScreenshotUrl(String rawUrl) {
        String path;
        try {
            path = URI.create(rawUrl).getPath();
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("SOCIAL_SCREENSHOT", "Загрузите скриншот через форму");
        }
        if (path == null || !path.startsWith("/uploads/")) {
            throw ApiException.badRequest("SOCIAL_SCREENSHOT", "Загрузите скриншот через форму");
        }
    }

    private static String blankToNull(String s) {
        return s != null && !s.isBlank() ? s.trim() : null;
    }
}
