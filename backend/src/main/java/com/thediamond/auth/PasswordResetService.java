package com.thediamond.auth;

import com.thediamond.domain.User;
import com.thediamond.error.ApiException;
import com.thediamond.notify.NotificationService;
import com.thediamond.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/**
 * Forgot / reset password flow via an emailed one-time token.
 * Token requests never reveal whether an email exists (anti-enumeration).
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final Duration TOKEN_TTL = Duration.ofMinutes(30);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService email;
    private final String siteUrl;

    public PasswordResetService(UserRepository users, PasswordEncoder passwordEncoder,
                                NotificationService email, @Value("${app.site-url}") String siteUrl) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.siteUrl = siteUrl.endsWith("/") ? siteUrl.substring(0, siteUrl.length() - 1) : siteUrl;
    }

    /** Issue a reset token and email the link. Silent no-op if the email is unknown or banned. */
    @Transactional
    public void requestReset(String rawEmail) {
        User user = users.findByEmailIgnoreCase(rawEmail).orElse(null);
        if (user == null || user.isBanned()) {
            log.info("[PASSWORD_RESET] request for unknown/banned email, ignored");
            return;
        }
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        user.setPasswordResetToken(token);
        user.setPasswordResetExpires(Instant.now().plus(TOKEN_TTL));
        users.save(user);
        email.passwordReset(user.getEmail(), siteUrl + "/reset-password?token=" + token);
    }

    /** Consume a reset token and set the new password. */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = users.findByPasswordResetToken(token)
                .orElseThrow(() -> ApiException.badRequest("RESET_TOKEN_INVALID",
                        "Ссылка недействительна — запросите сброс заново"));
        if (user.getPasswordResetExpires() == null || user.getPasswordResetExpires().isBefore(Instant.now())) {
            throw ApiException.badRequest("RESET_TOKEN_EXPIRED", "Ссылка истекла — запросите сброс заново");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);
        users.save(user);
    }
}
