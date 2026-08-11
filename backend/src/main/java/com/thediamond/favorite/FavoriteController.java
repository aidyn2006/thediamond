package com.thediamond.favorite;

import com.thediamond.api.dto.ListingDtos.ListingSummary;
import com.thediamond.security.AuthPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@PreAuthorize("isAuthenticated()")
public class FavoriteController {

    private final FavoriteService service;

    public FavoriteController(FavoriteService service) {
        this.service = service;
    }

    @GetMapping
    public List<ListingSummary> list(@AuthenticationPrincipal AuthPrincipal me) {
        return service.list(me.userId());
    }

    @PutMapping("/{listingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void add(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long listingId) {
        service.add(me.userId(), listingId);
    }

    @DeleteMapping("/{listingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long listingId) {
        service.remove(me.userId(), listingId);
    }
}
