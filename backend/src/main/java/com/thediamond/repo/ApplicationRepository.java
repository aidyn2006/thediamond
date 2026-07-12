package com.thediamond.repo;

import com.thediamond.domain.Application;
import com.thediamond.domain.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByCampaignIdAndCreatorId(Long campaignId, Long creatorId);
    boolean existsByCampaignIdAndCreatorId(Long campaignId, Long creatorId);
    List<Application> findByCreatorIdOrderByAppliedAtDesc(Long creatorId);
    List<Application> findByCampaignIdOrderByAppliedAtDesc(Long campaignId);
    long countByCampaignId(Long campaignId);
    long countByCampaignIdAndStatus(Long campaignId, ApplicationStatus status);

    /** True if the brand ever accepted this creator (contact may be revealed). */
    boolean existsByCreator_IdAndCampaign_Brand_IdAndStatusIn(
            Long creatorId, Long brandId, Collection<ApplicationStatus> statuses);
}
