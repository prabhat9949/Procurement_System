package com.procurement.dashboard.dto.response;

import java.util.List;

public record ChartResponse(String code, String label, List<ChartPointResponse> points) { }
