package com.procurement.approvalhistory.entity;
import com.procurement.purchaserequest.entity.PurchaseRequest; import com.procurement.approvaltask.entity.ApprovalTask; import com.procurement.employee.entity.Employee;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;
@Entity @Table(name="approval_histories") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalHistory{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="approval_history_id") private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="purchase_request_id",nullable=false) private PurchaseRequest purchaseRequest;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="approval_task_id") private ApprovalTask approvalTask;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private ApprovalAction action;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="performed_by_id",nullable=false) private Employee performedBy;
 @Column(length=1000) private String comments; @Column(name="performed_at",nullable=false) private LocalDateTime performedAt;
 @PrePersist void prePersist(){if(performedAt==null)performedAt=LocalDateTime.now();}
}
