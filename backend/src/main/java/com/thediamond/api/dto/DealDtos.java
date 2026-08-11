package com.thediamond.api.dto;

import com.thediamond.api.dto.ListingDtos.ListingSummary;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class DealDtos {

    private DealDtos() {}

    public record DealRequest(
            @NotNull(message = "Объявление не указано") Long listingId,
            @Size(max = 1000, message = "До 1000 символов") String message
    ) {}

    public record DealDecision(@Size(max = 500) String reason) {}

    /**
     * One row in "мои сделки". {@code counterpartPhone} is filled only after the seller
     * accepts — that's the whole point of the accept step.
     */
    public record DealItem(
            Long id,
            ListingSummary listing,
            String status,
            String message,
            String counterpartName,
            String counterpartPhone,
            Long counterpartId,
            boolean iAmSeller,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
