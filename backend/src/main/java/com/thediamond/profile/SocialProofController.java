package com.thediamond.profile;

import com.thediamond.api.dto.SocialProofDtos.SocialProofRequest;
import com.thediamond.api.dto.SocialProofDtos.SocialProofResponse;
import com.thediamond.api.dto.SocialProofDtos.SocialProofState;
import com.thediamond.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/creator/social-proof")
@PreAuthorize("hasRole('CREATOR')")
public class SocialProofController {

    private final SocialProofService service;

    public SocialProofController(SocialProofService service) {
        this.service = service;
    }

    @GetMapping
    public SocialProofState state(@AuthenticationPrincipal AuthPrincipal me) {
        return service.state(me.userId());
    }

    @PostMapping
    public SocialProofResponse submit(@AuthenticationPrincipal AuthPrincipal me,
                                      @Valid @RequestBody SocialProofRequest req) {
        return service.submit(me.userId(), req);
    }
}
