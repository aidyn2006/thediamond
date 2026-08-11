package com.thediamond.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** One phone for sale, posted by a seller and moderated before it goes live. */
@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PhoneBrand brand;

    @Column(nullable = false, length = 120)
    private String model;

    @Column(name = "storage_gb", nullable = false)
    private Integer storageGb;

    @Column(name = "ram_gb")
    private Integer ramGb;

    @Column(length = 40)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(name = "phone_condition", nullable = false, length = 20)
    private PhoneCondition condition;

    /** Battery capacity left, in percent. Optional — only iPhones report it reliably. */
    @Column(name = "battery_health")
    private Integer batteryHealth;

    /** Whole tenge. */
    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false, length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ListingStatus status = ListingStatus.DRAFT;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @Column(nullable = false)
    private Integer views = 0;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder asc, id asc")
    private List<ListingImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "sold_at")
    private Instant soldAt;

    /** Human title built from the specs — there is no free-text title field. */
    @Transient
    public String getTitle() {
        StringBuilder sb = new StringBuilder(brandLabel()).append(' ').append(model);
        if (storageGb != null) sb.append(' ').append(storageGb).append(" ГБ");
        return sb.toString();
    }

    private String brandLabel() {
        if (brand == null) return "";
        String name = brand.name();
        return name.charAt(0) + name.substring(1).toLowerCase();
    }

    /** First image, used as the card cover. */
    @Transient
    public String getCoverUrl() {
        return images.isEmpty() ? null : images.get(0).getUrl();
    }

    public void addImage(String url) {
        ListingImage image = new ListingImage();
        image.setListing(this);
        image.setUrl(url);
        image.setSortOrder(images.size());
        images.add(image);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }

    public PhoneBrand getBrand() { return brand; }
    public void setBrand(PhoneBrand brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getStorageGb() { return storageGb; }
    public void setStorageGb(Integer storageGb) { this.storageGb = storageGb; }

    public Integer getRamGb() { return ramGb; }
    public void setRamGb(Integer ramGb) { this.ramGb = ramGb; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public PhoneCondition getCondition() { return condition; }
    public void setCondition(PhoneCondition condition) { this.condition = condition; }

    public Integer getBatteryHealth() { return batteryHealth; }
    public void setBatteryHealth(Integer batteryHealth) { this.batteryHealth = batteryHealth; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ListingStatus getStatus() { return status; }
    public void setStatus(ListingStatus status) { this.status = status; }

    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }

    public Integer getViews() { return views; }
    public void setViews(Integer views) { this.views = views; }

    public List<ListingImage> getImages() { return images; }
    public void setImages(List<ListingImage> images) { this.images = images; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getSoldAt() { return soldAt; }
    public void setSoldAt(Instant soldAt) { this.soldAt = soldAt; }
}
