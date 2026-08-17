package com.procurement.noncatalog.entity;

import com.procurement.category.entity.Category;
import com.procurement.department.entity.Department;
import com.procurement.employee.entity.Employee;
import com.procurement.product.entity.Product;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.uom.entity.UnitOfMeasure;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "non_catalog_requests",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ncr_number", columnNames = "request_number")
        },
        indexes = {
                @Index(name = "idx_ncr_requester", columnList = "requester_id"),
                @Index(name = "idx_ncr_department", columnList = "department_id"),
                @Index(name = "idx_ncr_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NonCatalogRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "non_catalog_request_id")
    private Long id;

    @Column(name = "request_number", nullable = false, length = 40)
    private String requestNumber;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "description", length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uom_id")
    private UnitOfMeasure unitOfMeasure;

    @Column(name = "estimated_unit_price", precision = 15, scale = 2)
    private BigDecimal estimatedUnitPrice;

    @Column(name = "estimated_total_amount", precision = 15, scale = 2)
    private BigDecimal estimatedTotalAmount;

    @Column(name = "business_justification", length = 1000)
    private String businessJustification;

    @Column(name = "specifications", length = 1000)
    private String specifications;

    @Column(name = "preferred_vendor", length = 150)
    private String preferredVendor;

    @Column(name = "required_date")
    private LocalDate requiredDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_request_id")
    private PurchaseRequest purchaseRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private NonCatalogRequestStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_reviewer_id")
    private Employee hrReviewer;

    @Column(name = "hr_remarks", length = 1000)
    private String hrRemarks;

    @Column(name = "hr_reviewed_at")
    private LocalDateTime hrReviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procurement_reviewer_id")
    private Employee procurementReviewer;

    @Column(name = "procurement_remarks", length = 1000)
    private String procurementRemarks;

    @Column(name = "procurement_reviewed_at")
    private LocalDateTime procurementReviewedAt;

    /** If resolved by linking to an existing or newly created Product Master */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_product_id")
    private Product createdProduct;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = NonCatalogRequestStatus.PENDING_HR_REVIEW;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
