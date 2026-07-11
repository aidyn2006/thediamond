package com.thediamond.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "creator_profiles")
public class CreatorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 60)
    private String username;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(length = 500)
    private String bio;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "creator_categories", joinColumns = @JoinColumn(name = "creator_profile_id"))
    @Column(name = "category", length = 20)
    @Enumerated(EnumType.STRING)
    private Set<Category> categories = new HashSet<>();

    @Column(name = "instagram_url", length = 300)
    private String instagramUrl;
    @Column(name = "tiktok_url", length = 300)
    private String tiktokUrl;
    @Column(name = "threads_url", length = 300)
    private String threadsUrl;
    @Column(name = "youtube_url", length = 300)
    private String youtubeUrl;
    @Column(name = "telegram_url", length = 300)
    private String telegramUrl;

    @Column(name = "instagram_followers")
    private Integer instagramFollowers;
    @Column(name = "tiktok_followers")
    private Integer tiktokFollowers;
    @Column(name = "threads_followers")
    private Integer threadsFollowers;
    @Column(name = "youtube_followers")
    private Integer youtubeFollowers;

    @Column(name = "is_approved", nullable = false)
    private boolean approved = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public Set<Category> getCategories() { return categories; }
    public void setCategories(Set<Category> categories) { this.categories = categories; }

    public String getInstagramUrl() { return instagramUrl; }
    public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }

    public String getTiktokUrl() { return tiktokUrl; }
    public void setTiktokUrl(String tiktokUrl) { this.tiktokUrl = tiktokUrl; }

    public String getThreadsUrl() { return threadsUrl; }
    public void setThreadsUrl(String threadsUrl) { this.threadsUrl = threadsUrl; }

    public String getYoutubeUrl() { return youtubeUrl; }
    public void setYoutubeUrl(String youtubeUrl) { this.youtubeUrl = youtubeUrl; }

    public String getTelegramUrl() { return telegramUrl; }
    public void setTelegramUrl(String telegramUrl) { this.telegramUrl = telegramUrl; }

    public Integer getInstagramFollowers() { return instagramFollowers; }
    public void setInstagramFollowers(Integer v) { this.instagramFollowers = v; }

    public Integer getTiktokFollowers() { return tiktokFollowers; }
    public void setTiktokFollowers(Integer v) { this.tiktokFollowers = v; }

    public Integer getThreadsFollowers() { return threadsFollowers; }
    public void setThreadsFollowers(Integer v) { this.threadsFollowers = v; }

    public Integer getYoutubeFollowers() { return youtubeFollowers; }
    public void setYoutubeFollowers(Integer v) { this.youtubeFollowers = v; }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    @Transient
    public long getTotalFollowers() {
        long t = 0;
        if (instagramFollowers != null) t += instagramFollowers;
        if (tiktokFollowers != null) t += tiktokFollowers;
        if (threadsFollowers != null) t += threadsFollowers;
        if (youtubeFollowers != null) t += youtubeFollowers;
        return t;
    }
}
