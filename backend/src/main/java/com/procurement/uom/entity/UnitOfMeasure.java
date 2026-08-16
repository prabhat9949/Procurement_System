package com.procurement.uom.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "unit_of_measures",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "uom_code"),
                @UniqueConstraint(columnNames = "uom_name")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitOfMeasure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "uom_id")
    private Long id;

    @Column(name = "uom_code", nullable = false, length = 30)
    private String uomCode;

    @Column(name = "uom_name", nullable = false, length = 100)
    private String uomName;

    @Column(name = "description", length = 500)
    private String description;

    @Builder.Default
    @Column(name = "active_flag", nullable = false)
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
