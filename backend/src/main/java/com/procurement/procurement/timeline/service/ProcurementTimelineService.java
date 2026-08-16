package com.procurement.procurement.timeline.service;

import com.procurement.approvalhistory.entity.ApprovalAction;
import com.procurement.approvalhistory.entity.ApprovalHistory;
import com.procurement.approvalhistory.repository.ApprovalHistoryRepository;
import com.procurement.approvaltask.entity.ApprovalTaskStatus;
import com.procurement.approvaltask.repository.ApprovalTaskRepository;
import com.procurement.audit.entity.AuditCase;
import com.procurement.audit.repository.AuditCaseRepository;
import com.procurement.common.exception.ForbiddenException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.employee.entity.Employee;
import com.procurement.goodsreceipt.repository.GoodsReceiptNoteRepository;
import com.procurement.procurement.timeline.dto.TimelineEvent;
import com.procurement.procurement.timeline.dto.TimelineResponse;
import com.procurement.purchaseorder.entity.PurchaseOrder;
import com.procurement.purchaseorder.entity.PurchaseOrderHistory;
import com.procurement.purchaseorder.repository.PurchaseOrderHistoryRepository;
import com.procurement.purchaseorder.repository.PurchaseOrderRepository;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.rfq.repository.RfqRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.workflow.entity.WorkflowAssignment;
import com.procurement.workflow.entity.WorkflowAssignmentStatus;
import com.procurement.workflow.repository.WorkflowAssignmentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Unified PR timeline — one source of truth for every dashboard. Merges:
 * PR creation/submission, approval history, workflow assignments,
 * RFQ, PO (with its history), GRN and audit cases, chronologically sorted.
 */
@Service
public class ProcurementTimelineService {

    private final PurchaseRequestRepository requests;
    private final ApprovalHistoryRepository approvalHistories;
    private final ApprovalTaskRepository approvalTasks;
    private final WorkflowAssignmentRepository workflowAssignments;
    private final RfqRepository rfqs;
    private final PurchaseOrderRepository purchaseOrders;
    private final PurchaseOrderHistoryRepository poHistories;
    private final GoodsReceiptNoteRepository grns;
    private final AuditCaseRepository auditCases;
    private final UserRepository users;

    public ProcurementTimelineService(PurchaseRequestRepository requests,
                                      ApprovalHistoryRepository approvalHistories,
                                      ApprovalTaskRepository approvalTasks,
                                      WorkflowAssignmentRepository workflowAssignments,
                                      RfqRepository rfqs,
                                      PurchaseOrderRepository purchaseOrders,
                                      PurchaseOrderHistoryRepository poHistories,
                                      GoodsReceiptNoteRepository grns,
                                      AuditCaseRepository auditCases,
                                      UserRepository users) {
        this.requests = requests;
        this.approvalHistories = approvalHistories;
        this.approvalTasks = approvalTasks;
        this.workflowAssignments = workflowAssignments;
        this.rfqs = rfqs;
        this.purchaseOrders = purchaseOrders;
        this.poHistories = poHistories;
        this.grns = grns;
        this.auditCases = auditCases;
        this.users = users;
    }

