package com.procurement.vendor.specification;

import com.procurement.vendor.entity.Vendor;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class VendorSpecification {

    private VendorSpecification() {
    }

    public static Specification<Vendor> search(String keyword, String vendorType,
                                               String status, Boolean approved) {
        List<Specification<Vendor>> parts = new ArrayList<>();
        parts.add(keywordLike(keyword));
        parts.add(equalsIgnoreCase("vendorType", vendorType));
        parts.add(equalsIgnoreCase("status", status));
        parts.add(equals("approved", approved));
        return combine(parts);
    }

    private static <T> Specification<T> combine(List<Specification<T>> parts) {
        parts.removeIf(Objects::isNull);
        if (parts.isEmpty()) {
            return (root, query, cb) -> cb.conjunction();
        }
        Specification<T> spec = parts.get(0);
        for (int i = 1; i < parts.size(); i++) {
            spec = spec.and(parts.get(i));
        }
        return spec;
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
