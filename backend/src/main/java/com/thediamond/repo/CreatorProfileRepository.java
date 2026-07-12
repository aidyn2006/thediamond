package com.thediamond.repo;

import com.thediamond.domain.CreatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, Long> {
    Optional<CreatorProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    boolean existsByUsernameIgnoreCase(String username);
    List<CreatorProfile> findAllByOrderByCreatedAtDesc();
    List<CreatorProfile> findByApprovedOrderByCreatedAtDesc(boolean approved);
    long countByApproved(boolean approved);
}
