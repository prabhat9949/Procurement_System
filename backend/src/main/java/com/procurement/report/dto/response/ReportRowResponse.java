package com.procurement.report.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReportRowResponse(
        Long id,
        String referenceNumber,
        String title,
        String status,
        String relatedOne,
        String relatedTwo,
        String relatedThree,
        LocalDate date,
        BigDecimal quantity,
        BigDecimal amount,
        String remarks
) {}
