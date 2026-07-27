package com.procurement.product.specification;

import com.procurement.product.entity.Product;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> search(String keyword, Long categoryId,
                                                Long vendorId, Boolean active) {
        return Specification.where(keywordLike(keyword))
                .and(equals("category.id", categoryId))
                .and(equals("vendor.id", vendorId))
                .and(equals("active", active));
    }

    private static Specification<Product> keywordLike(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("productCode")), pattern),
                builder.like(builder.lower(root.get("sku")), pattern),
                builder.like(builder.lower(root.get("productName")), pattern),
                builder.like(builder.lower(root.get("brand")), pattern),
                builder.like(builder.lower(root.get("manufacturer")), pattern));
    }

    private static Specification<Product> equals(String path, Object value) {
        if (value == null) {
            return null;
        }
        return (root, query, builder) -> {
            String[] parts = path.split("\\.");
            jakarta.persistence.criteria.Path<?> expression = root;
            for (String part : parts) {
                expression = expression.get(part);
            }
            return builder.equal(expression, value);
        };
    }
}
