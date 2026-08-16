package com.procurement.threewaymatch.specification;

import com.procurement.threewaymatch.entity.ThreeWayMatch;
import com.procurement.threewaymatch.entity.ThreeWayMatchStatus;
import org.springframework.data.jpa.domain.Specification;

public final class ThreeWayMatchSpecification {
    private ThreeWayMatchSpecification() {}
    public static Specification<ThreeWayMatch> search(String keyword, Long vendorId, ThreeWayMatchStatus status) {
        return (root, query, cb) -> {
            var predicate = cb.conjunction();
            if (keyword != null && !keyword.isBlank()) {
                var k = "%" + keyword.toLowerCase() + "%";
                predicate = cb.and(predicate, cb.or(
                        cb.like(cb.lower(root.get("matchNumber")), k),
                        cb.like(cb.lower(root.get("invoice").get("invoiceNumber")), k),
                        cb.like(cb.lower(root.get("purchaseOrder").get("poNumber")), k),
                        cb.like(cb.lower(root.get("goodsReceiptNote").get("grnNumber")), k),
                        cb.like(cb.lower(root.get("vendor").get("vendorName")), k)
                ));
            }
            if (vendorId != null) predicate = cb.and(predicate, cb.equal(root.get("vendor").get("id"), vendorId));
            if (status != null) predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            return predicate;
        };
    }
}
