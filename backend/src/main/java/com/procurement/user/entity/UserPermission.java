package com.procurement.user.entity;

import com.procurement.permission.entity.Permission;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * User-specific permission override. Lets an Admin grant or deny a single
 * permission for one user on top of (or in spite of) their role's default
 * permission set.
 * <p>
 * Precedence when resolving effective permissions:
 * <ol>
 *   <li>Explicit user DENY → highest priority (removes the authority)</li>
 *   <li>Explicit user ALLOW → next (adds the authority)</li>
 *   <li>Role permission → default</li>
 *   <li>Anything else → no access</li>
 * </ol>
 */
@Entity
@Table(
        name = "user_permissions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "permission_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_permission_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private com.procurement.user.entity.User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @Enumerated(EnumType.STRING)
    @Column(name = "access", nullable = false, length = 10)
    private PermissionAccess access;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "created_by", length = 100)
    private String createdBy;

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
