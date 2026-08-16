package com.procurement.purchaseorder.specification;

import com.procurement.purchaseorder.entity.PurchaseOrder;
import com.procurement.purchaseorder.entity.PurchaseOrderStatus;
import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public final class PurchaseOrderSpecification {

    private PurchaseOrderSpecification() {
    }

    public static Specification<PurchaseOrder> search(String k, Long v, PurchaseOrderStatus s) {
        return (r, q, b) -> {
            var p = b.conjunction();
            if (k != null && !k.isBlank()) {
                p = b.and(p, b.like(b.lower(r.get("poNumber")), "%" + k.toLowerCase() + "%"));
            }
            if (v != null) p = b.and(p, b.equal(r.get("vendor").get("id"), v));
            if (s != null) p = b.and(p, b.equal(r.get("status"), s));
            return p;
        };
    }

    /** Restricts to POs whose underlying PR belongs to one of the given categories. */
    public static Specification<PurchaseOrder> categoryIn(List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) return null;
        return (r, q, b) -> {
            var sub = q.subquery(Long.class);
            var line = sub.from(PurchaseRequestLine.class);
            sub.select(line.get("purchaseRequest").get("id"));
            sub.where(line.get("product").get("category").get("id").in(categoryIds));
            return r.get("purchaseRequest").get("id").in(sub);
        };
    }
}
