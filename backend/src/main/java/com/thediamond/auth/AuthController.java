package com.thediamond.auth;

import com.thediamond.api.dto.AuthDtos.AuthResponse;
import com.thediamond.api.dto.AuthDtos.LoginRequest;
import com.thediamond.api.dto.AuthDtos.RegisterRequest;
import com.thediamond.api.dto.AuthDtos.UserSummary;
import com.thediamond.api.dto.AuthDtos.VerifyEmailRequest;
import com.thediamond.error.ApiException;
import com.thediamond.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerification;

    public AuthController(AuthService authService, EmailVerificationService emailVerification) {
        this.authService = authService;
        this.emailVerification = emailVerification;
    }

    @PostMapping("/register")
    public ResponseEntity<UserSummary> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UserSummary me(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Требуется вход");
        }
        return authService.currentUser(principal.userId());
    }

    @PostMapping("/email/send-code")
    public void sendEmailCode(@AuthenticationPrincipal AuthPrincipal me) {
        emailVerification.sendCode(me.userId());
    }

    @PostMapping("/email/verify")
    public UserSummary verifyEmail(@AuthenticationPrincipal AuthPrincipal me,
                                   @Valid @RequestBody VerifyEmailRequest req) {
        emailVerification.verify(me.userId(), req.code());
        return authService.currentUser(me.userId());
    }
}
