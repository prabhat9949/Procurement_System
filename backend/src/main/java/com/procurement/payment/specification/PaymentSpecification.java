package com.procurement.payment.specification;

import com.procurement.payment.entity.Payment;
import com.procurement.payment.entity.PaymentStatus;
import org.springframework.data.jpa.domain.Specification;

public final class PaymentSpecification {
    private PaymentSpecification() {}
    public static Specification<Payment> search(String keyword, Long vendorId, PaymentStatus status, String paymentMethod) {
        return (root, query, cb) -> {
            var p = cb.conjunction();
            if (keyword != null && !keyword.isBlank()) {
                var k = "%" + keyword.toLowerCase() + "%";
                p = cb.and(p, cb.or(
                        cb.like(cb.lower(root.get("paymentNumber")), k),
                        cb.like(cb.lower(root.get("paymentReference")), k),
                        cb.like(cb.lower(root.get("bankReference")), k),
                        cb.like(cb.lower(root.get("vendor").get("vendorName")), k),
                        cb.like(cb.lower(root.get("invoice").get("invoiceNumber")), k)
                ));
            }
            if (vendorId != null) p = cb.and(p, cb.equal(root.get("vendor").get("id"), vendorId));
            if (status != null) p = cb.and(p, cb.equal(root.get("status"), status));
            if (paymentMethod != null && !paymentMethod.isBlank()) p = cb.and(p, cb.equal(root.get("paymentMethod"), paymentMethod));
            return p;
        };
    }
}
