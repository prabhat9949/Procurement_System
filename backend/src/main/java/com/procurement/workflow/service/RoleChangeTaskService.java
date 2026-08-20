package com.procurement.workflow.service;

import com.procurement.approvaltask.entity.ApprovalTask;
import com.procurement.approvaltask.entity.ApprovalTaskStatus;
import com.procurement.approvaltask.repository.ApprovalTaskRepository;
import com.procurement.auditlog.service.AuditLogService;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.event.BusinessEventPublisher;
import com.procurement.event.BusinessEventType;
import com.procurement.notification.entity.NotificationType;
import com.procurement.role.entity.Role;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.workflow.entity.WorkflowAssignment;
import com.procurement.workflow.entity.WorkflowAssignmentStatus;
import com.procurement.workflow.repository.WorkflowAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

/**
 * Role-change-with-open-tasks handler.
 *
 * When Admin changes a user's role, every open work item assigned to that user
 * is processed safely — never deleted:
 *  - Option A (retain): the item stays if the new role is still authorised for
 *    the stage it belongs to.
 *  - Option B (reassign): otherwise it is handed to a configured replacement
 *    (the requester's reporting chain for approvals, then first active employee
 *    with the required role), preserving the full chain in history.
 * Every decision is written to the audit log and both parties are notified.
 */
@Service
public class RoleChangeTaskService {

    private final ApprovalTaskRepository approvalTasks;
    private final WorkflowAssignmentRepository workflowAssignments;
    private final EmployeeRepository employees;
    private final UserRepository users;
    private final AuditLogService auditLogService;
    private final BusinessEventPublisher eventPublisher;
    private final TaskRoutingService taskRouting;

    public RoleChangeTaskService(ApprovalTaskRepository approvalTasks,
                                 WorkflowAssignmentRepository workflowAssignments,
                                 EmployeeRepository employees,
                                 UserRepository users,
                                 AuditLogService auditLogService,
                                 BusinessEventPublisher eventPublisher,
                                 TaskRoutingService taskRouting) {
        this.approvalTasks = approvalTasks;
        this.workflowAssignments = workflowAssignments;
        this.employees = employees;
        this.users = users;
        this.auditLogService = auditLogService;
        this.eventPublisher = eventPublisher;
        this.taskRouting = taskRouting;
    }

    /**
     * Account-disabled handler: the account can no longer act, so every open
     * approval task and workflow assignment is handed to another active person
     * in the same flow (round-robin among the required role). Nothing is lost —
     * the old record is marked REASSIGNED and the chain is preserved in history.
     */
    @Transactional
    public void handleAccountDisabled(Long employeeId, String reason) {
        var employee = employees.findById(employeeId).orElse(null);
        if (employee == null) return;
        String change = "Account disabled"
                + (reason == null || reason.isBlank() ? "" : " — " + reason);
        reassignOpenApprovalTasks(employee, change);
        reassignOpenWorkflowAssignments(employee, change);
    }

    @Transactional
    public void handleRoleChange(Long employeeId, Role oldRole, Role newRole, String reason) {
        var employee = employees.findById(employeeId).orElse(null);
        if (employee == null) return;
        String change = "Role changed from " + oldRole.getRoleCode() + " to " + newRole.getRoleCode()
                + (reason == null || reason.isBlank() ? "" : " — " + reason);

        handleOpenApprovalTasks(employee, oldRole, newRole, change);
        handleOpenWorkflowAssignments(employee, oldRole, newRole, change);
    }

    // ------------------------------------------------------------------
    // Open approval tasks (PENDING)
    // ------------------------------------------------------------------

    private void handleOpenApprovalTasks(Employee employee, Role oldRole, Role newRole, String change) {
        List<ApprovalTask> open = approvalTasks.findByAssignedEmployeeIdAndStatus(
                employee.getId(), ApprovalTaskStatus.PENDING);
        for (ApprovalTask task : open) {
            var stageRole = task.getApprovalStage().getApproverRole();
            String stageName = task.getApprovalStage().getStageName();
            if (stageRole.getId().equals(newRole.getId())) {
                // Option A: the new role is still authorised for this stage.
                auditLogService.record("WORKFLOW", "ApprovalTask", task.getId(), "RETAINED_ON_ROLE_CHANGE",
                        task.getTaskNumber(), "PR", true, oldRole.getRoleCode(), newRole.getRoleCode(),
                        "Approval task retained for " + stageName + " — " + change);
                continue;
            }
            // Option B: find a replacement approver for this stage.
            Employee replacement = findReplacementApprover(task);
            if (replacement == null) {
                auditLogService.record("WORKFLOW", "ApprovalTask", task.getId(), "NO_REPLACEMENT_ON_ROLE_CHANGE",
                        task.getTaskNumber(), "PR", true, oldRole.getRoleCode(), newRole.getRoleCode(),
                        "No active replacement found for stage " + stageName + " — task left pending for admin review (" + change + ")");
                continue;
            }
            reassignApprovalTask(task, replacement, change);
        }
    }

