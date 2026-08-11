package com.thediamond.repo;

import com.thediamond.domain.Listing;
import com.thediamond.domain.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

/**
 * Catalog filtering goes through {@link JpaSpecificationExecutor} (see
 * {@code ListingSpecs}) rather than a JPQL query with nullable parameters —
 * Postgres cannot infer the type of a null enum bind, which fails at runtime.
 */
public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {

    List<Listing> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Listing> findByStatusOrderByCreatedAtDesc(ListingStatus status);

    List<Listing> findAllByOrderByCreatedAtDesc();

    long countByStatus(ListingStatus status);

    Optional<Listing> findByIdAndSellerId(Long id, Long sellerId);
}
