package com.thediamond.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class WalletDtos {

    private WalletDtos() {}

    public record TransactionItem(
            Long id,
            long amount,
            String type,
            String description,
            Instant createdAt
    ) {}

    public record WithdrawalItem(
            Long id,
            long amount,
            String status,
            String requisites,
            String rejectReason,
            Instant createdAt,
            Instant reviewedAt
    ) {}

    public record WalletResponse(
            long balance,
            long minWithdrawal,
            boolean canWithdraw,
            List<TransactionItem> transactions,
            List<WithdrawalItem> withdrawals
    ) {}

    public record WithdrawRequest(
            @Min(value = 2000, message = "Минимальная сумма вывода — 2000 ₸") long amount,
            @NotBlank(message = "Укажите реквизиты (номер Kaspi/карты)")
            @Size(max = 300) String requisites
    ) {}
}
