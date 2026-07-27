package com.procurement.vendor.specification;

import com.procurement.vendor.entity.Vendor;
import org.springframework.data.jpa.domain.Specification;

public final class VendorSpecification {

    private VendorSpecification() {
    }

    public static Specification<Vendor> search(String keyword, String vendorType,
                                               String status, Boolean approved) {
        return Specification.where(keywordLike(keyword))
                .and(equalsIgnoreCase("vendorType", vendorType))
                .and(equalsIgnoreCase("status", status))
                .and(equals("approved", approved));
    }

    private static Specification<Vendor> keywordLike(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("vendorCode")), pattern),
                builder.like(builder.lower(root.get("vendorName")), pattern),
                builder.like(builder.lower(root.get("contactPerson")), pattern),
                builder.like(builder.lower(root.get("email")), pattern),
                builder.like(builder.lower(root.get("gstNumber")), pattern));
    }

    private static Specification<Vendor> equalsIgnoreCase(String field, String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return (root, query, builder) -> builder.equal(
                builder.lower(root.get(field)), value.trim().toLowerCase());
    }

    private static <T> Specification<Vendor> equals(String field, T value) {
        if (value == null) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(field), value);
    }
}
