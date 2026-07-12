package com.thediamond.api.dto;

import com.thediamond.domain.Category;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public final class ProfileDtos {

    private ProfileDtos() {}

    public record CreatorProfileRequest(
            @NotBlank(message = "Как вас зовут?") @Size(max = 120) String name,
            @NotBlank(message = "Придумайте username")
            @Size(max = 60)
            @Pattern(regexp = "^[a-zA-Z0-9_.]+$", message = "Латиница, цифры, точка и подчёркивание")
            String username,
            @NotBlank(message = "Укажите город") @Size(max = 80) String city,
            @NotNull(message = "Укажите дату рождения") @Past(message = "Дата в прошлом") LocalDate birthDate,
            @NotEmpty(message = "Выберите хотя бы одну категорию") Set<Category> categories,
            @Size(max = 500, message = "До 500 символов") String bio,
            @Size(max = 500) String avatarUrl,
            @Size(max = 300) String instagramUrl,
            @Size(max = 300) String tiktokUrl,
            @Size(max = 300) String threadsUrl,
            @Size(max = 300) String youtubeUrl,
            @Size(max = 300) String telegramUrl,
            @PositiveOrZero(message = "Не может быть отрицательным") Integer instagramFollowers,
            @PositiveOrZero(message = "Не может быть отрицательным") Integer tiktokFollowers,
            @PositiveOrZero(message = "Не может быть отрицательным") Integer threadsFollowers,
            @PositiveOrZero(message = "Не может быть отрицательным") Integer youtubeFollowers
    ) {}

    public record BrandProfileRequest(
            @NotBlank(message = "Название компании") @Size(max = 200) String companyName,
            @NotBlank(message = "Укажите БИН")
            @Pattern(regexp = "^\\d{12}$", message = "БИН — ровно 12 цифр") String bin,
            @Size(max = 300) String website,
            @NotBlank(message = "Укажите телефон") @Size(max = 40) String phone,
            @NotBlank(message = "Контактное лицо") @Size(max = 120) String contactName
    ) {}

    public record SocialLink(String platform, String url, Integer followers) {}

    public record CreatorProfileResponse(
            Long id,
            String email,
            String name,
            String username,
            String avatarUrl,
            String bio,
            String city,
            LocalDate birthDate,
            List<Category> categories,
            List<SocialLink> socials,
            long totalFollowers,
            String telegramUrl,
            boolean approved
    ) {}

    public record BrandProfileResponse(
            Long id,
            String email,
            String companyName,
            String bin,
            String website,
            String phone,
            String contactName,
            boolean approved
    ) {}
}
