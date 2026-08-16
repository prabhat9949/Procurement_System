package com.procurement.workflow.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.workflow.dto.request.WorkflowAssignRequest;
import com.procurement.workflow.dto.request.WorkflowCompleteRequest;
import com.procurement.workflow.dto.request.WorkflowReassignRequest;
import com.procurement.workflow.dto.response.WorkflowAssignmentResponse;
import com.procurement.workflow.entity.WorkflowAssignmentStatus;
import com.procurement.workflow.service.WorkflowService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    private final WorkflowService service;

    public WorkflowController(WorkflowService service) {
        this.service = service;
    }

    private Pageable p(int page, int size, String sort, String direction) {
        return PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort));
    }

    /** The authenticated user's assigned tasks — backend scoped, never a generic role queue. */
    @GetMapping("/my-tasks")
    public ApiResponse<PageResponse<WorkflowAssignmentResponse>> myTasks(
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) WorkflowAssignmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "assignedAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.success(service.myTasks(stage, status, p(page, size, sort, direction)));
    }

    @GetMapping("/tasks/{id}")
    public ApiResponse<WorkflowAssignmentResponse> get(@PathVariable Long id) {
        return ApiResponse.success(service.getById(id));
    }

    /** Complete the current assignment (only the assigned person or admin). */
    @PostMapping("/tasks/{id}/complete")
    public ApiResponse<WorkflowAssignmentResponse> complete(@PathVariable Long id,
                                                            @Valid @RequestBody(required = false) WorkflowCompleteRequest req) {
        return ApiResponse.success("Workflow task completed", service.complete(id, req));
    }

    /** Reassign to another active eligible user with a mandatory reason. */
    @PostMapping("/tasks/{id}/reassign")
    public ApiResponse<WorkflowAssignmentResponse> reassign(@PathVariable Long id,
                                                            @Valid @RequestBody WorkflowReassignRequest req) {
        return ApiResponse.success("Workflow task reassigned", service.reassign(id, req));
    }

    /** Authorized assignment (admin / workflow owner). */
    @PostMapping("/assign")
    public ApiResponse<WorkflowAssignmentResponse> assign(@Valid @RequestBody WorkflowAssignRequest req) {
        return ApiResponse.success("Workflow task assigned", service.assign(req));
    }

    /** Append-only assignment history for a record. */
    @GetMapping("/history/{entityType}/{entityId}")
    public ApiResponse<List<WorkflowAssignmentResponse>> history(@PathVariable String entityType,
                                                                 @PathVariable Long entityId) {
        return ApiResponse.success(service.history(entityType, entityId));
    }
}
