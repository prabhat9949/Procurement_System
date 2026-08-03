package com.procurement.approvaltask.entity;
import com.procurement.employee.entity.Employee; import com.procurement.purchaserequest.entity.PurchaseRequest; import com.procurement.approvalstage.entity.ApprovalStage; import com.procurement.role.entity.Role;
import jakarta.persistence.*; import lombok.*; import java.math.BigDecimal; import java.time.LocalDateTime;
@Entity @Table(name="approval_tasks",uniqueConstraints=@UniqueConstraint(columnNames="task_number")) @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalTask{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="approval_task_id") private Long id;
 @Column(name="task_number",nullable=false,length=40) private String taskNumber;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="purchase_request_id",nullable=false) private PurchaseRequest purchaseRequest;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="approval_stage_id",nullable=false) private ApprovalStage approvalStage;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="assigned_employee_id",nullable=false) private Employee assignedEmployee;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="assigned_role_id",nullable=false) private Role assignedRole;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private ApprovalTaskStatus status;
 @Column(length=1000) private String comments;
 @Column(name="assigned_date",nullable=false) private LocalDateTime assignedDate;
 @Column(name="completed_date") private LocalDateTime completedDate;
 @Column(name="approved_amount",precision=15,scale=2) private BigDecimal approvedAmount;
 @Column(name="created_at",updatable=false) private LocalDateTime createdAt; @Column(name="updated_at") private LocalDateTime updatedAt;
 @PrePersist void prePersist(){var n=LocalDateTime.now();createdAt=n;updatedAt=n;if(assignedDate==null)assignedDate=n;if(status==null)status=ApprovalTaskStatus.PENDING;}
 @PreUpdate void preUpdate(){updatedAt=LocalDateTime.now();}
}
