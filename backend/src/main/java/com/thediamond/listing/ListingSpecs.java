package com.thediamond.listing;

import com.thediamond.domain.Listing;
import com.thediamond.domain.ListingStatus;
import com.thediamond.domain.PhoneBrand;
import com.thediamond.domain.PhoneCondition;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Catalog filters. Every parameter is optional; a null one simply isn't added as a
 * predicate, so no null ever reaches the driver as a typed bind parameter.
 *
 * ACTIVE-only is baked in and not overridable: unmoderated, sold and archived
 * listings must never appear in a catalog response.
 */
public final class ListingSpecs {

    private ListingSpecs() {}

    public record Filters(
            PhoneBrand brand,
            PhoneCondition condition,
            String city,
            Integer minPrice,
            Integer maxPrice,
            Integer minStorage,
            String query
    ) {}

    public static Specification<Listing> active(Filters f) {
        return (root, cq, cb) -> {
            List<Predicate> where = new ArrayList<>();
            where.add(cb.equal(root.get("status"), ListingStatus.ACTIVE));

            if (f.brand() != null) {
                where.add(cb.equal(root.get("brand"), f.brand()));
            }
            if (f.condition() != null) {
                where.add(cb.equal(root.get("condition"), f.condition()));
            }
            if (notBlank(f.city())) {
                where.add(cb.equal(cb.lower(root.get("city")), f.city().trim().toLowerCase()));
            }
            if (f.minPrice() != null) {
                where.add(cb.greaterThanOrEqualTo(root.get("price"), f.minPrice()));
            }
            if (f.maxPrice() != null) {
                where.add(cb.lessThanOrEqualTo(root.get("price"), f.maxPrice()));
            }
            if (f.minStorage() != null) {
                where.add(cb.greaterThanOrEqualTo(root.get("storageGb"), f.minStorage()));
            }
            if (notBlank(f.query())) {
                String like = "%" + f.query().trim().toLowerCase() + "%";
                where.add(cb.or(
                        cb.like(cb.lower(root.get("model")), like),
                        cb.like(cb.lower(root.get("description")), like)));
            }

            cq.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(where.toArray(new Predicate[0]));
        };
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
