package com.thediamond.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "is_banned", nullable = false)
    private boolean banned = false;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "verification_code", length = 10)
    private String verificationCode;

    @Column(name = "verification_code_expires")
    private Instant verificationCodeExpires;

    @Column(name = "reward_task_paid", nullable = false)
    private boolean rewardTaskPaid = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isBanned() { return banned; }
    public void setBanned(boolean banned) { this.banned = banned; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }

    public Instant getVerificationCodeExpires() { return verificationCodeExpires; }
    public void setVerificationCodeExpires(Instant v) { this.verificationCodeExpires = v; }

    public boolean isRewardTaskPaid() { return rewardTaskPaid; }
    public void setRewardTaskPaid(boolean rewardTaskPaid) { this.rewardTaskPaid = rewardTaskPaid; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
