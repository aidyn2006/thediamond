package com.thediamond.profile;

import com.thediamond.api.dto.ProfileDtos.ProfileRequest;
import com.thediamond.api.dto.ProfileDtos.ProfileResponse;
import com.thediamond.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public ProfileResponse me(@AuthenticationPrincipal AuthPrincipal me) {
        return service.me(me.userId());
    }

    @PutMapping("/me")
    public ProfileResponse upsert(@AuthenticationPrincipal AuthPrincipal me,
                                 @Valid @RequestBody ProfileRequest req) {
        return service.upsert(me.userId(), req);
    }
}
