package com.thediamond.admin;

import com.thediamond.api.dto.AdminDtos.AdminUser;
import com.thediamond.api.dto.AdminDtos.AdminUserDetail;
import com.thediamond.api.dto.AdminDtos.ModerationDecision;
import com.thediamond.api.dto.AdminDtos.StatsResponse;
import com.thediamond.api.dto.ListingDtos.ListingSummary;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return service.stats();
    }

    @GetMapping("/users")
    public List<AdminUser> users(@RequestParam(required = false) String search) {
        return service.listUsers(search);
    }

    @GetMapping("/users/{id}")
    public AdminUserDetail user(@PathVariable Long id) {
        return service.userDetail(id);
    }

    @PostMapping("/users/{id}/ban")
    public AdminUser ban(@PathVariable Long id) {
        return service.setBan(id, true);
    }

    @PostMapping("/users/{id}/unban")
    public AdminUser unban(@PathVariable Long id) {
        return service.setBan(id, false);
    }

    /** status: pending | active | rejected | sold | all (default). */
    @GetMapping("/listings")
    public List<ListingSummary> listings(@RequestParam(required = false) String status) {
        return service.listListings(status);
    }

    @PostMapping("/listings/{id}/approve")
    public ListingSummary approve(@PathVariable Long id) {
        return service.moderateListing(id, true, null);
    }

    @PostMapping("/listings/{id}/reject")
    public ListingSummary reject(@PathVariable Long id,
                                 @Valid @RequestBody(required = false) ModerationDecision body) {
        return service.moderateListing(id, false, body == null ? null : body.reason());
    }
}
