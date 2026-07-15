package com.thediamond.repo;

import com.thediamond.domain.CreatorSocialProof;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreatorSocialProofRepository extends JpaRepository<CreatorSocialProof, Long> {
    Optional<CreatorSocialProof> findTopByCreatorIdOrderByCreatedAtDesc(Long creatorId);
}
