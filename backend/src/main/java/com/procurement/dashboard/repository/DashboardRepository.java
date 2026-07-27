package com.procurement.dashboard.repository;

import com.procurement.dashboard.dto.request.DashboardFilter;
import com.procurement.dashboard.dto.response.ChartPointResponse;
import com.procurement.dashboard.dto.response.RecentActivityResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Read-only aggregate queries used by the dashboard. */
@Repository
public class DashboardRepository {
    @PersistenceContext
    private EntityManager entityManager;

    public long count(String sql, Map<String, Object> parameters) {
        Number result = (Number) query(sql, parameters).getSingleResult();
        return result == null ? 0L : result.longValue();
    }

    public BigDecimal amount(String sql, Map<String, Object> parameters) {
        Object result = query(sql, parameters).getSingleResult();
        return decimal(result);
    }

    public List<ChartPointResponse> chart(String sql, Map<String, Object> parameters) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query(sql, parameters).getResultList();
        return rows.stream().map(row -> new ChartPointResponse(
                row[0] == null ? "Unknown" : row[0].toString(),
                decimal(row[1]).setScale(2, RoundingMode.HALF_UP)
        )).toList();
    }

    public List<RecentActivityResponse> recentActivities(DashboardFilter filter, int limit) {
        List<RecentActivityResponse> activities = new ArrayList<>();
        activities.addAll(recentPurchaseRequests(filter, limit));
        activities.addAll(recentApprovals(filter, limit));
        activities.addAll(recentPurchaseOrders(filter, limit));
        activities.addAll(recentPayments(filter, limit));
        activities.addAll(recentInventoryUpdates(filter, limit));
        activities.addAll(recentNotifications(limit));
        return activities.stream()
                .sorted(Comparator.comparing(RecentActivityResponse::occurredAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .toList();
    }

    public SqlFilter filter(DashboardFilter filter, String alias, String dateColumn,
                            boolean department, boolean vendor, boolean warehouse, boolean costCenter,
                            boolean status) {
        Map<String, Object> params = new LinkedHashMap<>();
        StringBuilder where = new StringBuilder(" where 1=1");
        if (filter == null) return new SqlFilter(where.toString(), params);
        if (filter.startDate() != null) {
            where.append(" and ").append(alias).append('.').append(dateColumn).append(" >= :startDate");
            params.put("startDate", filter.startDate());
        }
        if (filter.endDate() != null) {
            where.append(" and ").append(alias).append('.').append(dateColumn).append(" < :endDate");
            params.put("endDate", filter.endDate().plusDays(1));
        }
        if (department && filter.departmentId() != null) { where.append(" and ").append(alias).append(".department_id = :departmentId"); params.put("departmentId", filter.departmentId()); }
        if (vendor && filter.vendorId() != null) { where.append(" and ").append(alias).append(".vendor_id = :vendorId"); params.put("vendorId", filter.vendorId()); }
        if (warehouse && filter.warehouseId() != null) { where.append(" and ").append(alias).append(".warehouse_id = :warehouseId"); params.put("warehouseId", filter.warehouseId()); }
        if (costCenter && filter.costCenterId() != null) { where.append(" and ").append(alias).append(".cost_center_id = :costCenterId"); params.put("costCenterId", filter.costCenterId()); }
        if (status && filter.status() != null && !filter.status().isBlank()) { where.append(" and ").append(alias).append(".status = :status"); params.put("status", filter.status()); }
        return new SqlFilter(where.toString(), params);
    }

    private List<RecentActivityResponse> recentPurchaseRequests(DashboardFilter filter, int limit) {
        SqlFilter f = filter(filter, "pr", "created_at", true, false, false, true, true);
        String sql = "select pr.request_number, pr.purpose, pr.status, pr.created_at from purchase_requests pr" + f.where() + " order by pr.created_at desc limit " + limit;
        return activities(sql, f.params(), "PURCHASE_REQUEST", "Purchase request");
    }

    private List<RecentActivityResponse> recentApprovals(DashboardFilter filter, int limit) {
        SqlFilter f = filter(filter, "ah", "performed_at", false, false, false, false, false);
        String sql = "select pr.request_number, ah.action, at.status, ah.performed_at from approval_histories ah join purchase_requests pr on pr.purchase_request_id = ah.purchase_request_id left join approval_tasks at on at.approval_task_id = ah.approval_task_id" + f.where() + " order by ah.performed_at desc limit " + limit;
        return activities(sql, f.params(), "APPROVAL", "Approval activity");
    }

    private List<RecentActivityResponse> recentPurchaseOrders(DashboardFilter filter, int limit) {
        SqlFilter f = filter(filter, "po", "created_at", true, true, false, true, true);
        String sql = "select po.po_number, v.vendor_name, po.status, po.created_at from purchase_orders po join vendors v on v.vendor_id = po.vendor_id" + f.where() + " order by po.created_at desc limit " + limit;
        return activities(sql, f.params(), "PURCHASE_ORDER", "Purchase order");
    }

    private List<RecentActivityResponse> recentPayments(DashboardFilter filter, int limit) {
        SqlFilter f = filter(filter, "p", "created_at", false, true, false, false, true);
        String sql = "select p.payment_number, v.vendor_name, p.status, p.created_at from payments p join vendors v on v.vendor_id = p.vendor_id" + f.where() + " order by p.created_at desc limit " + limit;
        return activities(sql, f.params(), "PAYMENT", "Payment");
    }

    private List<RecentActivityResponse> recentInventoryUpdates(DashboardFilter filter, int limit) {
        SqlFilter f = filter(filter, "i", "last_stock_update", false, false, true, false, true);
        String sql = "select p.product_code, concat(w.warehouse_name, ' / qty ', i.available_quantity), i.status, i.last_stock_update from inventory i join products p on p.product_id = i.product_id join warehouses w on w.warehouse_id = i.warehouse_id" + f.where() + " order by i.last_stock_update desc limit " + limit;
        return activities(sql, f.params(), "INVENTORY_UPDATE", "Inventory update");
    }

    private List<RecentActivityResponse> recentNotifications(int limit) {
        String sql = "select notification_number, title, status, created_at from notifications order by created_at desc limit " + limit;
        return activities(sql, Map.of(), "NOTIFICATION", "Notification");
    }

    private List<RecentActivityResponse> activities(String sql, Map<String, Object> params, String type, String fallbackTitle) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query(sql, params).getResultList();
        return rows.stream().map(row -> new RecentActivityResponse(type,
                string(row[0]), row[1] == null ? fallbackTitle : fallbackTitle + ": " + row[1],
                string(row[2]), timestamp(row[3]))).toList();
    }

    private Query query(String sql, Map<String, Object> parameters) {
        Query query = entityManager.createNativeQuery(sql);
        parameters.forEach(query::setParameter);
        return query;
    }

    private static String string(Object value) { return value == null ? null : value.toString(); }
    private static BigDecimal decimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal number) return number;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        return new BigDecimal(value.toString());
    }
    private static LocalDateTime timestamp(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime dateTime) return dateTime;
        if (value instanceof java.sql.Timestamp timestamp) return timestamp.toLocalDateTime();
        if (value instanceof java.util.Date date) return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        return LocalDateTime.parse(value.toString().replace(' ', 'T'));
    }

    public record SqlFilter(String where, Map<String, Object> params) { }
}
