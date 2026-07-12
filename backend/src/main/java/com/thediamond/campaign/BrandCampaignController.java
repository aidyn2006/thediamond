package com.thediamond.campaign;

import com.thediamond.api.dto.CampaignDtos.*;
import com.thediamond.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brand/campaigns")
@PreAuthorize("hasRole('BRAND')")
public class BrandCampaignController {

    private final CampaignService service;

    public BrandCampaignController(CampaignService service) {
        this.service = service;
    }

    @GetMapping
    public List<BrandCampaignItem> list(@AuthenticationPrincipal AuthPrincipal me) {
        return service.listMine(me.userId());
    }

    @PostMapping
    public ResponseEntity<CampaignFull> create(@AuthenticationPrincipal AuthPrincipal me,
                                               @RequestParam(defaultValue = "false") boolean submit,
                                               @Valid @RequestBody CampaignRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(me.userId(), req, submit));
    }

    @GetMapping("/{id}")
    public CampaignFull get(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.getMine(me.userId(), id);
    }

    @PutMapping("/{id}")
    public CampaignFull update(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id,
                               @Valid @RequestBody CampaignRequest req) {
        return service.update(me.userId(), id, req);
    }

    @PostMapping("/{id}/submit")
    public CampaignFull submit(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.submit(me.userId(), id);
    }

    @PostMapping("/{id}/close")
    public CampaignFull close(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.close(me.userId(), id);
    }
}
