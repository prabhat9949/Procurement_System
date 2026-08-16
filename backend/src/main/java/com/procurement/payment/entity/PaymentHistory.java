package com.procurement.payment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="payment_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="payment_history_id")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="payment_id",nullable=false)
    private Payment payment;
    @Column(nullable=false,length=50)
    private String action;
    @Column(name="performed_by",nullable=false)
    private String performedBy;
    @Enumerated(EnumType.STRING) @Column(name="old_status",length=30)
    private PaymentStatus oldStatus;
    @Enumerated(EnumType.STRING) @Column(name="new_status",length=30)
    private PaymentStatus newStatus;
    @Column(length=1000)
    private String remarks;
    @Column(name="performed_at",nullable=false)
    private LocalDateTime performedAt;
    @PrePersist void pre(){if(performedAt==null)performedAt=LocalDateTime.now();}
}
