package com.procurement.workflow.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.category.entity.Category;
import com.procurement.category.repository.CategoryRepository;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.event.BusinessEventPublisher;
import com.procurement.event.BusinessEventType;
import com.procurement.notification.entity.NotificationType;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.purchaserequestline.repository.PurchaseRequestLineRepository;
import com.procurement.role.repository.RoleRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.workflow.dto.request.WorkflowAssignRequest;
import com.procurement.workflow.dto.request.WorkflowCompleteRequest;
import com.procurement.workflow.dto.request.WorkflowReassignRequest;
import com.procurement.workflow.dto.response.WorkflowAssignmentResponse;
import com.procurement.workflow.entity.WorkflowAssignment;
import com.procurement.workflow.entity.WorkflowAssignmentStatus;
import com.procurement.workflow.repository.WorkflowAssignmentRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Set;

@Service
public class WorkflowServiceImpl implements WorkflowService {

    private static final Set<String> ALLOWED_ENTITY_TYPES =
            Set.of("PR", "PO", "GRN", "AUDIT_CASE", "INVOICE", "PAYMENT");
    private static final Set<String> ADMIN_ROLES = Set.of("SUPER_ADMIN", "ADMIN");
    private static final String DEFAULT_TEAM_ROLE = "PROCUREMENT_OFFICER";

    private final WorkflowAssignmentRepository assignments;
    private final EmployeeRepository employees;
    private final RoleRepository roles;
    private final UserRepository users;
    private final PurchaseRequestRepository requests;
    private final PurchaseRequestLineRepository lines;
    private final CategoryRepository categories;
    private final AuditLogService auditLogService;
    private final BusinessEventPublisher eventPublisher;
    private final TaskRoutingService taskRouting;

    public WorkflowServiceImpl(WorkflowAssignmentRepository assignments,
                               EmployeeRepository employees,
                               RoleRepository roles,
                               UserRepository users,
                               PurchaseRequestRepository requests,
                               PurchaseRequestLineRepository lines,
                               CategoryRepository categories,
                               AuditLogService auditLogService,
                               BusinessEventPublisher eventPublisher,
                               TaskRoutingService taskRouting) {
        this.assignments = assignments;
        this.employees = employees;
        this.roles = roles;
        this.users = users;
        this.requests = requests;
        this.lines = lines;
        this.categories = categories;
        this.auditLogService = auditLogService;
        this.eventPublisher = eventPublisher;
        this.taskRouting = taskRouting;
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private String username() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        return a == null ? "system" : a.getName();
    }

    private Employee currentEmployee() {
        return users.findByUsername(username())
                .map(User::getEmployee)
                .orElseThrow(() -> new ForbiddenException("Authenticated user is not linked to an employee"));
    }

    private boolean isAdmin() {
        return users.findByUsername(username())
                .map(u -> u.getRole() != null && ADMIN_ROLES.contains(u.getRole().getRoleCode()))
                .orElse(false);
    }

    private String currentRoleCode() {
        return users.findByUsername(username())
                .map(User::getRole)
                .map(r -> r.getRoleCode())
                .orElse("");
    }

    private boolean canManageAssignments() {
        String role = currentRoleCode();
        return ADMIN_ROLES.contains(role) || "PROCUREMENT_MANAGER".equals(role);
    }

    private WorkflowAssignment find(Long id) {
        return assignments.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow assignment not found: " + id));
    }

    private String nextNumber() {
        return "WA-" + Year.now().getValue() + "-" + String.format("%06d", assignments.count() + 1);
    }

    private String referenceFor(String entityType, Long entityId) {
        if ("PR".equals(entityType)) {
            return requests.findById(entityId).map(PurchaseRequest::getRequestNumber).orElse(String.valueOf(entityId));
        }
        return entityType + "-" + entityId;
    }

