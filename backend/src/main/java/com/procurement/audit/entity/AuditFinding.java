package com.procurement.audit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_findings", indexes = @Index(name = "idx_finding_case", columnList = "audit_case_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "finding_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "audit_case_id", nullable = false)
    private AuditCase auditCase;

    @Column(name = "finding_type", nullable = false, length = 40)
    private String findingType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private FindingSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private FindingStatus status;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(name = "related_record", length = 120)
    private String relatedRecord;

    @Column(length = 2000)
    private String recommendation;

    @Column(name = "evidence_ref", length = 500)
    private String evidenceRef;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = FindingStatus.OPEN;
        if (severity == null) severity = FindingSeverity.MEDIUM;
    }
}
