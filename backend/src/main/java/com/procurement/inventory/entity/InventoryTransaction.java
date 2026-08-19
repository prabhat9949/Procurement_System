package com.procurement.inventory.entity;

import com.procurement.department.entity.Department;
import com.procurement.employee.entity.Employee;
import com.procurement.product.entity.Product;
import com.procurement.warehouse.entity.Warehouse;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "inventory_transactions",
        indexes = {
                @Index(name = "idx_inv_txn_product", columnList = "product_id"),
                @Index(name = "idx_inv_txn_warehouse", columnList = "warehouse_id"),
                @Index(name = "idx_inv_txn_type", columnList = "transaction_type"),
                @Index(name = "idx_inv_txn_ref", columnList = "reference_type,reference_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long id;

    @Column(name = "transaction_number", nullable = false, unique = true, length = 50)
    private String transactionNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 40)
    private InventoryTransactionType transactionType;

    @Column(name = "quantity_before", nullable = false, precision = 15, scale = 3)
    private BigDecimal quantityBefore;

    @Column(name = "quantity_changed", nullable = false, precision = 15, scale = 3)
    private BigDecimal quantityChanged;

    @Column(name = "quantity_after", nullable = false, precision = 15, scale = 3)
    private BigDecimal quantityAfter;

    @Column(name = "unit_cost", precision = 15, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "total_value", precision = 18, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "reference_type", length = 40)
    private String referenceType; // e.g. "PR", "PO", "GRN", "INTERNAL_FULFILMENT", "MANUAL"

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_number", length = 60)
    private String referenceNumber; // e.g. PR-2026-000001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private Employee performedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private Employee requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "reason", length = 1000)
    private String reason;

    @Column(name = "actor_username", length = 100)
    private String actorUsername;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
