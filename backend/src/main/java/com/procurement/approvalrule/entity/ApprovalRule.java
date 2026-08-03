package com.procurement.approvalrule.entity;

import com.procurement.department.entity.Department;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="approval_rules", uniqueConstraints=@UniqueConstraint(columnNames="rule_code"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalRule {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="approval_rule_id") private Long id;
    @Column(name="rule_code", nullable=false, length=50) private String ruleCode;
    @Column(name="rule_name", nullable=false, length=150) private String ruleName;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="department_id", nullable=false) private Department department;
    @Column(name="minimum_amount", nullable=false, precision=15, scale=2) private BigDecimal minimumAmount;
    @Column(name="maximum_amount", precision=15, scale=2) private BigDecimal maximumAmount;
    @Builder.Default @Column(name="active", nullable=false) private Boolean active=true;
    @Column(length=500) private String description;
    @Column(name="created_by", nullable=false, length=100) private String createdBy;
    @Column(name="updated_by", length=100) private String updatedBy;
    @Column(name="created_at", updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist(){ var n=LocalDateTime.now(); createdAt=n; updatedAt=n; }
    @PreUpdate void preUpdate(){ updatedAt=LocalDateTime.now(); }
}
