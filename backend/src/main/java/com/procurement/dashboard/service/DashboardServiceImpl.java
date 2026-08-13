package com.procurement.dashboard.service;

import com.procurement.dashboard.dto.request.DashboardFilter;
import com.procurement.dashboard.dto.response.ChartResponse;
import com.procurement.dashboard.dto.response.DashboardResponse;
import com.procurement.dashboard.dto.response.KpiResponse;
import com.procurement.dashboard.repository.DashboardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {
    private final DashboardRepository repository;

    public DashboardServiceImpl(DashboardRepository repository) { this.repository = repository; }

    @Override
    public DashboardResponse admin(DashboardFilter filter) {
        List<KpiResponse> kpis = new ArrayList<>();
        addCount(kpis, "TOTAL_USERS", "Total Users", "select count(*) from users", Map.of());
        addCount(kpis, "ACTIVE_USERS", "Active Users", "select count(*) from users where enabled = true and account_locked = false", Map.of());
        addCount(kpis, "VENDORS", "Vendors", "select count(*) from vendors", Map.of());
        addCount(kpis, "DEPARTMENTS", "Departments", "select count(*) from departments", Map.of());
        addCount(kpis, "PRODUCTS", "Products", "select count(*) from products", Map.of());
        addCount(kpis, "WAREHOUSES", "Warehouses", "select count(*) from warehouses", Map.of());
        addCount(kpis, "PURCHASE_REQUESTS", "Purchase Requests", "select count(*) from purchase_requests", Map.of());
        addCount(kpis, "PENDING_APPROVALS", "Pending Approvals", "select count(*) from approval_tasks where status = 'PENDING'", Map.of());
        addCount(kpis, "OPEN_RFQS", "Open RFQs", "select count(*) from rfqs where status in ('DRAFT','OPEN')", Map.of());
        addCount(kpis, "SUBMITTED_QUOTATIONS", "Submitted Quotations", "select count(*) from vendor_quotations where status = 'SUBMITTED'", Map.of());
        addCount(kpis, "PURCHASE_ORDERS", "Purchase Orders", "select count(*) from purchase_orders", Map.of());
        addCount(kpis, "PENDING_GRNS", "Pending GRNs", "select count(*) from goods_receipt_notes where status not in ('COMPLETED','CANCELLED')", Map.of());
        addCount(kpis, "PENDING_INVOICES", "Pending Invoices", "select count(*) from invoices where status in ('RECEIVED','UNDER_VERIFICATION','MATCH_PENDING')", Map.of());
        addCount(kpis, "PENDING_THREE_WAY_MATCHES", "Pending Three Way Matches", "select count(*) from three_way_matches where status = 'PENDING'", Map.of());
        addCount(kpis, "PENDING_PAYMENTS", "Pending Payments", "select count(*) from payments where status in ('DRAFT','SCHEDULED','APPROVED','PROCESSING')", Map.of());
        addCount(kpis, "COMPLETED_PAYMENTS", "Completed Payments", "select count(*) from payments where status = 'PAID'", Map.of());
        addCount(kpis, "UNREAD_NOTIFICATIONS", "Unread Notifications", "select count(*) from notification_recipients where read_at is null", Map.of());
        return response("admin", kpis, List.of(chart("spend", filter), chart("vendors", filter), chart("po", filter), chart("invoices", filter), chart("payments", filter), departmentSpend(filter), statusChart("PURCHASE_ORDER_STATUS", "Purchase Order Status", "purchase_orders", "po", filter, true, true, true), statusChart("INVOICE_STATUS", "Invoice Status", "invoices", "i", filter, false, true, false), statusChart("PAYMENT_STATUS", "Payment Status", "payments", "p", filter, false, true, false)), filter);
    }

    @Override
    public DashboardResponse procurement(DashboardFilter filter, String username) {
        List<KpiResponse> kpis = new ArrayList<>();
        addCount(kpis, "MY_PENDING_APPROVALS", "My Pending Approvals", "select count(*) from approval_tasks at join employees e on e.employee_id = at.assigned_employee_id join users u on u.employee_id = e.employee_id where at.status = 'PENDING' and u.username = :username", Map.of("username", username));
        addCount(kpis, "PURCHASE_REQUESTS", "Purchase Requests", "select count(*) from purchase_requests", Map.of());
        addCount(kpis, "OPEN_RFQS", "Open RFQs", "select count(*) from rfqs where status in ('DRAFT','OPEN')", Map.of());
        addCount(kpis, "QUOTATIONS_AWAITING_COMPARISON", "Quotations Awaiting Comparison", "select count(*) from vendor_quotations where status = 'SUBMITTED'", Map.of());
        addCount(kpis, "POS_AWAITING_DELIVERY", "Purchase Orders Awaiting Delivery", "select count(*) from purchase_orders where status in ('GENERATED','SENT','ACKNOWLEDGED','PARTIALLY_RECEIVED')", Map.of());
        return response("procurement", kpis, List.of(chart("pr", filter), chart("rfq", filter), chart("po", filter), chart("vendors", filter)), filter);
    }

    @Override
    public DashboardResponse finance(DashboardFilter filter) {
        List<KpiResponse> kpis = new ArrayList<>();
        addCount(kpis, "PENDING_INVOICES", "Pending Invoices", "select count(*) from invoices where status in ('RECEIVED','UNDER_VERIFICATION','MATCH_PENDING')", Map.of());
        addCount(kpis, "PENDING_THREE_WAY_MATCHES", "Pending Three Way Matches", "select count(*) from three_way_matches where status = 'PENDING'", Map.of());
        addCount(kpis, "PENDING_PAYMENTS", "Pending Payments", "select count(*) from payments where status in ('DRAFT','SCHEDULED','APPROVED','PROCESSING')", Map.of());
        addCount(kpis, "COMPLETED_PAYMENTS", "Completed Payments", "select count(*) from payments where status = 'PAID'", Map.of());
        addAmount(kpis, "OUTSTANDING_VENDOR_BALANCE", "Outstanding Vendor Balance", "select coalesce(sum(balance_amount),0) from payments where status not in ('PAID','CANCELLED','REFUNDED')", Map.of());
        addAmount(kpis, "MONTHLY_SPEND", "Monthly Spend", "select coalesce(sum(net_amount),0) from payments where payment_date >= date_format(curdate(), '%Y-%m-01') and status = 'PAID'", Map.of());
        return response("finance", kpis, List.of(chart("spend", filter), chart("invoices", filter), chart("payments", filter)), filter);
    }

    @Override
    public DashboardResponse warehouse(DashboardFilter filter) {
        List<KpiResponse> kpis = new ArrayList<>();
        addCount(kpis, "PENDING_GRNS", "Pending GRNs", "select count(*) from goods_receipt_notes where status not in ('COMPLETED','CANCELLED')", Map.of());
        addCount(kpis, "GOODS_RECEIVED_TODAY", "Goods Received Today", "select count(*) from goods_receipt_notes where receipt_date = curdate()", Map.of());
        addAmount(kpis, "INVENTORY_VALUE", "Inventory Value", "select coalesce(sum(inventory_value),0) from inventory", Map.of());
        addCount(kpis, "LOW_STOCK", "Low Stock", "select count(*) from inventory where available_quantity > 0 and available_quantity <= reorder_level", Map.of());
        addCount(kpis, "OUT_OF_STOCK", "Out Of Stock", "select count(*) from inventory where available_quantity <= 0", Map.of());
        return response("warehouse", kpis, List.of(chart("grn", filter), chart("inventory", filter)), filter);
    }

    @Override
    public DashboardResponse vendor(DashboardFilter filter) {
        if (filter == null || filter.vendorId() == null) throw new IllegalArgumentException("vendorId is required for the vendor dashboard");
        Map<String, Object> vendor = Map.of("vendorId", filter.vendorId());
        List<KpiResponse> kpis = new ArrayList<>();
        addCount(kpis, "OPEN_RFQS", "Open RFQs", "select count(*) from rfq_vendors rv join rfqs r on r.rfq_id = rv.rfq_id where rv.vendor_id = :vendorId and r.status in ('DRAFT','OPEN')", vendor);
        addCount(kpis, "SUBMITTED_QUOTATIONS", "Submitted Quotations", "select count(*) from vendor_quotations where vendor_id = :vendorId and status = 'SUBMITTED'", vendor);
        addCount(kpis, "PURCHASE_ORDERS", "Purchase Orders", "select count(*) from purchase_orders where vendor_id = :vendorId", vendor);
        addCount(kpis, "INVOICES", "Invoices", "select count(*) from invoices where vendor_id = :vendorId", vendor);
        addCount(kpis, "PAYMENTS", "Payments", "select count(*) from payments where vendor_id = :vendorId", vendor);
        addCount(kpis, "NOTIFICATIONS", "Notifications", "select count(*) from notifications where reference_type = 'VENDOR' and reference_id = :vendorId", vendor);
        return response("vendor", kpis, List.of(chart("po", filter), chart("invoices", filter), chart("payments", filter)), filter);
    }

    @Override
    public DashboardResponse hr(DashboardFilter filter) {
        List<KpiResponse> kpis = new ArrayList<>();
        addCount(kpis, "TOTAL_EMPLOYEES", "Total Employees", "select count(*) from employees", Map.of());
        addCount(kpis, "ACTIVE_EMPLOYEES", "Active Employees", "select count(*) from employees where active_flag = true", Map.of());
        addCount(kpis, "NEW_EMPLOYEES", "New Employees", "select count(*) from employees where created_at >= date_format(curdate(), '%Y-%m-01')", Map.of());
        addCount(kpis, "WITHOUT_MANAGER", "Without Manager", "select count(*) from employees where manager_id is null", Map.of());
        addCount(kpis, "DEPARTMENTS", "Departments", "select count(*) from departments where active_flag = true", Map.of());
        return response("hr", kpis, List.of(chart("pr", filter)), filter);
    }

    @Override
    public ChartResponse chart(String type, DashboardFilter filter) {
        return switch (type) {
            case "spend" -> chart("MONTHLY_SPEND", "Monthly Procurement Spend", "select date_format(po.order_date, '%Y-%m'), coalesce(sum(po.grand_total),0) from purchase_orders po" + repository.filter(filter, "po", "order_date", true, true, false, true, true).where() + " group by date_format(po.order_date, '%Y-%m') order by 1", repository.filter(filter, "po", "order_date", true, true, false, true, true).params());
            case "pr" -> monthlyCount("PURCHASE_REQUESTS", "Purchase Requests", "purchase_requests", "pr", "request_date", filter, true, false, false, true);
            case "rfq" -> monthlyCount("RFQS", "RFQs", "rfqs", "r", "issue_date", filter, false, false, false, false);
            case "po" -> monthlyCount("PURCHASE_ORDERS", "Purchase Orders", "purchase_orders", "po", "order_date", filter, true, true, false, true);
            case "grn" -> monthlyCount("GRNS", "Goods Receipt Notes", "goods_receipt_notes", "grn", "receipt_date", filter, false, true, true, false);
            case "invoices" -> monthlyCount("INVOICES", "Invoices", "invoices", "i", "invoice_date", filter, false, true, false, false);
            case "payments" -> monthlyCount("PAYMENTS", "Payments", "payments", "p", "payment_date", filter, false, true, false, false);
            case "vendors" -> vendorDistribution(filter);
            case "inventory" -> inventoryValue(filter);
            default -> throw new IllegalArgumentException("Unsupported dashboard chart: " + type);
        };
    }

    private ChartResponse monthlyCount(String code, String label, String table, String alias, String dateColumn, DashboardFilter filter, boolean department, boolean vendor, boolean warehouse, boolean costCenter) {
        var f = repository.filter(filter, alias, dateColumn, department, vendor, warehouse, costCenter, true);
        return chart(code, label, "select date_format(" + alias + "." + dateColumn + ", '%Y-%m'), count(*) from " + table + " " + alias + f.where() + " group by date_format(" + alias + "." + dateColumn + ", '%Y-%m') order by 1", f.params());
    }

    private ChartResponse vendorDistribution(DashboardFilter filter) {
        var f = repository.filter(filter, "po", "order_date", true, true, false, true, true);
        return chart("VENDOR_DISTRIBUTION", "Vendor Distribution", "select v.vendor_name, coalesce(sum(po.grand_total),0) from purchase_orders po join vendors v on v.vendor_id = po.vendor_id" + f.where() + " group by v.vendor_name order by 2 desc limit 10", f.params());
    }

    private ChartResponse departmentSpend(DashboardFilter filter) {
        var f = repository.filter(filter, "po", "order_date", true, true, false, true, true);
        return chart("DEPARTMENT_SPEND", "Department Spend", "select d.department_name, coalesce(sum(po.grand_total),0) from purchase_orders po join departments d on d.department_id = po.department_id" + f.where() + " group by d.department_name order by 2 desc limit 10", f.params());
    }

    private ChartResponse inventoryValue(DashboardFilter filter) {
        var f = repository.filter(filter, "i", "last_stock_update", false, false, true, false, true);
        return chart("INVENTORY_VALUE", "Inventory Value", "select w.warehouse_name, coalesce(sum(i.inventory_value),0) from inventory i join warehouses w on w.warehouse_id = i.warehouse_id" + f.where() + " group by w.warehouse_name order by 2 desc", f.params());
    }

    private ChartResponse statusChart(String code, String label, String table, String alias, DashboardFilter filter, boolean department, boolean vendor, boolean costCenter) {
        var f = repository.filter(filter, alias, "created_at", department, vendor, false, costCenter, true);
        return chart(code, label, "select " + alias + ".status, count(*) from " + table + " " + alias + f.where() + " group by " + alias + ".status order by 2 desc", f.params());
    }

    private ChartResponse chart(String code, String label, String sql, Map<String, Object> params) { return new ChartResponse(code, label, repository.chart(sql, params)); }
    private DashboardResponse response(String name, List<KpiResponse> kpis, List<ChartResponse> charts, DashboardFilter filter) { return new DashboardResponse(name, LocalDateTime.now(), kpis, charts, repository.recentActivities(filter, 20)); }
    private void addCount(List<KpiResponse> kpis, String code, String label, String sql, Map<String, Object> params) { kpis.add(new KpiResponse(code, label, repository.count(sql, params), null)); }
    private void addAmount(List<KpiResponse> kpis, String code, String label, String sql, Map<String, Object> params) { kpis.add(new KpiResponse(code, label, null, repository.amount(sql, params))); }
}
