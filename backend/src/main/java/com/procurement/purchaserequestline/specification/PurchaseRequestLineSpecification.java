package com.procurement.purchaserequestline.specification;

import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import org.springframework.data.jpa.domain.Specification;

public final class PurchaseRequestLineSpecification {

    private PurchaseRequestLineSpecification() {
    }

    public static Specification<PurchaseRequestLine> search(String keyword,
                                                             Long purchaseRequestId,
                                                             Long productId) {
        return Specification.where(keywordLike(keyword))
                .and(equalsPath("purchaseRequest.id", purchaseRequestId))
                .and(equalsPath("product.id", productId));
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
