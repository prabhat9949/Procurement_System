package com.procurement.employee.specification;

import com.procurement.employee.entity.Employee;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public final class EmployeeSpecification {

    private EmployeeSpecification() {
    }

    public static Specification<Employee> search(String keyword, Long departmentId,
                                                 Long costCenterId, Long roleId,
                                                 Long managerId, Boolean active) {
        List<Specification<Employee>> parts = new ArrayList<>();
        parts.add(keywordLike(keyword));
        parts.add(equals("department.id", departmentId));
        parts.add(equals("costCenter.id", costCenterId));
        parts.add(equals("role.id", roleId));
        parts.add(equals("manager.id", managerId));
        parts.add(equals("active", active));
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
