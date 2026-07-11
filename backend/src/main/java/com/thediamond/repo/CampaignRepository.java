package com.thediamond.repo;

import com.thediamond.domain.Campaign;
import com.thediamond.domain.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByBrandIdOrderByCreatedAtDesc(Long brandId);
    List<Campaign> findByStatusOrderByCreatedAtDesc(CampaignStatus status);
    long countByStatus(CampaignStatus status);
}
