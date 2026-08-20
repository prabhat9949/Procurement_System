package com.procurement.rfq.specification;

import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import com.procurement.rfq.entity.Rfq;
import com.procurement.rfq.entity.RfqStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public final class RfqSpecification {

    private RfqSpecification() {
    }

    public static Specification<Rfq> search(String keyword, RfqStatus status, Long departmentId) {
        return (r, q, b) -> {
            var p = b.conjunction();
            if (keyword != null && !keyword.isBlank()) {
                var k = "%" + keyword.toLowerCase() + "%";
                p = b.and(p, b.like(b.lower(r.get("rfqNumber")), k));
            }
            if (status != null) p = b.and(p, b.equal(r.get("status"), status));
            if (departmentId != null) p = b.and(p, b.equal(r.get("purchaseRequest").get("department").get("id"), departmentId));
            return p;
        };
    }

    /** Restricts to RFQs whose underlying PR belongs to one of the given categories. */
    public static Specification<Rfq> categoryIn(List<Long> categoryIds) {
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
