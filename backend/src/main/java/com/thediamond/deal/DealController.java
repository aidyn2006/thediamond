package com.thediamond.deal;

import com.thediamond.api.dto.DealDtos.DealDecision;
import com.thediamond.api.dto.DealDtos.DealItem;
import com.thediamond.api.dto.DealDtos.DealRequest;
import com.thediamond.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
@PreAuthorize("isAuthenticated()")
public class DealController {

    private final DealService service;

    public DealController(DealService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DealItem> request(@AuthenticationPrincipal AuthPrincipal me,
                                            @Valid @RequestBody DealRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.request(me.userId(), req));
    }

    /** Deals where I'm the buyer. */
    @GetMapping("/purchases")
    public List<DealItem> purchases(@AuthenticationPrincipal AuthPrincipal me) {
        return service.myPurchases(me.userId());
    }

    /** Deals on my own listings. */
    @GetMapping("/sales")
    public List<DealItem> sales(@AuthenticationPrincipal AuthPrincipal me) {
        return service.mySales(me.userId());
    }

    @PostMapping("/{id}/accept")
    public DealItem accept(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.accept(me.userId(), id);
    }

    @PostMapping("/{id}/decline")
    public DealItem decline(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id,
                            @Valid @RequestBody(required = false) DealDecision body) {
        return service.decline(me.userId(), id, body == null ? null : body.reason());
    }

    @PostMapping("/{id}/complete")
    public DealItem complete(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.complete(me.userId(), id);
    }

    @PostMapping("/{id}/cancel")
    public DealItem cancel(@AuthenticationPrincipal AuthPrincipal me, @PathVariable Long id) {
        return service.cancel(me.userId(), id);
    }
}
