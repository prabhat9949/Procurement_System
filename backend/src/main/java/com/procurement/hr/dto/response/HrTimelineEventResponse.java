package com.procurement.hr.dto.response;

import java.time.LocalDateTime;

/**
 * A single event in the full procurement lifecycle of a purchase request,
 * as shown on the HR "View Full Process" timeline. Each event identifies the
 * actor, their role, the timestamp and a comment where recorded.
 */
public record HrTimelineEventResponse(
        long sequence,
        String action,
        String person,
        String employeeCode,
        String role,
        String department,
        LocalDateTime timestamp,
        String comment,
        String previousStatus,
        String newStatus
) {
}
