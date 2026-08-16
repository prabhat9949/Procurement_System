package com.procurement.purchaserequest.specification;

import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class PurchaseRequestSpecification {

    private PurchaseRequestSpecification() {
    }

    /**
     * Restricts to purchase requests whose line items belong to one of the given
     * categories (used for server-side per-officer scoping). Empty/null list
     * matches everything.
     */
    public static Specification<PurchaseRequest> categoryIn(java.util.List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) return null;
        return (root, query, cb) -> {
            var sub = query.subquery(Long.class);
            var line = sub.from(PurchaseRequestLine.class);
            sub.select(line.get("purchaseRequest").get("id"));
            sub.where(line.get("product").get("category").get("id").in(categoryIds));
            return root.get("id").in(sub);
        };
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
        List<Specification<PurchaseRequest>> parts = new ArrayList<>();
        parts.add(keywordLike(keyword));
        parts.add(equalsPath("requester.id", requesterId));
        parts.add(equalsPath("department.id", departmentId));
        parts.add(equalsPath("costCenter.id", costCenterId));
        parts.add(equalsPath("priority", priority));
        parts.add(equalsPath("status", status));
        parts.add(equalsPath("approvalStatus", approvalStatus));
        parts.add(dateGte("requiredDate", requiredDateFrom));
        parts.add(dateLte("requiredDate", requiredDateTo));
        parts.add(dateTimeGte("createdAt", createdDateFrom));
        parts.add(dateTimeLt("createdAt", createdDateTo));
        parts.removeIf(Objects::isNull);
        if (parts.isEmpty()) {
            // Spring Data rejects a null Specification; match all when no filters are set
            return (root, query, cb) -> cb.conjunction();
        }
        Specification<PurchaseRequest> spec = parts.get(0);
        for (int i = 1; i < parts.size(); i++) {
            spec = spec.and(parts.get(i));
        }
        return spec;
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
