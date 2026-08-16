package com.procurement.threewaymatch.entity;

import com.procurement.goodsreceipt.entity.GoodsReceiptNote;
import com.procurement.invoice.entity.Invoice;
import com.procurement.purchaseorder.entity.PurchaseOrder;
import com.procurement.vendor.entity.Vendor;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name="three_way_matches",uniqueConstraints={@UniqueConstraint(columnNames="match_number")},indexes={@Index(name="idx_twm_match_number",columnList="match_number"),@Index(name="idx_twm_status",columnList="status"),@Index(name="idx_twm_match_date",columnList="match_date")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThreeWayMatch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="three_way_match_id")
    private Long id;
    @Column(name="match_number",nullable=false,length=50)
    private String matchNumber;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="purchase_order_id",nullable=false,unique=true)
    private PurchaseOrder purchaseOrder;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="goods_receipt_note_id",nullable=false,unique=true)
    private GoodsReceiptNote goodsReceiptNote;
    @OneToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="invoice_id",nullable=false,unique=true)
    private Invoice invoice;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="vendor_id",nullable=false)
    private Vendor vendor;
    @Column(name="match_date",nullable=false)
    private LocalDate matchDate;
    @Column(name="performed_by",nullable=false)
    private String performedBy;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20)
    private ThreeWayMatchStatus status;
    @Enumerated(EnumType.STRING) @Column(name="overall_result",nullable=false,length=20)
    private ThreeWayMatchResult overallResult;
    @Column(length=1000)
    private String remarks;
    @Column(name="created_by",nullable=false)
    private String createdBy;
    @Column(name="updated_by")
    private String updatedBy;
    @Column(name="created_at",updatable=false)
    private LocalDateTime createdAt;
    @Column(name="updated_at")
    private LocalDateTime updatedAt;
    @PrePersist void pre(){var n=LocalDateTime.now();createdAt=n;updatedAt=n;if(status==null)status=ThreeWayMatchStatus.PENDING;if(overallResult==null)overallResult=ThreeWayMatchResult.WARNING;}
    @PreUpdate void upd(){updatedAt=LocalDateTime.now();}
}
