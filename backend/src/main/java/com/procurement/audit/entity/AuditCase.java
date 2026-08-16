package com.procurement.audit.entity;

import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_cases", indexes = {
        @Index(name = "idx_audit_case_pr", columnList = "purchase_request_id"),
        @Index(name = "idx_audit_case_assignee", columnList = "assigned_to_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_case_id")
    private Long id;

    @Column(name = "case_number", nullable = false, unique = true, length = 40)
    private String caseNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_request_id", nullable = false)
    private PurchaseRequest purchaseRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    private User assignedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private AuditStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 15)
    private AuditRiskLevel riskLevel;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "audit_summary", length = 2000)
    private String auditSummary;

    @Column(name = "conclusion", length = 25)
    private String conclusion;

    @Column(name = "recommendation", length = 2000)
    private String recommendation;

    @Column(name = "concluded_by")
    private String concludedBy;

    @Column(name = "concluded_at")
    private LocalDateTime concludedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        var now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = AuditStatus.PENDING;
        if (riskLevel == null) riskLevel = AuditRiskLevel.LOW;
        if (assignedDate == null) assignedDate = LocalDate.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
