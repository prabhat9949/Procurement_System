package com.procurement.warehouse.specification;

import com.procurement.warehouse.entity.Warehouse;
import com.procurement.warehouse.entity.WarehouseType;
import org.springframework.data.jpa.domain.Specification;

public final class WarehouseSpecification {

    private WarehouseSpecification() {
    }

    public static Specification<Warehouse> search(String keyword, WarehouseType warehouseType,
                                                  String city, String state, String status) {
        return Specification.where(keywordLike(keyword))
                .and(equals("warehouseType", warehouseType))
                .and(equalsIgnoreCase("city", city))
                .and(equalsIgnoreCase("state", state))
                .and(equalsIgnoreCase("status", status));
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
