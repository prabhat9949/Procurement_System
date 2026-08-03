package com.procurement.inventory.entity;

import com.procurement.product.entity.Product;
import com.procurement.warehouse.entity.Warehouse;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "inventory",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"product_id", "warehouse_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(name = "available_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal availableQuantity;

    @Column(name = "reserved_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal reservedQuantity;

    @Column(name = "damaged_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal damagedQuantity;

    @Column(name = "minimum_stock", nullable = false, precision = 15, scale = 3)
    private BigDecimal minimumStock;

    @Column(name = "maximum_stock", nullable = false, precision = 15, scale = 3)
    private BigDecimal maximumStock;

    @Column(name = "reorder_level", nullable = false, precision = 15, scale = 3)
    private BigDecimal reorderLevel;

    @Column(name = "average_unit_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal averageUnitCost;

    @Column(name = "inventory_value", nullable = false, precision = 18, scale = 2)
    private BigDecimal inventoryValue;

    @Column(name = "last_stock_update")
    private LocalDateTime lastStockUpdate;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "created_by", length = 100, updatable = false)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (lastStockUpdate == null) {
            lastStockUpdate = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
