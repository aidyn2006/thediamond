package com.thediamond.repo;

import com.thediamond.domain.Deal;
import com.thediamond.domain.DealStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DealRepository extends JpaRepository<Deal, Long> {

    /** Deals where the current user is the buyer ("мои покупки"). */
    List<Deal> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    /** Deals on the current user's own listings ("мои продажи"). */
    List<Deal> findByListing_SellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Deal> findByListingIdOrderByCreatedAtDesc(Long listingId);

    Optional<Deal> findByListingIdAndBuyerId(Long listingId, Long buyerId);

    long countByListingIdAndStatus(Long listingId, DealStatus status);
}
