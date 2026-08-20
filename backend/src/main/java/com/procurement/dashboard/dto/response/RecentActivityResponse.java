package com.procurement.dashboard.dto.response;

import java.time.LocalDateTime;

public record RecentActivityResponse(
        String type,
        String referenceNumber,
        String title,
        String status,
        LocalDateTime occurredAt
) { }
