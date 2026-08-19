package com.procurement.procurement.timeline.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.procurement.timeline.dto.TimelineResponse;
import com.procurement.procurement.timeline.service.ProcurementTimelineService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/procurement")
public class ProcurementTimelineController {

    private final ProcurementTimelineService timelineService;

    public ProcurementTimelineController(ProcurementTimelineService timelineService) {
        this.timelineService = timelineService;
    }

    /**
     * Unified PR timeline: PR creation, approvals, assignments, RFQ, PO (with
     * history), GRN and audit events merged into one chronological source of
     * truth. Visibility follows the same rules as the PR itself.
     */
    @GetMapping("/{prId}/timeline")
    public ApiResponse<TimelineResponse> timeline(@PathVariable Long prId) {
        return ApiResponse.success(timelineService.timeline(prId));
    }
}
