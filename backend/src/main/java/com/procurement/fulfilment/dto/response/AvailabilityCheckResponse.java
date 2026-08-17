package com.procurement.fulfilment.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record AvailabilityCheckResponse(
        Long purchaseRequestId,
        String requestNumber,
        String requesterName,
        String departmentName,
        String overallStatus, // "FULLY_AVAILABLE", "PARTIALLY_AVAILABLE", "UNAVAILABLE"
        String recommendedAction, // "INTERNAL_FULFILMENT", "PARTIAL_FULFILMENT_AND_EXTERNAL_PROCUREMENT", "EXTERNAL_PROCUREMENT_REQUIRED"
        BigDecimal totalRequestedQuantity,
        BigDecimal totalAvailableQuantity,
        BigDecimal totalShortageQuantity,
        String specializedTeam, // e.g. "EQUIPMENT_ASSET_TEAM", "IT_SOFTWARE_TEAM", "FACILITIES_TEAM"
        List<AvailabilityLineDetail> lines
) {}
