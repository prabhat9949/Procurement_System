package com.procurement.auditlog.specification;

import com.procurement.auditlog.entity.AuditLog;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class AuditLogSpecification {
    private AuditLogSpecification() {}

    public static Specification<AuditLog> search(String moduleName, String entityName, String operation, Long userId,
                                                 LocalDate startDate, LocalDate endDate, Boolean success,
                                                 String referenceNumber) {
        return (root, query, cb) -> {
            var predicate = cb.conjunction();
            if (moduleName != null && !moduleName.isBlank()) {
                var k = "%" + moduleName.toLowerCase() + "%";
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("moduleName")), k));
            }
            if (entityName != null && !entityName.isBlank()) {
                var k = "%" + entityName.toLowerCase() + "%";
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("entityName")), k));
            }
            if (operation != null && !operation.isBlank()) {
                var k = "%" + operation.toLowerCase() + "%";
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("operation")), k));
            }
            if (userId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("user").get("id"), userId));
            }
            if (startDate != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("performedAt"), startDate.atStartOfDay()));
            }
            if (endDate != null) {
                predicate = cb.and(predicate, cb.lessThan(root.get("performedAt"), endDate.plusDays(1).atStartOfDay()));
            }
            if (success != null) {
                predicate = cb.and(predicate, cb.equal(root.get("success"), success));
            }
            if (referenceNumber != null && !referenceNumber.isBlank()) {
                var k = "%" + referenceNumber.toLowerCase() + "%";
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("referenceNumber")), k));
            }
            return predicate;
        };
    }
}
