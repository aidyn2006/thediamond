package com.thediamond.publicapi;

import com.thediamond.api.dto.ProfileDtos.PublicCreatorListItem;
import com.thediamond.api.dto.ProfileDtos.PublicCreatorProfile;
import com.thediamond.domain.CreatorProfile;
import com.thediamond.error.ApiException;
import com.thediamond.profile.Mappers;
import com.thediamond.repo.CreatorProfileRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Unauthenticated, public-facing endpoints (see SecurityConfig permitAll on /api/public/**). */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final CreatorProfileRepository creators;

    public PublicController(CreatorProfileRepository creators) {
        this.creators = creators;
    }

    @GetMapping("/creators/{id}")
    @Transactional(readOnly = true)
    public PublicCreatorProfile creator(@PathVariable Long id) {
        CreatorProfile p = creators.findById(id)
                .filter(CreatorProfile::isApproved)
                .orElseThrow(() -> ApiException.notFound("Профиль не найден"));
        return Mappers.toPublicCreator(p);
    }

    /** Approved creators for the sitemap (id + last-modified). */
    @GetMapping("/creators")
    @Transactional(readOnly = true)
    public List<PublicCreatorListItem> creatorList() {
        return creators.findByApprovedOrderByCreatedAtDesc(true).stream()
                .map(Mappers::toPublicCreatorListItem)
                .toList();
    }
}
