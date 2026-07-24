package com.procurement.costcenter.entity;

import com.procurement.department.entity.Department;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "cost_centers",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "code")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cost_center_id")
    private Long id;

    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "budget", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal budget = BigDecimal.ZERO;

    @Column(name = "used_budget", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal usedBudget = BigDecimal.ZERO;

    @Column(name = "remaining_budget", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal remainingBudget = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "active_flag", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
