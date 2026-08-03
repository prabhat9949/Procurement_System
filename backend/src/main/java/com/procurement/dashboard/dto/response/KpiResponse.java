package com.procurement.dashboard.dto.response;

import java.math.BigDecimal;

public record KpiResponse(String code, String label, Long count, BigDecimal amount) { }
