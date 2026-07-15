package com.thediamond.domain;

import jakarta.persistence.*;

import java.time.Instant;

/** A user's request to cash out wallet funds (minimum 2000₸). */
@Entity
@Table(name = "withdrawals")
public class Withdrawal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WithdrawalStatus status = WithdrawalStatus.PENDING;

    @Column(nullable = false, length = 300)
    private String requisites;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public WithdrawalStatus getStatus() { return status; }
    public void setStatus(WithdrawalStatus status) { this.status = status; }

    public String getRequisites() { return requisites; }
    public void setRequisites(String requisites) { this.requisites = requisites; }

    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
}
