package com.thediamond.auth;

import com.thediamond.domain.BrandProfile;
import com.thediamond.domain.CreatorProfile;
import com.thediamond.domain.User;
import com.thediamond.error.ApiException;
import com.thediamond.notify.InAppNotificationService;
import com.thediamond.notify.NotificationService;
import com.thediamond.repo.BrandProfileRepository;
import com.thediamond.repo.CreatorProfileRepository;
import com.thediamond.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

/**
 * Email confirmation via a 6-digit code. On successful confirmation the user's
 * profile (creator or brand) is auto-approved — no admin moderation required.
 */
@Service
public class EmailVerificationService {

    private static final Duration CODE_TTL = Duration.ofMinutes(15);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final CreatorProfileRepository creators;
    private final BrandProfileRepository brands;
    private final NotificationService email;
    private final InAppNotificationService inApp;

    public EmailVerificationService(UserRepository users, CreatorProfileRepository creators,
                                    BrandProfileRepository brands, NotificationService email,
                                    InAppNotificationService inApp) {
        this.users = users;
        this.creators = creators;
        this.brands = brands;
        this.email = email;
        this.inApp = inApp;
    }

    @Transactional
    public void sendCode(Long userId) {
        User user = users.findById(userId).orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        if (user.isEmailVerified()) {
            throw ApiException.badRequest("ALREADY_VERIFIED", "Почта уже подтверждена");
        }
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        user.setVerificationCode(code);
        user.setVerificationCodeExpires(Instant.now().plus(CODE_TTL));
        users.save(user);
        email.emailVerificationCode(user.getEmail(), code);
    }

    @Transactional
    public void verify(Long userId, String code) {
        User user = users.findById(userId).orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        if (user.isEmailVerified()) return;
        if (user.getVerificationCode() == null || user.getVerificationCodeExpires() == null
                || user.getVerificationCodeExpires().isBefore(Instant.now())) {
            throw ApiException.badRequest("CODE_EXPIRED", "Код истёк — запросите новый");
        }
        if (!user.getVerificationCode().equals(code == null ? null : code.trim())) {
            throw ApiException.badRequest("CODE_INVALID", "Неверный код подтверждения");
        }
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpires(null);
        users.save(user);
        autoApproveProfiles(user);
    }

    /** Approve the user's existing profile (if any) now that their email is confirmed. */
    @Transactional
    public void autoApproveProfiles(User user) {
        if (!user.isEmailVerified()) return;
        CreatorProfile creator = creators.findByUserId(user.getId()).orElse(null);
        if (creator != null && !creator.isApproved()) {
            creator.setApproved(true);
            creators.save(creator);
            email.creatorProfileApproved(user.getEmail());
            inApp.send(user.getId(), "Вас приняли как UGC-креатора",
                    "Профиль подтверждён — теперь вы можете откликаться на кампании.");
        }
        BrandProfile brand = brands.findByUserId(user.getId()).orElse(null);
        if (brand != null && !brand.isApproved()) {
            brand.setApproved(true);
            brands.save(brand);
            email.brandProfileApproved(user.getEmail());
            inApp.send(user.getId(), "Профиль компании одобрен",
                    "Почта подтверждена — создайте первую кампанию.");
        }
    }
}
