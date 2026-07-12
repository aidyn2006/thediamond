package com.thediamond.application;

import com.thediamond.api.dto.ApplicationDtos.BrandApplication;
import com.thediamond.security.AuthPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brand")
@PreAuthorize("hasRole('BRAND')")
public class BrandApplicationController {

    private final ApplicationService service;

    public BrandApplicationController(ApplicationService service) {
        this.service = service;
    }

    @GetMapping("/campaigns/{id}/applications")
    public List<BrandApplication> forCampaign(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.listForCampaign(me.userId(), id);
    }

    @PostMapping("/applications/{id}/accept")
    public BrandApplication accept(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.accept(me.userId(), id);
    }

    @PostMapping("/applications/{id}/decline")
    public BrandApplication decline(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.decline(me.userId(), id);
    }
}
