package com.procurement.procurement.scope.entity;

import com.procurement.category.entity.Category;
import com.procurement.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Database-driven procurement officer category scope.
 *
 * A procurement officer with one or more rows here is restricted to those
 * categories (their approved-PR queue, RFQs and POs are filtered server-side).
 * An officer with no rows is unscoped and sees all categories — the safe
 * default so no work is ever silently hidden.
 */
@Entity
@Table(
        name = "officer_category_scopes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "category_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficerCategoryScope {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "officer_category_scope_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Builder.Default
    @Column(name = "active_flag", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        var now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
