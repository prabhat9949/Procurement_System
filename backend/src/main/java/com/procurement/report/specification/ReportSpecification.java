package com.procurement.report.specification;

import com.procurement.report.dto.request.ReportFilter;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ReportSpecification {
    private ReportSpecification() {}

    public record SqlParts(String whereClause, Map<String, Object> params) {}

    public static SqlParts common(String alias, ReportFilter filter) {
        var where = new StringBuilder(" where 1=1 ");
        Map<String, Object> params = new LinkedHashMap<>();
        if (filter == null) {
            return new SqlParts("", params);
        }
        if (filter.startDate() != null) {
            where.append(" and ").append(alias).append(".created_at >= :startDate");
            params.put("startDate", filter.startDate().atStartOfDay());
        }
        if (filter.endDate() != null) {
            where.append(" and ").append(alias).append(".created_at < :endDate");
            params.put("endDate", filter.endDate().plusDays(1).atStartOfDay());
        }
        if (filter.departmentId() != null) {
            where.append(" and ").append(alias).append(".department_id = :departmentId");
            params.put("departmentId", filter.departmentId());
        }
        if (filter.vendorId() != null) {
            where.append(" and ").append(alias).append(".vendor_id = :vendorId");
            params.put("vendorId", filter.vendorId());
        }
        if (filter.warehouseId() != null) {
            where.append(" and ").append(alias).append(".warehouse_id = :warehouseId");
            params.put("warehouseId", filter.warehouseId());
        }
        if (filter.categoryId() != null) {
            where.append(" and ").append(alias).append(".category_id = :categoryId");
            params.put("categoryId", filter.categoryId());
        }
        if (filter.productId() != null) {
            where.append(" and ").append(alias).append(".product_id = :productId");
            params.put("productId", filter.productId());
        }
        if (filter.status() != null && !filter.status().isBlank()) {
            where.append(" and ").append(alias).append(".status = :status");
            params.put("status", filter.status());
        }
        if (filter.employeeId() != null) {
            where.append(" and ").append(alias).append(".employee_id = :employeeId");
            params.put("employeeId", filter.employeeId());
        }
        if (filter.costCenterId() != null) {
            where.append(" and ").append(alias).append(".cost_center_id = :costCenterId");
            params.put("costCenterId", filter.costCenterId());
        }
        return new SqlParts(where.toString(), params);
    }
}
