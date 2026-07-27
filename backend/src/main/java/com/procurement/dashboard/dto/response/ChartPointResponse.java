package com.procurement.dashboard.dto.response;

import java.math.BigDecimal;

public record ChartPointResponse(String label, BigDecimal value) { }
