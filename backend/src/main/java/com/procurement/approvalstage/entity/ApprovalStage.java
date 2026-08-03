package com.procurement.approvalstage.entity;
import com.procurement.approvalrule.entity.ApprovalRule;
import com.procurement.role.entity.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="approval_stages", uniqueConstraints=@UniqueConstraint(columnNames={"approval_rule_id","sequence"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalStage {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="approval_stage_id") private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="approval_rule_id",nullable=false) private ApprovalRule approvalRule;
 @Column(name="stage_number",nullable=false) private Integer stageNumber;
 @Column(name="stage_name",nullable=false,length=100) private String stageName;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="approver_role_id",nullable=false) private Role approverRole;
 @Column(name="minimum_approvers",nullable=false) @Builder.Default private Integer minimumApprovers=1;
 @Column(name="mandatory_approval",nullable=false) @Builder.Default private Boolean mandatoryApproval=true;
 @Column(name="sequence",nullable=false) private Integer sequence;
 @Column(name="active",nullable=false) @Builder.Default private Boolean active=true;
 @Column(name="created_at",updatable=false) private LocalDateTime createdAt;
 @Column(name="updated_at") private LocalDateTime updatedAt;
 @PrePersist void prePersist(){var n=LocalDateTime.now();createdAt=n;updatedAt=n;}
 @PreUpdate void preUpdate(){updatedAt=LocalDateTime.now();}
}
