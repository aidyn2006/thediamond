package com.thediamond.profile;

import com.thediamond.api.dto.ProfileDtos.*;
import com.thediamond.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    // ---- Creator ----
    @GetMapping("/creator/me")
    @PreAuthorize("hasRole('CREATOR')")
    public CreatorProfileResponse getCreatorMe(@AuthenticationPrincipal AuthPrincipal me) {
        return service.getCreatorMe(me.userId());
    }

    @PutMapping("/creator/me")
    @PreAuthorize("hasRole('CREATOR')")
    public CreatorProfileResponse upsertCreator(@AuthenticationPrincipal AuthPrincipal me,
                                                @Valid @RequestBody CreatorProfileRequest req) {
        return service.upsertCreator(me.userId(), req);
    }

    // ---- Brand ----
    @GetMapping("/brand/me")
    @PreAuthorize("hasRole('BRAND')")
    public BrandProfileResponse getBrandMe(@AuthenticationPrincipal AuthPrincipal me) {
        return service.getBrandMe(me.userId());
    }

    @PutMapping("/brand/me")
    @PreAuthorize("hasRole('BRAND')")
    public BrandProfileResponse upsertBrand(@AuthenticationPrincipal AuthPrincipal me,
                                            @Valid @RequestBody BrandProfileRequest req) {
        return service.upsertBrand(me.userId(), req);
    }
}
