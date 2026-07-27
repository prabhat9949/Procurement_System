package com.procurement.dashboard.service;

import com.procurement.dashboard.dto.request.DashboardFilter;
import com.procurement.dashboard.dto.response.ChartResponse;
import com.procurement.dashboard.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse admin(DashboardFilter filter);
    DashboardResponse procurement(DashboardFilter filter, String username);
    DashboardResponse finance(DashboardFilter filter);
    DashboardResponse warehouse(DashboardFilter filter);
    DashboardResponse vendor(DashboardFilter filter);
    ChartResponse chart(String type, DashboardFilter filter);
}
