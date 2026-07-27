package com.procurement.payment.entity;

import com.procurement.invoice.entity.Invoice;
import com.procurement.purchaseorder.entity.PurchaseOrder;
import com.procurement.threewaymatch.entity.ThreeWayMatch;
import com.procurement.vendor.entity.Vendor;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="payments",uniqueConstraints={@UniqueConstraint(columnNames="payment_number")},indexes={@Index(name="idx_payment_number",columnList="payment_number"),@Index(name="idx_payment_status",columnList="status"),@Index(name="idx_payment_date",columnList="payment_date")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="payment_id")
    private Long id;
    @Column(name="payment_number",nullable=false,length=50)
    private String paymentNumber;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="vendor_id",nullable=false)
    private Vendor vendor;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="invoice_id")
    private Invoice invoice;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="three_way_match_id")
    private ThreeWayMatch threeWayMatch;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="purchase_order_id")
    private PurchaseOrder purchaseOrder;
    @Column(name="payment_date")
    private LocalDate paymentDate;
    @Column(name="scheduled_date")
    private LocalDate scheduledDate;
    @Enumerated(EnumType.STRING) @Column(name="payment_method",nullable=false,length=30)
    private PaymentMethod paymentMethod;
    @Column(name="payment_reference",length=100)
    private String paymentReference;
    @Column(name="bank_reference",length=100)
    private String bankReference;
    @Column(nullable=false,length=3)
    private String currency;
    @Column(name="gross_amount",nullable=false,precision=15,scale=2)
    @Builder.Default private BigDecimal grossAmount=BigDecimal.ZERO;
    @Column(name="discount_amount",nullable=false,precision=15,scale=2)
    @Builder.Default private BigDecimal discountAmount=BigDecimal.ZERO;
    @Column(name="tax_deduction",nullable=false,precision=15,scale=2)
    @Builder.Default private BigDecimal taxDeduction=BigDecimal.ZERO;
    @Column(name="other_deduction",nullable=false,precision=15,scale=2)
    @Builder.Default private BigDecimal otherDeduction=BigDecimal.ZERO;
    @Column(name="net_amount",nullable=false,precision=15,scale=2)
    @Builder.Default private BigDecimal netAmount=BigDecimal.ZERO;
    @Column(name="paid_amount",nullable=false,precision=15,scale=2)
    @Builder.Default private BigDecimal paidAmount=BigDecimal.ZERO;
    @Column(name="balance_amount",nullable=false,precision=15,scale=2)
    @Builder.Default private BigDecimal balanceAmount=BigDecimal.ZERO;
    @Column(length=1000)
    private String remarks;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30)
    private PaymentStatus status;
    @Column(name="created_by",nullable=false)
    private String createdBy;
    @Column(name="updated_by")
    private String updatedBy;
    @Column(name="created_at",updatable=false)
    private LocalDateTime createdAt;
    @Column(name="updated_at")
    private LocalDateTime updatedAt;
    @PrePersist void pre(){var n=LocalDateTime.now();createdAt=n;updatedAt=n;if(status==null)status=PaymentStatus.DRAFT;}
    @PreUpdate void upd(){updatedAt=LocalDateTime.now();}
}
