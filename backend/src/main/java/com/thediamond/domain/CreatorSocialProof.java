package com.thediamond.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "creator_social_proofs")
public class CreatorSocialProof {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private CreatorProfile creator;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Platform platform;

    @Column(name = "post_url", nullable = false, length = 500)
    private String postUrl;

    @Column(name = "screenshot_url", length = 500)
    private String screenshotUrl;

    @Column(name = "verification_code", nullable = false, length = 40)
    private String verificationCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SocialProofStatus status = SocialProofStatus.PENDING;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CreatorProfile getCreator() { return creator; }
    public void setCreator(CreatorProfile creator) { this.creator = creator; }

    public Platform getPlatform() { return platform; }
    public void setPlatform(Platform platform) { this.platform = platform; }

    public String getPostUrl() { return postUrl; }
    public void setPostUrl(String postUrl) { this.postUrl = postUrl; }

    public String getScreenshotUrl() { return screenshotUrl; }
    public void setScreenshotUrl(String screenshotUrl) { this.screenshotUrl = screenshotUrl; }

    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }

    public SocialProofStatus getStatus() { return status; }
    public void setStatus(SocialProofStatus status) { this.status = status; }

    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
}
