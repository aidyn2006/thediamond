package com.thediamond.repo;

import com.thediamond.domain.BrandProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandProfileRepository extends JpaRepository<BrandProfile, Long> {
    Optional<BrandProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    List<BrandProfile> findAllByOrderByCreatedAtDesc();
    List<BrandProfile> findByApprovedOrderByCreatedAtDesc(boolean approved);
    long countByApproved(boolean approved);
}
