package com.thediamond.profile;

import com.thediamond.api.dto.ProfileDtos.*;
import com.thediamond.domain.BrandProfile;
import com.thediamond.domain.CreatorProfile;
import com.thediamond.domain.User;
import com.thediamond.error.ApiException;
import com.thediamond.repo.BrandProfileRepository;
import com.thediamond.repo.CreatorProfileRepository;
import com.thediamond.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashSet;

@Service
public class ProfileService {

    private final UserRepository users;
    private final CreatorProfileRepository creators;
    private final BrandProfileRepository brands;

    public ProfileService(UserRepository users, CreatorProfileRepository creators, BrandProfileRepository brands) {
        this.users = users;
        this.creators = creators;
        this.brands = brands;
    }

    // ---------- Creator ----------

    @Transactional(readOnly = true)
    public CreatorProfileResponse getCreatorMe(Long userId) {
        CreatorProfile p = creators.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Профиль ещё не заполнен"));
        return Mappers.toCreatorResponse(p, true);
    }

    @Transactional
    public CreatorProfileResponse upsertCreator(Long userId, CreatorProfileRequest req) {
        validateAge(req.birthDate());
        validateAtLeastOneSocial(req);

        User user = users.findById(userId).orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        CreatorProfile p = creators.findByUserId(userId).orElseGet(CreatorProfile::new);
        boolean isNew = p.getId() == null;

        String username = req.username().trim();
        boolean usernameChanged = isNew || !username.equalsIgnoreCase(p.getUsername());
        if (usernameChanged && creators.existsByUsernameIgnoreCase(username)) {
            throw ApiException.conflict("USERNAME_TAKEN", "Этот username уже занят");
        }

        p.setUser(user);
        p.setName(req.name().trim());
        p.setUsername(username);
        p.setCity(req.city().trim());
        p.setBirthDate(req.birthDate());
        p.setCategories(new HashSet<>(req.categories()));
        p.setBio(blankToNull(req.bio()));
        p.setAvatarUrl(blankToNull(req.avatarUrl()));
        p.setInstagramUrl(blankToNull(req.instagramUrl()));
        p.setTiktokUrl(blankToNull(req.tiktokUrl()));
        p.setThreadsUrl(blankToNull(req.threadsUrl()));
        p.setYoutubeUrl(blankToNull(req.youtubeUrl()));
        p.setTelegramUrl(blankToNull(req.telegramUrl()));
        p.setInstagramFollowers(req.instagramFollowers());
        p.setTiktokFollowers(req.tiktokFollowers());
        p.setThreadsFollowers(req.threadsFollowers());
        p.setYoutubeFollowers(req.youtubeFollowers());
        // approval is never granted by the user; new profiles start unapproved
        creators.save(p);
        return Mappers.toCreatorResponse(p, true);
    }

    // ---------- Brand ----------

    @Transactional(readOnly = true)
    public BrandProfileResponse getBrandMe(Long userId) {
        BrandProfile b = brands.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Профиль ещё не заполнен"));
        return Mappers.toBrandResponse(b);
    }

    @Transactional
    public BrandProfileResponse upsertBrand(Long userId, BrandProfileRequest req) {
        User user = users.findById(userId).orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        BrandProfile b = brands.findByUserId(userId).orElseGet(BrandProfile::new);
        b.setUser(user);
        b.setCompanyName(req.companyName().trim());
        b.setBin(req.bin().trim());
        b.setWebsite(blankToNull(req.website()));
        b.setPhone(req.phone().trim());
        b.setContactName(req.contactName().trim());
        brands.save(b);
        return Mappers.toBrandResponse(b);
    }

    // ---------- helpers ----------

    private void validateAge(LocalDate birthDate) {
        if (Period.between(birthDate, LocalDate.now()).getYears() < 16) {
            throw ApiException.badRequest("AGE_LIMIT", "Регистрация с 16 лет");
        }
    }

    private void validateAtLeastOneSocial(CreatorProfileRequest req) {
        boolean any = notBlank(req.instagramUrl()) || notBlank(req.tiktokUrl())
                || notBlank(req.threadsUrl()) || notBlank(req.youtubeUrl());
        if (!any) {
            throw ApiException.badRequest("NO_SOCIAL", "Добавьте хотя бы одну соцсеть");
        }
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String blankToNull(String s) {
        return notBlank(s) ? s.trim() : null;
    }
}
