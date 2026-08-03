package com.procurement.inventory.specification;

import com.procurement.inventory.entity.Inventory;
import org.springframework.data.jpa.domain.Specification;

public final class InventorySpecification {

    private InventorySpecification() {
    }

    public static Specification<Inventory> search(String keyword, Long productId, Long warehouseId,
                                                  Long categoryId, String status, Boolean lowStock,
                                                  Boolean outOfStock) {
        return Specification.where(keywordLike(keyword))
                .and(equalsPath("product.id", productId))
                .and(equalsPath("warehouse.id", warehouseId))
                .and(equalsPath("product.category.id", categoryId))
                .and(equalsPath("status", status))
                .and(lowStock(lowStock))
                .and(outOfStock(outOfStock));
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