    private void notifyUser(Employee employee, String message, String reference) {
        users.findByEmployee(employee).ifPresent(u ->
                eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_APPROVED, "Workflow",
                        "WorkflowAssignment", null, reference, message, u.getUsername(), NotificationType.APPROVAL));
    }

    private String name(Employee e) {
        return e == null ? null : e.getFirstName() + " " + (e.getLastName() == null ? "" : e.getLastName());
    }

    private WorkflowAssignmentResponse toResponse(WorkflowAssignment wa) {
        Employee assignee = wa.getAssignedEmployee();
        Employee by = wa.getAssignedBy();
        Long prId = "PR".equals(wa.getEntityType()) ? wa.getEntityId() : null;
        PurchaseRequest pr = prId == null ? null : requests.findById(prId).orElse(null);
        String requestNumber = null;
        String requesterName = null;
        String departmentName = null;
        String categoryName = null;
        java.math.BigDecimal amount = null;
        String priority = null;
        LocalDateTime requiredDate = null;
        if (pr != null) {
            requestNumber = pr.getRequestNumber();
            requesterName = name(pr.getRequester());
            if (pr.getDepartment() != null) departmentName = pr.getDepartment().getDepartmentName();
            if (pr.getPriority() != null) priority = pr.getPriority().name();
            amount = pr.getEstimatedAmount();
            requiredDate = pr.getRequiredDate() == null ? null : pr.getRequiredDate().atStartOfDay();
            categoryName = lines.findByPurchaseRequestId(pr.getId()).stream()
                    .filter(l -> l.getProduct() != null && l.getProduct().getCategory() != null)
                    .findFirst()
                    .map(l -> l.getProduct().getCategory().getCategoryName())
                    .orElse(null);
        }
        return new WorkflowAssignmentResponse(
                wa.getId(), wa.getAssignmentNumber(), wa.getEntityType(), wa.getEntityId(), wa.getStage(),
                assignee.getId(), name(assignee), assignee.getEmployeeCode(),
                wa.getAssignedRole() == null ? null : wa.getAssignedRole().getRoleCode(),
                wa.getAssignedRole() == null ? null : wa.getAssignedRole().getRoleName(),
                by.getId(), name(by),
                wa.getStatus() == null ? null : wa.getStatus().name(),
                wa.getAction(), wa.getReason(), wa.getPreviousAssignmentId(),
                wa.getAssignedAt(), wa.getCompletedAt(),
                prId, requestNumber, requesterName, departmentName, categoryName, amount, priority, requiredDate);
    }

    // ------------------------------------------------------------------
    // Core engine
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public WorkflowAssignmentResponse assign(WorkflowAssignRequest req) {
        if (!canManageAssignments()) {
            throw new ForbiddenException("Only administrators or procurement managers can create workflow assignments");
        }
        if (!ALLOWED_ENTITY_TYPES.contains(req.entityType())) {
            throw new ConflictException("Unsupported entity type: " + req.entityType() +
                    " (supported: " + ALLOWED_ENTITY_TYPES + ")");
        }
        var assignee = employees.findById(req.assignedEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + req.assignedEmployeeId()));
        if (!Boolean.TRUE.equals(assignee.getActive())) {
            throw new ConflictException("Cannot assign to an inactive employee");
        }
        if (assignee.getRole() == null) {
            throw new ConflictException("Assigned employee has no role");
        }
        if ("PROCUREMENT_MANAGER".equals(currentRoleCode())
                && !isProcurementTarget(req.stage(), assignee.getRole().getRoleCode())) {
            throw new ForbiddenException("Procurement managers may assign only to an eligible procurement/team officer");
        }
        // Idempotency: never create a second active assignment for the same stage.
        assignments.findByEntityTypeAndEntityIdAndStatusAndStage(
                        req.entityType(), req.entityId(), WorkflowAssignmentStatus.ASSIGNED, req.stage())
                .ifPresent(existing -> {
                    throw new ConflictException("An active assignment already exists for this stage: " +
                            existing.getAssignmentNumber());
                });
        // One current assignment per record — supersede any other active stage.
        assignments.findByEntityTypeAndEntityIdAndStatus(req.entityType(), req.entityId(), WorkflowAssignmentStatus.ASSIGNED)
                .forEach(old -> {
                    old.setStatus(WorkflowAssignmentStatus.COMPLETED);
                    old.setCompletedAt(LocalDateTime.now());
                    old.setReason((old.getReason() == null ? "" : old.getReason() + " ") +
                            "Superseded by new assignment for stage " + req.stage());
                    assignments.save(old);
                });

        var by = currentEmployee();
        var wa = assignments.save(WorkflowAssignment.builder()
                .assignmentNumber(nextNumber())
                .entityType(req.entityType())
                .entityId(req.entityId())
                .stage(req.stage())
                .assignedEmployee(assignee)
                .assignedRole(assignee.getRole())
                .assignedBy(by)
                .status(WorkflowAssignmentStatus.ASSIGNED)
                .action(req.action())
                .reason(req.reason())
                .assignedAt(LocalDateTime.now())
                .build());
        String ref = referenceFor(req.entityType(), req.entityId());
        auditLogService.record("WORKFLOW", "WorkflowAssignment", wa.getId(), "ASSIGNED",
                ref, req.entityType(), true, null, req.stage(),
                "Assigned to " + assignee.getFirstName() + " " +
                        (assignee.getLastName() == null ? "" : assignee.getLastName()) +
                        " (" + assignee.getRole().getRoleCode() + ") for stage " + req.stage());
        notifyUser(assignee, "A new task has been assigned to you for " + ref +
                " (stage: " + req.stage() + ").", ref);
        return toResponse(wa);
    }

    @Override
    @Transactional
    public WorkflowAssignmentResponse complete(Long id, WorkflowCompleteRequest req) {
        var wa = find(id);
        if (wa.getStatus() != WorkflowAssignmentStatus.ASSIGNED &&
                wa.getStatus() != WorkflowAssignmentStatus.IN_PROGRESS) {
            throw new ConflictException("Only active assignments can be completed");
        }
        var employee = currentEmployee();
        boolean admin = isAdmin();
        if (!admin && !wa.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new ForbiddenException("Only the currently assigned person can complete this task");
        }
        wa.setStatus(WorkflowAssignmentStatus.COMPLETED);
        wa.setCompletedAt(LocalDateTime.now());
        if (req != null) {
            if (req.action() != null && !req.action().isBlank()) wa.setAction(req.action());
            if (req.comment() != null && !req.comment().isBlank()) {
                wa.setReason((wa.getReason() == null ? "" : wa.getReason() + " ") + req.comment());
            }
        }
        assignments.save(wa);
        String ref = referenceFor(wa.getEntityType(), wa.getEntityId());
        auditLogService.record("WORKFLOW", "WorkflowAssignment", wa.getId(), "COMPLETED",
                ref, wa.getEntityType(), true, wa.getStage(), "COMPLETED",
                "Stage " + wa.getStage() + " completed by " + employee.getFirstName() + " " +
                        (employee.getLastName() == null ? "" : employee.getLastName()));
        // Notify the requester when a PR stage completes so they can track progress.
        if ("PR".equals(wa.getEntityType())) {
            requests.findById(wa.getEntityId()).ifPresent(pr -> {
                if (pr.getRequester() != null) {
                    notifyUser(pr.getRequester(), pr.getRequestNumber() + " — stage " + wa.getStage() +
                            " completed by " + employee.getFirstName() + " " +
                            (employee.getLastName() == null ? "" : employee.getLastName()) + ".", pr.getRequestNumber());
                }
            });
        }
        return toResponse(wa);
    }

    @Override
    @Transactional
    public WorkflowAssignmentResponse reassign(Long id, WorkflowReassignRequest req) {
        var wa = find(id);
        if (wa.getStatus() != WorkflowAssignmentStatus.ASSIGNED &&
                wa.getStatus() != WorkflowAssignmentStatus.IN_PROGRESS) {
            throw new ConflictException("Only active assignments can be reassigned");
        }
        var employee = currentEmployee();
        boolean admin = isAdmin();
        if (!admin && !wa.getAssignedEmployee().getId().equals(employee.getId())) {
            throw new ForbiddenException("Only the current assignee or an administrator can reassign this task");
        }
        var newAssignee = employees.findById(req.newAssigneeEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + req.newAssigneeEmployeeId()));
        if (!Boolean.TRUE.equals(newAssignee.getActive())) {
            throw new ConflictException("Cannot reassign to an inactive employee");
        }
        if (newAssignee.getRole() == null) {
            throw new ConflictException("New assignee has no role");
        }
        // Keep the chain: old record is marked REASSIGNED and points forward via the new record's previousAssignmentId.
        wa.setStatus(WorkflowAssignmentStatus.REASSIGNED);
        wa.setCompletedAt(LocalDateTime.now());
        wa.setReason(req.reason());
        assignments.save(wa);

        var fresh = assignments.save(WorkflowAssignment.builder()
                .assignmentNumber(nextNumber())
                .entityType(wa.getEntityType())
                .entityId(wa.getEntityId())
                .stage(wa.getStage())
                .assignedEmployee(newAssignee)
                .assignedRole(newAssignee.getRole())
                .assignedBy(employee)
                .status(WorkflowAssignmentStatus.ASSIGNED)
                .action(wa.getAction())
                .reason(req.reason())
                .previousAssignmentId(wa.getId())
                .assignedAt(LocalDateTime.now())
                .build());
        String ref = referenceFor(wa.getEntityType(), wa.getEntityId());
        auditLogService.record("WORKFLOW", "WorkflowAssignment", wa.getId(), "REASSIGNED",
                ref, wa.getEntityType(), true, wa.getAssignedEmployee().getEmployeeCode(),
                newAssignee.getEmployeeCode(), "Reassigned by " + employee.getFirstName() + " — " + req.reason());
        auditLogService.record("WORKFLOW", "WorkflowAssignment", fresh.getId(), "ASSIGNED",
                ref, wa.getEntityType(), true, null, wa.getStage(), req.reason());
        notifyUser(wa.getAssignedEmployee(), "Task for " + ref + " (stage: " + wa.getStage() +
                ") was reassigned to " + newAssignee.getFirstName() + " " +
                (newAssignee.getLastName() == null ? "" : newAssignee.getLastName()) + ".", ref);
        notifyUser(newAssignee, "A task for " + ref + " (stage: " + wa.getStage() +
                ") has been reassigned to you.", ref);
        return toResponse(fresh);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WorkflowAssignmentResponse> myTasks(String stage, WorkflowAssignmentStatus status, Pageable pageable) {
        var employee = currentEmployee();
        var rows = status == null
                ? assignments.findByAssignedEmployeeId(employee.getId(), pageable)
                : assignments.findByAssignedEmployeeIdAndStatus(employee.getId(), status, pageable);
        var filtered = rows.getContent().stream()
                .filter(a -> stage == null || stage.isBlank() || stage.equalsIgnoreCase(a.getStage()))
                .map(this::toResponse)
                .toList();
        return new PageResponse<>(filtered, rows.getNumber(), rows.getSize(), rows.getTotalElements(),
                rows.getTotalPages(), rows.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkflowAssignmentResponse getById(Long id) {
        var wa = find(id);
        var user = currentEmployee();
        boolean admin = isAdmin();
        boolean assignee = wa.getAssignedEmployee().getId().equals(user.getId());
        boolean previousAssignee = assignments.findByEntityTypeAndEntityIdOrderByAssignedAtAsc(wa.getEntityType(), wa.getEntityId())
                .stream().anyMatch(a -> a.getAssignedEmployee().getId().equals(user.getId()));
        boolean requester = "PR".equals(wa.getEntityType())
                && requests.findById(wa.getEntityId()).map(pr -> pr.getRequester() != null
                        && pr.getRequester().getId().equals(user.getId())).orElse(false);
        if (!admin && !assignee && !previousAssignee && !requester) {
            throw new ForbiddenException("You are not authorized to view this workflow task");
        }
        return toResponse(wa);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkflowAssignmentResponse> history(String entityType, Long entityId) {
        // IDOR protection: employees may only read assignment history for their own PRs.
        if ("PR".equalsIgnoreCase(entityType)) {
            var user = users.findByUsername(username()).orElse(null);
            if (user != null && user.getRole() != null && "EMPLOYEE".equals(user.getRole().getRoleCode())) {
                var emp = user.getEmployee();
                boolean own = emp != null && requests.findById(entityId)
                        .map(pr -> pr.getRequester() != null && pr.getRequester().getId().equals(emp.getId()))
                        .orElse(false);
                if (!own) throw new ForbiddenException("You can only view assignment history for your own requests");
            }
        }
        var rows = assignments.findByEntityTypeAndEntityIdOrderByAssignedAtAsc(entityType, entityId);
        var user = currentEmployee();
        boolean admin = isAdmin();
        boolean requester = "PR".equalsIgnoreCase(entityType)
                && requests.findById(entityId).map(pr -> pr.getRequester() != null && pr.getRequester().getId().equals(user.getId())).orElse(false);
        boolean participant = rows.stream().anyMatch(a -> a.getAssignedEmployee().getId().equals(user.getId()));
        if (!admin && !requester && !participant) {
            throw new ForbiddenException("You are not authorized to view this workflow history");
        }
        return rows.stream().map(this::toResponse).toList();
    }

    private boolean isProcurementTarget(String stage, String roleCode) {
        String s = stage == null ? "" : stage.toUpperCase();
        String r = roleCode == null ? "" : roleCode.toUpperCase();
        return r.contains("PROCUREMENT") || r.contains("EQUIPMENT") || r.contains("SOFTWARE") || r.contains("FACILITIES")
                || s.contains("PROCUREMENT") || s.contains("EQUIPMENT") || s.contains("SOFTWARE") || s.contains("FACILITIES");
    }

    // ------------------------------------------------------------------
    // Category routing engine
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Employee resolveTeamOfficer(PurchaseRequest pr) {
        String teamRole = resolveTeamRole(pr);
        var role = roles.findByRoleCode(teamRole)
                .orElseThrow(() -> new ConflictException("Routing role not configured: " + teamRole));
        // Round-robin across every active officer in the flow, keyed by the PR:
        // with four officers a request lands on any of the four, with five on any of the five.
        return taskRouting.pickActiveByRole(role.getId(), pr.getId())
                .orElseThrow(() -> new ConflictException("No active employee found for routing role: " + teamRole));
    }

    private String resolveTeamRole(PurchaseRequest pr) {
        var line = lines.findByPurchaseRequestId(pr.getId()).stream()
                .filter(l -> l.getProduct() != null && l.getProduct().getCategory() != null)
                .findFirst()
                .orElse(null);
        if (line == null) return DEFAULT_TEAM_ROLE;
        Category category = line.getProduct().getCategory();
        // Walk the parent chain until a configured team mapping is found.
        Category cursor = category;
        while (cursor != null) {
            if (cursor.getTeamRoleCode() != null && !cursor.getTeamRoleCode().isBlank()) {
                return cursor.getTeamRoleCode();
            }
            cursor = cursor.getParentCategory();
        }
        return DEFAULT_TEAM_ROLE;
    }

    @Override
    @Transactional
    public WorkflowAssignmentResponse assignToTeam(PurchaseRequest pr, String reason) {
        // Final approval always enters the Procurement Manager's scoped queue.
        // The manager must explicitly assign the category-specific officer/team;
        // the manager themselves is chosen round-robin among every active
        // procurement manager so no single person owns the whole queue.
        var managerRole = roles.findByRoleCode("PROCUREMENT_MANAGER")
                .orElseThrow(() -> new ConflictException("Procurement Manager role is not configured"));
        var officer = taskRouting.pickActiveByRole(managerRole.getId(), pr.getId())
                .orElseThrow(() -> new ConflictException("No active Procurement Manager is configured"));
        String stage = "PROCUREMENT_MANAGER";
        // Idempotent: if this PR already has an active team assignment, keep it.
        var existing = assignments.findByEntityTypeAndEntityIdAndStatusAndStage(
                "PR", pr.getId(), WorkflowAssignmentStatus.ASSIGNED, stage);
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }
        var by = currentEmployee();
        var wa = assignments.save(WorkflowAssignment.builder()
                .assignmentNumber(nextNumber())
                .entityType("PR")
                .entityId(pr.getId())
                .stage(stage)
                .assignedEmployee(officer)
                .assignedRole(officer.getRole())
                .assignedBy(by)
                .status(WorkflowAssignmentStatus.ASSIGNED)
                .action("PROCESS")
                .reason(reason == null || reason.isBlank()
                        ? "Final approval complete — queued for Procurement Manager category assignment"
                        : reason)
                .assignedAt(LocalDateTime.now())
                .build());
        auditLogService.record("WORKFLOW", "WorkflowAssignment", wa.getId(), "ROUTED",
                pr.getRequestNumber(), "PR", true, null, stage,
                "Routed to " + officer.getFirstName() + " " +
                        (officer.getLastName() == null ? "" : officer.getLastName()) +
                        " (" + officer.getRole().getRoleName() + ") after final approval");
        notifyUser(officer, pr.getRequestNumber() + " has been fully approved and routed to your team (" +
                officer.getRole().getRoleName() + ") for processing.", pr.getRequestNumber());
        return toResponse(wa);
    }
}
