package com.thediamond.wallet;

import com.thediamond.api.dto.WalletDtos.WalletResponse;
import com.thediamond.api.dto.WalletDtos.WithdrawRequest;
import com.thediamond.api.dto.WalletDtos.WithdrawalItem;
import com.thediamond.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Wallet + withdrawal requests for the current user (any non-admin role). */
@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService service;

    public WalletController(WalletService service) {
        this.service = service;
    }

    @GetMapping
    public WalletResponse wallet(@AuthenticationPrincipal AuthPrincipal me) {
        return service.view(me.userId());
    }

    @PostMapping("/withdraw")
    public WithdrawalItem withdraw(@AuthenticationPrincipal AuthPrincipal me,
                                   @Valid @RequestBody WithdrawRequest req) {
        return service.requestWithdrawal(me.userId(), req);
    }
}
