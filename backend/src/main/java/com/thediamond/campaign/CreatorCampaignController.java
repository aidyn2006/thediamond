package com.thediamond.campaign;

import com.thediamond.api.dto.ApplicationDtos.MyApplication;
import com.thediamond.api.dto.CampaignDtos.CampaignDetail;
import com.thediamond.api.dto.CampaignDtos.CampaignFeedItem;
import com.thediamond.application.ApplicationService;
import com.thediamond.domain.Category;
import com.thediamond.domain.Platform;
import com.thediamond.security.AuthPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('CREATOR')")
public class CreatorCampaignController {

    private final CampaignService campaignService;
    private final ApplicationService applicationService;

    public CreatorCampaignController(CampaignService campaignService, ApplicationService applicationService) {
        this.campaignService = campaignService;
        this.applicationService = applicationService;
    }

    @GetMapping("/campaigns")
    public List<CampaignFeedItem> feed(@AuthenticationPrincipal AuthPrincipal me,
                                       @RequestParam(required = false) String search,
                                       @RequestParam(required = false) Category category,
                                       @RequestParam(required = false) Platform platform) {
        return campaignService.feed(me.userId(), search, category, platform);
    }

    @GetMapping("/campaigns/{id}")
    public CampaignDetail detail(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return campaignService.creatorDetail(me.userId(), id);
    }

    @PostMapping("/campaigns/{id}/apply")
    public ResponseEntity<MyApplication> apply(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.apply(me.userId(), id));
    }

    @GetMapping("/my-applications")
    public List<MyApplication> myApplications(@AuthenticationPrincipal AuthPrincipal me) {
        return applicationService.myApplications(me.userId());
    }
}
