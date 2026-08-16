package com.procurement.dashboard.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record DashboardResponse(
        String dashboard,
        LocalDateTime generatedAt,
        List<KpiResponse> kpis,
        List<ChartResponse> charts,
        List<RecentActivityResponse> recentActivities
) { }
