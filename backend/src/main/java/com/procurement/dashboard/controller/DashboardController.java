package com.procurement.dashboard.controller;

import com.procurement.dashboard.dto.request.DashboardFilter;
import com.procurement.dashboard.dto.response.ChartResponse;
import com.procurement.dashboard.dto.response.DashboardResponse;
import com.procurement.dashboard.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) { this.dashboardService = dashboardService; }

    @GetMapping("/admin") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','AUDITOR')")
    public DashboardResponse admin(DashboardFilter filter) { return dashboardService.admin(filter); }

    @GetMapping("/procurement") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER')")
    public DashboardResponse procurement(DashboardFilter filter, Authentication authentication) { return dashboardService.procurement(filter, authentication.getName()); }

    @GetMapping("/finance") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','FINANCE_MANAGER')")
    public DashboardResponse finance(DashboardFilter filter) { return dashboardService.finance(filter); }

    @GetMapping("/warehouse") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','WAREHOUSE_MANAGER')")
    public DashboardResponse warehouse(DashboardFilter filter) { return dashboardService.warehouse(filter); }

    @GetMapping("/vendor") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','VENDOR')")
    public DashboardResponse vendor(DashboardFilter filter) { return dashboardService.vendor(filter); }

    @GetMapping("/hr") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    public DashboardResponse hr(DashboardFilter filter) { return dashboardService.hr(filter); }

    @GetMapping("/employee") @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','EMPLOYEE')")
    public DashboardResponse employee(DashboardFilter filter, Authentication authentication) { return dashboardService.employee(filter, authentication.getName()); }

    @GetMapping("/charts/spend") @PreAuthorize("isAuthenticated()") public ChartResponse spend(DashboardFilter filter) { return dashboardService.chart("spend", filter); }
    @GetMapping("/charts/pr") @PreAuthorize("isAuthenticated()") public ChartResponse purchaseRequests(DashboardFilter filter) { return dashboardService.chart("pr", filter); }
    @GetMapping("/charts/rfq") @PreAuthorize("isAuthenticated()") public ChartResponse rfqs(DashboardFilter filter) { return dashboardService.chart("rfq", filter); }
    @GetMapping("/charts/po") @PreAuthorize("isAuthenticated()") public ChartResponse purchaseOrders(DashboardFilter filter) { return dashboardService.chart("po", filter); }
    @GetMapping("/charts/grn") @PreAuthorize("isAuthenticated()") public ChartResponse grns(DashboardFilter filter) { return dashboardService.chart("grn", filter); }
    @GetMapping("/charts/invoices") @PreAuthorize("isAuthenticated()") public ChartResponse invoices(DashboardFilter filter) { return dashboardService.chart("invoices", filter); }
    @GetMapping("/charts/payments") @PreAuthorize("isAuthenticated()") public ChartResponse payments(DashboardFilter filter) { return dashboardService.chart("payments", filter); }
    @GetMapping("/charts/vendors") @PreAuthorize("isAuthenticated()") public ChartResponse vendors(DashboardFilter filter) { return dashboardService.chart("vendors", filter); }
    @GetMapping("/charts/inventory") @PreAuthorize("isAuthenticated()") public ChartResponse inventory(DashboardFilter filter) { return dashboardService.chart("inventory", filter); }
}
