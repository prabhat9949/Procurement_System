package com.procurement.hr.service;

import com.procurement.approvaltask.entity.ApprovalTask;
import com.procurement.approvaltask.entity.ApprovalTaskStatus;
import com.procurement.approvaltask.repository.ApprovalTaskRepository;
import com.procurement.auditlog.dto.response.AuditLogResponse;
import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.hr.dto.response.HrApprovalHistoryResponse;
import com.procurement.hr.dto.response.HrPrDetailResponse;
import com.procurement.hr.dto.response.HrPrRowResponse;
import com.procurement.hr.dto.response.HrTimelineEventResponse;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.purchaserequest.specification.PurchaseRequestSpecification;
import com.procurement.rfq.entity.Rfq;
import com.procurement.rfq.repository.RfqRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class HrServiceImpl implements HrService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final ApprovalTaskRepository approvalTaskRepository;
    private final RfqRepository rfqRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public HrServiceImpl(PurchaseRequestRepository purchaseRequestRepository,
                         ApprovalTaskRepository approvalTaskRepository,
                         RfqRepository rfqRepository,
                         UserRepository userRepository,
                         AuditLogService auditLogService) {
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.approvalTaskRepository = approvalTaskRepository;
        this.rfqRepository = rfqRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    // ==================================================================
    // Active PR list
    // ==================================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<HrPrRowResponse> activePurchaseRequests(
            String keyword, Long departmentId, Long requesterId,
            PurchaseRequestPriority priority, PurchaseRequestStatus status,
            ApprovalStatus approvalStatus, LocalDate createdDateFrom,
            LocalDate createdDateTo, Pageable pageable) {

        User user = currentUser();
        boolean allScope = hasAuthority(user, "CAN_VIEW_ALL_EMPLOYEE_PR");

        // Scope: when HR does not hold CAN_VIEW_ALL_EMPLOYEE_PR, restrict to the
        // HR user's own department (never trust a client-supplied department).
        if (!allScope && user.getEmployee() != null) {
            departmentId = user.getEmployee().getDepartment() == null
                    ? departmentId : user.getEmployee().getDepartment().getId();
        }

        Specification<PurchaseRequest> spec = PurchaseRequestSpecification.search(
                keyword, requesterId, departmentId, null, priority, status,
                approvalStatus, null, null, createdDateFrom, createdDateTo);

        Page<HrPrRowResponse> page = purchaseRequestRepository.findAll(spec, pageable)
                .map(this::toRow);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    // ==================================================================
    // PR detail + approval history + timeline
    // ==================================================================

    @Override
    @Transactional(readOnly = true)
    public HrPrDetailResponse purchaseRequestDetail(Long id) {
        PurchaseRequest pr = findInScope(id);
        return new HrPrDetailResponse(
                pr.getId(), pr.getRequestNumber(), pr.getRequestDate(), pr.getRequiredDate(),
                pr.getRequester().getId(),
                pr.getRequester().getFirstName() + " " + pr.getRequester().getLastName(),
                pr.getRequester().getEmployeeCode(),
                pr.getDepartment() == null ? null : pr.getDepartment().getDepartmentName(),
                pr.getCostCenter() == null ? null : pr.getCostCenter().getName(),
                pr.getRequester().getManager() == null ? null
                        : pr.getRequester().getManager().getFirstName() + " " + pr.getRequester().getManager().getLastName(),
                pr.getPriority(), pr.getStatus(), pr.getApprovalStatus(),
                pr.getPurpose(), pr.getRemarks(), pr.getEstimatedAmount(),
                currentStage(pr), currentOwnerName(pr), nextAction(pr),
                ageDays(pr), pr.getCreatedAt(), pr.getUpdatedAt(),
                approvalHistory(pr.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HrApprovalHistoryResponse> approvalHistory(Long purchaseRequestId) {
        findInScope(purchaseRequestId);
        return approvalTaskRepository
                .findByPurchaseRequestIdOrderByApprovalStageSequenceAsc(purchaseRequestId)
                .stream()
                .map(task -> new HrApprovalHistoryResponse(
                        task.getId(), task.getTaskNumber(),
                        task.getApprovalStage() == null ? null : task.getApprovalStage().getStageName(),
                        task.getAssignedEmployee().getFirstName() + " " + task.getAssignedEmployee().getLastName(),
                        task.getAssignedEmployee().getEmployeeCode(),
                        task.getAssignedRole() == null ? null : task.getAssignedRole().getRoleName(),
                        task.getStatus() == null ? null : task.getStatus().name(),
                        task.getComments(), task.getAssignedDate(), task.getCompletedDate()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HrTimelineEventResponse> timeline(Long purchaseRequestId) {
        PurchaseRequest pr = findInScope(purchaseRequestId);
        List<HrTimelineEventResponse> events = new ArrayList<>();
        long seq = 0;

        // 1. PR created
        events.add(new HrTimelineEventResponse(seq++, "PR Created",
                pr.getRequester().getFirstName() + " " + pr.getRequester().getLastName(),
                pr.getRequester().getEmployeeCode(),
                pr.getRequester().getRole() == null ? null : pr.getRequester().getRole().getRoleName(),
                pr.getDepartment() == null ? null : pr.getDepartment().getDepartmentName(),
                pr.getCreatedAt(), pr.getPurpose(), null, "DRAFT"));

        // 2. Audit-log events for this PR (submitted / approved / rejected / cancelled)
        var auditPage = auditLogService.search(null, null, null, null, null, null,
                null, pr.getRequestNumber(), org.springframework.data.domain.PageRequest.of(0, 200));
        for (AuditLogResponse log : auditPage.content()) {
            events.add(new HrTimelineEventResponse(seq++, friendlyAction(log.operation()),
                    log.performedBy(), null, null, null, log.performedAt(),
                    log.details() == null ? log.newValue() : log.details(),
                    null, null));
        }

        // 3. Approval chain (who approved, when, comment)
        for (ApprovalTask task : approvalTaskRepository
                .findByPurchaseRequestIdOrderByApprovalStageSequenceAsc(purchaseRequestId)) {
            events.add(new HrTimelineEventResponse(seq++, approvalTaskAction(task),
                    task.getAssignedEmployee().getFirstName() + " " + task.getAssignedEmployee().getLastName(),
                    task.getAssignedEmployee().getEmployeeCode(),
                    task.getAssignedRole() == null ? null : task.getAssignedRole().getRoleName(),
                    task.getAssignedEmployee().getDepartment() == null ? null
                            : task.getAssignedEmployee().getDepartment().getDepartmentName(),
                    task.getCompletedDate() == null ? task.getAssignedDate() : task.getCompletedDate(),
                    task.getComments(),
                    null, task.getStatus() == null ? null : task.getStatus().name()));
        }

        // 4. RFQ created for this PR, if any
        var rfqOpt = rfqRepository.findByPurchaseRequestId(purchaseRequestId);
        if (rfqOpt.isPresent()) {
            Rfq rfq = rfqOpt.get();
            events.add(new HrTimelineEventResponse(seq++, "RFQ Created",
                    rfq.getCreatedBy(), null, "Procurement",
                    pr.getDepartment() == null ? null : pr.getDepartment().getDepartmentName(),
                    rfq.getCreatedAt(), "RFQ " + rfq.getRfqNumber() + " — " + rfq.getStatus(),
                    null, null));
        }

        events.sort(Comparator.comparing(HrTimelineEventResponse::timestamp,
                Comparator.nullsLast(Comparator.naturalOrder())));
        return events;
    }

    // ==================================================================
    // Helpers
    // ==================================================================

    private HrPrRowResponse toRow(PurchaseRequest pr) {
        return new HrPrRowResponse(
                pr.getId(), pr.getRequestNumber(),
                pr.getRequester().getId(),
                pr.getRequester().getFirstName() + " " + pr.getRequester().getLastName(),
                pr.getRequester().getEmployeeCode(),
                pr.getDepartment() == null ? null : pr.getDepartment().getDepartmentName(),
                pr.getCostCenter() == null ? null : pr.getCostCenter().getName(),
                pr.getPurpose(), pr.getEstimatedAmount(), pr.getPriority(),
                pr.getStatus(), pr.getApprovalStatus(),
                currentStage(pr), currentOwnerName(pr), nextAction(pr),
                ageDays(pr), pr.getCreatedAt(), pr.getUpdatedAt());
    }

    private PurchaseRequest findInScope(Long id) {
        PurchaseRequest pr = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found: " + id));
        User user = currentUser();
        boolean allScope = hasAuthority(user, "CAN_VIEW_ALL_EMPLOYEE_PR");
        if (!allScope && user.getEmployee() != null
                && pr.getRequester().getDepartment() != null
                && !pr.getRequester().getDepartment().getId()
                .equals(user.getEmployee().getDepartment() == null ? null
                        : user.getEmployee().getDepartment().getId())) {
            throw new ForbiddenException("This purchase request is outside your HR scope");
        }
        return pr;
    }

    private String currentStage(PurchaseRequest pr) {
        if (pr.getStatus() == PurchaseRequestStatus.APPROVED
                || pr.getStatus() == PurchaseRequestStatus.RFQ_CREATED) {
            return "Procurement";
        }
        if (pr.getStatus() == PurchaseRequestStatus.SUBMITTED
                || pr.getStatus() == PurchaseRequestStatus.UNDER_REVIEW) {
            return pendingTask(pr) == null ? "Approval"
                    : pendingTask(pr).getApprovalStage().getStageName();
        }
        return pr.getStatus() == null ? null : pr.getStatus().name();
    }

    private String currentOwnerName(PurchaseRequest pr) {
        ApprovalTask pending = pendingTask(pr);
        if (pending != null) {
            return pending.getAssignedEmployee().getFirstName() + " "
                    + pending.getAssignedEmployee().getLastName();
        }
        if (pr.getStatus() == PurchaseRequestStatus.APPROVED
                || pr.getStatus() == PurchaseRequestStatus.RFQ_CREATED) {
            return "Procurement Team";
        }
        return null;
    }

    private String nextAction(PurchaseRequest pr) {
        ApprovalTask pending = pendingTask(pr);
        if (pending != null) {
            return "Awaiting " + pending.getAssignedEmployee().getFirstName() + " "
                    + pending.getAssignedEmployee().getLastName() + " (" + pending.getStatus() + ")";
        }
        return switch (pr.getStatus()) {
            case DRAFT -> "Awaiting submission by requester";
            case SUBMITTED, UNDER_REVIEW -> "Awaiting approval decision";
            case APPROVED -> "Awaiting procurement assignment / RFQ";
            case RFQ_CREATED -> "Awaiting vendor sourcing";
            case REJECTED -> "Request rejected";
            case CANCELLED -> "Request cancelled";
            default -> null;
        };
    }

    private ApprovalTask pendingTask(PurchaseRequest pr) {
        return approvalTaskRepository
                .findFirstByPurchaseRequestIdAndStatusOrderByApprovalStageSequenceAsc(
                        pr.getId(), ApprovalTaskStatus.PENDING)
                .orElse(null);
    }

    private int ageDays(PurchaseRequest pr) {
        if (pr.getCreatedAt() == null) return 0;
        return (int) Duration.between(pr.getCreatedAt(), LocalDateTime.now()).toDays();
    }

    private String approvalTaskAction(ApprovalTask task) {
        if (task.getStatus() == null) return "Approval task";
        return switch (task.getStatus()) {
            case APPROVED -> "Approved";
            case REJECTED -> "Rejected";
            case RETURNED -> "Returned for Correction";
            default -> "Approval Task Created";
        };
    }

    private String friendlyAction(String operation) {
        if (operation == null) return "Event";
        return switch (operation.toUpperCase()) {
            case "CREATE" -> "PR Created";
            case "SUBMIT" -> "PR Submitted";
            case "APPROVE" -> "Approved";
            case "REJECT" -> "Rejected";
            case "RETURN" -> "Returned for Correction";
            case "CANCEL" -> "Cancelled";
            default -> operation;
        };
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication == null ? "system" : authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ForbiddenException("Authenticated user not found"));
    }

    /** Effective permission check — the JWT filter reloads role + permissions +
     *  user overrides from the database on every request, so this is always live. */
    private boolean hasAuthority(User user, String permissionCode) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> permissionCode.equals(a.getAuthority()));
    }
}
