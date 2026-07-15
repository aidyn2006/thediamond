package com.thediamond.admin;

import com.thediamond.api.dto.AdminDtos.AdminUser;
import com.thediamond.api.dto.AdminDtos.AdminUserDetail;
import com.thediamond.api.dto.AdminDtos.ModerationDecision;
import com.thediamond.api.dto.AdminDtos.StatsResponse;
import com.thediamond.api.dto.CampaignDtos.CampaignFull;
import com.thediamond.api.dto.ProfileDtos.BrandProfileResponse;
import com.thediamond.api.dto.ProfileDtos.CreatorProfileResponse;
import com.thediamond.api.dto.WalletDtos.WithdrawalItem;
import com.thediamond.campaign.CampaignService;
import com.thediamond.wallet.WalletService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService service;
    private final CampaignService campaignService;
    private final WalletService walletService;

    public AdminController(AdminService service, CampaignService campaignService, WalletService walletService) {
        this.service = service;
        this.campaignService = campaignService;
        this.walletService = walletService;
    }

    @GetMapping("/creators")
    public List<CreatorProfileResponse> creators(@RequestParam(required = false) String status) {
        return service.listCreators(status);
    }

    @GetMapping("/brands")
    public List<BrandProfileResponse> brands(@RequestParam(required = false) String status) {
        return service.listBrands(status);
    }

    @PostMapping("/creators/{id}/approve")
    public CreatorProfileResponse approveCreator(@PathVariable Long id) {
        return service.setCreatorApproval(id, true);
    }

    @PostMapping("/creators/{id}/reject")
    public CreatorProfileResponse rejectCreator(@PathVariable Long id,
                                                @RequestBody(required = false) @Valid ModerationDecision body) {
        return service.setCreatorApproval(id, false, body == null ? null : body.reason());
    }

    @PostMapping("/brands/{id}/approve")
    public BrandProfileResponse approveBrand(@PathVariable Long id) {
        return service.setBrandApproval(id, true);
    }

    @PostMapping("/brands/{id}/reject")
    public BrandProfileResponse rejectBrand(@PathVariable Long id,
                                            @RequestBody(required = false) @Valid ModerationDecision body) {
        return service.setBrandApproval(id, false, body == null ? null : body.reason());
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return service.stats();
    }

    // ---- Users ----

    @GetMapping("/users")
    public List<AdminUser> users(@RequestParam(required = false) String search) {
        return service.listUsers(search);
    }

    @PostMapping("/users/{id}/ban")
    public AdminUser ban(@PathVariable Long id) {
        return service.setBan(id, true);
    }

    @PostMapping("/users/{id}/unban")
    public AdminUser unban(@PathVariable Long id) {
        return service.setBan(id, false);
    }

    @GetMapping("/users/{id}/detail")
    public AdminUserDetail userDetail(@PathVariable Long id) {
        return service.userDetail(id);
    }

    // ---- Withdrawals ----

    @GetMapping("/withdrawals")
    public List<WithdrawalItem> withdrawals(@RequestParam(required = false) String status) {
        return walletService.listWithdrawals(status);
    }

    @PostMapping("/withdrawals/{id}/pay")
    public WithdrawalItem payWithdrawal(@PathVariable Long id) {
        return walletService.markPaid(id);
    }

    @PostMapping("/withdrawals/{id}/reject")
    public WithdrawalItem rejectWithdrawal(@PathVariable Long id,
                                           @RequestBody(required = false) @Valid ModerationDecision body) {
        return walletService.reject(id, body == null ? null : body.reason());
    }

    // ---- Campaign moderation ----

    @GetMapping("/campaigns")
    public List<CampaignFull> campaigns(@RequestParam(required = false) String status) {
        return campaignService.listForAdmin(status);
    }

    @PostMapping("/campaigns/{id}/approve")
    public CampaignFull approveCampaign(@PathVariable Long id) {
        return campaignService.approve(id);
    }

    @PostMapping("/campaigns/{id}/reject")
    public CampaignFull rejectCampaign(@PathVariable Long id, @Valid @RequestBody ModerationDecision body) {
        return campaignService.reject(id, body == null ? null : body.reason());
    }
}
