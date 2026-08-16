package com.procurement.workflow.service;

import com.procurement.common.response.PageResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.workflow.dto.request.WorkflowAssignRequest;
import com.procurement.workflow.dto.request.WorkflowCompleteRequest;
import com.procurement.workflow.dto.request.WorkflowReassignRequest;
import com.procurement.workflow.dto.response.WorkflowAssignmentResponse;
import com.procurement.workflow.entity.WorkflowAssignmentStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Central Workflow Assignment Engine.
 *
 * Every actionable record has a current assignment stored in the database.
 * Only the currently assigned person can perform the current action; queues
 * are resolved against the authenticated user, never against a generic role.
 */
public interface WorkflowService {

    /** Create a workflow assignment (validated, idempotent, supersedes any other active assignment on the same record). */
    WorkflowAssignmentResponse assign(WorkflowAssignRequest request);

    /** Complete the current assignment — only the assigned person (or admin) can act. */
    WorkflowAssignmentResponse complete(Long id, WorkflowCompleteRequest request);

    /** Reassign to another active eligible user with a mandatory reason; keeps the full chain in history. */
    WorkflowAssignmentResponse reassign(Long id, WorkflowReassignRequest request);

    /** The authenticated user's assigned tasks (user-scoped queue). */
    PageResponse<WorkflowAssignmentResponse> myTasks(String stage, WorkflowAssignmentStatus status, Pageable pageable);

    /** Task detail — visible to the assignee, the requester (PR), or admin. */
    WorkflowAssignmentResponse getById(Long id);

    /** Append-only assignment history for an entity. */
    List<WorkflowAssignmentResponse> history(String entityType, Long entityId);

    /** Category routing engine: resolve the team officer that owns execution for this PR's category. */
    Employee resolveTeamOfficer(PurchaseRequest pr);

    /** Called when a PR reaches final approval — routes it to the category team officer. */
    WorkflowAssignmentResponse assignToTeam(PurchaseRequest pr, String reason);
}
