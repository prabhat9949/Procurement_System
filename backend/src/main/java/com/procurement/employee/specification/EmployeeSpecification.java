package com.procurement.employee.specification;

import com.procurement.employee.entity.Employee;
import org.springframework.data.jpa.domain.Specification;

public final class EmployeeSpecification {

    private EmployeeSpecification() {
    }

    public static Specification<Employee> search(String keyword, Long departmentId,
                                                 Long costCenterId, Long roleId,
                                                 Long managerId, Boolean active) {
        return Specification.where(keywordLike(keyword))
                .and(equals("department.id", departmentId))
                .and(equals("costCenter.id", costCenterId))
                .and(equals("role.id", roleId))
                .and(equals("manager.id", managerId))
                .and(equals("active", active));
    }

    private static Specification<Employee> keywordLike(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String pattern = "%" + keyword.trim().toLowerCase() + "%";
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("employeeCode")), pattern),
                builder.like(builder.lower(root.get("firstName")), pattern),
                builder.like(builder.lower(root.get("lastName")), pattern),
                builder.like(builder.lower(root.get("email")), pattern)
        );
    }

    private static <T> Specification<Employee> equals(String path, T value) {
        if (value == null) {
            return null;
        }
        return (root, query, builder) -> {
            var parts = path.split("\\.");
            var expression = root.get(parts[0]);
            for (int i = 1; i < parts.length; i++) {
                expression = expression.get(parts[i]);
            }
            return builder.equal(expression, value);
        };
    }
}
