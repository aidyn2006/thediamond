package com.thediamond.profile;

import com.thediamond.api.dto.ProfileDtos.ProfileRequest;
import com.thediamond.api.dto.ProfileDtos.ProfileResponse;
import com.thediamond.domain.User;
import com.thediamond.domain.UserProfile;
import com.thediamond.error.ApiException;
import com.thediamond.repo.UserProfileRepository;
import com.thediamond.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final UserRepository users;
    private final UserProfileRepository profiles;

    public ProfileService(UserRepository users, UserProfileRepository profiles) {
        this.users = users;
        this.profiles = profiles;
    }

    @Transactional(readOnly = true)
    public ProfileResponse me(Long userId) {
        UserProfile p = profiles.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Профиль ещё не заполнен"));
        return Mappers.toProfileResponse(p);
    }

    @Transactional
    public ProfileResponse upsert(Long userId, ProfileRequest req) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Пользователь не найден"));
        UserProfile p = profiles.findByUserId(userId).orElseGet(UserProfile::new);
        p.setUser(user);
        p.setDisplayName(req.displayName().trim());
        p.setPhone(req.phone().trim());
        p.setCity(req.city().trim());
        p.setAvatarUrl(blankToNull(req.avatarUrl()));
        p.setAbout(blankToNull(req.about()));
        profiles.save(p);
        return Mappers.toProfileResponse(p);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
