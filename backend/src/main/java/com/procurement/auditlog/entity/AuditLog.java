package com.procurement.auditlog.entity;

import com.procurement.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_module_name", columnList = "module_name"),
        @Index(name = "idx_audit_entity_name", columnList = "entity_name"),
        @Index(name = "idx_audit_performed_by", columnList = "performed_by"),
        @Index(name = "idx_audit_performed_at", columnList = "performed_at"),
        @Index(name = "idx_audit_operation", columnList = "operation"),
        @Index(name = "idx_audit_reference_number", columnList = "reference_number")
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_log_id")
    private Long id;

    @Column(name = "module_name", nullable = false, length = 100)
    private String moduleName;

    @Column(name = "entity_name", nullable = false, length = 100)
    private String entityName;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "operation", nullable = false, length = 50)
    private String operation;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "reference_type", length = 100)
    private String referenceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "performed_by", nullable = false, length = 150)
    private String performedBy;

    @Column(name = "success_flag", nullable = false)
    @Builder.Default
    private Boolean success = true;

    @Column(name = "old_value", length = 4000)
    private String oldValue;

    @Column(name = "new_value", length = 4000)
    private String newValue;

    @Column(name = "details", length = 4000)
    private String details;

    @Column(name = "performed_at", nullable = false, updatable = false)
    private LocalDateTime performedAt;

    @PrePersist
    void prePersist() {
        if (performedAt == null) {
            performedAt = LocalDateTime.now();
        }
        if (success == null) {
            success = true;
        }
    }
}
