package com.procurement.workflow.entity;

import com.procurement.employee.entity.Employee;
import com.procurement.role.entity.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Central Workflow Assignment record.
 *
 * Every actionable record (PurchaseRequest, PurchaseOrder, GRN, AuditCase, ...)
 * has a current assignment: who owns the next action, in which stage, since when,
 * and with what reason. The backend is the single source of truth — the frontend
 * only renders what these records say the logged-in user can act on.
 */
@Entity
@Table(
        name = "workflow_assignments",
        uniqueConstraints = @UniqueConstraint(columnNames = "assignment_number"),
        indexes = {
                @Index(name = "idx_wa_assigned_employee_status", columnList = "assigned_employee_id,status"),
                @Index(name = "idx_wa_entity", columnList = "entity_type,entity_id"),
                @Index(name = "idx_wa_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "workflow_assignment_id")
    private Long id;

    @Column(name = "assignment_number", nullable = false, length = 40)
    private String assignmentNumber;

    /** Type of the actionable record: PR, PO, GRN, AUDIT_CASE, INVOICE, PAYMENT. */
    @Column(name = "entity_type", nullable = false, length = 30)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    /** Workflow stage, e.g. PROCUREMENT, EQUIPMENT_TEAM, IT_SOFTWARE_TEAM, FACILITIES_TEAM, WAREHOUSE, AUDIT, FINANCE, CLOSURE. */
    @Column(name = "stage", nullable = false, length = 50)
    private String stage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_employee_id", nullable = false)
    private Employee assignedEmployee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_role_id", nullable = false)
    private Role assignedRole;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assigned_by_id", nullable = false)
    private Employee assignedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private WorkflowAssignmentStatus status;

    /** Expected next action, e.g. PROCESS, CREATE_RFQ, CREATE_PO, RECEIVE_GOODS, AUDIT, VERIFY, COMPLETE. */
    @Column(name = "action", length = 50)
    private String action;

    @Column(name = "reason", length = 1000)
    private String reason;

    /** Id of the assignment this one replaced (reassignment chain). */
    @Column(name = "previous_assignment_id")
    private Long previousAssignmentId;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        var now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (assignedAt == null) assignedAt = now;
        if (status == null) status = WorkflowAssignmentStatus.ASSIGNED;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