    private String username() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        return a == null ? "system" : a.getName();
    }

    private Employee currentEmployee() {
        return users.findByUsername(username()).map(User::getEmployee).orElse(null);
    }

    private String name(Employee e) {
        return e == null ? "System" : e.getFirstName() + " " + (e.getLastName() == null ? "" : e.getLastName());
    }

    private String roleOf(Employee e) {
        return e == null || e.getRole() == null ? null : e.getRole().getRoleName();
    }

    @Transactional(readOnly = true)
    public TimelineResponse timeline(Long prId) {
        var pr = requests.findById(prId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase request not found: " + prId));
        // Visibility: an EMPLOYEE may only open their own request timeline.
        var user = users.findByUsername(username()).orElse(null);
        if (user != null && user.getRole() != null && "EMPLOYEE".equals(user.getRole().getRoleCode())) {
            var emp = user.getEmployee();
            if (emp == null || pr.getRequester() == null || !pr.getRequester().getId().equals(emp.getId())) {
                throw new ForbiddenException("You can only view the timeline of your own requests");
            }
        }

        List<TimelineEvent> events = new ArrayList<>();
        // 1. PR creation
        events.add(new TimelineEvent(pr.getId(), "PR_CREATED", "REQUEST",
                "Request created", pr.getPurpose(), name(pr.getRequester()), roleOf(pr.getRequester()),
                pr.getRequestNumber(), pr.getStatus() == null ? null : pr.getStatus().name(),
                pr.getCreatedAt()));

        // 2. Approval history (submission + approvals)
        approvalHistories.findByPurchaseRequestIdOrderByPerformedAtAsc(prId).forEach(h -> {
            String stage = h.getApprovalTask() != null && h.getApprovalTask().getApprovalStage() != null
                    ? h.getApprovalTask().getApprovalStage().getStageName() : "Approval";
            String type = switch (h.getAction()) {
                case SUBMITTED -> "PR_SUBMITTED";
                case APPROVED -> "APPROVAL_APPROVED";
                case REJECTED -> "APPROVAL_REJECTED";
                case RETURNED -> "APPROVAL_RETURNED";
                case AUTO_APPROVED -> "APPROVAL_AUTO_APPROVED";
            };
            String title = switch (h.getAction()) {
                case SUBMITTED -> "Request submitted";
                case APPROVED -> stage + " approved";
                case REJECTED -> stage + " rejected";
                case RETURNED -> stage + " returned for correction";
                case AUTO_APPROVED -> stage + " auto-approved";
            };
            events.add(new TimelineEvent(h.getId(), type, stage, title, h.getComments(),
                    name(h.getPerformedBy()), roleOf(h.getPerformedBy()),
                    h.getApprovalTask() == null ? null : h.getApprovalTask().getTaskNumber(),
                    h.getAction().name(), h.getPerformedAt()));
        });

        // 3. Workflow assignments (post-approval routing)
        workflowAssignments.findByEntityTypeAndEntityIdOrderByAssignedAtAsc("PR", prId).forEach(wa -> {
            String type = switch (wa.getStatus()) {
                case ASSIGNED -> "ASSIGNED";
                case IN_PROGRESS -> "IN_PROGRESS";
                case COMPLETED -> "COMPLETED";
                case REASSIGNED -> "REASSIGNED";
                case CANCELLED -> "CANCELLED";
                case EXPIRED -> "EXPIRED";
            };
            String title = switch (wa.getStatus()) {
                case ASSIGNED -> "Assigned to " + name(wa.getAssignedEmployee()) + " (" +
                        (wa.getAssignedRole() == null ? "" : wa.getAssignedRole().getRoleName()) + ")";
                case REASSIGNED -> "Reassigned from " + name(wa.getAssignedEmployee());
                case COMPLETED -> "Stage completed by " + name(wa.getAssignedEmployee());
                case IN_PROGRESS -> "Stage started by " + name(wa.getAssignedEmployee());
                default -> "Assignment " + wa.getStatus().name();
            };
            events.add(new TimelineEvent(wa.getId(), type, wa.getStage(), title, wa.getReason(),
                    name(wa.getAssignedBy()), roleOf(wa.getAssignedBy()), wa.getAssignmentNumber(),
                    wa.getStatus().name(), wa.getCompletedAt() != null ? wa.getCompletedAt() : wa.getAssignedAt()));
        });

        // 4. RFQ
        rfqs.findByPurchaseRequestId(prId).ifPresent(rfq ->
                events.add(new TimelineEvent(rfq.getId(), "RFQ_CREATED", "RFQ",
                        "RFQ generated", rfq.getRemarks(), rfq.getCreatedBy(), null,
                        rfq.getRfqNumber(), rfq.getStatus() == null ? null : rfq.getStatus().name(),
                        rfq.getCreatedAt())));

        // 5. Purchase orders + their history
        purchaseOrders.findByPurchaseRequestIdOrderByCreatedAtAsc(prId).forEach(po -> {
            events.add(new TimelineEvent(po.getId(), "PO_CREATED", "PURCHASE_ORDER",
                    "Purchase order generated", "Vendor: " +
                            (po.getVendor() == null ? "" : po.getVendor().getVendorName()),
                    po.getCreatedBy(), null, po.getPoNumber(),
                    po.getStatus() == null ? null : po.getStatus().name(), po.getCreatedAt()));
            poHistories.findByPurchaseOrderIdOrderByPerformedAtAsc(po.getId()).forEach(h ->
                    events.add(new TimelineEvent(h.getId(), "PO_STATUS", "PURCHASE_ORDER",
                            "Purchase order " + h.getAction().toLowerCase().replace('_', ' '),
                            h.getRemarks(), name(h.getPerformedBy()), roleOf(h.getPerformedBy()),
                            po.getPoNumber(),
                            h.getNewStatus() == null ? null : h.getNewStatus().name(),
                            h.getPerformedAt())));
        });

        // 6. GRN
        purchaseOrders.findByPurchaseRequestIdOrderByCreatedAtAsc(prId).forEach(po ->
                grns.findByPurchaseOrderId(po.getId()).forEach(grn ->
                        events.add(new TimelineEvent(grn.getId(), "GRN_CREATED", "WAREHOUSE",
                                "Goods received — GRN created", "Received by " + grn.getReceivedBy() +
                                        (grn.getRemarks() == null ? "" : " · " + grn.getRemarks()),
                                grn.getReceivedBy(), "WAREHOUSE", grn.getGrnNumber(),
                                grn.getStatus() == null ? null : grn.getStatus().name(),
                                grn.getCreatedAt()))));

        // 7. Audit cases
        auditCases.findByPurchaseRequestId(prId).forEach(c -> {
            events.add(new TimelineEvent(c.getId(), "AUDIT_CASE_CREATED", "AUDIT",
                    "Audit case created", "Risk: " +
                            (c.getRiskLevel() == null ? "N/A" : c.getRiskLevel().name()),
                    c.getAssignedTo() == null ? c.getCreatedBy() : name(c.getAssignedTo().getEmployee()),
                    c.getAssignedTo() == null || c.getAssignedTo().getEmployee() == null ? null
                            : roleOf(c.getAssignedTo().getEmployee()),
                    c.getCaseNumber(), c.getStatus() == null ? null : c.getStatus().name(), c.getCreatedAt()));
            if (c.getConcludedAt() != null) {
                events.add(new TimelineEvent(c.getId(), "AUDIT_CONCLUDED", "AUDIT",
                        "Audit concluded", c.getConclusion(),
                        c.getConcludedBy(), "AUDITOR", c.getCaseNumber(),
                        c.getStatus() == null ? null : c.getStatus().name(), c.getConcludedAt()));
            }
        });

        events.sort(Comparator.comparing(TimelineEvent::occurredAt, Comparator.nullsLast(Comparator.naturalOrder())));

        // Current state: active approval task or active workflow assignment.
        String currentStage = null;
        String currentAssigneeName = null;
        String currentAssigneeRole = null;
        var pendingTask = approvalTasks.findByPurchaseRequestIdOrderByApprovalStageSequenceAsc(prId).stream()
                .filter(t -> t.getStatus() == ApprovalTaskStatus.PENDING)
                .findFirst().orElse(null);
        if (pendingTask != null) {
            currentStage = pendingTask.getApprovalStage() == null ? null : pendingTask.getApprovalStage().getStageName();
            currentAssigneeName = name(pendingTask.getAssignedEmployee());
            currentAssigneeRole = roleOf(pendingTask.getAssignedEmployee());
        } else {
            var activeWa = workflowAssignments.findByEntityTypeAndEntityIdAndStatus("PR", prId,
                            WorkflowAssignmentStatus.ASSIGNED).stream().findFirst()
                    .orElse(workflowAssignments.findByEntityTypeAndEntityIdAndStatus("PR", prId,
                            WorkflowAssignmentStatus.IN_PROGRESS).stream().findFirst().orElse(null));
            if (activeWa != null) {
                currentStage = activeWa.getStage();
                currentAssigneeName = name(activeWa.getAssignedEmployee());
                currentAssigneeRole = activeWa.getAssignedRole() == null ? null : activeWa.getAssignedRole().getRoleName();
            }
        }

        return new TimelineResponse(
                pr.getId(), pr.getRequestNumber(),
                name(pr.getRequester()),
                pr.getDepartment() == null ? null : pr.getDepartment().getDepartmentName(),
                pr.getStatus() == null ? null : pr.getStatus().name(),
                pr.getApprovalStatus() == null ? null : pr.getApprovalStatus().name(),
                currentStage, currentAssigneeName, currentAssigneeRole, events);
    }
}
