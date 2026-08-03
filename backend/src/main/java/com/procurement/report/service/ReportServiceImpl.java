package com.procurement.report.service;

import com.procurement.common.response.PageResponse;
import com.procurement.report.dto.request.ReportFilter;
import com.procurement.report.dto.response.*;
import com.procurement.report.repository.ReportRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Supplier;

@Service
public class ReportServiceImpl implements ReportService {
    private final ReportRepository repo;
    private final ExportService exportService;
    public ReportServiceImpl(ReportRepository repo, ExportService exportService){this.repo=repo;this.exportService=exportService;}

    public DashboardResponse dashboard(){return repo.dashboard();}
    public PageResponse<ReportRowResponse> purchaseRequests(ReportFilter filter, Pageable pageable){return page(repo.purchaseRequests(filter,pageable));}
    public PageResponse<ReportRowResponse> approvals(ReportFilter filter, Pageable pageable){return page(repo.approvals(filter,pageable));}
    public PageResponse<ReportRowResponse> rfqs(ReportFilter filter, Pageable pageable){return page(repo.rfqs(filter,pageable));}
    public PageResponse<ReportRowResponse> quotations(ReportFilter filter, Pageable pageable){return page(repo.quotations(filter,pageable));}
    public PageResponse<ReportRowResponse> comparisons(ReportFilter filter, Pageable pageable){return page(repo.comparisons(filter,pageable));}
    public PageResponse<ReportRowResponse> purchaseOrders(ReportFilter filter, Pageable pageable){return page(repo.purchaseOrders(filter,pageable));}
    public PageResponse<ReportRowResponse> grns(ReportFilter filter, Pageable pageable){return page(repo.grns(filter,pageable));}
    public PageResponse<ReportRowResponse> inventory(ReportFilter filter, Pageable pageable){return page(repo.inventory(filter,pageable));}
    public PageResponse<ReportRowResponse> invoices(ReportFilter filter, Pageable pageable){return page(repo.invoices(filter,pageable));}
    public PageResponse<ReportRowResponse> threeWayMatches(ReportFilter filter, Pageable pageable){return page(repo.threeWayMatches(filter,pageable));}
    public PageResponse<ReportRowResponse> payments(ReportFilter filter, Pageable pageable){return page(repo.payments(filter,pageable));}
    public PageResponse<ReportRowResponse> vendors(ReportFilter filter, Pageable pageable){return page(repo.vendors(filter,pageable));}
    public PageResponse<ReportRowResponse> departments(ReportFilter filter, Pageable pageable){return page(repo.departments(filter,pageable));}
    public PageResponse<ReportRowResponse> auditSummary(ReportFilter filter, Pageable pageable){return page(repo.auditSummary(filter,pageable));}

    public ReportExportResponse exportPdf(String reportType, ReportFilter filter){return exportService.pdf(reportType, rows(reportType, filter));}
    public ReportExportResponse exportExcel(String reportType, ReportFilter filter){return exportService.excel(reportType, rows(reportType, filter));}
    public ReportExportResponse exportCsv(String reportType, ReportFilter filter){return exportService.csv(reportType, rows(reportType, filter));}

    private List<ReportRowResponse> rows(String reportType, ReportFilter filter) {
        var pageable = org.springframework.data.domain.PageRequest.of(0, 500);
        return switch (reportType) {
            case "purchase-requests" -> repo.purchaseRequests(filter, pageable).getContent();
            case "approvals" -> repo.approvals(filter, pageable).getContent();
            case "rfqs" -> repo.rfqs(filter, pageable).getContent();
            case "quotations" -> repo.quotations(filter, pageable).getContent();
            case "comparisons" -> repo.comparisons(filter, pageable).getContent();
            case "purchase-orders" -> repo.purchaseOrders(filter, pageable).getContent();
            case "grns" -> repo.grns(filter, pageable).getContent();
            case "inventory" -> repo.inventory(filter, pageable).getContent();
            case "invoices" -> repo.invoices(filter, pageable).getContent();
            case "three-way-matches" -> repo.threeWayMatches(filter, pageable).getContent();
            case "payments" -> repo.payments(filter, pageable).getContent();
            case "vendors" -> repo.vendors(filter, pageable).getContent();
            case "departments" -> repo.departments(filter, pageable).getContent();
            case "audit-summary" -> repo.auditSummary(filter, pageable).getContent();
            default -> throw new IllegalArgumentException("Unknown report type: " + reportType);
        };
    }

    private PageResponse<ReportRowResponse> page(org.springframework.data.domain.Page<ReportRowResponse> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
