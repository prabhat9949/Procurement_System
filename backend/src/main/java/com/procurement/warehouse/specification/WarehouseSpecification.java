package com.procurement.warehouse.specification;

import com.procurement.warehouse.entity.Warehouse;
import com.procurement.warehouse.entity.WarehouseType;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class WarehouseSpecification {

    private WarehouseSpecification() {
    }

    public static Specification<Warehouse> search(String keyword, WarehouseType warehouseType,
                                                  String city, String state, String status) {
        List<Specification<Warehouse>> parts = new ArrayList<>();
        parts.add(keywordLike(keyword));
        parts.add(equals("warehouseType", warehouseType));
        parts.add(equalsIgnoreCase("city", city));
        parts.add(equalsIgnoreCase("state", state));
        parts.add(equalsIgnoreCase("status", status));
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

    private static Specification<Warehouse> keywordLike(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("warehouseCode")), pattern),
                builder.like(builder.lower(root.get("warehouseName")), pattern),
                builder.like(builder.lower(root.get("managerName")), pattern),
                builder.like(builder.lower(root.get("contactPerson")), pattern),
                builder.like(builder.lower(root.get("city")), pattern));
    }

    private static <T> Specification<Warehouse> equals(String field, T value) {
        if (value == null) {
            return null;
        }
        return (root, query, builder) -> builder.equal(root.get(field), value);
    }

    private static Specification<Warehouse> equalsIgnoreCase(String field, String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return (root, query, builder) -> builder.equal(
                builder.lower(root.get(field)), value.trim().toLowerCase());
    }
}
