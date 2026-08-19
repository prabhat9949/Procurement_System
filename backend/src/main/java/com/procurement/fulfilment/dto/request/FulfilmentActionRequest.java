package com.procurement.fulfilment.dto.request;

import java.math.BigDecimal;

public record FulfilmentActionRequest(
        BigDecimal quantity,
        String licenseKeyAssigned,
        String assetTag,
        String deliveryLocation,
        String remarks,
        Long assignedEmployeeId
) {}
