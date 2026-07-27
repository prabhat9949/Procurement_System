package com.procurement.report.service;

import com.procurement.common.response.PageResponse;
import com.procurement.report.dto.request.ReportFilter;
import com.procurement.report.dto.response.*;
import org.springframework.data.domain.Pageable;

public interface ReportService {
    DashboardResponse dashboard();
    PageResponse<ReportRowResponse> purchaseRequests(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> approvals(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> rfqs(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> quotations(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> comparisons(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> purchaseOrders(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> grns(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> inventory(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> invoices(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> threeWayMatches(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> payments(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> vendors(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> departments(ReportFilter filter, Pageable pageable);
    PageResponse<ReportRowResponse> auditSummary(ReportFilter filter, Pageable pageable);
    ReportExportResponse exportPdf(String reportType, ReportFilter filter);
    ReportExportResponse exportExcel(String reportType, ReportFilter filter);
    ReportExportResponse exportCsv(String reportType, ReportFilter filter);
}
