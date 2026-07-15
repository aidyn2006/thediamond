package com.thediamond.auth;

import com.thediamond.api.dto.AuthDtos.AuthResponse;
import com.thediamond.api.dto.AuthDtos.LoginRequest;
import com.thediamond.api.dto.AuthDtos.RegisterRequest;
import com.thediamond.api.dto.AuthDtos.UserSummary;
import com.thediamond.domain.BrandProfile;
import com.thediamond.domain.CreatorProfile;
import com.thediamond.domain.Role;
import com.thediamond.domain.User;
import com.thediamond.error.ApiException;
import com.thediamond.repo.BrandProfileRepository;
import com.thediamond.repo.CreatorProfileRepository;
import com.thediamond.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final CreatorProfileRepository creators;
    private final BrandProfileRepository brands;
    private final com.thediamond.repo.CreatorSocialProofRepository proofs;
    private final PasswordEncoder passwordEncoder;
    private final com.thediamond.security.JwtService jwtService;

    public AuthService(UserRepository users, CreatorProfileRepository creators, BrandProfileRepository brands,
                       com.thediamond.repo.CreatorSocialProofRepository proofs,
                       PasswordEncoder passwordEncoder, com.thediamond.security.JwtService jwtService) {
        this.users = users;
        this.creators = creators;
        this.brands = brands;
        this.proofs = proofs;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserSummary register(RegisterRequest req) {
        if (req.role() == Role.ADMIN) {
            throw ApiException.badRequest("ROLE_NOT_ALLOWED", "Регистрация с этой ролью недоступна");
        }
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw ApiException.conflict("EMAIL_TAKEN", "Такой email уже зарегистрирован — войти?");
        }
        User user = new User();
        user.setEmail(req.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(req.role());
        users.save(user);
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
        boolean onboardingComplete;
        boolean approved;
        // Non-creators have no advertise task, so it's "done" for gating purposes.
        boolean rewardTaskDone = true;
        switch (user.getRole()) {
            case CREATOR -> {
                CreatorProfile p = creators.findByUserId(user.getId()).orElse(null);
                onboardingComplete = p != null;
                approved = p != null && p.isApproved();
                rewardTaskDone = user.isRewardTaskPaid();
                if (!rewardTaskDone && p != null) {
                    // Also "done" once a post has been submitted and not rejected.
                    rewardTaskDone = proofs.findTopByCreatorIdOrderByCreatedAtDesc(p.getId())
                            .map(pr -> pr.getStatus() != com.thediamond.domain.SocialProofStatus.REJECTED)
                            .orElse(false);
                }
            }
            case BRAND -> {
                BrandProfile p = brands.findByUserId(user.getId()).orElse(null);
                onboardingComplete = p != null;
                approved = p != null && p.isApproved();
            }
            default -> {
                onboardingComplete = true;
                approved = true;
            }
        }
        return new UserSummary(user.getId(), user.getEmail(), user.getRole(), user.isBanned(),
                user.isEmailVerified(), onboardingComplete, approved, rewardTaskDone);
    }
}
