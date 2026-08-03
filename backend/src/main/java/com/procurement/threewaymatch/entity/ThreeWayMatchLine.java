package com.procurement.threewaymatch.entity;

import com.procurement.goodsreceipt.entity.GoodsReceiptLine;
import com.procurement.invoice.entity.InvoiceLine;
import com.procurement.product.entity.Product;
import com.procurement.purchaseorder.entity.PurchaseOrderLine;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name="three_way_match_lines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThreeWayMatchLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="three_way_match_line_id")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="three_way_match_id",nullable=false)
    private ThreeWayMatch threeWayMatch;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="purchase_order_line_id",nullable=false)
    private PurchaseOrderLine purchaseOrderLine;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="goods_receipt_line_id")
    private GoodsReceiptLine goodsReceiptLine;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="invoice_line_id")
    private InvoiceLine invoiceLine;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="product_id",nullable=false)
    private Product product;
    @Column(name="ordered_quantity",precision=15,scale=3,nullable=false)
    private BigDecimal orderedQuantity;
    @Column(name="received_quantity",precision=15,scale=3,nullable=false)
    private BigDecimal receivedQuantity;
    @Column(name="invoiced_quantity",precision=15,scale=3,nullable=false)
    private BigDecimal invoicedQuantity;
    @Column(name="ordered_price",precision=15,scale=2,nullable=false)
    private BigDecimal orderedPrice;
    @Column(name="invoiced_price",precision=15,scale=2,nullable=false)
    private BigDecimal invoicedPrice;
    @Column(name="quantity_matched",nullable=false)
    private Boolean quantityMatched;
    @Column(name="price_matched",nullable=false)
    private Boolean priceMatched;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20)
    private ThreeWayMatchResult result;
    @Column(length=1000)
    private String remarks;
}
