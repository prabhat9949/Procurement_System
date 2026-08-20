package com.procurement.purchaserequestline.specification;

import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class PurchaseRequestLineSpecification {

    private PurchaseRequestLineSpecification() {
    }

    public static Specification<PurchaseRequestLine> search(String keyword,
                                                             Long purchaseRequestId,
                                                             Long productId) {
        List<Specification<PurchaseRequestLine>> parts = new ArrayList<>();
        parts.add(keywordLike(keyword));
        parts.add(equalsPath("purchaseRequest.id", purchaseRequestId));
        parts.add(equalsPath("product.id", productId));
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

    private static Specification<PurchaseRequestLine> keywordLike(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("product").get("productCode")), pattern),
                builder.like(builder.lower(root.get("product").get("productName")), pattern),
                builder.like(builder.lower(root.get("purchaseRequest").get("requestNumber")), pattern));
    }

    private static Specification<PurchaseRequestLine> equalsPath(String path, Object value) {
        if (value == null) return null;
        return (root, query, builder) -> {
            jakarta.persistence.criteria.Path<?> current = root;
            for (String part : path.split("\\.")) current = current.get(part);
            return builder.equal(current, value);
        };
    }
}
