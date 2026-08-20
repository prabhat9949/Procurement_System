package com.procurement.product.specification;

import com.procurement.product.entity.Product;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> search(String keyword, Long categoryId,
                                                Long vendorId, Boolean active) {
        List<Specification<Product>> parts = new ArrayList<>();
        parts.add(keywordLike(keyword));
        parts.add(equals("category.id", categoryId));
        parts.add(equals("vendor.id", vendorId));
        parts.add(equals("active", active));
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
