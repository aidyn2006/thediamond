package com.thediamond.listing;

import com.thediamond.api.dto.ListingDtos.ListingDetail;
import com.thediamond.api.dto.ListingDtos.ListingRequest;
import com.thediamond.api.dto.ListingDtos.ListingSummary;
import com.thediamond.api.dto.ListingDtos.MyListingItem;
import com.thediamond.domain.PhoneBrand;
import com.thediamond.domain.PhoneCondition;
import com.thediamond.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
@PreAuthorize("isAuthenticated()")
public class ListingController {

    private final ListingService service;

    public ListingController(ListingService service) {
        this.service = service;
    }

    @GetMapping
    public List<ListingSummary> catalog(@RequestParam(required = false) PhoneBrand brand,
                                        @RequestParam(required = false) PhoneCondition condition,
                                        @RequestParam(required = false) String city,
                                        @RequestParam(required = false) Integer minPrice,
                                        @RequestParam(required = false) Integer maxPrice,
                                        @RequestParam(required = false) Integer minStorage,
                                        @RequestParam(required = false) String q) {
        return service.catalog(new ListingSpecs.Filters(
                brand, condition, city, minPrice, maxPrice, minStorage, q));
    }

    /** Must stay above {@code /{id}} so "mine" isn't parsed as an id. */
    @GetMapping("/mine")
    public List<MyListingItem> mine(@AuthenticationPrincipal AuthPrincipal me) {
        return service.mine(me.userId());
    }

    @GetMapping("/{id}")
    public ListingDetail detail(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.detail(me.userId(), id);
    }

    @PostMapping
    public ResponseEntity<ListingSummary> create(@AuthenticationPrincipal AuthPrincipal me,
                                                 @Valid @RequestBody ListingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(me.userId(), req));
    }

    @PutMapping("/{id}")
    public ListingSummary update(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id,
                                 @Valid @RequestBody ListingRequest req) {
        return service.update(me.userId(), id, req);
    }

    @PostMapping("/{id}/sold")
    public ListingSummary markSold(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.markSold(me.userId(), id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void archive(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        service.archive(me.userId(), id);
    }
}
