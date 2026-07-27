package com.procurement.purchaserequest.specification;

import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class PurchaseRequestSpecification {

    private PurchaseRequestSpecification() {
    }

    public static Specification<PurchaseRequest> search(String keyword, Long requesterId,
                                                        Long departmentId, Long costCenterId,
                                                        PurchaseRequestPriority priority,
                                                        PurchaseRequestStatus status,
                                                        ApprovalStatus approvalStatus,
                                                        LocalDate requiredDateFrom,
                                                        LocalDate requiredDateTo,
                                                        LocalDate createdDateFrom,
                                                        LocalDate createdDateTo) {
        return Specification.where(keywordLike(keyword))
                .and(equalsPath("requester.id", requesterId))
                .and(equalsPath("department.id", departmentId))
                .and(equalsPath("costCenter.id", costCenterId))
                .and(equalsPath("priority", priority))
                .and(equalsPath("status", status))
                .and(equalsPath("approvalStatus", approvalStatus))
                .and(dateGte("requiredDate", requiredDateFrom))
                .and(dateLte("requiredDate", requiredDateTo))
                .and(dateTimeGte("createdAt", createdDateFrom))
                .and(dateTimeLt("createdAt", createdDateTo));
    }

    private static Specification<PurchaseRequest> keywordLike(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("requestNumber")), pattern),
                builder.like(builder.lower(root.get("purpose")), pattern),
                builder.like(builder.lower(root.get("remarks")), pattern));
    }

    private static Specification<PurchaseRequest> equalsPath(String path, Object value) {
        if (value == null) return null;
        return (root, query, builder) -> builder.equal(path(root, path), value);
    }

    private static Specification<PurchaseRequest> dateGte(String field, LocalDate value) {
        if (value == null) return null;
        return (root, query, builder) -> builder.greaterThanOrEqualTo(root.get(field), value);
    }

    private static Specification<PurchaseRequest> dateLte(String field, LocalDate value) {
        if (value == null) return null;
        return (root, query, builder) -> builder.lessThanOrEqualTo(root.get(field), value);
    }

    private static Specification<PurchaseRequest> dateTimeGte(String field, LocalDate value) {
        if (value == null) return null;
        return (root, query, builder) -> builder.greaterThanOrEqualTo(
                root.get(field), value.atStartOfDay());
    }

    private static Specification<PurchaseRequest> dateTimeLt(String field, LocalDate value) {
        if (value == null) return null;
        return (root, query, builder) -> builder.lessThan(
                root.get(field), value.plusDays(1).atStartOfDay());
    }

    private static jakarta.persistence.criteria.Path<?> path(
            jakarta.persistence.criteria.Root<PurchaseRequest> root, String expression) {
        jakarta.persistence.criteria.Path<?> current = root;
        for (String part : expression.split("\\.")) current = current.get(part);
        return current;
    }
}
