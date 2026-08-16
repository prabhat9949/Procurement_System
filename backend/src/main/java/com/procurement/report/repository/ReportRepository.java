package com.procurement.report.repository;

import com.procurement.report.dto.request.ReportFilter;
import com.procurement.report.dto.response.ChartPointResponse;
import com.procurement.report.dto.response.DashboardResponse;
import com.procurement.report.dto.response.ReportRowResponse;
import com.procurement.report.specification.ReportSpecification;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class ReportRepository {
    @PersistenceContext
    private EntityManager em;

    private static BigDecimal bd(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal b) return b;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(value.toString());
    }

    private static LocalDate ld(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDate d) return d;
        if (value instanceof LocalDateTime dt) return dt.toLocalDate();
        return LocalDate.parse(value.toString());
    }

    private Page<ReportRowResponse> page(String baseSql, String countSql, Map<String, Object> params, Pageable pageable, Function<Object[], ReportRowResponse> mapper) {
        Query query = em.createNativeQuery(baseSql);
        params.forEach(query::setParameter);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        Query countQuery = em.createNativeQuery(countSql);
        params.forEach(countQuery::setParameter);
        Number total = (Number) countQuery.getSingleResult();

        var mapped = rows.stream().map(mapper).toList();
        return new PageImpl<>(mapped, pageable, total.longValue());
    }

    private List<ChartPointResponse> chart(String sql, Map<String, Object> params) {
        Query query = em.createNativeQuery(sql);
        params.forEach(query::setParameter);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(r -> new ChartPointResponse(
                r[0] == null ? "Unknown" : r[0].toString(),
                bd(r[1]).setScale(2, RoundingMode.HALF_UP)
        )).toList();
    }

    public DashboardResponse dashboard() {
        BigDecimal totalSpend = bd(em.createNativeQuery("select coalesce(sum(grand_total),0) from purchase_orders where status <> 'CANCELLED'").getSingleResult());
        BigDecimal monthlySpend = bd(em.createNativeQuery("select coalesce(sum(grand_total),0) from purchase_orders where order_date >= date_format(curdate(), '%Y-%m-01')").getSingleResult());
        long pendingApprovals = ((Number) em.createNativeQuery("select count(*) from approval_tasks where status = 'PENDING'").getSingleResult()).longValue();
        long pendingRfqs = ((Number) em.createNativeQuery("select count(*) from rfqs where status in ('DRAFT','OPEN')").getSingleResult()).longValue();
        long pendingPurchaseOrders = ((Number) em.createNativeQuery("select count(*) from purchase_orders where status in ('GENERATED','SENT')").getSingleResult()).longValue();
        long pendingGrns = ((Number) em.createNativeQuery("select count(*) from goods_receipt_notes where status not in ('COMPLETED','CANCELLED')").getSingleResult()).longValue();
        long pendingInvoices = ((Number) em.createNativeQuery("select count(*) from invoices where status in ('RECEIVED','UNDER_VERIFICATION','MATCH_PENDING')").getSingleResult()).longValue();
        long pendingPayments = ((Number) em.createNativeQuery("select count(*) from payments where status in ('DRAFT','SCHEDULED','APPROVED','PROCESSING')").getSingleResult()).longValue();
        BigDecimal inventoryValue = bd(em.createNativeQuery("select coalesce(sum(inventory_value),0) from inventory").getSingleResult());

        List<ChartPointResponse> monthlySpendChart = chart("""
                select date_format(order_date, '%Y-%m') as period, coalesce(sum(grand_total),0) as total
                from purchase_orders
                group by date_format(order_date, '%Y-%m')
                order by period desc
                limit 12
                """, Map.of());
        List<ChartPointResponse> departmentSpendChart = chart("""
                select d.department_name, coalesce(sum(po.grand_total),0) as total
                from purchase_orders po
                join departments d on d.department_id = po.department_id
                group by d.department_name
                order by total desc
                limit 10
                """, Map.of());
        List<ChartPointResponse> vendorSpendChart = chart("""
                select v.vendor_name, coalesce(sum(po.grand_total),0) as total
                from purchase_orders po
                join vendors v on v.vendor_id = po.vendor_id
                group by v.vendor_name
                order by total desc
                limit 10
                """, Map.of());
        List<ChartPointResponse> paymentStatusChart = chart("""
                select status, count(*) as total
                from payments
                group by status
                order by total desc
                """, Map.of());
        List<ChartPointResponse> invoiceStatusChart = chart("""
                select status, count(*) as total
                from invoices
                group by status
                order by total desc
                """, Map.of());

        return new DashboardResponse(totalSpend, monthlySpend, pendingApprovals, pendingRfqs, pendingPurchaseOrders, pendingGrns, pendingInvoices, pendingPayments, inventoryValue, monthlySpendChart, departmentSpendChart, vendorSpendChart, paymentStatusChart, invoiceStatusChart);
    }

    public Page<ReportRowResponse> purchaseRequests(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("pr", filter);
        String sql = """
                select pr.purchase_request_id, pr.request_number, pr.purpose, pr.status, e.first_name, d.department_name, cc.name,
                       pr.request_date, null as quantity, pr.estimated_amount, pr.remarks
                from purchase_requests pr
                join employees e on e.employee_id = pr.requester_id
                join departments d on d.department_id = pr.department_id
                join cost_centers cc on cc.cost_center_id = pr.cost_center_id
                """ + parts.whereClause() + orderBy(pageable, "pr.request_date");
        String count = "select count(*) from purchase_requests pr" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> approvals(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("at", filter);
        String sql = """
                select at.approval_task_id, at.task_number, at.comments, at.status, concat(e.first_name,' ',e.last_name), r.role_name, pr.request_number,
                       at.assigned_date, null as quantity, at.approved_amount, at.comments
                from approval_tasks at
                join purchase_requests pr on pr.purchase_request_id = at.purchase_request_id
                join employees e on e.employee_id = at.assigned_employee_id
                join roles r on r.role_id = at.assigned_role_id
                """ + parts.whereClause() + orderBy(pageable, "at.assigned_date");
        String count = "select count(*) from approval_tasks at" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> rfqs(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("r", filter);
        String sql = """
                select r.rfq_id, r.rfq_number, r.remarks, r.status, d.department_name, pr.request_number, null, r.issue_date,
                       null as quantity, null as amount, r.remarks
                from rfqs r
                join purchase_requests pr on pr.purchase_request_id = r.purchase_request_id
                join departments d on d.department_id = pr.department_id
                """ + parts.whereClause() + orderBy(pageable, "r.issue_date");
        String count = "select count(*) from rfqs r" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> quotations(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("vq", filter);
        String sql = """
                select vq.vendor_quotation_id, vq.quotation_number, vq.remarks, vq.status, v.vendor_name, r.rfq_number, null, vq.submission_date,
                       null as quantity, vq.grand_total, vq.remarks
                from vendor_quotations vq
                join vendors v on v.vendor_id = vq.vendor_id
                join rfqs r on r.rfq_id = vq.rfq_id
                """ + parts.whereClause() + orderBy(pageable, "vq.submission_date");
        String count = "select count(*) from vendor_quotations vq" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> comparisons(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("qc", filter);
        String sql = """
                select qc.quotation_comparison_id, qc.comparison_number, qc.remarks, qc.status, r.rfq_number, qc.comparison_method, null, qc.comparison_date,
                       null as quantity, null as amount, qc.remarks
                from quotation_comparisons qc
                join rfqs r on r.rfq_id = qc.rfq_id
                """ + parts.whereClause() + orderBy(pageable, "qc.comparison_date");
        String count = "select count(*) from quotation_comparisons qc" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> purchaseOrders(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("po", filter);
        String sql = """
                select po.purchase_order_id, po.po_number, po.remarks, po.status, v.vendor_name, d.department_name, pr.request_number,
                       po.order_date, null as quantity, po.grand_total, po.remarks
                from purchase_orders po
                join vendors v on v.vendor_id = po.vendor_id
                join departments d on d.department_id = po.department_id
                join purchase_requests pr on pr.purchase_request_id = po.purchase_request_id
                """ + parts.whereClause() + orderBy(pageable, "po.order_date");
        String count = "select count(*) from purchase_orders po" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> grns(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("grn", filter);
        String sql = """
                select grn.grn_id, grn.grn_number, grn.remarks, grn.status, v.vendor_name, w.warehouse_name, po.po_number,
                       grn.receipt_date, null as quantity, null as amount, grn.remarks
                from goods_receipt_notes grn
                join vendors v on v.vendor_id = grn.vendor_id
                join warehouses w on w.warehouse_id = grn.warehouse_id
                join purchase_orders po on po.purchase_order_id = grn.purchase_order_id
                """ + parts.whereClause() + orderBy(pageable, "grn.receipt_date");
        String count = "select count(*) from goods_receipt_notes grn" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> inventory(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("i", filter);
        String sql = """
                select i.inventory_id, p.product_code, p.product_name, i.status, w.warehouse_name, c.category_name, null,
                       i.last_stock_update, i.available_quantity, i.inventory_value, null
                from inventory i
                join products p on p.product_id = i.product_id
                join warehouses w on w.warehouse_id = i.warehouse_id
                join categories c on c.category_id = p.category_id
                """ + parts.whereClause() + orderBy(pageable, "i.last_stock_update");
        String count = "select count(*) from inventory i" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> invoices(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("inv", filter);
        String sql = """
                select inv.invoice_id, inv.invoice_number, inv.remarks, inv.status, v.vendor_name, po.po_number, grn.grn_number,
                       inv.invoice_date, null as quantity, inv.grand_total, inv.remarks
                from invoices inv
                join vendors v on v.vendor_id = inv.vendor_id
                join purchase_orders po on po.purchase_order_id = inv.purchase_order_id
                join goods_receipt_notes grn on grn.grn_id = inv.goods_receipt_note_id
                """ + parts.whereClause() + orderBy(pageable, "inv.invoice_date");
        String count = "select count(*) from invoices inv" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> threeWayMatches(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("twm", filter);
        String sql = """
                select twm.three_way_match_id, twm.match_number, twm.remarks, twm.status, v.vendor_name, po.po_number, grn.grn_number,
                       twm.match_date, null as quantity, null as amount, twm.overall_result
                from three_way_matches twm
                join vendors v on v.vendor_id = twm.vendor_id
                join purchase_orders po on po.purchase_order_id = twm.purchase_order_id
                join goods_receipt_notes grn on grn.grn_id = twm.goods_receipt_note_id
                """ + parts.whereClause() + orderBy(pageable, "twm.match_date");
        String count = "select count(*) from three_way_matches twm" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> payments(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("p", filter);
        String sql = """
                select p.payment_id, p.payment_number, p.remarks, p.status, v.vendor_name, inv.invoice_number, po.po_number,
                       p.payment_date, null as quantity, p.net_amount, p.payment_method
                from payments p
                join vendors v on v.vendor_id = p.vendor_id
                left join invoices inv on inv.invoice_id = p.invoice_id
                left join purchase_orders po on po.purchase_order_id = p.purchase_order_id
                """ + parts.whereClause() + orderBy(pageable, "p.payment_date");
        String count = "select count(*) from payments p" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> vendors(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("v", filter);
        String sql = """
                select v.vendor_id, v.vendor_code, v.vendor_type, v.status, v.vendor_name, null, null,
                       v.created_at, null as quantity, coalesce(sum(po.grand_total),0), concat('Approved=', v.approved)
                from vendors v
                left join purchase_orders po on po.vendor_id = v.vendor_id
                """ + parts.whereClause() + " group by v.vendor_id, v.vendor_code, v.vendor_type, v.status, v.vendor_name, v.created_at, v.approved " + orderBy(pageable, "v.vendor_name");
        String count = "select count(*) from vendors v" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> departments(ReportFilter filter, Pageable pageable) {
        var parts = ReportSpecification.common("d", filter);
        String sql = """
                select d.department_id, d.department_code, d.department_name, d.active_flag, d.department_name, null, null,
                       d.created_at, null as quantity, coalesce(sum(po.grand_total),0), d.description
                from departments d
                left join purchase_orders po on po.department_id = d.department_id
                """ + parts.whereClause() + " group by d.department_id, d.department_code, d.department_name, d.active_flag, d.created_at, d.description " + orderBy(pageable, "d.department_name");
        String count = "select count(*) from departments d" + parts.whereClause();
        return page(sql, count, parts.params(), pageable, this::row);
    }

    public Page<ReportRowResponse> auditSummary(ReportFilter filter, Pageable pageable) {
        var params = new LinkedHashMap<String, Object>();
        var where = new StringBuilder(" where 1=1 ");
        if (filter != null && filter.startDate() != null) {
            where.append(" and a.performed_at >= :startDate");
            params.put("startDate", filter.startDate().atStartOfDay());
        }
        if (filter != null && filter.endDate() != null) {
            where.append(" and a.performed_at < :endDate");
            params.put("endDate", filter.endDate().plusDays(1).atStartOfDay());
        }
        String sql = """
                select a.module_name,
                       a.operation,
                       case when a.success_flag = 1 then 'SUCCESS' else 'FAILURE' end as result_status,
                       max(a.entity_name) as entity_name,
                       max(a.performed_by) as performed_by,
                       max(a.reference_number) as reference_number,
                       max(a.performed_at) as performed_at,
                       count(*) as total_count
                from audit_logs a
                """ + where + """
                group by a.module_name, a.operation, a.success_flag
                order by performed_at desc
                limit 200
                """;
        Query query = em.createNativeQuery(sql);
        params.forEach(query::setParameter);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        var mapped = rows.stream().map(r -> new ReportRowResponse(
                null,
                r[0] == null ? null : r[0].toString(),
                r[1] == null ? null : r[1].toString(),
                r[2] == null ? null : r[2].toString(),
                r[3] == null ? null : r[3].toString(),
                r[4] == null ? null : r[4].toString(),
                r[5] == null ? null : r[5].toString(),
                ld(r[6]),
                bd(r[7]),
                BigDecimal.ZERO,
                "Audit activity summary"
        )).toList();
        return new PageImpl<>(mapped, pageable, mapped.size());
    }

    private String orderBy(Pageable pageable, String defaultColumn) {
        if (pageable == null || pageable.getSort().isUnsorted()) {
            return " order by " + defaultColumn + " desc";
        }
        var order = pageable.getSort().iterator().next();
        var property = order.getProperty();
        var dir = order.isAscending() ? "asc" : "desc";
        var allowed = Set.of("id", "referenceNumber", "title", "status", "relatedOne", "relatedTwo", "relatedThree", "date", "quantity", "amount");
        if (!allowed.contains(property)) {
            return " order by " + defaultColumn + " desc";
        }
        return " order by " + defaultColumn + " " + dir;
    }

    private ReportRowResponse row(Object[] r) {
        return new ReportRowResponse(
                r[0] == null ? null : ((Number) r[0]).longValue(),
                r[1] == null ? null : r[1].toString(),
                r[2] == null ? null : r[2].toString(),
                r[3] == null ? null : r[3].toString(),
                r[4] == null ? null : r[4].toString(),
                r[5] == null ? null : r[5].toString(),
                r[6] == null ? null : r[6].toString(),
                ld(r[7]),
                r[8] == null ? null : bd(r[8]),
                r[9] == null ? null : bd(r[9]),
                r[10] == null ? null : r[10].toString()
        );
    }
}
