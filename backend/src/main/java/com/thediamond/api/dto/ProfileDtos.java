package com.thediamond.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ProfileDtos {

    private ProfileDtos() {}

    public record ProfileRequest(
            @NotBlank(message = "Как вас зовут?") @Size(max = 120) String displayName,
            @NotBlank(message = "Укажите телефон")
            @Pattern(regexp = "^\\+?[0-9 ()-]{10,20}$", message = "Например +7 701 123 45 67")
            String phone,
            @NotBlank(message = "Укажите город") @Size(max = 80) String city,
            @Size(max = 500) String avatarUrl,
            @Size(max = 500, message = "До 500 символов") String about
    ) {}

    public record ProfileResponse(
            Long id,
            String email,
            String displayName,
            String phone,
            String city,
            String avatarUrl,
            String about,
            Instant createdAt
    ) {}
}