    private Employee findReplacementApprover(ApprovalTask task) {
        var stage = task.getApprovalStage();
        var pr = task.getPurchaseRequest();
        // Anyone active in the flow is a candidate; round-robin by PR id and
        // never back to the assignee being replaced.
        return taskRouting.pickActiveByRole(
                stage.getApproverRole().getId(), pr.getId(), task.getAssignedEmployee().getId())
                .orElse(null);
    }

    /** Disabled account: reassign every open approval task to someone else in the flow. */
    private void reassignOpenApprovalTasks(Employee employee, String change) {
        List<ApprovalTask> open = approvalTasks.findByAssignedEmployeeIdAndStatus(
                employee.getId(), ApprovalTaskStatus.PENDING);
        for (ApprovalTask task : open) {
            Employee replacement = findReplacementApprover(task);
            if (replacement == null) {
                auditLogService.record("WORKFLOW", "ApprovalTask", task.getId(), "NO_REPLACEMENT_ON_DISABLE",
                        task.getTaskNumber(), "PR", true, null, employee.getEmployeeCode(),
                        "No active replacement found for stage " + task.getApprovalStage().getStageName()
                                + " — task left pending for admin review (" + change + ")");
                continue;
            }
            reassignApprovalTask(task, replacement, change);
        }
    }

    private void reassignApprovalTask(ApprovalTask task, Employee replacement, String change) {
        var pr = task.getPurchaseRequest();
        task.setStatus(ApprovalTaskStatus.REASSIGNED);
        task.setCompletedDate(LocalDateTime.now());
        task.setComments((task.getComments() == null ? "" : task.getComments() + " ")
                + "Reassigned (" + change + ")");
        approvalTasks.save(task);

        ApprovalTask fresh = approvalTasks.save(ApprovalTask.builder()
                .taskNumber("AT-" + Year.now().getValue() + "-" + String.format("%06d", approvalTasks.count() + 1))
                .purchaseRequest(pr)
                .approvalStage(task.getApprovalStage())
                .assignedEmployee(replacement)
                .assignedRole(task.getAssignedRole())
                .status(ApprovalTaskStatus.PENDING)
                .approvedAmount(pr.getEstimatedAmount())
                .assignedDate(LocalDateTime.now())
                .comments("Reassigned from " + task.getAssignedEmployee().getFirstName() + " " +
                        (task.getAssignedEmployee().getLastName() == null ? "" : task.getAssignedEmployee().getLastName()) + " — " + change)
                .build());

        auditLogService.record("WORKFLOW", "ApprovalTask", task.getId(), "REASSIGNED_ON_ROLE_CHANGE",
                pr.getRequestNumber(), "PR", true,
                task.getAssignedEmployee().getEmployeeCode(), replacement.getEmployeeCode(),
                "Approval task reassigned to " + replacement.getFirstName() + " " +
                        (replacement.getLastName() == null ? "" : replacement.getLastName()) + " (" +
                        replacement.getRole().getRoleCode() + ") for stage " +
                        task.getApprovalStage().getStageName() + " — " + change);
        notifyUser(replacement, pr.getRequestNumber() + " has been assigned to you for " +
                task.getApprovalStage().getStageName() + " approval (reassigned — " + change + ").",
                pr.getRequestNumber());
    }

    // ------------------------------------------------------------------
    // Open workflow assignments (ASSIGNED / IN_PROGRESS)
    // ------------------------------------------------------------------

