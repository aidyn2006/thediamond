package com.thediamond.auth;

import com.thediamond.api.dto.AuthDtos.AuthResponse;
import com.thediamond.api.dto.AuthDtos.LoginRequest;
import com.thediamond.api.dto.AuthDtos.RegisterRequest;
import com.thediamond.api.dto.AuthDtos.UserSummary;
import com.thediamond.domain.Role;
import com.thediamond.domain.User;
import com.thediamond.error.ApiException;
import com.thediamond.notify.InAppNotificationService;
import com.thediamond.notify.NotificationService;
import com.thediamond.repo.UserProfileRepository;
import com.thediamond.repo.UserRepository;
import com.thediamond.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final UserProfileRepository profiles;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService email;
    private final InAppNotificationService inApp;
    private final String siteUrl;

    public AuthService(UserRepository users, UserProfileRepository profiles,
                       PasswordEncoder passwordEncoder, JwtService jwtService,
                       NotificationService email, InAppNotificationService inApp,
                       @Value("${app.site-url}") String siteUrl) {
        this.users = users;
        this.profiles = profiles;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.email = email;
        this.inApp = inApp;
        this.siteUrl = siteUrl.endsWith("/") ? siteUrl.substring(0, siteUrl.length() - 1) : siteUrl;
    }

    @Transactional
    public UserSummary register(RegisterRequest req) {
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw ApiException.conflict("EMAIL_TAKEN", "Такой email уже зарегистрирован — войти?");
        }
        User user = new User();
        user.setEmail(req.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(Role.USER);
        users.save(user);

        // Welcome pair: the email is the receipt, the in-app one is what the bell shows
        // on the very first login.
        email.welcome(user.getEmail(), siteUrl);
        inApp.send(user.getId(), "Добро пожаловать в TheDiamond",
                "Заполните профиль и выставляйте телефон на продажу — комиссии нет.");
        return buildSummary(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS",
                        "Неверный email или пароль"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Неверный email или пароль");
        }
        if (user.isBanned()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "BANNED", "Аккаунт заблокирован");
        }
        String token = jwtService.generate(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, buildSummary(user));
    }

    @Transactional(readOnly = true)
    public UserSummary currentUser(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        return buildSummary(user);
    }

    private UserSummary buildSummary(User user) {
        // Admins never post or buy, so onboarding doesn't apply to them.
        boolean onboardingComplete = user.getRole() == Role.ADMIN
                || profiles.findByUserId(user.getId()).isPresent();
        return new UserSummary(user.getId(), user.getEmail(), user.getRole(), user.isBanned(),
                user.isEmailVerified(), onboardingComplete);
    }
}
