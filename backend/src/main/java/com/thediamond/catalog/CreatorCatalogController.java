package com.thediamond.catalog;

import com.thediamond.api.dto.ProfileDtos.CreatorProfileResponse;
import com.thediamond.domain.Category;
import com.thediamond.security.AuthPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creators")
@PreAuthorize("hasRole('BRAND')")
public class CreatorCatalogController {

    private final CatalogService service;

    public CreatorCatalogController(CatalogService service) {
        this.service = service;
    }

    @GetMapping
    public List<CreatorProfileResponse> list(@RequestParam(required = false) Category category,
                                             @RequestParam(required = false) String city) {
        return service.list(category, city);
    }

    @GetMapping("/{id}")
    public CreatorProfileResponse detail(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.detail(me.userId(), id);
    }
}