    private void handleOpenWorkflowAssignments(Employee employee, Role oldRole, Role newRole, String change) {
        for (WorkflowAssignmentStatus status : List.of(
                WorkflowAssignmentStatus.ASSIGNED, WorkflowAssignmentStatus.IN_PROGRESS)) {
            List<WorkflowAssignment> open =
                    workflowAssignments.findByAssignedEmployeeIdAndStatusOrderByAssignedAtAsc(employee.getId(), status);
            for (WorkflowAssignment wa : open) {
                var requiredRole = wa.getAssignedRole();
                if (requiredRole != null && requiredRole.getId().equals(newRole.getId())) {
                    // Option A: the new role is still authorised for this stage.
                    auditLogService.record("WORKFLOW", "WorkflowAssignment", wa.getId(), "RETAINED_ON_ROLE_CHANGE",
                            wa.getAssignmentNumber(), wa.getEntityType(), true,
                            oldRole.getRoleCode(), newRole.getRoleCode(),
                            "Assignment retained for stage " + wa.getStage() + " — " + change);
                    continue;
                }
                Employee replacement = requiredRole == null ? null
                        : taskRouting.pickActiveByRole(
                                requiredRole.getId(), wa.getEntityId(), employee.getId()).orElse(null);
                if (replacement == null) {
                    auditLogService.record("WORKFLOW", "WorkflowAssignment", wa.getId(), "NO_REPLACEMENT_ON_ROLE_CHANGE",
                            wa.getAssignmentNumber(), wa.getEntityType(), true,
                            oldRole.getRoleCode(), newRole.getRoleCode(),
                            "No active replacement for stage " + wa.getStage() + " — assignment left active for admin review (" + change + ")");
                    continue;
                }
                reassignWorkflowAssignment(wa, replacement, change);
            }
        }
    }

    /** Disabled account: reassign every open workflow assignment to someone else in the flow. */
    private void reassignOpenWorkflowAssignments(Employee employee, String change) {
        for (WorkflowAssignmentStatus status : List.of(
                WorkflowAssignmentStatus.ASSIGNED, WorkflowAssignmentStatus.IN_PROGRESS)) {
            List<WorkflowAssignment> open =
                    workflowAssignments.findByAssignedEmployeeIdAndStatusOrderByAssignedAtAsc(employee.getId(), status);
            for (WorkflowAssignment wa : open) {
                var requiredRole = wa.getAssignedRole();
                Employee replacement = requiredRole == null ? null
                        : taskRouting.pickActiveByRole(
                                requiredRole.getId(), wa.getEntityId(), employee.getId()).orElse(null);
                if (replacement == null) {
                    auditLogService.record("WORKFLOW", "WorkflowAssignment", wa.getId(), "NO_REPLACEMENT_ON_DISABLE",
                            wa.getAssignmentNumber(), wa.getEntityType(), true,
                            null, employee.getEmployeeCode(),
                            "No active replacement for stage " + wa.getStage()
                                    + " — assignment left active for admin review (" + change + ")");
                    continue;
                }
                reassignWorkflowAssignment(wa, replacement, change);
            }
        }
    }

    private void reassignWorkflowAssignment(WorkflowAssignment wa, Employee replacement, String change) {
        var oldAssignee = wa.getAssignedEmployee();
        wa.setStatus(WorkflowAssignmentStatus.REASSIGNED);
        wa.setCompletedAt(LocalDateTime.now());
        wa.setReason((wa.getReason() == null ? "" : wa.getReason() + " ") + change);
        workflowAssignments.save(wa);

        WorkflowAssignment fresh = workflowAssignments.save(WorkflowAssignment.builder()
                .assignmentNumber("WA-" + Year.now().getValue() + "-" + String.format("%06d", workflowAssignments.count() + 1))
                .entityType(wa.getEntityType())
                .entityId(wa.getEntityId())
                .stage(wa.getStage())
                .assignedEmployee(replacement)
                .assignedRole(wa.getAssignedRole())
                .assignedBy(wa.getAssignedBy())
                .status(WorkflowAssignmentStatus.ASSIGNED)
                .action(wa.getAction())
                .reason((wa.getReason() == null ? "" : wa.getReason() + " ") + change)
                .previousAssignmentId(wa.getId())
                .assignedAt(LocalDateTime.now())
                .build());

        String ref = "PR".equals(wa.getEntityType())
                ? String.valueOf(wa.getEntityId())
                : wa.getEntityType() + "-" + wa.getEntityId();
        auditLogService.record("WORKFLOW", "WorkflowAssignment", wa.getId(), "REASSIGNED_ON_ROLE_CHANGE",
                wa.getAssignmentNumber(), wa.getEntityType(), true,
                oldAssignee.getEmployeeCode(), replacement.getEmployeeCode(),
                "Assignment for stage " + wa.getStage() + " reassigned to " + replacement.getFirstName() + " " +
                        (replacement.getLastName() == null ? "" : replacement.getLastName()) + " — " + change);
        notifyUser(replacement, "A task (stage: " + wa.getStage() + ") was reassigned to you — " + change + ".",
                ref);
    }

    private void notifyUser(Employee employee, String message, String reference) {
        users.findByEmployee(employee).ifPresent(u ->
                eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_APPROVED, "Workflow",
                        "WorkflowAssignment", null, reference, message, u.getUsername(), NotificationType.APPROVAL));
    }
}
