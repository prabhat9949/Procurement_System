package com.procurement.report.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal totalProcurementSpend,
        BigDecimal monthlySpend,
        long pendingApprovals,
        long pendingRfqs,
        long pendingPurchaseOrders,
        long pendingGrns,
        long pendingInvoices,
        long pendingPayments,
        BigDecimal inventoryValue,
        List<ChartPointResponse> monthlySpendChart,
        List<ChartPointResponse> departmentSpendChart,
        List<ChartPointResponse> vendorSpendChart,
        List<ChartPointResponse> paymentStatusChart,
        List<ChartPointResponse> invoiceStatusChart
) {}
