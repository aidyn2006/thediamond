package com.thediamond.api.dto;

import com.thediamond.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank(message = "Укажите email") @Email(message = "Неверный формат email") String email,
            @NotBlank(message = "Придумайте пароль")
            @Size(min = 8, max = 100, message = "Пароль от 8 символов") String password,
            @NotNull(message = "Выберите роль") Role role
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Укажите email") String email,
            @NotBlank(message = "Введите пароль") String password
    ) {}

    public record VerifyEmailRequest(
            @NotBlank(message = "Введите код") @Size(min = 6, max = 6, message = "Код из 6 цифр") String code
    ) {}

    public record ForgotPasswordRequest(
            @NotBlank(message = "Укажите email") @Email(message = "Неверный формат email") String email
    ) {}

    public record ResetPasswordRequest(
            @NotBlank(message = "Ссылка недействительна") String token,
            @NotBlank(message = "Придумайте пароль")
            @Size(min = 8, max = 100, message = "Пароль от 8 символов") String password
    ) {}

    public record UserSummary(
            Long id,
            String email,
            Role role,
            boolean banned,
            boolean emailVerified,
            boolean onboardingComplete,
            boolean approved
    ) {}

    public record AuthResponse(String token, UserSummary user) {}
}
