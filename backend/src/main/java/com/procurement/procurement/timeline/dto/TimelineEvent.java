package com.procurement.procurement.timeline.dto;

import java.time.LocalDateTime;

/**
 * One uniform event in the unified PR timeline. Every source (approval history,
 * workflow assignment, RFQ, PO, GRN, audit case) is normalised into this shape
 * so all dashboards render one source of truth.
 */
public record TimelineEvent(
        Long id,
        String type,            // PR_CREATED, PR_SUBMITTED, APPROVAL_*, ASSIGNED, REASSIGNED, COMPLETED, ROUTED, RFQ_CREATED, PO_CREATED, PO_STATUS, GRN_CREATED, AUDIT_CASE_CREATED, AUDIT_CONCLUDED
        String stage,           // e.g. MANAGER_APPROVAL, EQUIPMENT_TEAM, WAREHOUSE, AUDIT
        String title,           // human-readable headline
        String description,     // additional detail (comments / reason)
        String performedByName, // who did it (or "System")
        String performedByRole, // role at the time of the action
        String reference,       // PR-..., AT-..., WA-..., RFQ-..., PO-..., GRN-..., AC-...
        String status,          // resulting status at that point
        LocalDateTime occurredAt) {
}
