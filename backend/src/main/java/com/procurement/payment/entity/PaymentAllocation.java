package com.procurement.payment.entity;

import com.procurement.invoice.entity.Invoice;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name="payment_allocations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentAllocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="payment_allocation_id")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="payment_id",nullable=false)
    private Payment payment;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="invoice_id",nullable=false)
    private Invoice invoice;
    @Column(name="allocated_amount",nullable=false,precision=15,scale=2)
    private BigDecimal allocatedAmount;
    @Column(name="remaining_amount",nullable=false,precision=15,scale=2)
    private BigDecimal remainingAmount;
    @Column(length=1000)
    private String remarks;
}
