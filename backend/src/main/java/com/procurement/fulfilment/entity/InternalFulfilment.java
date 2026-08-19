package com.procurement.fulfilment.entity;

import com.procurement.department.entity.Department;
import com.procurement.employee.entity.Employee;
import com.procurement.product.entity.Product;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import com.procurement.warehouse.entity.Warehouse;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "internal_fulfilments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_fulfilment_number", columnNames = "fulfilment_number")
        },
        indexes = {
                @Index(name = "idx_if_pr", columnList = "purchase_request_id"),
                @Index(name = "idx_if_team_status", columnList = "specialized_team,status"),
                @Index(name = "idx_if_assigned_emp", columnList = "assigned_employee_id,status"),
                @Index(name = "idx_if_requester", columnList = "requester_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternalFulfilment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fulfilment_id")
    private Long id;

    @Column(name = "fulfilment_number", nullable = false, length = 40)
    private String fulfilmentNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_request_id", nullable = false)
    private PurchaseRequest purchaseRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_request_line_id")
    private PurchaseRequestLine purchaseRequestLine;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    /** Role code of the specialized team: EQUIPMENT_ASSET_TEAM, IT_SOFTWARE_TEAM, FACILITIES_TEAM */
    @Column(name = "specialized_team", nullable = false, length = 50)
    private String specializedTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_id")
    private Employee assignedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfilment_type", nullable = false, length = 40)
    private FulfilmentType fulfilmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private InternalFulfilmentStatus status;

    @Column(name = "requested_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal requestedQuantity;

    @Column(name = "available_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal availableQuantity;

    @Column(name = "allocated_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal allocatedQuantity;

    @Column(name = "delivered_quantity", nullable = false, precision = 15, scale = 3)
    @Builder.Default
    private BigDecimal deliveredQuantity = BigDecimal.ZERO;

    @Column(name = "shortage_quantity", nullable = false, precision = 15, scale = 3)
    @Builder.Default
    private BigDecimal shortageQuantity = BigDecimal.ZERO;

    @Column(name = "license_key_assigned", length = 255)
    private String licenseKeyAssigned;

    @Column(name = "asset_tag", length = 100)
    private String assetTag;

    @Column(name = "delivery_location", length = 255)
    private String deliveryLocation;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @Column(name = "allocated_at")
    private LocalDateTime allocatedAt;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (deliveredQuantity == null) deliveredQuantity = BigDecimal.ZERO;
        if (shortageQuantity == null) shortageQuantity = BigDecimal.ZERO;
        if (status == null) status = InternalFulfilmentStatus.ASSIGNED;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
