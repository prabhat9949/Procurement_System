package com.procurement.inventory.specification;

import com.procurement.inventory.entity.Inventory;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class InventorySpecification {

    private InventorySpecification() {
    }

    public static Specification<Inventory> search(String keyword, Long productId, Long warehouseId,
                                                  Long categoryId, String status, Boolean lowStock,
                                                  Boolean outOfStock) {
        List<Specification<Inventory>> parts = new ArrayList<>();
        parts.add(keywordLike(keyword));
        parts.add(equalsPath("product.id", productId));
        parts.add(equalsPath("warehouse.id", warehouseId));
        parts.add(equalsPath("product.category.id", categoryId));
        parts.add(equalsPath("status", status));
        parts.add(lowStock(lowStock));
        parts.add(outOfStock(outOfStock));
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

    private static Specification<Inventory> keywordLike(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("product").get("productCode")), pattern),
                builder.like(builder.lower(root.get("product").get("productName")), pattern),
                builder.like(builder.lower(root.get("warehouse").get("warehouseCode")), pattern),
                builder.like(builder.lower(root.get("warehouse").get("warehouseName")), pattern));
    }

    private static Specification<Inventory> equalsPath(String path, Object value) {
        if (value == null || (value instanceof String string && string.isBlank())) {
            return null;
        }
        return (root, query, builder) -> builder.equal(path(root, path), value);
    }

    private static Specification<Inventory> lowStock(Boolean enabled) {
        if (!Boolean.TRUE.equals(enabled)) {
            return null;
        }
        return (root, query, builder) -> builder.lessThanOrEqualTo(
                root.get("availableQuantity"), root.get("reorderLevel"));
    }

    private static Specification<Inventory> outOfStock(Boolean enabled) {
        if (!Boolean.TRUE.equals(enabled)) {
            return null;
        }
        return (root, query, builder) -> builder.lessThanOrEqualTo(
                root.get("availableQuantity"), java.math.BigDecimal.ZERO);
    }

    private static jakarta.persistence.criteria.Path<?> path(jakarta.persistence.criteria.Root<Inventory> root,
                                                              String expression) {
        jakarta.persistence.criteria.Path<?> current = root;
        for (String part : expression.split("\\.")) {
            current = current.get(part);
        }
        return current;
    }
}
